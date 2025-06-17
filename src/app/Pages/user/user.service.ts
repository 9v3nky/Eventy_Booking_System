import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { backend_url, getAuthHeaders } from '../../auth/auth-header.util';

@Injectable({ providedIn: 'root' })
export class UserService {
  private apiUrl = backend_url + '/users/';

  constructor(private http: HttpClient) {}

  getUsers(search = '', page = 1, pageSize = 10): Observable<any> {
    const headers = getAuthHeaders();
    let params = new HttpParams()
      .set('page', page.toString())
      .set('page_size', pageSize.toString());
    if (search.length > 2) params = params.set('search', search);
    return this.http.get<any>(this.apiUrl, { headers, params });
  }

  toggleAdmin(id: number): Observable<any> {
    const headers = getAuthHeaders();
    return this.http.post(`${this.apiUrl}${id}/toggle-admin/`,{}, {headers});
    
  }
}