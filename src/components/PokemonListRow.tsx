import { memo } from 'react';

import type { PokemonListItem } from '../types/pokemonListItem';
import { PokemonCard } from './PokemonCard';

type PokemonListRowProps = PokemonListItem & {
  onSelect: (pokemonId: number) => void;
};

export const PokemonListRow = memo(function PokemonListRow({
  id,
  name,
  imageUrl,
  onSelect,
}: PokemonListRowProps) {
  return (
    <PokemonCard.Root
      accessibilityLabel={`${name}, #${id}`}
      onPress={() => onSelect(id)}
    >
      <PokemonCard.Image imageUrl={imageUrl} />
      <PokemonCard.Name id={id} name={name} />
    </PokemonCard.Root>
  );
});
