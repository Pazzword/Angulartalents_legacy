import { ElementRef, Injectable } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import { Subscription, filter } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ScrollService {
  routeSubscription$: Subscription;

  constructor(private router: Router) { }

  public scrollToTopOnRouteChange(mainContent: ElementRef<HTMLElement>): void {
    this.routeSubscription$ = this.router.events.pipe(
      filter(
        (event): event is NavigationStart => event instanceof NavigationStart,
      ),
    ).subscribe({
      next: () => {
        mainContent.nativeElement.scrollTo({top: 0})
      }
    });
  }
}
