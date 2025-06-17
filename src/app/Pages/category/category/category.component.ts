import { Component, OnInit, inject } from '@angular/core';
import { CategoryService } from '../category.service';
import { Router } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { firstValueFrom } from 'rxjs';
import { AddEditCategoryComponent } from '../add-category/add-category.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FooterNavComponent } from "../../footer-nav/footer-nav.component";


@Component({
  selector: 'app-category',
  standalone: true,
  imports: [CommonModule,
    FormsModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    MatTableModule,
    MatPaginatorModule,
    MatProgressSpinnerModule, 
    FooterNavComponent],
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.css']
})
export class CategoryComponent implements OnInit {
  private categoryService = inject(CategoryService);
  private router = inject(Router);
  private dialog = inject(MatDialog);

  dataSource = new MatTableDataSource<any>();
  displayedColumns = ['sno', 'name', 'created_by', 'status', 'actions'];
  selectedStatus: number = 1;
  totalItems: number = 0;
  currentPage: number = 1;
  loading: boolean = false;

  constructor(
    private snackBar: MatSnackBar
  ) {}
  ngOnInit() {
    this.loadCategories();
  }

  onPageChange(event: any) {
    this.currentPage = event.pageIndex + 1;
    this.loadCategories();
  }

  async loadCategories() {
    this.loading = true;
    try {
      const res = await firstValueFrom(
        this.categoryService.getCategories(this.selectedStatus, this.currentPage)
      );
      this.dataSource.data = res.data; 
      this.totalItems = res.count || this.dataSource.data.length;
    } catch (err) {
      console.error('Failed to load categories', err);
    } finally {
      this.loading = false;
    }
  }

  addCategory() {
    const dialogRef = this.dialog.open(AddEditCategoryComponent, {
      width: '400px',
      data: null,
      disableClose: true,
      autoFocus: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) this.loadCategories();
    });
  }


  editCategory(category: any) {
  const dialogRef = this.dialog.open(AddEditCategoryComponent, {
    width: '400px',
    data: category,
    disableClose: true,
    autoFocus: true
  });

  dialogRef.afterClosed().subscribe(result => {
    if (result) this.loadCategories();
  });
}
  confirmDelete(category: any) {
    if (confirm("This category will be marked as deleted. Future time slots will also be removed and cannot be recovered. Are you sure?")) {
      this.categoryService.deleteCategory(category.id).subscribe(() => this.loadCategories());
    }
  }

  recoverCategory(category: any) {
    const confirmRecover = confirm("Do you want to recover this category?");
    if (confirmRecover) {
      this.categoryService.recoverCategory(category.id).subscribe({
        next: () => {
          this.snackBar.open('Category recovered successfully.', 'Close', { duration: 3000 });
          this.loadCategories();
        },
        error: () => {
          this.snackBar.open('Failed to recover category.', 'Close', { duration: 3000 });
        }
      });
    }
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}
