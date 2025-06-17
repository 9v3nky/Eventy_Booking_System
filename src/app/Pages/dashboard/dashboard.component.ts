import { Component, inject } from '@angular/core';
import { FooterNavComponent } from "../footer-nav/footer-nav.component";
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [FooterNavComponent,
    MatIconModule,
    MatCardModule,
    CommonModule,
    MatToolbarModule 
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  isAdmin = localStorage.getItem('isAdmin') =='true';
  private router = inject(Router);

  goTo(path: string) {
  this.router.navigate(['/' + path]);
}
logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

}
