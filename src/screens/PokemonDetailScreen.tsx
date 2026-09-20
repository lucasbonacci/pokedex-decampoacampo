import { Image } from 'expo-image';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ErrorState } from '../components/ErrorState';
import { FavoriteButton } from '../components/FavoriteButton';
import { Loading } from '../components/Loading';
import { statLabels, typeLabels } from '../constants/pokemonDetail';
import { getRequestErrorMessage } from '../helpers/requestError';
import { useFavorites } from '../hooks/useFavorites';
import { usePokemonDetail } from '../hooks/usePokemonDetail';
import type { PokemonDetailScreenProps } from '../navigation/navigation.types';

export default function PokemonDetailScreen({ route }: PokemonDetailScreenProps) {
  const pokemonId = route.params.pokemonId;
  const { isFavorite, toggleFavorite } = useFavorites({ pokemonId });
  const { data: pokemon, isPending, isError, error, isFetching, refetch } =
    usePokemonDetail(pokemonId);

  const retry = () => {
    if (!isFetching) {
      void refetch();
    }
  };

  if (isPending) {
    return <Loading label="Cargando detalle del Pokémon" fullScreen />;
  }

  if (!pokemon) {
    return <ErrorState message={getRequestErrorMessage(error)} onRetry={retry} />;
  }

  const imageUrl =
    pokemon.sprites.other?.['official-artwork']?.front_default ??
    pokemon.sprites.front_default;

  return (
    <SafeAreaView style={styles.screen} edges={['bottom', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.content}>
        {isFetching ? (
          <Loading label="Actualizando detalle del Pokémon" />
        ) : isError ? (
          <ErrorState
            message={`No se pudo actualizar el detalle. ${getRequestErrorMessage(error)}`}
            onRetry={retry}
            fullScreen={false}
          />
        ) : null}

        <View style={[styles.section, styles.hero]}>
          <Text style={styles.number}>#{String(pokemon.id).padStart(3, '0')}</Text>
          <Text style={styles.name} accessibilityRole="header">
            {pokemon.name}
          </Text>
          <Image
            source={imageUrl ? { uri: imageUrl } : require('../../assets/pokemon-placeholder.svg')}
            placeholder={require('../../assets/pokemon-placeholder.svg')}
            style={styles.image}
            contentFit="contain"
            placeholderContentFit="contain"
            cachePolicy="memory-disk"
            transition={200}
            recyclingKey={String(pokemon.id)}
            accessible={false}
          />
          <View style={styles.types}>
            {pokemon.types.map(({ slot, type }) => (
              <View key={slot} style={styles.badge}>
                <Text style={styles.badgeText}>{typeLabels[type.name] ?? type.name}</Text>
              </View>
            ))}
          </View>
          <FavoriteButton
            pokemonName={pokemon.name}
            isFavorite={isFavorite}
            onPress={() => toggleFavorite({
              id: pokemon.id,
              name: pokemon.name,
              imageUrl: imageUrl ?? '',
            })}
            showLabel
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.heading} accessibilityRole="header">Información</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Altura</Text>
            <Text style={styles.value}>{pokemon.height / 10} m</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Peso</Text>
            <Text style={styles.value}>{pokemon.weight / 10} kg</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Experiencia base</Text>
            <Text style={styles.value}>{pokemon.base_experience ?? 'Sin datos'}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.heading} accessibilityRole="header">Habilidades</Text>
          {pokemon.abilities.map(({ ability, slot }) => (
            <View key={slot} style={styles.row}>
              <Text style={[styles.label, styles.ability]}>
                {ability.name.replace(/-/g, ' ')}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.heading} accessibilityRole="header">Estadísticas base</Text>
          {pokemon.stats.map(({ base_stat, stat }) => (
            <View key={stat.name} style={styles.row}>
              <Text style={styles.label}>{statLabels[stat.name] ?? stat.name}</Text>
              <Text style={styles.value}>{base_stat}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    padding: 16,
    gap: 16,
    width: '100%',
    maxWidth: 640,
    alignSelf: 'center',
  },
  section: {
    padding: 20,
    gap: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff',
  },
  hero: {
    alignItems: 'center',
    gap: 8,
  },
  number: {
    color: '#64748b',
    fontSize: 16,
  },
  name: {
    color: '#0f172a',
    fontSize: 30,
    fontWeight: '700',
    textTransform: 'capitalize',
    textAlign: 'center',
  },
  image: {
    width: '100%',
    height: 240,
  },
  types: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#dbeafe',
  },
  badgeText: {
    color: '#1e40af',
    fontSize: 14,
    fontWeight: '600',
  },
  heading: {
    color: '#0f172a',
    fontSize: 20,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  label: {
    color: '#475569',
    fontSize: 16,
    flexShrink: 1,
  },
  value: {
    color: '#0f172a',
    fontSize: 16,
    fontWeight: '600',
  },
  ability: {
    textTransform: 'capitalize',
  },
});
