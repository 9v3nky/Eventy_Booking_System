import { Component, inject, OnInit } from '@angular/core';
import { FooterNavComponent } from '../../footer-nav/footer-nav.component';
import { PreferencesService } from '../preference.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router } from '@angular/router';

@Component({
  selector: 'app-preference',
  standalone: true,
  imports: [
    FooterNavComponent,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    MatCardModule,
    MatCheckboxModule,
    MatButtonModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatToolbarModule
  ],
  templateUrl: './preference.component.html',
  styleUrl: './preference.component.css'
})
export class PreferencesComponent implements OnInit {
  categories: any[] = [];
  selectedPreferences: number[] = [];
  originalPreferences: number[] = [];
  loading = false;

  private preferenceService = inject(PreferencesService);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);
  
  ngOnInit(): void {
    this.fetchData();
  }

  async fetchData(): Promise<void> {
    this.loading = true;
    try {
      const [categoriesRes, preferencesRes] = await Promise.all([
        this.preferenceService.getActiveCategories().toPromise(),
        this.preferenceService.getUserPreferences().toPromise()
      ]);

      this.categories = categoriesRes;

      // Extract category IDs from preferences
      const preferenceIds = preferencesRes.map((p: any) => p.category);
      this.selectedPreferences = [...preferenceIds];
      this.originalPreferences = [...preferenceIds];

    } catch (err) {
      this.snackBar.open('Failed to load preferences.', 'Close', { duration: 3000 });
    } finally {
      this.loading = false;
    }
  }

  isSelected(id: number): boolean {
    return this.selectedPreferences.includes(id);
  }

  togglePreference(id: number): void {
    if (id == null) return;

    if (this.isSelected(id)) {
      this.selectedPreferences = this.selectedPreferences.filter(prefId => prefId !== id);
    } else {
      this.selectedPreferences.push(id);
    }
  }

  hasChanges(): boolean {
    return (
      this.selectedPreferences.length !== this.originalPreferences.length ||
      !this.selectedPreferences.every(id => this.originalPreferences.includes(id))
    );
  }

  updatePreferences(): void {
    const categoryIds = this.selectedPreferences
      .filter(id => id != null)
      .map(id => Number(id));

    this.preferenceService.updatePreferences(categoryIds).subscribe({
      next: () => {
        this.snackBar.open('Preferences updated successfully.', 'Close', { duration: 3000 });
        this.originalPreferences = [...this.selectedPreferences];
      },
      error: (err) => {
        this.snackBar.open(err?.error?.message || 'Update failed.', 'Close', { duration: 3000 });
        console.error(err);
      }
    });
  }

  discardChanges(): void {
    this.selectedPreferences = [...this.originalPreferences];
  }
  logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}
