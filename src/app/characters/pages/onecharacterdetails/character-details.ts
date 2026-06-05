import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { RickMortyService } from '../../service/rick-morty.service';
import { InterfaceCharacter, EpisodeInterface } from '../../interface/character.inteface';
import { TraduccionPipe } from '../../pipes/traduccion-pipe';
import { CommonModule } from '@angular/common';
import { idsFromUrls } from '../../../shared/utils/ids';

@Component({
  selector: 'app-character-details',
  templateUrl: './character-details.html',
  imports: [TraduccionPipe, CommonModule],
})

export class CharacterDetails implements OnInit {
  private route = inject(ActivatedRoute);
  private service = inject(RickMortyService);
  private destroyRef = inject(DestroyRef);

  character = signal<InterfaceCharacter | null>(null);
  episodes = signal<EpisodeInterface[]>([]);

  constructor() {


  }
  ngOnInit(): void {
    const c = this.service.getCharacterDetail();
    if (!c) {
      this.getCharacterAux();
      return;
    }

    this.character.set(c);
    this.getEpisoidesByCharacter();
  }
  getEpisoidesByCharacter(): void {
    const ids = idsFromUrls(this.character()?.episode);

    this.service
      .getEpisodesByIds(ids)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (eps) => this.episodes.set(Array.isArray(eps) ? eps : [eps]),
        error: () => this.episodes.set([]),
      });
  }

  getCharacterAux() {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    this.service
      .getCharacterById(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (c) => {
          this.character.set(c);

          this.getEpisoidesByCharacter();
        },
        error: () => {
          this.character.set(null);
          this.episodes.set([]);
        },
      });

  }



}
