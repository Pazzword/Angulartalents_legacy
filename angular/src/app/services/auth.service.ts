// auth.service.ts
import { of, BehaviorSubject, Observable, Subject } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'environments/environments';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { jwtDecode } from 'jwt-decode'; // Corrected import

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
    console.log('AuthService: Initialized. Token exists:', !!token);

    if (token) {
      const decodedToken = this.decodeToken(token);
      this.selectedRole = decodedToken ? decodedToken.role : null;
      console.log('AuthService: Decoded role from token:', this.selectedRole);
    } else {
      console.log('AuthService: No token found on initialization.');
    }

    this.engineerImageChange.subscribe(value => {
      this.engineerImg = value;
      console.log('AuthService: Engineer image updated:', value);
    });
  }

  setRole(role: string) {
    this.selectedRole = role;
    localStorage.setItem('selectedRole', role);  // Save role in localStorage
    console.log('Role set in localStorage:', localStorage.getItem('selectedRole'));  // Log role after setting
  }
  
  getRole(): string | null {
    console.log('Retrieving role from memory:', this.selectedRole);
  
    // If the role is already in memory, return it
    if (this.selectedRole) {
      console.log('Returning role from memory:', this.selectedRole);
      return this.selectedRole;
    }
  
    // If role is not in memory, retrieve from localStorage
    const storedRole = localStorage.getItem('selectedRole');
    console.log('Retrieving role from localStorage:', storedRole);
  
    if (storedRole) {
      this.selectedRole = storedRole;  // Store it in memory again
      return storedRole;
    }
  
    console.log('No role found in localStorage or memory.');
    return null;
  }
  

  signin(loginData: { email: string; password: string }): Observable<any> {
    console.log('AuthService: Attempting to sign in with:', loginData);
    return this.http.post(`${this.url}/login/`, loginData).pipe(
      tap((response: any) => {
        console.log('AuthService: Signin response:', response);
        const accessToken = response.access;
        const refreshToken = response.refresh;
        localStorage.setItem('token', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        this.selectedRole = response.role;
        this.setIsLoggedIn(true);
        this.userData = response.user; // Store user data
        console.log('AuthService: Tokens stored and role set to:', this.selectedRole);
      })
    );
  }

  getMyProfile(): Observable<any> {
    const token = localStorage.getItem('token');
    if (!token) {
      this.setIsLoggedIn(false);
      console.log('AuthService: getMyProfile called without token.');
      return of(null);
    }
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    console.log('AuthService: Fetching profile with token:', token);
    return this.http.get(`${this.url}/me/`, { headers }).pipe(
      tap((profile: any) => {
        console.log('AuthService: Profile data retrieved:', profile);
        this.userData = profile; // Update user data
      })
    );
  }

  signup(signupData: { email: string; password: string; role: string }): Observable<any> {
    console.log('AuthService: Attempting to sign up with:', signupData);
    return this.http.post(`${this.url}/sign-up/`, signupData).pipe(
      tap((response: any) => {
        console.log('AuthService: Signup response:', response);
        this.selectedRole = signupData.role;
        this.setRole(signupData.role);
        this.userData = response.user; // Store user data after signup
        console.log('AuthService: Role set after signup:', this.selectedRole);
      })
    );
  }

  setIsLoggedIn(val: boolean) {
    this._isLoggedIn$.next(val);
    console.log(`AuthService: setIsLoggedIn called with value: ${val}`);
    if (!val) {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('selectedRole');
      this.selectedRole = null;
      this.userData = null; // Clear user data on logout
      console.log('AuthService: User logged out. Cleared tokens and role.');
    }
  }

  signout() {
    console.log('AuthService: Signing out user.');
    this.setIsLoggedIn(false);
    this.router.navigate(['signin']).then(() => {
      console.log('AuthService: Navigated to signin after signout.');
    });
  }

  getUserRole(): string | null {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken: any = jwtDecode(token);
        console.log('AuthService: Decoded user role from token:', decodedToken.role);
        return decodedToken.role || null;
      } catch (error) {
        console.error('AuthService: Error decoding token:', error);
        return null;
      }
    }
    console.log('AuthService: No token found when getting user role.');
    return null;
  }

  getUserData(): any {
    console.log('AuthService: Retrieving user data:', this.userData);
    return this.userData; // Return user data
  }

  private decodeToken(token: string): any {
    try {
      const decoded = jwtDecode(token);
      console.log('AuthService: Successfully decoded token:', decoded);
      return decoded;
    } catch (error) {
      console.error('AuthService: Error decoding token:', error);
      return null;
    }
  }
}
