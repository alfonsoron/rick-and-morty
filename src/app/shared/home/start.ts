import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Router } from '@angular/router';
@Component({
  selector: 'app-start',
  imports: [],
  templateUrl: './start.html',
})
export class Start {
  private router = inject(Router);
  goToLogin(){
    this.router.navigate(['login']);
  }
}
