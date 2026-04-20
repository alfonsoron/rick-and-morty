import { RegisterPayload } from './../../../interfaces/registerPayload';
import { UserService } from './../../../service/user.service';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { AbstractControl,FormBuilder,FormGroup,ValidationErrors,Validators,ReactiveFormsModule,} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AppRoute } from '../../../../shared/enums/routes.enums';




function passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const repeatPassword = control.get('repeatPassword')?.value;

  if (!password || !repeatPassword) return null;
  return password === repeatPassword ? null : { passwordsMismatch: true };
}


function addressValidation(control: AbstractControl): ValidationErrors | null {
  const fields = ['street', 'number', 'city', 'country', 'zip'];

  const values = fields.map(f => (control.get(f)?.value ?? '').toString().trim());

  const anyFilled = values.some(v => v.length > 0);
  const allFilled = values.every(v => v.length > 0);

  if (!anyFilled) return null;
  return allFilled ? null : { addressIncomplete: true };
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './register.html',
  changeDetection: ChangeDetectionStrategy.OnPush,

})
export class Register implements OnInit {

  protected readonly AppRoute = AppRoute;

  ok = signal<boolean | null>(null);
  loginForm!: FormGroup;

  private registerService = inject(UserService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  constructor() {}

  ngOnInit(): void {
    this.loginForm = this.fb.group(
      {
        fullName: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(15)]],
        email: ['', [Validators.required, Validators.email, Validators.minLength(10), Validators.maxLength(50)]],
        password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(30)]],
        repeatPassword: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(30)]],
        street: ['', [Validators.maxLength(50)]],
        number: ['', [Validators.maxLength(10)]],
        city: ['', [Validators.maxLength(50)]],
        country: ['', [Validators.maxLength(50)]],
        zip: ['', [Validators.minLength(4), Validators.maxLength(4), Validators.pattern(/^\d{4}$/)]],
      },
      { validators: [passwordsMatchValidator, addressValidation] }
    );
    this.loginForm.reset();
  }

  onSubmit(): void {
    this.ok.set(null);

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const payload = this.getpayload();

    this.registerService.register(payload).subscribe({
      next: () => {
        this.ok.set(true);
        this.loginForm.reset();
        this.router.navigate([AppRoute.Login]);
      },
      error: (error) => {
        console.error('Registration error:', error);
        this.ok.set(false);
      },
    });
  }


  getpayload(): RegisterPayload { const payload: RegisterPayload = {
      name: this.loginForm.value.fullName,
      mail: this.loginForm.value.email,
      password: this.loginForm.value.password,
      address: {
        street: this.loginForm.value.street,
        location: this.loginForm.value.number,
        city: this.loginForm.value.city,
        country: this.loginForm.value.country,
        cp: this.loginForm.value.zip,
      },
      phone: '3584203237',
      birthday: '2003-10-12',
    };
    return payload;
  }
  goToLogin(){
    this.router.navigate([AppRoute.Login]);
  }
}


