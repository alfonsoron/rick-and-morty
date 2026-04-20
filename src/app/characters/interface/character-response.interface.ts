import { InterfaceCharacter } from "./character.inteface";
import { EpisodeInterface } from "./character.inteface";

export interface ApiInfo {
  pages: number;
  next: string;
  prev: string;
}

export interface CharacterResponse {
  info: ApiInfo;
  results: InterfaceCharacter[];
}

export interface EpisodeResponse {
  info: ApiInfo;
  results: EpisodeInterface[];
}
