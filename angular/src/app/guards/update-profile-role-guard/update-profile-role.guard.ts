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
        if (profile.type === route.data['role']) {
          this.toastr.error('Access denied'); // Show error message
          this.route.navigate(['/']); // Redirect to home on access denial
          return false;
        } else {
          return true; // Allow access if roles match
        }
      }),
      catchError((err) => {
        console.log(err.error.code);
        this.route.navigate(['/role']); // Redirect to role selection on error
        return of(true);
      })
    );
  }
}
