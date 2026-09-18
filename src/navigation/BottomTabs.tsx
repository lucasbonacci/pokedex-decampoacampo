import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import FavoritesScreen from '../screens/FavoritesScreen';
import PokemonListScreen from '../screens/PokemonListScreen';
import type { MainTabParamList } from './navigation.types';

const Tab = createBottomTabNavigator<MainTabParamList>();

export default function BottomTabs() {
  return (
    <Tab.Navigator
      initialRouteName="PokemonList"
      screenOptions={{ tabBarIconStyle: { display: 'none' } }}
    >
      <Tab.Screen
        name="PokemonList"
        component={PokemonListScreen}
        options={{ title: 'Lista' }}
      />
      <Tab.Screen
        name="Favorites"
        component={FavoritesScreen}
        options={{ title: 'Favoritos' }}
      />
    </Tab.Navigator>
  );
}
