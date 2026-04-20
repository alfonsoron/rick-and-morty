import {  Component , inject } from '@angular/core';
import { AppRoute } from '../../../shared/enums/routes.enums';
import { Router } from '@angular/router';
@Component({
  selector: 'app-not-found',
  imports: [],
  styleUrl: './not-found.css',
  templateUrl: './not-found.html',
})
export class NotFound {
private router = inject(Router);
  goToStart(){
    this.router.navigate([AppRoute.Start]);
  }
 }
