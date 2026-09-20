import { Image } from 'expo-image';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type RootProps = {
  children: ReactNode;
  accessibilityLabel: string;
  onPress: () => void;
  action: ReactNode;
};

function Root({ children, accessibilityLabel, onPress, action }: RootProps) {
  return (
    <View style={styles.card}>
      <Pressable
        style={({ pressed }) => [styles.content, pressed && styles.pressed]}
        accessible
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityHint="Abre el detalle del Pokémon"
        onPress={onPress}
      >
        {children}
      </Pressable>
      {action}
    </View>
  );
}

type PokemonImageProps = {
  imageUrl: string;
};

function PokemonImage({ imageUrl }: PokemonImageProps) {
  return (
    <Image
      source={imageUrl ? { uri: imageUrl } : require('../../assets/pokemon-placeholder.svg')}
      placeholder={require('../../assets/pokemon-placeholder.svg')}
      style={styles.image}
      contentFit="contain"
      placeholderContentFit="contain"
      transition={200}
      cachePolicy="memory-disk"
      recyclingKey={imageUrl}
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
  pressed: {
    opacity: 0.7,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
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
