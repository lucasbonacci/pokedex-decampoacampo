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
    (set, get) => ({
      favorites: [],
      updateFavorites: async (update) => {
        const previousFavorites = get().favorites;

        try {
          await Promise.resolve(set(({ favorites }) => ({
            favorites: update(favorites),
          })));
        } catch (error) {
          try {
            await Promise.resolve(set({ favorites: previousFavorites }));
          } catch {}

          throw error;
        }
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
