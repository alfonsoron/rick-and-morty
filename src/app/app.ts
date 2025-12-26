import { Component, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { TopMenu } from "./characters/components/top-menu/top-menu";
import { filter } from 'rxjs/operators';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, TopMenu],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('Rick-and-Morty');



  private router = inject(Router);

  showTopMenu = true;

  constructor() {
    this.checkUrl(this.router.url);

    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe((e: any) => {
        this.checkUrl(e.urlAfterRedirects);
      });
  }

  checkUrl(url: string) {

    if (
      url === '/' || url === '/404' ||
      url==='/Home/404'
    ) {
      this.showTopMenu = false;
      return
    }


    this.showTopMenu = true;
  }
}
