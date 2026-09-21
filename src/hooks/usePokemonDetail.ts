import { queryOptions, useQuery } from '@tanstack/react-query';

import { getPokemonDetail } from '../api/pokemonApi';
import { shouldRetryRequest } from '../helpers/requestError';

export function pokemonDetailQueryOptions(pokemonId: number) {
  return queryOptions({
    queryKey: ['pokemon', 'detail', pokemonId],
    queryFn: ({ signal }) => getPokemonDetail(pokemonId, signal),
    staleTime: 5 * 60 * 1000,
    retry: shouldRetryRequest,
  });
}

export function usePokemonDetail(pokemonId: number) {
  return useQuery(pokemonDetailQueryOptions(pokemonId));
}
