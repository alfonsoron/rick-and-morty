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

  loadFromStorage() {
    const info = localStorage.getItem(this.currentUserStorageKey);
    const token = localStorage.getItem(this.authTokenStorageKey);
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

    const payload = {
      id: user.id,
      name: name || user.name,
      photoUrl: photoUrl || user.photoUrl || '',
      address: {
        street: user.address?.street ?? '',
        location: location || user.address?.location || '',
        city: user.address?.city ?? '',
        country: user.address?.country ?? '',
        cp: user.address?.cp ?? '',
      },
    };

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

  private normalizeFavoriteEpisodes(response: unknown): EpisodeInterface[] {
    const parsedResponse = response as FavoriteEpisodeApiResponse;
    const rawItems = Array.isArray(response)
      ? response
      : Array.isArray(parsedResponse?.data)
        ? parsedResponse.data
        : Array.isArray(parsedResponse?.favoriteEpisodes)
          ? parsedResponse.favoriteEpisodes
          : Array.isArray(parsedResponse?.data?.favoriteEpisodes)
            ? parsedResponse.data.favoriteEpisodes
            : [];

    return rawItems.map((item) => ({
      id: Number(item.episodeId),
      name: item.name,
      episode: item.episodeCode,
      air_date: item.airDate,
    }));
  }

  private persistSession(user: User): void {
    const { favoriteEpisodes, ...storedUser } = user;
    localStorage.setItem(this.currentUserStorageKey, JSON.stringify(storedUser));

    if (user.token) {
      localStorage.setItem(this.authTokenStorageKey, user.token);
    }
  }
}
