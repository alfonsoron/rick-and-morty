import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../user/service/info-user.service';
import { AppRoute, HomeRoute } from '../../../shared/enums/routes.enums';

@Component({
  selector: 'app-top-menu',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './top-menu.html',
})
export class TopMenu {
  authService = inject(AuthService);
  private router = inject(Router);

  logout(): void {
    this.authService.logout();
    this.router.navigate(['']);
  }
  goToCharacters(){
    this.router.navigate([AppRoute.Home, HomeRoute.Characters]);
  }
  goToEpisodes(){
    this.router.navigate([AppRoute.Home, HomeRoute.Episodes]);
  }
  goToLocations(){
    this.router.navigate([AppRoute.Home, HomeRoute.Locations]);
  }
  goToStart(){
    this.router.navigate([AppRoute.Start]);
  }
  goToProfile(){
    this.router.navigate([AppRoute.Home, HomeRoute.Profile]);
  }
  
}
