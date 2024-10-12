import { EngineerService } from 'src/app/services/engineer-service/engineer.service';
import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { LoadingBarService } from '@ngx-loading-bar/core';
import { CloudinaryImage } from '@cloudinary/url-gen';
import { quality } from "@cloudinary/url-gen/actions/delivery";
import { Router } from '@angular/router';  // Import Router for navigation

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

  constructor(
    private engineerService: EngineerService,
    private loadingBar: LoadingBarService,
    private router: Router  // Inject Router for navigation
  ) {}

  ngOnInit(): void {
    this.loader.start();

    // Fetch engineers and handle Cloudinary images properly
    this.engineersSub = this.engineerService.getAllEngineers().subscribe({
      next: (res) => {
        this.loading = false;
        if (res && res.engineers) {
          this.engineers = res.engineers.map((engineer: any) => {
            // If the avatar is hosted on Cloudinary, use the URL directly
            if (engineer.avatar) {
              engineer.avatar = engineer.avatar;
            } else {
              engineer.avatar = 'assets/empty-avatar.png'; // Default avatar if not available
            }
            return engineer;
          });
    
          // Limit the display to a maximum of 7 engineers
          this.engineers = this.engineers.slice(0, 7);
          this.loader.stop();
        } else {
          this.loader.stop();
        }
      },
      error: (err) => {
        console.error('Error fetching engineers:', err);
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
