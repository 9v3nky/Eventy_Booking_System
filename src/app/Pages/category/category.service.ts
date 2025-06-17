import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { getAuthHeaders, backend_url } from '../../auth/auth-header.util';
@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private apiUrl = backend_url + '/categories/'; 

  constructor(private http: HttpClient) {}

  getCategories(status: number = 1, page: number = 1): Observable<any> {
    const headers = getAuthHeaders();
    const params = new HttpParams()
      .set('status', status.toString())
      .set('page', page.toString());

    return this.http.get(this.apiUrl, { headers, params });
  }

  getCategory(id: number): Observable<any> {
    const headers = getAuthHeaders();
    return this.http.get(`${this.apiUrl}${id}/`, { headers });
  }

  addCategory(data: any): Observable<any> {
    const headers = getAuthHeaders();
    return this.http.post(this.apiUrl, data, { headers });
  }

  updateCategory(id: number, data: any): Observable<any> {
    const headers = getAuthHeaders();
    return this.http.put(`${this.apiUrl}${id}/`, data, { headers });
  }

  deleteCategory(id: number): Observable<any> {
    const headers = getAuthHeaders();
    return this.http.delete(`${this.apiUrl}${id}/`, { headers });
  }

  recoverCategory(id: number): Observable<any> {
    const headers = getAuthHeaders();
    return this.http.post(`${this.apiUrl}${id}/recover/`, {}, { headers });
  }
}
