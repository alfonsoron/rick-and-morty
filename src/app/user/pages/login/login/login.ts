import { ChangeDetectionStrategy, Component, OnInit, inject, signal,} from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule,} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../service/info-user.service';
import { LoginResponse } from '../../../interfaces/loginResponse';
import { User } from '../../../interfaces/user';
import { UserService } from '../../../service/user.service';
import { AppRoute, HomeRoute } from '../../../../shared/enums/routes.enums';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule],
  templateUrl: './login.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Login implements OnInit {
  protected readonly AppRoute = AppRoute;

  loginForm!: FormGroup;
  ok = signal<boolean | null>(null);

  private loginService = inject(UserService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

constructor() {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(5)]],
    });
  }

  onSubmit(): void {

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const payload = this.getpayload();

    this.loginService.login(payload).subscribe({
      next: (response: LoginResponse) => {
        this.authService.setUser(response.data.user as User, response.data.token);

        this.ok.set(true);
        this.router.navigate([AppRoute.Home, HomeRoute.Characters]);
      },

      error: (error) => {
        console.error('Login error:', error);
        this.ok.set(false);
      },
    });
  }

  getpayload() {
    return {
      mail: this.loginForm.value.email,
      password: this.loginForm.value.password,
    };}

  goToRegister(){
    this.router.navigate([AppRoute.Register])
  };
}


