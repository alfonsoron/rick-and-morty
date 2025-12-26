import { Component, inject, signal } from '@angular/core';
import { RickMortyService } from '../../service/rick-morty.service';
import { InterfaceCharacter } from '../../interface/character.inteface';
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-characters',
  imports: [RouterLink],
  templateUrl: './characters.html',
})
export class CharactersList {

private rickMortyService = inject(RickMortyService);

  characters = signal<InterfaceCharacter[]>([]);


currentPage = signal(1);
totalPages  = signal(1);

goToPage(page: number) {
    if ( page < 1 || page > this.totalPages())
      return;

    this.loadCharacters(page);
    }

nextPage(){
  this.goToPage(this.currentPage() + 1);
}

prevPage(){
  this.goToPage(this.currentPage() - 1);
}




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

      },
      error: () => this.characters.set([]),
    });

  }}
