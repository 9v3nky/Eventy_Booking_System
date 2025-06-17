import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { backend_url, getAuthHeaders } from '../../auth/auth-header.util';

@Injectable({ providedIn: 'root' })
export class CalendarService {
  private baseUrl = backend_url;

  constructor(private http: HttpClient) {}

  getActiveCategories(): Observable<any> {
    const headers = getAuthHeaders();
    return this.http.get(`${this.baseUrl}/categories/categories/active/`, { headers });
  }

  getUserPreferences(): Observable<any> {
    const headers = getAuthHeaders();
    return this.http.get(`${this.baseUrl}/categories/preferences/`, { headers });
  }

  getWeeklySlots(data: any): Observable<any> {
    const headers = getAuthHeaders();
    return this.http.get(`${this.baseUrl}/calendar/slots/`, { headers, params: data });
  }

  createSlot(data: any): Observable<any> {
    const headers = getAuthHeaders();
    return this.http.post(`${this.baseUrl}/slots/create/`, data, { headers });
  }

  updateSlot(slotId: number, data: any): Observable<any> {
    const headers = getAuthHeaders();
    return this.http.put(`${this.baseUrl}/slots/update/${slotId}/`, data, { headers });
  }

  deleteSlot(slotId: number): Observable<any> {
    const headers = getAuthHeaders();
    return this.http.delete(`${this.baseUrl}/slots/update/${slotId}/`, { headers });
  }

  bookSlot(slotId: number): Observable<any> {
    const headers = getAuthHeaders();
    return this.http.post(`${this.baseUrl}/calendar/slots/book/${slotId}/`, {}, { headers });
  }

  unbookSlot(slotId: number): Observable<any> {
    const headers = getAuthHeaders();
    return this.http.post(`${this.baseUrl}/calendar/slots/book/${slotId}/`, {}, { headers });
  }
}
