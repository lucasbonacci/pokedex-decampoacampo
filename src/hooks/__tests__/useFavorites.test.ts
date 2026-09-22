import AsyncStorage from '@react-native-async-storage/async-storage';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { createElement, type PropsWithChildren } from 'react';

import { getPokemonDetail } from '../../api/pokemonApi';
import { useFavoritesStore } from '../../stores/useFavoritesStore';
import { useFavorites } from '../useFavorites';

jest.mock('../../api/pokemonApi');

const pikachu = { id: 25, name: 'pikachu', imageUrl: 'pikachu.png' };
const bulbasaur = { id: 1, name: 'bulbasaur', imageUrl: 'bulbasaur.png' };

let queryClient: QueryClient;

function wrapper({ children }: PropsWithChildren) {
  return createElement(QueryClientProvider, { client: queryClient }, children);
}

beforeEach(async () => {
  jest.restoreAllMocks();
  jest.mocked(getPokemonDetail).mockResolvedValue({} as never);
  queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  useFavoritesStore.setState({ favorites: [] });
  await AsyncStorage.clear();
  await useFavoritesStore.persist.rehydrate();
});

afterEach(() => queryClient.clear());

test('agrega y quita un favorito, guardando ambos cambios', async () => {
  const { result } = renderHook(() => useFavorites({ pokemonId: pikachu.id }), { wrapper });
  await waitFor(() => expect(result.current.isLoading).toBe(false));

  await act(() => result.current.toggleFavorite(pikachu));

  expect(result.current.isFavorite).toBe(true);
  expect(useFavoritesStore.getState().favorites).toEqual([pikachu]);
  expect(JSON.parse((await AsyncStorage.getItem('pokedex-favorites'))!).state.favorites)
    .toEqual([pikachu]);

  await act(() => result.current.toggleFavorite(pikachu));

  expect(result.current.isFavorite).toBe(false);
  expect(useFavoritesStore.getState().favorites).toEqual([]);
  expect(JSON.parse((await AsyncStorage.getItem('pokedex-favorites'))!).state.favorites)
    .toEqual([]);
});

test('recupera los favoritos guardados desde el almacenamiento', async () => {
  await AsyncStorage.setItem('pokedex-favorites', JSON.stringify({
    state: { favorites: [pikachu] },
    version: 0,
  }));
  expect(useFavoritesStore.getState().favorites).toEqual([]);

  await useFavoritesStore.persist.rehydrate();
  const { result } = renderHook(() => useFavorites(), { wrapper });

  await waitFor(() => expect(result.current.isLoading).toBe(false));
  expect(result.current.favorites).toEqual([pikachu]);
  expect(result.current.isError).toBe(false);
});

test('conserva los favoritos anteriores si falla el guardado', async () => {
  await useFavoritesStore.getState().updateFavorites(() => [bulbasaur]);
  const { result } = renderHook(() => useFavorites(), { wrapper });
  await waitFor(() => expect(result.current.isLoading).toBe(false));
  jest.spyOn(AsyncStorage, 'setItem').mockRejectedValueOnce(new Error('Sin espacio'));

  await act(async () => {
    await expect(result.current.toggleFavorite(pikachu)).rejects.toThrow('Sin espacio');
  });

  expect(result.current.favorites).toEqual([bulbasaur]);
  expect(JSON.parse((await AsyncStorage.getItem('pokedex-favorites'))!).state.favorites)
    .toEqual([bulbasaur]);
});
