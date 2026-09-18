import type { NavigatorScreenParams } from '@react-navigation/native';

export type MainTabParamList = {
  PokemonList: undefined;
  Favorites: undefined;
};

export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<MainTabParamList> | undefined;
  PokemonDetail: { pokemonId: number };
};
