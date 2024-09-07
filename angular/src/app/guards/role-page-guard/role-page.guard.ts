import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { catchError, Observable, of, tap } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RolePageGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router){}
  
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | boolean {
    return this.auth.getMyProfile().pipe(
      tap((res:any) => {
        console.log(`RolePageGuard - Role: ${res.type}`);
        if (res.type === "recruiter" || res.type === "engineer") {
          this.router.navigate(["/engineers"]);
          return false;
        }
        return true;
      }),
      catchError((err) => {
        console.error('Error in RolePageGuard:', err);
        return of(true); // Allow access if there's an error.
      })
    );
  }
}

