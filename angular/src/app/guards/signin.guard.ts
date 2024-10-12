import { Injectable } from '@angular/core';
import { 
  ActivatedRouteSnapshot, 
  CanActivate, 
  Router, 
  RouterStateSnapshot 
} from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class SigninGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> {
    return this.auth.isLoggedIn$.pipe(
      map((loggedIn: boolean) => {
        if (loggedIn) {
          console.log('User is logged in, redirecting to home.');
          this.router.navigate(['']);
          return false;
        }
        return true;
      })
    );
  }
}
