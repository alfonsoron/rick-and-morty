import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../user/service/info-user.service';
import { User } from '../../../../user/interfaces/user';
import { EpisodeInterface } from '../../../interface/character.inteface';
import { AppRoute, HomeRoute } from '../../../../shared/enums/routes.enums';
import { defaultAvatarUrl } from '../../../../shared/utils/avatar';

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
  private destroyRef = inject(DestroyRef);

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

    this.authService.syncFavoriteEpisodes().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
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

  /**
   * Foto de perfil a mostrar: la cargada por el usuario o, si no existe (o
   * falla la carga), un avatar placeholder random pero estable.
   */
  profilePhoto(): string {
    const photoUrl = this.user()?.photoUrl?.trim();
    if (photoUrl && !this.imageLoadError()) {
      return photoUrl;
    }
    return defaultAvatarUrl(this.user()?.id ?? this.user()?.name);
  }

  onProfileImageError(): void {
    this.imageLoadError.set(true);
  }

  saveProfile(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    const currentUser = this.user();
    if (!currentUser) {
      return;
    }

    const name = this.profileForm.value.name?.trim() || currentUser.name;
    const location = this.profileForm.value.location?.trim() || currentUser.address?.location || '';
    const photoUrl = this.profileForm.value.photoUrl?.trim() || currentUser.photoUrl || '';

    this.authService
      .updateProfile(name, location, photoUrl)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
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
