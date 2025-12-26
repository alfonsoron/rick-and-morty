import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RickMortyService } from '../../service/rick-morty.service';
import { InterfaceCharacter, EpisodeInterface } from '../../interface/character.inteface';
import { TraduccionPipe } from '../../pipes/traduccion-pipe';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-character-details',
  templateUrl: './character-details.html',
  imports: [TraduccionPipe, CommonModule],
})
export class CharacterDetails {
  private route = inject(ActivatedRoute);
  private service = inject(RickMortyService);

  character = signal<InterfaceCharacter | null>(null);
  episodes = signal<EpisodeInterface[]>([]);

  constructor() {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    this.service.getCharacterById(id).subscribe({
      next: (c) => {
        this.character.set(c);


        const ids = (c.episode ?? [])
          .map((url: string) => Number(url.split('/').pop()))
          .filter((n: number) => !Number.isNaN(n));



        this.service.getEpisodesByIds(ids).subscribe({
          next: (eps) => this.episodes.set(Array.isArray(eps) ? eps : [eps]),
          error: () => this.episodes.set([]),
        });
      },
      error: () => {
        this.character.set(null);
        this.episodes.set([]);
      },
    });
  }
}
