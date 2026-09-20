import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

export type MainTabParamList = {
  PokemonList: undefined;
  Favorites: undefined;
};

export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<MainTabParamList> | undefined;
  PokemonDetail: { pokemonId: number };
};

export type PokemonListScreenProps = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'PokemonList'>,
  NativeStackScreenProps<RootStackParamList>
>;

export type PokemonDetailScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'PokemonDetail'
>;

export type FavoritesScreenProps = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Favorites'>,
  NativeStackScreenProps<RootStackParamList>
>;
