import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { typeLabels } from '../constants/pokemonDetail';

type PokemonTypeFilterProps = {
  value: string | null;
  onChange: (type: string | null) => void;
};

const options = [
  { value: null, label: 'Todos los tipos' },
  ...Object.entries(typeLabels).map(([value, label]) => ({ value, label })),
];

export function PokemonTypeFilter({ value, onChange }: PokemonTypeFilterProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <View style={styles.container}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Filtrar por tipo: ${value ? typeLabels[value] : 'Todos los tipos'}`}
        accessibilityState={{ expanded }}
        onPress={() => setExpanded((previous) => !previous)}
        style={({ pressed }) => [styles.trigger, value !== null && styles.active, pressed && styles.pressed]}
      >
        <Text style={styles.triggerText}>
          {value ? `Tipo: ${typeLabels[value]}` : 'Filtrar por tipo'}
        </Text>
        <Text style={styles.triggerText} accessibilityElementsHidden importantForAccessibility="no">
          {expanded ? '▴' : '▾'}
        </Text>
      </Pressable>
      {expanded && (
        <ScrollView style={styles.panel} contentContainerStyle={styles.options} keyboardShouldPersistTaps="handled">
          {options.map((option) => {
            const selected = value === option.value;
            return (
              <Pressable
                key={option.value ?? 'all'}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() => {
                  onChange(option.value);
                  setExpanded(false);
                }}
                style={({ pressed }) => [styles.option, selected && styles.selected, pressed && styles.pressed]}
              >
                <Text style={[styles.optionText, selected && styles.selectedText]}>
                  {option.label}{selected ? ' ✓' : ''}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginHorizontal: 16, marginTop: 12 },
  trigger: {
    minHeight: 48,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    backgroundColor: '#ffffff',
  },
  active: { borderColor: '#2563eb', backgroundColor: '#eff6ff' },
  triggerText: { fontSize: 16, fontWeight: '400', color: '#0f172a' },
  panel: { maxHeight: 220, marginTop: 8, borderRadius: 8, backgroundColor: '#ffffff' },
  options: { padding: 8, flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  option: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
  },
  selected: { backgroundColor: '#2563eb' },
  optionText: { fontSize: 14, color: '#334155', fontWeight: '500' },
  selectedText: { color: '#ffffff' },
  pressed: { opacity: 0.7 },
});
