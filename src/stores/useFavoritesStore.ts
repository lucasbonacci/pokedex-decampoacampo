import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { PokemonListItem } from '../types/pokemonListItem';

type FavoritesStore = {
  favorites: PokemonListItem[];
  updateFavorites: (
    update: (favorites: PokemonListItem[]) => PokemonListItem[],
  ) => Promise<void>;
};

export const useFavoritesStore = create<FavoritesStore>()(
  persist(
    (set) => ({
      favorites: [],
      updateFavorites: async (update) => {
        await set(({ favorites }) => ({ favorites: update(favorites) }));
      },
    }),
    {
      name: 'pokedex-favorites',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ favorites }) => ({ favorites }),
      skipHydration: true,
    },
  ),
);
