export interface LocationRef {
  name: string;

}
export interface OrigineRef{
  name: string;

}

export interface EpisodeInterface {
  id: number;
  episode: string;
  name: string;
}

export interface InterfaceCharacter {
  id: number;
  name: string;
  image: string;
  species: string;
  origin: OrigineRef;
  location: LocationRef;
  status: 'Alive' | 'Dead' | 'unknown';
  gender: 'Female' | 'Male' | 'Genderless' | 'unknown';
  episode: string[];
}
