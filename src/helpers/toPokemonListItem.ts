import type { PokemonListItem } from '../types/pokemonListItem';
import type { NamedAPIResource } from '../types/pokemonApi';

export function toPokemonListItem(resource: NamedAPIResource): PokemonListItem {
  const id = Number(resource.url.split('/').filter(Boolean).pop());

  return {
    id,
    name: resource.name,
    imageUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`,
  };
}
