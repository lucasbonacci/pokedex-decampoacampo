import axios from 'axios';

import type { PokemonDetail, PokemonListResponse } from '../types/pokemonApi';

const pokemonApi = axios.create({
  baseURL: 'https://pokeapi.co/api/v2',
  timeout: 15_000,
});

export async function getPokemonList(
  limit: number,
  offset: number,
  signal?: AbortSignal,
): Promise<PokemonListResponse> {
  const response = await pokemonApi.get<PokemonListResponse>('/pokemon', {
    params: { limit, offset },
    signal,
  });

  return response.data;
}

export async function getPokemonDetail(
  idOrName: number | string,
  signal?: AbortSignal,
): Promise<PokemonDetail> {
  const response = await pokemonApi.get<PokemonDetail>(`/pokemon/${idOrName}`, {
    signal,
  });

  return response.data;
}

export async function getPokemonCatalog(signal?: AbortSignal) {
  const firstPage = await getPokemonList(1, 0, signal);

  if (firstPage.count <= firstPage.results.length) {
    return firstPage.results;
  }

  const catalog = await getPokemonList(firstPage.count, 0, signal);
  return catalog.results;
}
