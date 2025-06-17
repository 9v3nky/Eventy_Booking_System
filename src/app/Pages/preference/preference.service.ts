import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { backend_url, getAuthHeaders } from '../../auth/auth-header.util';

@Injectable({
  providedIn: 'root'
})
export class PreferencesService {
  private apiUrl = backend_url + '/categories'; 

  constructor(private http: HttpClient) {}

  getActiveCategories(): Observable<any> {
    const headers = getAuthHeaders();
    return this.http.get(`${this.apiUrl}/categories/active/`, {headers});
  }

  getUserPreferences(): Observable<any> {
    const headers = getAuthHeaders();
    return this.http.get(`${this.apiUrl}/preferences/`, { headers });
  }

  updatePreferences(category_ids: number[]): Observable<any> {
    const headers = getAuthHeaders();
    return this.http.post(`${this.apiUrl}/preferences/`, { category_ids}, {headers });
  }
}
