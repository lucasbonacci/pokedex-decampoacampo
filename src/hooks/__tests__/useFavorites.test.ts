import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, renderHook, waitFor } from '@testing-library/react-native';

import { useFavoritesStore } from '../../stores/useFavoritesStore';
import { useFavorites } from '../useFavorites';

const pikachu = { id: 25, name: 'pikachu', imageUrl: 'pikachu.png' };
const bulbasaur = { id: 1, name: 'bulbasaur', imageUrl: 'bulbasaur.png' };

beforeEach(async () => {
  jest.restoreAllMocks();
  useFavoritesStore.setState({ favorites: [] });
  await AsyncStorage.clear();
  await useFavoritesStore.persist.rehydrate();
});

test('agrega y quita un favorito, guardando ambos cambios', async () => {
  const { result } = renderHook(() => useFavorites({ pokemonId: pikachu.id }));
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
  const { result } = renderHook(() => useFavorites());

  await waitFor(() => expect(result.current.isLoading).toBe(false));
  expect(result.current.favorites).toEqual([pikachu]);
  expect(result.current.isError).toBe(false);
});

test('conserva los favoritos anteriores si falla el guardado', async () => {
  await useFavoritesStore.getState().updateFavorites(() => [bulbasaur]);
  const { result } = renderHook(() => useFavorites());
  await waitFor(() => expect(result.current.isLoading).toBe(false));
  jest.spyOn(AsyncStorage, 'setItem').mockRejectedValueOnce(new Error('Sin espacio'));

  await act(async () => {
    await expect(result.current.toggleFavorite(pikachu)).rejects.toThrow('Sin espacio');
  });

  expect(result.current.favorites).toEqual([bulbasaur]);
  expect(JSON.parse((await AsyncStorage.getItem('pokedex-favorites'))!).state.favorites)
    .toEqual([bulbasaur]);
});
