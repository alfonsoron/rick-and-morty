import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EpisodeInterface, InterfaceCharacter } from '../../interface/character.inteface';
import { RickMortyService } from '../../service/rick-morty.service';
import { AppRoute, HomeRoute } from '../../../shared/enums/routes.enums';
import { AuthService } from '../../../user/service/info-user.service';
import { EpisodeComments } from '../../components/episode-comments/episode-comments';

@Component({
  selector: 'app-one-episode',
  imports: [CommonModule, EpisodeComments],
  templateUrl: './one-episode.html',
})
export class OneEpisode {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private service = inject(RickMortyService);
  private authService = inject(AuthService);

  episode = signal<EpisodeInterface | null>(null);
  characters = signal<InterfaceCharacter[]>([]);
  favoriteAdded = signal(false);

  constructor() {
    this.loadEpisodeDetail();
  }

  loadEpisodeDetail(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (Number.isNaN(id)) {
      this.episode.set(null);
      this.characters.set([]);
      return;
    }

    this.service.getEpisodeById(id).subscribe({
      next: (ep) => {
        this.episode.set(ep);
        this.favoriteAdded.set(this.authService.isEpisodeFavorite(ep.id));
        this.authService.syncFavoriteEpisodes().subscribe({
          next: () => {
            this.favoriteAdded.set(this.authService.isEpisodeFavorite(ep.id));
          },
        });
        this.loadCharactersFromEpisode(ep);
      },
      error: () => {
        this.episode.set(null);
        this.characters.set([]);
      },
    });
  }

  loadCharactersFromEpisode(ep: EpisodeInterface): void {
    const ids = (ep.characters ?? [])
      .map((url: string) => Number(url.split('/').pop()))
      .filter((n: number) => !Number.isNaN(n));

    if (!ids.length) {
      this.characters.set([]);
      return;
    }

    this.service.getCharactersByIds(ids).subscribe({
      next: (chars) => this.characters.set(Array.isArray(chars) ? chars : [chars]),
      error: () => this.characters.set([]),
    });
  }

  goToCharacter(character: InterfaceCharacter): void {
    this.service.setCharacterDetail(character);
    this.router.navigate([AppRoute.Home, HomeRoute.Characters, character.id]);
  }

  toggleEpisodeFavorite(): void {
    const selectedEpisode = this.episode();
    if (!selectedEpisode) return;

    this.authService.toggleFavoriteEpisode(selectedEpisode).subscribe({
      next: (isFavoriteNow) => {
        this.favoriteAdded.set(isFavoriteNow);
      },
      error: (error) => {
        console.error('Favorite episode error:', error);
      },
    });
  }
}
