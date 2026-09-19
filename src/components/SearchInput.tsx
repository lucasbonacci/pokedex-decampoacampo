import { StyleSheet, TextInput, type TextInputProps } from 'react-native';

type SearchInputProps = Omit<TextInputProps, 'value' | 'onChangeText' | 'defaultValue'> & {
  value: string;
  onChangeText: (text: string) => void;
};

export function SearchInput({
  value,
  onChangeText,
  placeholder = 'Buscar por nombre',
  accessibilityLabel = placeholder,
  style,
  ...props
}: SearchInputProps) {
  return (
    <TextInput
      autoCapitalize="none"
      autoCorrect={false}
      clearButtonMode="while-editing"
      placeholderTextColor="#64748b"
      {...props}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      accessibilityLabel={accessibilityLabel}
      style={[styles.input, style]}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 48,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    backgroundColor: '#ffffff',
    color: '#0f172a',
    fontSize: 16,
  },
});
