import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';

import { getPokemonCatalog, getPokemonList } from '../api/pokemonApi';
import { PAGE_SIZE, POKEMON_LIST_STALE_TIME } from '../constants/pokemonList';
import { shouldRetryRequest } from '../helpers/requestError';
import { toPokemonListItem } from '../helpers/toPokemonListItem';
import type { PokemonListItem } from '../types/pokemonListItem';

export function usePokemonList(searchText = '') {
  const searchTerm = searchText.trim().toLowerCase();
  const isSearching = searchTerm.length > 0;
  const query = useInfiniteQuery({
    queryKey: ['pokemon', 'list', PAGE_SIZE],
    initialPageParam: 0,
    queryFn: ({ pageParam, signal }) => getPokemonList(PAGE_SIZE, pageParam, signal),
    staleTime: POKEMON_LIST_STALE_TIME,
    retry: shouldRetryRequest,
    getNextPageParam: (lastPage, _allPages, lastPageParam) =>
      lastPage.next === null ? undefined : lastPageParam + PAGE_SIZE,
  });

  const searchQuery = useQuery({
    queryKey: ['pokemon', 'catalog'],
    queryFn: ({ signal }) => getPokemonCatalog(signal),
    enabled: isSearching,
    staleTime: POKEMON_LIST_STALE_TIME,
    retry: shouldRetryRequest,
  });

  const filteredPokemon = useMemo(
    () =>
      (searchQuery.data ?? [])
        .filter((resource) => resource.name.toLowerCase().includes(searchTerm))
        .map(toPokemonListItem),
    [searchQuery.data, searchTerm],
  );

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
    if (isSearching || !hasNextPage || isFetching || isError) {
      return;
    }

    void fetchQueryNextPage({ cancelRefetch: false });
  }, [isSearching, hasNextPage, isFetching, isError, fetchQueryNextPage]);

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

  const { refetch: refetchSearch, isFetching: isFetchingSearch } = searchQuery;
  const retrySearch = useCallback(() => {
    if (!isFetchingSearch) {
      void refetchSearch({ cancelRefetch: false });
    }
  }, [isFetchingSearch, refetchSearch]);

  const activeQuery = isSearching ? searchQuery : query;
  const { refetch: refetchActive, isFetching: isFetchingActive } = activeQuery;

  const refresh = useCallback(() => {
    if (!isFetchingActive) {
      void refetchActive({ cancelRefetch: false });
    }
  }, [isFetchingActive, refetchActive]);

  return {
    pokemon: isSearching ? filteredPokemon : pokemon,
    isLoading: activeQuery.isLoading,
    isError: activeQuery.isError,
    error: activeQuery.error,
    refresh,
    fetchNextPage,
    hasNextPage: !isSearching && query.hasNextPage,
    isFetchingNextPage: !isSearching && query.isFetchingNextPage,
    isFetchNextPageError: !isSearching && isFetchNextPageError,
    isRefetchError: activeQuery.isRefetchError,
    isRefetching: activeQuery.isRefetching,
    retry: isSearching ? retrySearch : retry,
  };
}
