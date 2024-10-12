import { of, BehaviorSubject, Observable, Subject } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'environments/environments';
import { Router } from '@angular/router';
import { tap, catchError } from 'rxjs/operators';
import { jwtDecode } from 'jwt-decode'; // Corrected import

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  url = environment.apiUrl;
  engineerImg: string | null = null;
  engineerImageChange = new Subject<string>();
  private _isLoggedIn$ = new BehaviorSubject<boolean>(false);
  isLoggedIn$ = this._isLoggedIn$.asObservable();
  private selectedRole: string | null = null;
  private userData: any = null; // Store user data

  constructor(private http: HttpClient, private router: Router) {
    const token = localStorage.getItem('token');
    this._isLoggedIn$.next(!!token);
    console.log('AuthService: Initialized. Token exists:', !!token);

    if (token && !this.isTokenExpired(token)) {
      const decodedToken = this.decodeToken(token);
      this.selectedRole = decodedToken ? decodedToken.role : null;
      console.log('AuthService: Decoded role from token:', this.selectedRole);

      // Fetch the profile immediately if token exists
      this.getMyProfile().subscribe({
        next: (profile) => {
          console.log('Profile loaded during service initialization:', profile);
        },
        error: (err) => {
          console.error('Error fetching profile during service initialization:', err);
        },
      });
    } else {
      console.log('AuthService: No valid token found on initialization.');
    }

    this.engineerImageChange.subscribe((value) => {
      this.engineerImg = value;
      console.log('AuthService: Engineer image updated:', value);
    });
  }

  setRole(role: string) {
    this.selectedRole = role;
    localStorage.setItem('selectedRole', role); // Save role in localStorage
    console.log('Role set in localStorage:', localStorage.getItem('selectedRole')); // Log role after setting
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
      this.selectedRole = storedRole; // Store it in memory again
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
        this.selectedRole = response.role; // Set role from login response
        this.setRole(response.role); // Save role in memory and localStorage
        this.setIsLoggedIn(true);
        this.userData = response.user;

        // Immediately fetch the profile, including the avatar
        this.getMyProfile().subscribe({
          next: (profile) => {
            console.log('Profile loaded during login:', profile);
          },
          error: (err) => {
            console.error('Error fetching profile during login:', err);
          },
        });
      }),
      catchError((error) => {
        console.error('Signin error:', error);
        return of(null); // Return null or handle the error appropriately
      })
    );
  }

  isTokenExpired(token: string): boolean {
    const decodedToken: any = jwtDecode(token);
    const expiry = decodedToken.exp * 1000;
    return expiry < Date.now();
  }

  getMyProfile(): Observable<any> {
    const token = localStorage.getItem('token');
    if (!token || this.isTokenExpired(token)) {
      this.setIsLoggedIn(false);
      this.signout();
      return of(null);
    }
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    // Fetch user profile
    return this.http.get(`${this.url}/me/`, { headers }).pipe(
      tap((userProfile: any) => {
        console.log('User profile fetched:', userProfile);
        this.setRole(userProfile.role);
        this.userData = userProfile; // Store user profile in userData

        if (userProfile.role === 'engineer') {
          // Fetch engineer profile
          this.loadEngineerProfile(headers);
        }
      }),
      catchError((error) => {
        console.error('Error fetching profile:', error);
        return of(null);
      })
    );
  }

  private loadEngineerProfile(headers: HttpHeaders) {
    this.http.get(`${this.url}/engineers/me/`, { headers }).subscribe({
      next: (engineerProfile: any) => {
        console.log('Engineer profile fetched:', engineerProfile);
        // Merge engineerProfile into userData
        this.userData = { ...this.userData, engineerProfile };
        // Update avatar if necessary
        if (engineerProfile.avatar) {
          this.userData.avatar = engineerProfile.avatar;
        }
      },
      error: (err) => {
        console.error('Error fetching engineer profile:', err);
      },
    });
  }

  signup(signupData: { email: string; password: string; role: string }): Observable<any> {
    console.log('AuthService: Attempting to sign up with:', signupData);
    return this.http.post(`${this.url}/sign-up/`, signupData).pipe(
      tap((response: any) => {
        console.log('AuthService: Signup response:', response);
        this.selectedRole = signupData.role;
        this.setRole(signupData.role); // Save role right after signup
        this.userData = response.user; // Store user data after signup

        // Immediately fetch the profile after signup
        this.getMyProfile().subscribe({
          next: (profile) => {
            console.log('Profile loaded after signup:', profile);
          },
          error: (err) => {
            console.error('Error fetching profile after signup:', err);
          },
        });
      }),
      catchError((error) => {
        console.error('Signup error:', error);
        return of(null); // Handle error appropriately
      })
    );
  }

  setIsLoggedIn(val: boolean) {
    if (this._isLoggedIn$.value === val) {
      return; // Avoid multiple calls with the same value
    }
    this._isLoggedIn$.next(val);
    console.log(`AuthService: setIsLoggedIn called with value: ${val}`);
    if (!val) {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('selectedRole');
      this.selectedRole = null;
      this.userData = null; // Clear user data on logout
      this.engineerImg = ''; // Clear avatar on logout
      console.log('AuthService: User logged out. Cleared tokens, role, and avatar.');
    }
  }

  signout() {
    console.log('AuthService: Signing out user.');
    this.setIsLoggedIn(false);
    this.router.navigate(['signin']).then(() => {
      console.log('AuthService: Navigated to signin after signout.');
    });
  }

  getToken(): string | null {
    return localStorage.getItem('token');
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

  getUserId(): string | null {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken: any = jwtDecode(token);
        console.log('AuthService: Decoded token:', decodedToken);
        return decodedToken.user_id || null; // Adjust 'user_id' based on your token's structure
      } catch (error) {
        console.error('AuthService: Error decoding token:', error);
        return null;
      }
    }
    console.log('AuthService: No token found when getting user ID.');
    return null;
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
