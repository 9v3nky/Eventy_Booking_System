import { Component, inject } from '@angular/core';
import { FooterNavComponent } from "../..//footer-nav/footer-nav.component";
import { UserService } from '../user.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { PageEvent } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router } from '@angular/router';


@Component({
  selector: 'app-user',
  standalone: true,
  imports: [FooterNavComponent,
    CommonModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatToolbarModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule
  ],
  templateUrl: './user.component.html',
  styleUrl: './user.component.css'
})
export class UserComponent {
   private router = inject(Router);
  users: any[] = [];
  displayedColumns = ['username', 'role', 'status', 'actions'];

  searchTerm: string = '';
  private searchSubject = new Subject<string>();

  totalItems = 0;
  pageSize = 10;
  currentPage = 1;

  constructor(private userService: UserService, private snackBar: MatSnackBar) {}

  ngOnInit() {
    this.loadUsers();

    this.searchSubject.pipe(debounceTime(300)).subscribe(term => {
      this.currentPage = 1;
      this.loadUsers();
    });
  }

  onSearchChange() {
    this.searchSubject.next(this.searchTerm);
  }

  onPageChange(event: PageEvent) {
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadUsers();
  }

  loadUsers() {
    this.userService.getUsers(this.searchTerm, this.currentPage, this.pageSize).subscribe({
      next: res => {
        this.users = res.results;
        this.totalItems = res.count;
      },
      error: () => this.snackBar.open('Error loading users', 'Close', { duration: 3000 })
    });
  }

  confirmToggle(user: any) {
    if (!user.is_active) return;
    const action = user.is_admin ? 'remove admin role from' : 'make';
    if (confirm(`Are you sure you want to ${action} ${user.username}?`)) {
      this.userService.toggleAdmin(user.id).subscribe({
        next: () => {
          this.snackBar.open('Role updated', 'Close', { duration: 3000 });
          this.loadUsers();
        },
        error: (err) => {
        const errorMessage = err?.error?.error || 'Action failed';
        this.snackBar.open(errorMessage, 'Close', { duration: 3000 });
      }
    });
    }
  }
  logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}
