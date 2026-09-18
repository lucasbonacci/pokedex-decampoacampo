import { useInfiniteQuery } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';

import { getPokemonList } from '../api/pokemonApi';
import { PAGE_SIZE, POKEMON_LIST_STALE_TIME } from '../constants/pokemonList';
import { shouldRetryRequest } from '../helpers/requestError';
import { toPokemonListItem } from '../helpers/toPokemonListItem';
import type { PokemonListItem } from '../types/pokemonListItem';

export function usePokemonList() {
  const query = useInfiniteQuery({
    queryKey: ['pokemon', 'list', PAGE_SIZE],
    initialPageParam: 0,
    queryFn: ({ pageParam, signal }) => getPokemonList(PAGE_SIZE, pageParam, signal),
    staleTime: POKEMON_LIST_STALE_TIME,
    retry: shouldRetryRequest,
    getNextPageParam: (lastPage, _allPages, lastPageParam) =>
      lastPage.next === null ? undefined : lastPageParam + PAGE_SIZE,
  });

  const pokemon = useMemo(() => {
    const pokemonById = new Map<number, PokemonListItem>();

    for (const page of query.data?.pages ?? []) {
      for (const resource of page.results) {
        const item = toPokemonListItem(resource);
        pokemonById.set(item.id, item);
      }
    }

    return Array.from(pokemonById.values());
  }, [query.data]);

  const {
    hasNextPage,
    isFetching,
    isError,
    isFetchNextPageError,
    fetchNextPage: fetchQueryNextPage,
    refetch,
  } = query;

  const fetchNextPage = useCallback(() => {
    if (!hasNextPage || isFetching || isError) {
      return;
    }

    void fetchQueryNextPage({ cancelRefetch: false });
  }, [hasNextPage, isFetching, isError, fetchQueryNextPage]);

  const retry = useCallback(() => {
    if (isFetching) {
      return;
    }

    if (isFetchNextPageError) {
      void fetchQueryNextPage({ cancelRefetch: false });
    } else {
      void refetch({ cancelRefetch: false });
    }
  }, [isFetching, isFetchNextPageError, fetchQueryNextPage, refetch]);

  return {
    pokemon,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    fetchNextPage,
    hasNextPage: query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
    isFetchNextPageError,
    isRefetchError: query.isRefetchError,
    isRefetching: query.isRefetching,
    retry,
  };
}
