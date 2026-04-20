import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { EpisodeInterface } from '../../characters/interface/character.inteface';
import { RegisterPayload } from '../interfaces/registerPayload';
import { RegisterResponse } from '../interfaces/registerResponse';
import { LoginPayload } from '../interfaces/loginPayload';
import { LoginResponse } from '../interfaces/loginResponse';

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);

  private readonly BASE_URL = environment.apiUrl;
  private readonly REGISTER_URL = `${this.BASE_URL}/user/register`;
  private readonly LOGIN_URL = `${this.BASE_URL}/user/login`;
  private readonly FAVORITE_EPISODES_URL = `${this.BASE_URL}/favorite-episodes`;

  register(payload: RegisterPayload): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(this.REGISTER_URL, payload);
  }

  login(payload: LoginPayload): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(this.LOGIN_URL, payload);
  }

  getFavoriteEpisodes(token: string): Observable<unknown> {
    return this.http.get<unknown>(this.FAVORITE_EPISODES_URL, {
      headers: this.createAuthHeaders(token),
    });
  }

  addFavoriteEpisode(episode: EpisodeInterface, token: string): Observable<unknown> {
    return this.http.post<unknown>(
      this.FAVORITE_EPISODES_URL,
      {
        episodeId: episode.id,
        name: episode.name,
        episodeCode: episode.episode,
        airDate: episode.air_date ?? '',
      },
      {
        headers: this.createAuthHeaders(token),
      },
    );
  }

  removeFavoriteEpisode(episodeId: number, token: string): Observable<unknown> {
    return this.http.delete<unknown>(`${this.FAVORITE_EPISODES_URL}/${episodeId}`, {
      headers: this.createAuthHeaders(token),
    });
  }

  updateUser(payload: any, token: string): Observable<any> {
    return this.http.put<any>(`${this.BASE_URL}/user/update`, payload, {
      headers: this.createAuthHeaders(token),
    });
  }

  private createAuthHeaders(token: string): HttpHeaders {
    return new HttpHeaders({
      'auth-token': token,
    });
  }
}
