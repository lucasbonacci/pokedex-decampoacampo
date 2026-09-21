import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useState } from 'react';

import { removeFavoriteDetailFromCache } from '../cache/queryClient';
import { useFavoritesStore } from '../stores/useFavoritesStore';
import type { PokemonListItem } from '../types/pokemonListItem';
import { pokemonDetailQueryOptions } from './usePokemonDetail';

type UseFavoritesOptions = {
  pokemonId?: number;
};


let hydrationPromise: Promise<void> | undefined;

export function useFavorites({ pokemonId }: UseFavoritesOptions = {}) {
  const queryClient = useQueryClient();
  const favorites = useFavoritesStore((state) =>
    pokemonId === undefined ? state.favorites : undefined,
  );
  const isFavorite = useFavoritesStore((state) =>
    pokemonId !== undefined && state.favorites.some(({ id }) => id === pokemonId),
  );
  const updateFavorites = useFavoritesStore((state) => state.updateFavorites);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>(
    () => useFavoritesStore.persist.hasHydrated() ? 'ready' : 'loading',
  );

  const loadFavorites = useCallback(() => {
    if (useFavoritesStore.persist.hasHydrated()) {
      return Promise.resolve();
    }

    hydrationPromise ??= Promise.resolve(useFavoritesStore.persist.rehydrate())
      .then(() => {
        if (!useFavoritesStore.persist.hasHydrated()) {
          throw new Error('No se pudieron cargar los favoritos guardados.');
        }
      })
      .finally(() => {
        hydrationPromise = undefined;
      });

    return hydrationPromise;
  }, []);

  const toggleFavorite = useCallback(
    async (pokemon: PokemonListItem) => {
      await loadFavorites();
      const wasFavorite = useFavoritesStore
        .getState()
        .favorites
        .some(({ id }) => id === pokemon.id);

      await updateFavorites((current) =>
        current.some(({ id }) => id === pokemon.id)
          ? current.filter(({ id }) => id !== pokemon.id)
          : [...current, pokemon],
      );

      if (wasFavorite) {
        await removeFavoriteDetailFromCache(queryClient, pokemon.id);
      } else {
        void queryClient
          .query(pokemonDetailQueryOptions(pokemon.id))
          .catch(() => undefined);
      }
    },
    [loadFavorites, updateFavorites, queryClient],
  );

  const retry = useCallback(async () => {
    if (!useFavoritesStore.persist.hasHydrated()) {
      setStatus('loading');
    }
    try {
      await loadFavorites();
      setStatus('ready');
    } catch {
      setStatus('error');
    }
  }, [loadFavorites]);

  useEffect(() => {
    const unsubscribe = useFavoritesStore.persist.onFinishHydration(() => setStatus('ready'));
    void retry();
    return unsubscribe;
  }, [retry]);

  return {
    favorites,
    isFavorite,
    toggleFavorite,
    isLoading: status === 'loading',
    isError: status === 'error',
    retry,
  };
}
