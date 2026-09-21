import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  persistQueryClientRestore,
  persistQueryClientSave,
} from '@tanstack/react-query-persist-client';

import { PAGE_SIZE } from '../../constants/pokemonList';
import {
  createQueryClient,
  persistOptions,
} from '../queryClient';

const queryKey = ['pokemon', 'list', PAGE_SIZE];
const cachedList = {
  pages: [{
    count: 1,
    next: null,
    previous: null,
    results: [{
      name: 'bulbasaur',
      url: 'https://pokeapi.co/api/v2/pokemon/1/',
    }],
  }],
  pageParams: [0],
};

let firstSession: ReturnType<typeof createQueryClient> | undefined;
let newSession: ReturnType<typeof createQueryClient> | undefined;

beforeEach(() => AsyncStorage.clear());

afterEach(() => {
  firstSession?.clear();
  newSession?.clear();
});

test('guarda y restaura la lista en un cliente nuevo', async () => {
  firstSession = createQueryClient();
  firstSession.setQueryData(queryKey, cachedList);
  await persistQueryClientSave({
    queryClient: firstSession,
    ...persistOptions,
  });

  newSession = createQueryClient();
  expect(newSession.getQueryData(queryKey)).toBeUndefined();

  await persistQueryClientRestore({
    queryClient: newSession,
    ...persistOptions,
  });

  expect(newSession.getQueryData(queryKey)).toEqual(cachedList);
});
