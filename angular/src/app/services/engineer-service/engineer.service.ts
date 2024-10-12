import { Injectable } from '@angular/core';
import { Observable, catchError, tap, of, throwError } from 'rxjs';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { environment } from 'environments/environments';
import { AuthService } from '../auth.service';

@Injectable({
  providedIn: 'root',
})
export class EngineerService {
  url = environment.apiUrl;

  constructor(private http: HttpClient, private auth: AuthService) {}

  // Create a new engineer profile
  createEngineer(profileFormData: object): Observable<any> {
    return this.http.post(`${this.url}/engineers/`, profileFormData).pipe(
      tap((response) => console.log('Engineer created:', response)),
      catchError(this.handleError<any>('createEngineer'))
    );
  }

  // Get all engineers
  getAllEngineers(): Observable<any> {
    return this.http.get<any>(`${this.url}/engineers/`).pipe(
      tap((response) => console.log('Fetched all engineers:', response)),
      catchError(this.handleError<any>('getAllEngineers'))
    );
  }

  // Get engineers with pagination and filters
  getEngineers(
    page: number,
    limit: number,
    country: string,
    selectedRoleType: string,
    selectedRoleLevel: string
  ): Observable<any> {
    return this.http
      .get<any>(
        `${this.url}/engineers/?page=${page}&limit=${limit}&country=${country}&roleType=${selectedRoleType}&roleLevel=${selectedRoleLevel}`
      )
      .pipe(
        tap((response) => console.log('Fetched engineers with filters:', response)),
        catchError(this.handleError<any>('getEngineers'))
      );
  }

  // Get total engineer count
  getEngineersCount(): Observable<any> {
    return this.http.get(`${this.url}/engineers/count/`).pipe(
      tap((response) => console.log('Total engineers count:', response)),
      catchError(this.handleError<any>('getEngineersCount'))
    );
  }

  // Get a specific engineer by ID
  getEngineer(engineerId: string): Observable<any> {
    return this.http.get(`${this.url}/engineers/${engineerId}/`).pipe(
      tap((response) => console.log('Fetched engineer with ID:', response)),
      catchError(this.handleError<any>('getEngineer'))
    );
  }

  // Update the current engineer profile
  updateEngineer(engineer: any): Observable<any> {
    return this.http.put(`${this.url}/engineers/me/`, engineer).pipe(
      tap((response) => console.log('Updated engineer:', response)),
      catchError(this.handleError<any>('updateEngineer'))
    );
  }

  // **Add this method to get the current engineer profile**
  getMyEngineerProfile(): Observable<any> {
    const token = this.auth.getToken();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    });

    return this.http.get(`${this.url}/engineers/me/`, { headers }).pipe(
      tap((engineer) => {
        console.log('Fetched my engineer profile:', engineer);
      }),
      catchError((error) => {
        console.error('getMyEngineerProfile failed:', error);
        return throwError(() => error);
      })
    );
  }

  // General error handling method
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: HttpErrorResponse): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`); // Log the error to the console
      return of(result as T); // Return a safe fallback value
    };
  }
}
