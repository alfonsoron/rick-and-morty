import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { EpisodeInterface } from '../../interface/character.inteface';
import { RickMortyService } from '../../service/rick-morty.service';
import { Paginador } from '../../components/paginador/paginador';
import { AppRoute, HomeRoute } from '../../../shared/enums/routes.enums';
import { AuthService } from '../../../user/service/info-user.service';

@Component({
  selector: 'app-episode',
  imports: [Paginador, MatButtonModule, MatIconModule],
  templateUrl: './episode.html',
})
export class Episode {
  private rickMortyService = inject(RickMortyService);
  private router = inject(Router);
  private authService = inject(AuthService);
  private destroyRef = inject(DestroyRef);

  episodes = signal<EpisodeInterface[]>([]);

  currentPage = signal(1);
  totalPages = signal(1);
  prevNullPage = signal<string | null>(null);
  nextNullPage = signal<string | null>(null);

  searchName = signal<string>('');

  constructor() {
    this.loadEpisodes();
    this.authService.syncFavoriteEpisodes().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
  }

  onSearch(value: string): void {
    this.searchName.set(value);
    this.loadEpisodes();
  }

  loadEpisodes(page: number = 1): void {
    this.rickMortyService
      .getEpisodes(page, this.searchName())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.episodes.set(response.results);
          this.currentPage.set(page);
          this.totalPages.set(response.info.pages);
          this.prevNullPage.set(response.info.prev);
          this.nextNullPage.set(response.info.next);
        },
        error: () => {
          this.episodes.set([]);
          this.currentPage.set(1);
          this.totalPages.set(1);
          this.prevNullPage.set(null);
          this.nextNullPage.set(null);
        },
      });
  }

  goToEpisodeDetail(episode: EpisodeInterface): void {
    this.router.navigate([AppRoute.Home, HomeRoute.Episodes, episode.id]);
  }

  isFavorite(episode: EpisodeInterface): boolean {
    return this.authService.isEpisodeFavorite(episode.id);
  }

  toggleFavorite(episode: EpisodeInterface, event: Event): void {
    // Evita que el click en el boton propague a la card y navegue al detalle.
    event.stopPropagation();

    this.authService
      .toggleFavoriteEpisode(episode)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        error: (error) => console.error('Favorite episode error:', error),
      });
  }
}
