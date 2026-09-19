import { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  View,
  type ListRenderItemInfo,
} from 'react-native';

import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';
import { Loading } from '../components/Loading';
import { PokemonListRow } from '../components/PokemonListRow';
import { SearchInput } from '../components/SearchInput';
import { getRequestErrorMessage } from '../helpers/requestError';
import { useDebounce } from '../hooks/useDebounce';
import { usePokemonList } from '../hooks/usePokemonList';
import type { PokemonListScreenProps } from '../navigation/navigation.types';
import type { PokemonListItem } from '../types/pokemonListItem';

function pokemonKey(item: PokemonListItem) {
  return String(item.id);
}

export default function PokemonListScreen({ navigation }: PokemonListScreenProps) {
  const [searchText, setSearchText] = useState('');
  const debouncedSearchText = useDebounce(searchText, 500);
  const isSearching = debouncedSearchText.trim().length > 0;
  const {
    pokemon,
    isLoading,
    isError,
    error,
    refresh,
    fetchNextPage,
    isFetchingNextPage,
    isFetchNextPageError,
    isRefetchError,
    isRefetching,
    retry,
  } = usePokemonList(debouncedSearchText);

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

  const listEmpty = useMemo(
    () => (
      <EmptyState
        message={isSearching
          ? 'No se encontraron Pokémon para esta búsqueda.'
          : 'No hay Pokémon disponibles.'}
        description={isSearching ? 'Probá con otro nombre o borrá la búsqueda.' : undefined}
      />
    ),
    [isSearching],
  );

  const listHeader = useMemo(
    () => !isRefetching && isRefetchError ? (
      <ErrorState
        message={`No se pudo actualizar la lista. ${getRequestErrorMessage(error)}`}
        onRetry={retry}
        fullScreen={false}
      />
    ) : null,
    [isRefetching, isRefetchError, error, retry],
  );

  const listFooter = useMemo(
    () => isFetchingNextPage ? (
      <Loading label="Cargando más Pokémon" />
    ) : isFetchNextPageError ? (
      <ErrorState
        message={`No se pudieron cargar más Pokémon. ${getRequestErrorMessage(error)}`}
        onRetry={retry}
        fullScreen={false}
      />
    ) : null,
    [isFetchingNextPage, isFetchNextPageError, error, retry],
  );

  return (
    <View style={styles.container}>
      <SearchInput
        style={styles.searchInput}
        value={searchText}
        onChangeText={setSearchText}
        placeholder="Buscar Pokémon por nombre"
      />
      {isLoading ? (
        <Loading label="Cargando Pokémon" fullScreen />
      ) : isError && pokemon.length === 0 ? (
        <ErrorState message={getRequestErrorMessage(error)} onRetry={retry} />
      ) : (
        <FlatList
          style={styles.list}
          contentContainerStyle={styles.content}
          data={pokemon}
          keyExtractor={pokemonKey}
          renderItem={renderPokemon}
          keyboardShouldPersistTaps="handled"
          onRefresh={refresh}
          refreshing={isRefetching}
          alwaysBounceVertical
          windowSize={7}
          maxToRenderPerBatch={5}
          ListEmptyComponent={listEmpty}
          ListHeaderComponent={listHeader}
          onEndReached={fetchNextPage}
          onEndReachedThreshold={0.5}
          ListFooterComponent={listFooter}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  searchInput: {
    marginHorizontal: 16,
    marginTop: 16,
  },
  list: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    flexGrow: 1,
    padding: 16,
    gap: 12,
  },
});
