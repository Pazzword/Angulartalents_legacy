import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from 'environments/environments';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BusinessService {
  url = environment.apiUrl;
  constructor(private http: HttpClient, private router: Router) {}

  createRecruiter(profileFormData: object): Observable<any> {
    return this.http.post(`${this.url}/recruiters`, profileFormData);
  }

  updateRecruiter(recruiterData: object): Observable<any> {
    return this.http.put(`${this.url}/recruiters/me`, recruiterData);
  }

  getRecruiter(id: any): Observable<any> {
    return this.http.get(`${this.url}/recruiters/${id}`);
  }

  getMyProfile(): Observable<any> {
    return this.http.get(`${this.url}/me`);
  }
}
