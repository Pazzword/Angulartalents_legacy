import { Injectable } from '@angular/core';
import { Observable, catchError, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from 'environments/environments';

@Injectable({
  providedIn: 'root',
})
export class EngineerService {
  url = environment.apiUrl;

  constructor(private http: HttpClient) {}

  createEngineer(profileFormData: object): Observable<any> {
    return this.http.post(`${this.url}/engineers/`, profileFormData); // Added trailing slash
  }

  getAllEngineers(): Observable<any> {
    return this.http.get<any>(`${this.url}/engineers/`); // Added trailing slash
  }

  getEngineers(page: number, limit: number, country: string, selectedRoleType: string, selectedRoleLevel: string): Observable<any> {
    return this.http.get<any>(`${this.url}/engineers/?page=${page}&limit=${limit}&country=${country}&roleType=${selectedRoleType}&roleLevel=${selectedRoleLevel}`); // Added trailing slash
  }

  getEngineersCount(): Observable<any> {
    return this.http.get(`${this.url}/engineers/count/`); // Added trailing slash and assumed the endpoint for count
  }

  getEngineer(engineerId: any): Observable<any> {
    return this.http.get(`${this.url}/engineers/${engineerId}/`); // Added trailing slash
  }

  updateEngineer(engineer: any): Observable<any> {
    return this.http.put(`${this.url}/engineers/me/`, engineer); // Added trailing slash
  }
}
