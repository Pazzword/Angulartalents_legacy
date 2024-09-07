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
  engineers = new Array<any>();
  tempEngineers = new Array<any>();
  loading: boolean = true;
  loader = this.loadingBar.useRef();
  private engineersSub: Subscription;
  imgObj: CloudinaryImage = new CloudinaryImage(); //needs to be initialized
  imgString: string = ''; //CloudinaryImage;

  constructor(
    private engineerService: EngineerService,
    private loadingBar: LoadingBarService,
    private router: Router  // Inject Router for navigation
  ) {}

  ngOnInit(): void {
    this.loader.start();
    this.engineersSub = this.engineerService.getAllEngineers().subscribe({
      next: (res) => {
        this.loading = false;
        if (res) {
          res.engineers.forEach((e: any) => {
            if (e.Avatar.includes('https://res.cloudinary.com')) {
              let urlString = e.Avatar.replace('https://res.cloudinary.com/dogx6peuh/image/upload/', '').replace('.jpg', '').slice(12);
              // changing the image quality setting from cloudinary
              this.imgObj = new CloudinaryImage(urlString, {
                cloudName: 'dogx6peuh',
              }).format('auto').delivery(quality('auto:best'));
              // get the string for the img tag
              e.Avatar = this.imgObj.toURL();
              this.tempEngineers.push(e);
            } else {
              this.tempEngineers.push(e);
            }
          });
          this.tempEngineers.length = 7;
          this.engineers = this.tempEngineers;
          this.loader.stop();
        } else {
          this.loader.stop();
        }
      },
      error: (err) => {
        console.error(err);
        this.loader.stop();
      },
    });
  }

  onGetStarted(): void {
    // Navigate to the role selection page
    this.router.navigate(['/role']);
  }

  ngOnDestroy(): void {
    this.engineersSub.unsubscribe();
  }
}
