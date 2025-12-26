import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CharacterResponse } from '../interface/character-response.interface';
import { InterfaceCharacter } from '../interface/character.inteface';
import { EpisodeInterface } from '../interface/character.inteface';
@Injectable({
  providedIn: 'root',
})
export class RickMortyService {
  private readonly baseUrl = 'https://rickandmortyapi.com/api';

  constructor(private http: HttpClient) {}

  getCharacters(page: number, name?: string) {
    const params: any = { page: String(page) };
    if (name) params.name = name;

    return this.http.get<CharacterResponse>(`${this.baseUrl}/character`,{ params });
  }


  getCharacterById(id: number) {
    return this.http.get<InterfaceCharacter>(`${this.baseUrl}/character/${id}`);
  }



  getEpisodesByIds(ids: number[]) {
    const joined = ids.join(',');
    return this.http.get<EpisodeInterface>(`${this.baseUrl}/episode/${joined}`);
}

}
