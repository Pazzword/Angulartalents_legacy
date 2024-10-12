import { Injectable } from '@angular/core';
import { 
  ActivatedRouteSnapshot, 
  CanActivate, 
  Router, 
  RouterStateSnapshot 
} from '@angular/router';
import { catchError, map, Observable, of } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class RolePageGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | boolean {
    // If navigating explicitly to '/role', allow access
    if (state.url === '/role') {
      console.log('Navigating to role selection page, allowing access.');
      return true;  // Always allow access to the role page
    }

    // Otherwise, check if user has a role and redirect accordingly
    return this.auth.getMyProfile().pipe(
      map((profile: any) => {
        const role = profile.role || profile.type;  // Fetch the correct role field
        console.log(`RolePageGuard - Role: ${role}`);

        if (!role) {
          console.log('No role set for user, allowing access to role selection page.');
          return true;  // Allow access to role selection if no role is set
        }

        const userId = profile.id;

        // Redirect based on role
        if (role === 'recruiter') {
          this.router.navigate(['/business/form', userId]);
          return false;  // Block access to role page and redirect recruiter
        } else if (role === 'engineer') {
          this.router.navigate(['/engineers/form', userId]);
          return false;  // Block access to role page and redirect engineer
        }

        // If no matching role, allow access
        return true;
      }),
      catchError((err) => {
        console.error('Error in RolePageGuard:', err);
        return of(true);  // Allow access if there's an error
      })
    );
  }
}
