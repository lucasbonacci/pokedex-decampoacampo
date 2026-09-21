import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';

import {
  createQueryClient,
  persistOptions,
} from './src/cache/queryClient';
import AppNavigator from './src/navigation/AppNavigator';

const queryClient = createQueryClient();

export default function App() {
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={persistOptions}
    >
      <AppNavigator />
    </PersistQueryClientProvider>
  );
}
