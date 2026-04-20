import { EpisodeInterface } from "../../characters/interface/character.inteface";
import { RegisterPayload } from "./registerPayload";

export interface User {
  id: string;
  role: string;
  name: string;
  mail: string;
  token?: string;
  photoUrl?: string;
  address?: RegisterPayload['address'];
  phone: string;
  birthday?: string;
  favoriteEpisodes?: EpisodeInterface[];
};
