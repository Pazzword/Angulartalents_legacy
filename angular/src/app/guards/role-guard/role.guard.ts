import { Injectable } from '@angular/core';
import { 
  ActivatedRouteSnapshot, 
  CanActivate, 
  Router, 
  RouterStateSnapshot 
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators'; 
import { AuthService } from '../../services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class RoleGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    return this.auth.getMyProfile().pipe(
      map((res: any) => {
        const selectedRole = res.type;  // Get the role from profile

        if (selectedRole === 'engineer') {
          // Redirect to the engineer form if role is engineer
          this.router.navigate(['/engineers/form']);
          return false;
        } else if (selectedRole === 'recruiter') {
          // Redirect to recruiter dashboard (example route)
          this.router.navigate(['/business/form']);
          return false;
        }

        // If no role is assigned, allow access
        return true;
      }),
      catchError((err) => {
        console.error('Error in RoleGuard:', err);
        this.router.navigate(['/signin']); 
        return of(false);
      })
    );
  }
}
