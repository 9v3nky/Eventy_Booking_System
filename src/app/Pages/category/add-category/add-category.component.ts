import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { CategoryService } from '../category.service';

@Component({
  selector: 'app-add-edit-category',
  standalone: true,
  templateUrl: './add-category.component.html',
  styleUrls: ['./add-category.component.css'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule,
    MatIconModule,
    MatDialogModule
  ]
})
export class AddEditCategoryComponent implements OnInit {
  form!: FormGroup;
  isEdit: boolean = false;
  categoryId!: number | null;

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private categoryService: CategoryService,
    private dialogRef: MatDialogRef<AddEditCategoryComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      name: ['', [Validators.required]],
    });
    if (this.data && this.data.name) {
      this.isEdit = true;
      
      this.categoryId = this.data.id;
      this.form.patchValue({
        name: this.data.name
      });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    const formData = {
      name: this.toTitleCase(this.form.value.name.trim())
    };

    if (this.isEdit && this.categoryId) {
      this.categoryService.updateCategory(this.categoryId, formData).subscribe({
        next: () => {
          this.snackBar.open('Category updated successfully.', 'Close', { duration: 3000 });
          this.dialogRef.close(true);
        },
        error: (err) => {
          this.snackBar.open(err?.error?.detail || 'Update failed', 'Close', { duration: 3000 });
        }
      });
    } else {
      this.categoryService.addCategory(formData).subscribe({
        next: () => {
          this.snackBar.open('Category added successfully.', 'Close', { duration: 3000 });
          this.dialogRef.close(true);
        },
        error: (err) => {
          this.snackBar.open(err?.error?.detail || 'Creation failed', 'Close', { duration: 3000 });
        }
      });
    }
  }

  toTitleCase(str: string): string {
    return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
  }

  shouldEnable(): boolean {
    if (this.isEdit) {
      const currentValue = this.form.get('name')?.value?.trim();
      const originalValue = this.data.name?.trim();
      return currentValue === originalValue;
    }
    return false;
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
