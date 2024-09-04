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
        if(res.type === "recruiter" || res.type === "engineer"){
          this.router.navigate(["/engineers"])
          return false
        }
        else{
          return true
        }
      }),
      catchError((err) => {
        return of(true)
      })
    );
  }

}
