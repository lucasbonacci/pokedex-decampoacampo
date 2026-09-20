import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';

import { getPokemonByType, getPokemonCatalog, getPokemonList } from '../api/pokemonApi';
import { PAGE_SIZE, POKEMON_LIST_STALE_TIME } from '../constants/pokemonList';
import { shouldRetryRequest } from '../helpers/requestError';
import { toPokemonListItem } from '../helpers/toPokemonListItem';
import type { PokemonListItem } from '../types/pokemonListItem';

export function usePokemonList(searchText = '', selectedType: string | null = null) {
  const searchTerm = searchText.trim().toLowerCase();
  const isSearching = searchTerm.length > 0;
  const isFiltering = isSearching || selectedType !== null;
  const query = useInfiniteQuery({
    queryKey: ['pokemon', 'list', PAGE_SIZE],
    enabled: !isFiltering,
    initialPageParam: 0,
    queryFn: ({ pageParam, signal }) => getPokemonList(PAGE_SIZE, pageParam, signal),
    staleTime: POKEMON_LIST_STALE_TIME,
    retry: shouldRetryRequest,
    getNextPageParam: (lastPage, _allPages, lastPageParam) =>
      lastPage.next === null ? undefined : lastPageParam + PAGE_SIZE,
  });

  const searchQuery = useQuery({
    queryKey: selectedType ? ['pokemon', 'type', selectedType] : ['pokemon', 'catalog'],
    queryFn: ({ signal }) => selectedType
      ? getPokemonByType(selectedType, signal)
      : getPokemonCatalog(signal),
    enabled: isFiltering,
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
    if (isFiltering || !hasNextPage || isFetching || isError) {
      return;
    }

    void fetchQueryNextPage({ cancelRefetch: false });
  }, [isFiltering, hasNextPage, isFetching, isError, fetchQueryNextPage]);

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

  const activeQuery = isFiltering ? searchQuery : query;
  const { refetch: refetchActive, isFetching: isFetchingActive } = activeQuery;

  const refresh = useCallback(() => {
    if (!isFetchingActive) {
      void refetchActive({ cancelRefetch: false });
    }
  }, [isFetchingActive, refetchActive]);

  return {
    pokemon: isFiltering ? filteredPokemon : pokemon,
    isLoading: activeQuery.isLoading,
    isError: activeQuery.isError,
    error: activeQuery.error,
    refresh,
    fetchNextPage,
    hasNextPage: !isFiltering && query.hasNextPage,
    isFetchingNextPage: !isFiltering && query.isFetchingNextPage,
    isFetchNextPageError: !isFiltering && isFetchNextPageError,
    isRefetchError: activeQuery.isRefetchError,
    isRefetching: activeQuery.isRefetching,
    retry: isFiltering ? retrySearch : retry,
  };
}
