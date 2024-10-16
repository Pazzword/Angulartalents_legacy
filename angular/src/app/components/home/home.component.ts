import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { EngineerService } from 'src/app/services/engineer-service/engineer.service';
import { LoadingBarService } from '@ngx-loading-bar/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  engineers: any[] = [];
  loading: boolean = true;
  loader = this.loadingBar.useRef();
  private engineersSub: Subscription;
  excludedStatuses: string[] = ['not_interested', 'invisible'];

  constructor(
    private engineerService: EngineerService,
    private loadingBar: LoadingBarService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loader.start();

    // Fetch engineers and handle Cloudinary images properly
    this.engineersSub = this.engineerService.getAllEngineers().subscribe({
      next: (res) => {
        this.loading = false;
        if (res && res.engineers) {
          // Exclude engineers with 'not_interested' and 'invisible' statuses
          this.engineers = res.engineers
            .filter((engineer: any) => !this.excludedStatuses.includes(engineer.search_status))
            .map((engineer: any) => {
              engineer.avatar = engineer.avatar || 'assets/empty-avatar.png';
              return engineer;
            });

          // Limit the display to a maximum of 7 engineers
          this.engineers = this.engineers.slice(0, 7);
        }
        this.loader.stop();
      },
      error: (err) => {
        console.error('Error fetching engineers:', err);
        this.loading = false;
        this.loader.stop();
      },
    });
  }

  // Navigate to the role selection page
  onGetStarted(): void {
    this.router.navigate(['/role']);
  }

  ngOnDestroy(): void {
    if (this.engineersSub) {
      this.engineersSub.unsubscribe();
    }
  }
}
