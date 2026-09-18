export type NamedAPIResource = {
  name: string;
  url: string;
};

export type PokemonListResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: NamedAPIResource[];
};

export type PokemonDetail = {
  id: number;
  name: string;
  base_experience: number | null;
  height: number;
  weight: number;
  sprites: {
    front_default: string | null;
    other: {
      'official-artwork': {
        front_default: string | null;
      };
    };
  };
  stats: {
    base_stat: number;
    stat: NamedAPIResource;
  }[];
  types: {
    slot: number;
    type: NamedAPIResource;
  }[];
  abilities: {
    ability: NamedAPIResource;
    is_hidden: boolean;
    slot: number;
  }[];
};
