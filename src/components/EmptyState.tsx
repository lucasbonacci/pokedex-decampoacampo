import { StyleSheet, Text, View } from 'react-native';

type EmptyStateProps = {
  message: string;
  description?: string;
};

export function EmptyState({ message, description }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.message}>{message}</Text>
      {description && <Text style={styles.description}>{description}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 24,
    gap: 8,
  },
  message: {
    color: '#64748b',
    fontSize: 16,
    textAlign: 'center',
  },
  description: {
    color: '#64748b',
    fontSize: 14,
    textAlign: 'center',
  },
});
