import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';

import { POKEMON_CACHE_MAX_AGE } from './src/constants/pokemonList';
import AppNavigator from './src/navigation/AppNavigator';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: POKEMON_CACHE_MAX_AGE,
    },
  },
});

const queryPersister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: 'pokedex-query-cache',
});

export default function App() {
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister: queryPersister,
        maxAge: POKEMON_CACHE_MAX_AGE,
        dehydrateOptions: {
          shouldDehydrateQuery: ({ queryKey, state }) =>
            queryKey[0] === 'pokemon' &&
            queryKey[1] !== 'detail' &&
            state.status === 'success',
        },
      }}
    >
      <AppNavigator />
    </PersistQueryClientProvider>
  );
}
