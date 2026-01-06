import { Component, inject, signal } from '@angular/core';
import { RickMortyService } from '../../service/rick-morty.service';
import { InterfaceCharacter } from '../../interface/character.inteface';
import { Router, RouterLink } from "@angular/router";
import { Paginador } from "../../components/paginador/paginador";

@Component({
  selector: 'app-characters',
  imports: [Paginador],
  templateUrl: './characters.html',
})
export class CharactersList {

  private rickMortyService = inject(RickMortyService);
  private router = inject(Router);

  characters = signal<InterfaceCharacter[]>([]);


  currentPage = signal(1);
  totalPages = signal(1);
  prevNullPage = signal<string | null>(null)
  nextNullPage = signal<string | null>(null)

  searchName = signal<string>('');

  onSearch(value: string): void {
    this.searchName.set(value);
    this.loadCharacters();
  }

  constructor() {
    this.loadCharacters();
  }
  loadCharacters(page: number = 1) {
    this.rickMortyService.getCharacters(page, this.searchName()).subscribe({
      next: (response) => {
        this.characters.set(response.results);
        this.currentPage.set(page);
        this.totalPages.set(response.info.pages);
        this.prevNullPage.set(response.info.prev)
        this.nextNullPage.set(response.info.next)
      },
      error: () => this.characters.set([]),
    });

  }
  goToDetail(character: InterfaceCharacter): void {
    this.rickMortyService.setCharacterDetail(character);
    console.log(character);
    this.router.navigate(['/Home/characters', character.id]);


  }
}
