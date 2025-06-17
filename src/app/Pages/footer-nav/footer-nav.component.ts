import { Component } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import {MatTabsModule} from '@angular/material/tabs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer-nav',
  imports: [
    MatToolbarModule, 
    MatIconModule, 
    MatTooltipModule,
    MatButtonModule, 
    RouterModule, 
    MatTabsModule, 
    CommonModule
  ],
  templateUrl: './footer-nav.component.html',
  styleUrl: './footer-nav.component.css'
})
export class FooterNavComponent {
  isAdmin = localStorage.getItem('isAdmin') == 'true';
  
}
