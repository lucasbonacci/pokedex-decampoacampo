import { useQuery } from '@tanstack/react-query';

import { getPokemonDetail } from '../api/pokemonApi';
import { shouldRetryRequest } from '../helpers/requestError';

export function usePokemonDetail(pokemonId: number) {
  return useQuery({
    queryKey: ['pokemon', 'detail', pokemonId],
    queryFn: ({ signal }) => getPokemonDetail(pokemonId, signal),
    staleTime: 5 * 60 * 1000,
    retry: shouldRetryRequest,
  });
}
