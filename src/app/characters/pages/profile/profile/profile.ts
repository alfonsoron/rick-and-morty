import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../user/service/info-user.service';
import { User } from '../../../../user/interfaces/user';
import { EpisodeInterface } from '../../../interface/character.inteface';
import { AppRoute, HomeRoute } from '../../../../shared/enums/routes.enums';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './profile.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Profile {
  private authService = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  imageLoadError = signal(false);
  user = computed<User | null>(() => this.authService.user);
  favoriteEpisodes = computed<EpisodeInterface[]>(() => this.user()?.favoriteEpisodes ?? []);
  profileForm = this.fb.group({
    name: [''],
    location: [''],
    photoUrl: [''],
  });

  constructor() {
    const user = this.authService.user;

    this.profileForm.patchValue({
      name: user?.name ?? '',
      location: user?.address?.location ?? '',
      photoUrl: user?.photoUrl ?? '',
    });

    this.imageLoadError.set(false);

    this.authService.syncFavoriteEpisodes().subscribe();
  }

  getAddress(): string {
    const user = this.authService.user;
    if (!user?.address) return 'No especificada';
    const { street, location, city, country, cp } = user.address;

    return [street, location, city, country, cp]
      .filter(Boolean)
      .join(', ');
  }

  goToEpisode(episodeId: number): void {
    this.router.navigate([AppRoute.Home, HomeRoute.Episodes, episodeId]);
  }

  hasProfilePhoto(): boolean {
    return !!this.user()?.photoUrl && !this.imageLoadError();
  }

  onProfileImageError(): void {
    this.imageLoadError.set(true);
  }

  saveProfile(): void {
    console.log('saveProfile clicked');
    console.log('Form valid?', this.profileForm.valid);
    console.log('Form value:', this.profileForm.value);

    if (this.profileForm.invalid) {
      console.log('Form is invalid');
      this.profileForm.markAllAsTouched();
      return;
    }

    const currentUser = this.user();
    if (!currentUser) {
      console.log('No current user');
      return;
    }

    const name = this.profileForm.value.name?.trim() || currentUser.name;
    const location = this.profileForm.value.location?.trim() || currentUser.address?.location || '';
    const photoUrl = this.profileForm.value.photoUrl?.trim() || currentUser.photoUrl || '';

    console.log('Sending update:', { name, location, photoUrl });
    this.authService.updateProfile(name, location, photoUrl).subscribe({
      next: () => {
        console.log('Update successful');
        this.imageLoadError.set(false);
        this.profileForm.patchValue({
          name,
          location,
          photoUrl,
        });
      },
      error: (error) => {
        console.error('Error updating profile:', error);
      },
    });
  }
}
