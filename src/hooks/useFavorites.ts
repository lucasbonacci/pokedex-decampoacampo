import { useCallback, useEffect, useState } from 'react';

import { useFavoritesStore } from '../stores/useFavoritesStore';
import type { PokemonListItem } from '../types/pokemonListItem';

type UseFavoritesOptions = {
  pokemonId?: number;
};


let hydrationPromise: Promise<void> | undefined;

export function useFavorites({ pokemonId }: UseFavoritesOptions = {}) {

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
      await updateFavorites((current) =>
        current.some(({ id }) => id === pokemon.id)
          ? current.filter(({ id }) => id !== pokemon.id)
          : [...current, pokemon],
      );
    },
    [loadFavorites, updateFavorites],
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
