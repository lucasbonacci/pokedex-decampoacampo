import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { QueryClient } from '@tanstack/react-query';

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
