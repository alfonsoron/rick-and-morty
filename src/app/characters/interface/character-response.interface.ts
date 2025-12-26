import { InterfaceCharacter } from "./character.inteface";
export interface ApiInfo {
  pages: number;

}

export interface CharacterResponse {
  info: ApiInfo;
  results: InterfaceCharacter[];
}
