import { ActivityIndicator, StyleSheet, View } from 'react-native';

type LoadingProps = {
  label: string;
  fullScreen?: boolean;
};

export function Loading({ label, fullScreen = false }: LoadingProps) {
  return (
    <View style={fullScreen ? styles.centered : styles.footer}>
      <ActivityIndicator
        size={fullScreen ? 'large' : 'small'}
        color="#2563eb"
        accessibilityLabel={label}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#f8fafc',
  },
  footer: {
    paddingVertical: 16,
  },
});
