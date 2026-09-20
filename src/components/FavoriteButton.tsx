import { Alert, Pressable, StyleSheet, Text } from 'react-native';

type FavoriteButtonProps = {
  pokemonName: string;
  isFavorite: boolean;
  onPress: () => void | Promise<void>;
  showLabel?: boolean;
};

export function FavoriteButton({
  pokemonName,
  isFavorite,
  onPress,
  showLabel = false,
}: FavoriteButtonProps) {
  const handlePress = async () => {
    try {
      await onPress();
    } catch {
      Alert.alert(
        'No se pudo completar o guardar el cambio',
        'Intentá nuevamente.',
      );
    }
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={isFavorite
        ? `Quitar a ${pokemonName} de favoritos`
        : `Agregar a ${pokemonName} a favoritos`}
      accessibilityState={{ selected: isFavorite }}
      onPress={handlePress}
      style={({ pressed }) => [
        styles.button,
        isFavorite && styles.selected,
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.icon, isFavorite && styles.selectedText]}>
        {isFavorite ? '★' : '☆'}
      </Text>
      {showLabel && (
        <Text style={[styles.label, isFavorite && styles.selectedText]}>
          {isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minWidth: 44,
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
  },
  selected: {
    backgroundColor: '#fffbeb',
  },
  pressed: {
    opacity: 0.7,
  },
  icon: {
    color: '#64748b',
    fontSize: 26,
  },
  label: {
    color: '#475569',
    fontSize: 14,
    fontWeight: '600',
    flexShrink: 1,
  },
  selectedText: {
    color: '#d97706',
  },
});
