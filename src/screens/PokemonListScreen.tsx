import { useCallback } from 'react';
import { FlatList, StyleSheet, Text, type ListRenderItemInfo } from 'react-native';

import { ErrorState } from '../components/ErrorState';
import { Loading } from '../components/Loading';
import { PokemonListRow } from '../components/PokemonListRow';
import { getRequestErrorMessage } from '../helpers/requestError';
import { usePokemonList } from '../hooks/usePokemonList';
import type { PokemonListScreenProps } from '../navigation/navigation.types';
import type { PokemonListItem } from '../types/pokemonListItem';

function pokemonKey(item: PokemonListItem) {
  return String(item.id);
}

export default function PokemonListScreen({ navigation }: PokemonListScreenProps) {
  const {
    pokemon,
    isLoading,
    isError,
    error,
    fetchNextPage,
    isFetchingNextPage,
    isFetchNextPageError,
    isRefetchError,
    isRefetching,
    retry,
  } = usePokemonList();

  const openPokemon = useCallback(
    (pokemonId: number) => navigation.navigate('PokemonDetail', { pokemonId }),
    [navigation],
  );

  const renderPokemon = useCallback(
    ({ item }: ListRenderItemInfo<PokemonListItem>) => (
      <PokemonListRow {...item} onSelect={openPokemon} />
    ),
    [openPokemon],
  );

  if (isLoading) {
    return <Loading label="Cargando Pokémon" fullScreen />;
  }

  if (isError && pokemon.length === 0) {
    return (
      <ErrorState message={getRequestErrorMessage(error)} onRetry={retry} />
    );
  }

  return (
    <FlatList
      style={styles.list}
      contentContainerStyle={styles.content}
      data={pokemon}
      keyExtractor={pokemonKey}
      renderItem={renderPokemon}
      ListEmptyComponent={<Text style={styles.empty}>No se encontraron Pokémon.</Text>}
      ListHeaderComponent={
        isRefetching ? (
          <Loading label="Actualizando Pokémon" />
        ) : isRefetchError ? (
          <ErrorState
            message={`No se pudo actualizar la lista. ${getRequestErrorMessage(error)}`}
            onRetry={retry}
            fullScreen={false}
          />
        ) : null
      }
      onEndReached={fetchNextPage}
      onEndReachedThreshold={0.5}
      ListFooterComponent={
        isFetchingNextPage ? (
          <Loading label="Cargando más Pokémon" />
        ) : isFetchNextPageError ? (
          <ErrorState
            message={`No se pudieron cargar más Pokémon. ${getRequestErrorMessage(error)}`}
            onRetry={retry}
            fullScreen={false}
          />
        ) : null
      }
    />
  );
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    padding: 16,
    gap: 12,
  },
  empty: {
    padding: 24,
    color: '#64748b',
    textAlign: 'center',
  },
});
