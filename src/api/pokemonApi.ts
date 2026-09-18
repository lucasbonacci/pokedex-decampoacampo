import axios from 'axios';

import type { PokemonDetail, PokemonListResponse } from '../types/pokemon';

const pokemonApi = axios.create({
  baseURL: 'https://pokeapi.co/api/v2',
});

export async function getPokemonList(
  limit: number,
  offset: number,
): Promise<PokemonListResponse> {
  const response = await pokemonApi.get<PokemonListResponse>('/pokemon', {
    params: { limit, offset },
  });

  return response.data;
}

export async function getPokemonDetail(
  idOrName: number | string,
): Promise<PokemonDetail> {
  const response = await pokemonApi.get<PokemonDetail>(`/pokemon/${idOrName}`);

  return response.data;
}
