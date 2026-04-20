import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { EpisodeInterface } from '../../interface/character.inteface';
import { RickMortyService } from '../../service/rick-morty.service';
import { Paginador } from '../../components/paginador/paginador';
import { AppRoute, HomeRoute } from '../../../shared/enums/routes.enums';

@Component({
  selector: 'app-episode',
  imports: [Paginador],
  templateUrl: './episode.html',
})
export class Episode {
  private rickMortyService = inject(RickMortyService);
  private router = inject(Router);

  episodes = signal<EpisodeInterface[]>([]);

  currentPage = signal(1);
  totalPages = signal(1);
  prevNullPage = signal<string | null>(null);
  nextNullPage = signal<string | null>(null);

  searchName = signal<string>('');

  constructor() {
    this.loadEpisodes();
  }

  onSearch(value: string): void {
    this.searchName.set(value);
    this.loadEpisodes();
  }

  loadEpisodes(page: number = 1): void {
    this.rickMortyService.getEpisodes(page, this.searchName()).subscribe({
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
}
