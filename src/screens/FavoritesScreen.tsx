import { useCallback } from 'react';
import { FlatList, StyleSheet, type ListRenderItemInfo } from 'react-native';

import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';
import { Loading } from '../components/Loading';
import { PokemonListRow } from '../components/PokemonListRow';
import { useFavorites } from '../hooks/useFavorites';
import type { FavoritesScreenProps } from '../navigation/navigation.types';
import type { PokemonListItem } from '../types/pokemonListItem';

function pokemonKey(item: PokemonListItem) {
  return String(item.id);
}

export default function FavoritesScreen({ navigation }: FavoritesScreenProps) {
  const { favorites, isLoading, isError, retry } = useFavorites();

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
    return <Loading label="Cargando favoritos" fullScreen />;
  }

  if (isError) {
    return (
      <ErrorState
        message="No se pudieron cargar los favoritos guardados."
        onRetry={retry}
      />
    );
  }

  return (
    <FlatList
      style={styles.list}
      contentContainerStyle={styles.content}
      data={favorites}
      keyExtractor={pokemonKey}
      renderItem={renderPokemon}
      ListEmptyComponent={
        <EmptyState
          message="Todavía no tenés Pokémon favoritos."
          description="Tocá la estrella en la lista o en el detalle para agregarlos."
        />
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
    flexGrow: 1,
    padding: 16,
    gap: 12,
  },
});
