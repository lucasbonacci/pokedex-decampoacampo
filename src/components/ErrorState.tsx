import { Pressable, StyleSheet, Text, View } from 'react-native';

type ErrorStateProps = {
  message: string;
  onRetry?: () => void;
  fullScreen?: boolean;
};

export function ErrorState({ message, onRetry, fullScreen = true }: ErrorStateProps) {
  return (
    <View style={[styles.container, fullScreen && styles.fullScreen]}>
      <Text style={styles.message} accessibilityRole="alert">
        {message}
      </Text>
      {onRetry && (
        <Pressable
          onPress={onRetry}
          accessibilityRole="button"
          style={({ pressed }) => [styles.button, pressed && styles.pressed]}
        >
          <Text style={styles.buttonText}>Reintentar</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#f8fafc',
    gap: 12,
  },
  fullScreen: {
    flex: 1,
  },
  message: {
    color: '#b91c1c',
    fontSize: 16,
    textAlign: 'center',
  },
  button: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#2563eb',
  },
  pressed: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
});
