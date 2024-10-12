import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { catchError, map, Observable, of } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class UpdateProfileRoleGuard implements CanActivate {
  constructor(
    private auth: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    return this.auth.getMyProfile().pipe(
      map((profile: any) => {
        console.log('UpdateProfileRoleGuard - profile:', profile);
        if (!profile || !profile.role) {
          console.error('UpdateProfileRoleGuard - Profile or role is null or undefined');
          this.toastr.error('Access denied');
          this.router.navigate(['/']);
          return false;
        }
        console.log(`UpdateProfileRoleGuard - Role: ${profile.role}, Expected role: ${route.data['role']}`);
        if (profile.role === route.data['role']) {
          console.log('Roles match. Access granted.');
          return true; // Allow access if roles match
        } else {
          console.log('Access denied. Roles do not match.');
          this.toastr.error('Access denied'); // Show error message
          this.router.navigate(['/']);
          return false;
        }
      }),
      catchError((err) => {
        console.error('Error in UpdateProfileRoleGuard:', err);
        this.router.navigate(['/role']); // Redirect to role selection on error
        return of(false);
      })
    );
  }
}
