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
): Promise<PokemonDetail> {
  const response = await pokemonApi.get<PokemonDetail>(`/pokemon/${idOrName}`);

  return response.data;
}
