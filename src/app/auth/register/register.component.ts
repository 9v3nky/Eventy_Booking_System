import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-register',
  standalone: true,
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatTooltipModule
  ]
})
export class RegisterComponent {
  registerForm: FormGroup;
  error = ""

  constructor(
    private fb: FormBuilder, 
    private auth: AuthService, 
    private router: Router,
    private snackBar: MatSnackBar
    ) {
    this.registerForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.auth.register(this.registerForm.value).subscribe({
        next: () => {
          this.snackBar.open('Registration successful!', 'Close', {
            duration: 3000,
            panelClass: 'snackbar-success',
            verticalPosition: 'top',
          });
          this.router.navigate(['/login']);
        },
        error: (err: any) => {
          const errorMsg =
            err?.error?.email?.[0] || 'An unexpected error occurred. Please try again.';
          this.snackBar.open(errorMsg, 'Close', {
            duration: 4000,
            panelClass: 'snackbar-error',
            verticalPosition: 'top',
          });
        },
      });
    } else {
      this.snackBar.open('Please complete the form correctly.', 'Close', {
        duration: 3000,
        panelClass: 'snackbar-warning',
        verticalPosition: 'top',
      });
    }
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}

