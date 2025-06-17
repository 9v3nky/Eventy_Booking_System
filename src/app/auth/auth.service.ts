import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { backend_url } from './auth-header.util';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = backend_url; 

  constructor(private http: HttpClient, private router: Router) {}

  login(credentials: { username: string; password: string }) {
    return this.http.post<any>(`${this.apiUrl}/login/`, credentials);
  }

  register(data: any) {
    return this.http.post<any>(`${this.apiUrl}/register/`, data);
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh');
    localStorage.removeItem('username');
    localStorage.removeItem('isAdmin');
    this.router.navigate(['/login']);
  }

  saveToken(token: string, refresh:any) {
    localStorage.setItem('token', token);
    localStorage.setItem('refresh', refresh);
  }

  saveUserDetails(username: string, isAdmin: boolean) {
    localStorage.setItem('username', username);
    localStorage.setItem('isAdmin', isAdmin ? 'true' : 'false');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getRefresh(): string | null {
    return localStorage.getItem('refresh');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getUsername(): string | null {
    return localStorage.getItem('username');
  }

  isAdmin(): boolean {
    return localStorage.getItem('isAdmin') === 'true';
  }
}
