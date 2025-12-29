import { InterfaceCharacter } from "./character.inteface";
export interface ApiInfo {
  pages: number;
  next: string;
  prev: string;

}

export interface CharacterResponse {
  info: ApiInfo;
  results: InterfaceCharacter[];
}
