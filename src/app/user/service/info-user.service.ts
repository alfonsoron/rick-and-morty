import { Injectable, inject, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { EpisodeInterface } from '../../characters/interface/character.inteface';
import { User } from '../interfaces/user';
import { UserService } from './user.service';

interface FavoriteEpisodeApiItem {
  episodeId: number;
  name: string;
  episodeCode: string;
  airDate: string;
}

interface FavoriteEpisodeApiResponse {
  data?: FavoriteEpisodeApiItem[] | { favoriteEpisodes?: FavoriteEpisodeApiItem[] };
  favoriteEpisodes?: FavoriteEpisodeApiItem[];
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly currentUserStorageKey = 'currentUser';
  private readonly authTokenStorageKey = 'authToken';

  private userService = inject(UserService);

  private userSignal = signal<User | null>(null);
  nombre: string = '';

  setUser(user: User, token?: string) {
    const userWithSession: User = {
      ...user,
      token: token || user.token,
      favoriteEpisodes: [],
    };

    this.userSignal.set(userWithSession);
    this.nombre = user.name;
    this.persistSession(userWithSession);
    this.syncFavoriteEpisodes().subscribe();
  }

  get user() {
    return this.userSignal();
  }

  isAuthenticated(): boolean {
    if (this.userSignal()?.token) return true;
    return !!sessionStorage.getItem(this.authTokenStorageKey);
  }

  loadFromStorage() {
    // Limpieza de cualquier sesion previa guardada en localStorage (ya no se usa).
    localStorage.removeItem(this.currentUserStorageKey);
    localStorage.removeItem(this.authTokenStorageKey);

    const info = sessionStorage.getItem(this.currentUserStorageKey);
    const token = sessionStorage.getItem(this.authTokenStorageKey);
    if (!info) return;

    const storedUser = JSON.parse(info) as User;
    const userWithSession: User = {
      ...storedUser,
      token: token || storedUser.token,
      favoriteEpisodes: [],
    };

    this.userSignal.set(userWithSession);
    this.nombre = userWithSession.name;

    if (userWithSession.token) {
      this.syncFavoriteEpisodes().subscribe();
    }
  }

  logout() {
    this.userSignal.set(null);
    sessionStorage.removeItem(this.currentUserStorageKey);
    sessionStorage.removeItem(this.authTokenStorageKey);
    localStorage.removeItem(this.currentUserStorageKey);
    localStorage.removeItem(this.authTokenStorageKey);
  }

  syncFavoriteEpisodes(): Observable<EpisodeInterface[]> {
    const user = this.userSignal();
    const token = user?.token;

    if (!user || !token) return of([]);

    return this.userService.getFavoriteEpisodes(token).pipe(
      map((response) => this.normalizeFavoriteEpisodes(response)),
      tap((favoriteEpisodes) => {
        this.userSignal.set({
          ...user,
          favoriteEpisodes,
        });
      }),
    );
  }

  addFavoriteEpisode(episode: EpisodeInterface): Observable<boolean> {
    const user = this.userSignal();
    const token = user?.token;

    if (!user || !token) return of(false);
    if (this.isEpisodeFavorite(episode.id)) return of(true);

    return this.userService.addFavoriteEpisode(episode, token).pipe(
      tap(() => {
        this.userSignal.set({
          ...user,
          favoriteEpisodes: [...(user.favoriteEpisodes ?? []), episode],
        });
      }),
      map(() => true),
      catchError((error) => {
        if (error?.status === 409) {
          return this.syncFavoriteEpisodes().pipe(map(() => this.isEpisodeFavorite(episode.id)));
        }

        throw error;
      }),
    );
  }

  removeFavoriteEpisode(episodeId: number): Observable<boolean> {
    const user = this.userSignal();
    const token = user?.token;

    if (!user || !token) return of(false);

    return this.userService.removeFavoriteEpisode(episodeId, token).pipe(
      tap(() => {
        this.userSignal.set({
          ...user,
          favoriteEpisodes: (user.favoriteEpisodes ?? []).filter((item) => item.id !== episodeId),
        });
      }),
      map(() => true),
    );
  }

  toggleFavoriteEpisode(episode: EpisodeInterface): Observable<boolean> {
    if (this.isEpisodeFavorite(episode.id)) {
      return this.removeFavoriteEpisode(episode.id).pipe(map(() => false));
    }

    return this.addFavoriteEpisode(episode).pipe(map(() => true));
  }

  updateProfile(name: string, location: string, photoUrl: string): Observable<User> {
    const user = this.userSignal();
    if (!user || !user.token) return of(user!);

    const payload: Record<string, unknown> = {
      id: user.id,
      name: name || user.name,
      photoUrl: photoUrl || user.photoUrl || '',
    };

    // La direccion es opcional: solo enviamos los campos con valor real.
    // Si estan todos vacios (usuario sin direccion), no mandamos address
    // para no chocar con la validacion @IsNotEmpty del backend.
    const address = this.buildAddressPayload(user, location);
    if (address) {
      payload['address'] = address;
    }

    return this.userService.updateUser(payload, user.token).pipe(
      tap((response: any) => {
        const updatedUser: User = {
          ...user,
          ...response.user,
          token: user.token,
        };
        this.userSignal.set(updatedUser);
        this.nombre = updatedUser.name;
        this.persistSession(updatedUser);
      }),
      map((response: any) => ({
        ...user,
        ...response.user,
      })),
    );
  }

  isEpisodeFavorite(episodeId: number): boolean {
    const user = this.userSignal();
    if (!user) return false;

    return (user.favoriteEpisodes ?? []).some((episode) => episode.id === episodeId);
  }

  /**
   * Construye el address solo con los campos que tienen valor (no vacios).
   * Devuelve null si no hay ningun dato de direccion, para omitirlo del payload.
   */
  private buildAddressPayload(user: User, location: string): Record<string, string> | null {
    const source: Record<string, string> = {
      street: user.address?.street ?? '',
      location: location || user.address?.location || '',
      city: user.address?.city ?? '',
      country: user.address?.country ?? '',
      cp: user.address?.cp ?? '',
    };

    const filled = Object.entries(source).filter(([, value]) => value.trim().length > 0);

    if (filled.length === 0) {
      return null;
    }

    return Object.fromEntries(filled);
  }

  private normalizeFavoriteEpisodes(response: unknown): EpisodeInterface[] {
    return this.extractFavoriteItems(response).map((item) => ({
      id: Number(item.episodeId),
      name: item.name,
      episode: item.episodeCode,
      air_date: item.airDate,
    }));
  }

  /**
   * El backend puede devolver el listado en distintas formas (array plano,
   * dentro de data, dentro de favoriteEpisodes, etc). Tomamos el primer
   * candidato que sea un array.
   */
  private extractFavoriteItems(response: unknown): FavoriteEpisodeApiItem[] {
    if (Array.isArray(response)) {
      return response;
    }

    const parsed = response as FavoriteEpisodeApiResponse;
    const candidates: unknown[] = [
      parsed?.data,
      parsed?.favoriteEpisodes,
      (parsed?.data as { favoriteEpisodes?: FavoriteEpisodeApiItem[] })?.favoriteEpisodes,
    ];

    return (candidates.find(Array.isArray) as FavoriteEpisodeApiItem[]) ?? [];
  }

  private persistSession(user: User): void {
    // La sesion se guarda en sessionStorage (no en localStorage) para no
    // persistir las credenciales del usuario mas alla de la pestania activa.
    const { favoriteEpisodes, token, ...storedUser } = user;
    sessionStorage.setItem(this.currentUserStorageKey, JSON.stringify(storedUser));

    if (token) {
      sessionStorage.setItem(this.authTokenStorageKey, token);
    }
  }
}
