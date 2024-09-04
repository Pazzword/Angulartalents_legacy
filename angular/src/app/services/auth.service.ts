import { of, BehaviorSubject, Observable, Subject } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'environments/environments';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  url = environment.apiUrl;
  engineerImg: string;
  engineerImageChange = new Subject<string>();
  private _isLoggedIn$ = new BehaviorSubject<boolean>(false);
  isLoggedIn$ = this._isLoggedIn$.asObservable();
  private selectedRole: string | null = null;
  private userData: any = null; // Store user data

  constructor(private http: HttpClient, private router: Router) {
    const token = localStorage.getItem('token');
    this._isLoggedIn$.next(!!token);

    if (token) {
      const decodedToken = this.decodeToken(token);
      this.selectedRole = decodedToken ? decodedToken.role : null;
    }

    this.engineerImageChange.subscribe(value => (this.engineerImg = value));
  }

  setRole(role: string) {
    this.selectedRole = role;
    localStorage.setItem('selectedRole', role);
  }

  getRole(): string | null {
    if (this.selectedRole) {
      return this.selectedRole;
    }
    return localStorage.getItem('selectedRole');
  }

  signin(loginData: { email: string; password: string }): Observable<any> {
    console.log('Attempting to login with:', loginData);
    return this.http.post(`${this.url}/login/`, loginData).pipe(
      tap((response: any) => {
        console.log('Login response:', response);
        const accessToken = response.access;
        const refreshToken = response.refresh;
        localStorage.setItem('token', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        this.selectedRole = response.role;
        this.setIsLoggedIn(true);
        this.userData = response.user; // Store user data
      })
    );
  }

  getMyProfile(): Observable<any> {
    const token = localStorage.getItem('token');
    if (!token) {
      this.setIsLoggedIn(false);
      return of(null);
    }
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.get(`${this.url}/me/`, { headers }).pipe(
      tap((profile: any) => {
        this.userData = profile; // Update user data
      })
    );
  }

  signup(signupData: { email: string; password: string; role: string }): Observable<any> {
    return this.http.post(`${this.url}/sign-up/`, signupData).pipe(
      tap((response: any) => {
        this.selectedRole = signupData.role;
        this.userData = response.user; // Store user data after signup
      })
    );
  }

  setIsLoggedIn(val: boolean) {
    this._isLoggedIn$.next(val);
    if (!val) {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('selectedRole');
      this.selectedRole = null;
      this.userData = null; // Clear user data on logout
    }
  }

  signout() {
    this.setIsLoggedIn(false);
    this.router.navigate(['signin']);
  }

  getUserRole(): string | null {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken: any = jwtDecode(token);
        return decodedToken.role || null;
      } catch (error) {
        console.error('Error decoding token:', error);
        return null;
      }
    }
    return null;
  }

  getUserData(): any {
    return this.userData; // Return user data
  }

  private decodeToken(token: string): any {
    try {
      return jwtDecode(token);
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }
}
