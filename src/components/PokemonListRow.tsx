import { memo } from 'react';

import { useFavorites } from '../hooks/useFavorites';
import type { PokemonListItem } from '../types/pokemonListItem';
import { FavoriteButton } from './FavoriteButton';
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
  const { isFavorite, toggleFavorite } = useFavorites({ pokemonId: id });

  return (
    <PokemonCard.Root
      accessibilityLabel={`${name}, #${id}`}
      onPress={() => onSelect(id)}
      action={
        <FavoriteButton
          pokemonName={name}
          isFavorite={isFavorite}
          onPress={() => toggleFavorite({ id, name, imageUrl })}
        />
      }
    >
      <PokemonCard.Image imageUrl={imageUrl} />
      <PokemonCard.Name id={id} name={name} />
    </PokemonCard.Root>
  );
});
