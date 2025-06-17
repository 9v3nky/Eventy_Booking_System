import { HttpHeaders } from '@angular/common/http';

/**
 * Returns an HttpHeaders object with the Authorization header set.
 */
export function getAuthHeaders(): HttpHeaders {
  const token = localStorage.getItem('token');
  return new HttpHeaders({
    'Authorization': `Bearer ${token}`
  });
}

export const backend_url = "http://localhost:8000/api"