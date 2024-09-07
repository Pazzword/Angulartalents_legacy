import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { catchError, Observable, of, tap } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class UpdateProfileRoleGuard implements CanActivate {
  constructor(
    private auth: AuthService,
    private route: Router,
    private toastr: ToastrService
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    return this.auth.getMyProfile().pipe(
      tap((profile: any) => {
        console.log(`UpdateProfileRoleGuard - Role: ${profile.type}, Expected role: ${route.data['role']}`);
        if (profile.type !== route.data['role']) {
          console.log('Role does not match. Access granted.');
          return true; // Allow access if roles don't match
        } else {
          console.log('Access denied. Roles match.');
          this.toastr.error('Access denied'); // Show error message
          this.route.navigate(['/']);
          return false;
        }
      }),
      catchError((err) => {
        console.error('Error in UpdateProfileRoleGuard:', err);
        this.route.navigate(['/role']); // Redirect to role selection on error
        return of(false);
      })
    );
  }
}
