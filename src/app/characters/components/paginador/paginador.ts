import {  Component, input, output } from '@angular/core';

@Component({
  selector: 'app-paginador',
  imports: [],
  templateUrl: './paginador.html',

})
export class Paginador {

currentPage= input<number>(1)
prevNullPage= input<string | null>(null)
nextNullPage= input<string | null>(null)
totalPages= input<number>(1)

  pageChange = output<number>();

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages()) return;
    this.pageChange.emit(page);

  }
  nextPage() {
    this.goToPage(this.currentPage() + 1);
  }
  prevPage() {
    this.goToPage(this.currentPage() - 1);
  }

 }
