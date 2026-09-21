import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import type { PropsWithChildren } from 'react';

import { getPokemonByType, getPokemonCatalog, getPokemonList } from '../../api/pokemonApi';
import { PAGE_SIZE } from '../../constants/pokemonList';
import { usePokemonList } from '../usePokemonList';

jest.mock('../../api/pokemonApi');

const bulbasaur = { name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon/1/' };
const pikachu = { name: 'pikachu', url: 'https://pokeapi.co/api/v2/pokemon/25/' };
const raichu = { name: 'raichu', url: 'https://pokeapi.co/api/v2/pokemon/26/' };
const firstPage = { count: 3, next: 'next-page', previous: null, results: [bulbasaur] };
const lastPage = { count: 3, next: null, previous: 'first-page', results: [pikachu, raichu] };

let queryClient: QueryClient;

function wrapper({ children }: PropsWithChildren) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

beforeEach(() => {
  jest.resetAllMocks();
  queryClient = new QueryClient({ defaultOptions: { queries: { gcTime: Infinity } } });
});

afterEach(() => queryClient.clear());

test('busca por nombre ignorando mayúsculas y espacios alrededor', async () => {
  jest.mocked(getPokemonCatalog).mockResolvedValue([bulbasaur, pikachu, raichu]);

  const { result } = renderHook(() => usePokemonList('  PIKA  '), { wrapper });

  await waitFor(() => expect(result.current.isLoading).toBe(false));
  expect(result.current.pokemon.map(({ name }) => name)).toEqual(['pikachu']);
  expect(getPokemonList).not.toHaveBeenCalled();
});

test('combina el nombre con el tipo y no pagina los resultados filtrados', async () => {
  jest.mocked(getPokemonByType).mockResolvedValue([pikachu, raichu]);

  const { result } = renderHook(() => usePokemonList('pika', 'electric'), { wrapper });

  await waitFor(() => expect(result.current.isLoading).toBe(false));
  expect(getPokemonByType).toHaveBeenCalledWith('electric', expect.anything());
  expect(result.current.pokemon.map(({ name }) => name)).toEqual(['pikachu']);
  expect(result.current.hasNextPage).toBe(false);
  act(() => result.current.fetchNextPage());
  expect(getPokemonList).not.toHaveBeenCalled();
  expect(getPokemonCatalog).not.toHaveBeenCalled();
});

test('vuelve al listado paginado al limpiar la búsqueda y el tipo', async () => {
  jest.mocked(getPokemonByType).mockResolvedValue([pikachu]);
  jest.mocked(getPokemonList).mockResolvedValue(firstPage);
  const { result, rerender } = renderHook(
    ({ search, type }: { search: string; type: string | null }) => usePokemonList(search, type),
    { wrapper, initialProps: { search: 'pika', type: 'electric' as string | null } },
  );
  await waitFor(() => expect(result.current.pokemon[0]?.name).toBe('pikachu'));

  rerender({ search: '', type: null });

  await waitFor(() => expect(result.current.pokemon[0]?.name).toBe('bulbasaur'));
  expect(result.current.hasNextPage).toBe(true);
  expect(getPokemonList).toHaveBeenCalledWith(PAGE_SIZE, 0, expect.anything());
});

test('une las páginas sin repetir Pokémon', async () => {
  jest.mocked(getPokemonList)
    .mockResolvedValueOnce(firstPage)
    .mockResolvedValueOnce({ ...lastPage, results: [bulbasaur, pikachu, raichu] });
  const { result } = renderHook(() => usePokemonList(), { wrapper });
  await waitFor(() => expect(result.current.hasNextPage).toBe(true));

  act(() => result.current.fetchNextPage());

  await waitFor(() => expect(result.current.pokemon.map(({ id }) => id)).toEqual([1, 25, 26]));
  expect(getPokemonList).toHaveBeenLastCalledWith(PAGE_SIZE, PAGE_SIZE, expect.anything());
});

test('deja de pedir páginas cuando no hay más resultados', async () => {
  jest.mocked(getPokemonList).mockResolvedValue(lastPage);
  const { result } = renderHook(() => usePokemonList(), { wrapper });
  await waitFor(() => expect(result.current.isLoading).toBe(false));

  act(() => result.current.fetchNextPage());

  expect(result.current.hasNextPage).toBe(false);
  expect(getPokemonList).toHaveBeenCalledTimes(1);
});
