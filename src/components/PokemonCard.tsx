import type { ReactNode } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

type RootProps = {
  children: ReactNode;
  accessibilityLabel: string;
};

function Root({ children, accessibilityLabel }: RootProps) {
  return (
    <View style={styles.card} accessible accessibilityLabel={accessibilityLabel}>
      {children}
    </View>
  );
}

type PokemonImageProps = {
  imageUrl: string;
};

function PokemonImage({ imageUrl }: PokemonImageProps) {
  return (
    <Image
      source={{ uri: imageUrl }}
      style={styles.image}
      resizeMode="contain"
      accessible={false}
    />
  );
}

type NameProps = {
  id: number;
  name: string;
};

function Name({ id, name }: NameProps) {
  return (
    <View style={styles.info}>
      <Text style={styles.id}>#{String(id).padStart(3, '0')}</Text>
      <Text style={styles.name}>{name}</Text>
    </View>
  );
}

export const PokemonCard = {
  Root,
  Image: PokemonImage,
  Name,
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff',
  },
  image: {
    width: 88,
    height: 88,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
  },
  info: {
    flex: 1,
    gap: 4,
  },
  id: {
    color: '#64748b',
    fontSize: 14,
  },
  name: {
    color: '#0f172a',
    fontSize: 20,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
});
