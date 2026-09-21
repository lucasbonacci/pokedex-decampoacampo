import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { QueryClient } from '@tanstack/react-query';
import { persistQueryClientSave } from '@tanstack/react-query-persist-client';

import { POKEMON_CACHE_MAX_AGE } from '../constants/pokemonList';
import { useFavoritesStore } from '../stores/useFavoritesStore';

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        gcTime: POKEMON_CACHE_MAX_AGE,
      },
    },
  });
}

export const queryPersister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: 'pokedex-query-cache',
});

export const persistOptions = {
  persister: queryPersister,
  maxAge: POKEMON_CACHE_MAX_AGE,
  dehydrateOptions: {
    shouldDehydrateQuery: ({ queryKey, state }: {
      queryKey: readonly unknown[];
      state: { data: unknown };
    }) => {
      const isPokemonQuery = queryKey[0] === 'pokemon';
      const hasData = state.data !== undefined;

      if (!isPokemonQuery || !hasData) {
        return false;
      }

      const isDetailQuery = queryKey[1] === 'detail';

      if (!isDetailQuery) {
        return true;
      }

      const pokemonId = queryKey[2];

      return typeof pokemonId === 'number' && useFavoritesStore
        .getState()
        .favorites
        .some(({ id }) => id === pokemonId);
    },
  },
};

export async function removeFavoriteDetailFromCache(client: QueryClient, pokemonId: number) {
  const filters = { queryKey: ['pokemon', 'detail', pokemonId], exact: true };
  const cache = client.getQueryCache();
  const query = cache.find(filters);

  if (query && query.getObserversCount() > 0) {
    const unsubscribe = cache.subscribe((event) => {
      if (event.query !== query) {
        return;
      }

      if (event.type === 'removed') {
        unsubscribe();
      } else if (event.type === 'observerRemoved' && query.getObserversCount() === 0) {
        unsubscribe();
        const isFavorite = useFavoritesStore.getState().favorites.some(({ id }) => id === pokemonId);

        if (!isFavorite) {
          client.removeQueries(filters);
        }
      }
    });
  } else {
    client.removeQueries(filters);
  }

  await persistQueryClientSave({ queryClient: client, ...persistOptions });
}
