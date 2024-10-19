import { Component } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/services/auth.service';
import { CommonService } from 'src/app/services/common-service/common.service';
import { EngineerService } from 'src/app/services/engineer-service/engineer.service';
import { CloudinaryImage } from '@cloudinary/url-gen';  // Import CloudinaryImage
import { quality } from '@cloudinary/url-gen/actions/delivery';  // Import quality

@Component({
  selector: 'app-profile-details',
  templateUrl: './profile-details.component.html',
  styleUrls: ['./profile-details.component.scss'],
})
export class ProfileDetailsComponent {
  engineer: any;  
  userIsMe: boolean = false;  
  profileNotFoundError: boolean = false;  
  recruiterIsMember: boolean = false;
  loading: boolean = true;
  myProfile: any;  

  constructor(
    private engineerService: EngineerService,
    private route: ActivatedRoute,
    private auth: AuthService,
    private commonService: CommonService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params: Params) => {
      const engineerProfileId = params['id'];
  
      // Fetch the engineer profile by ID
      this.engineerService.getEngineer(engineerProfileId).subscribe({
        next: (engineerProfile) => {
          this.engineer = engineerProfile;
  
          // Remove the call to processAvatarUrl
          // this.processAvatarUrl();
  
          // Check if the logged-in user is viewing their own profile
          this.auth.getMyProfile().subscribe({
            next: (myProfile) => {
              this.myProfile = myProfile;
              const currentUserId = myProfile.id;
  
              if (
                engineerProfile.user === currentUserId ||
                engineerProfile.user?.id === currentUserId
              ) {
                this.userIsMe = true;
              }
              this.loading = false;
            },
            error: (err) => {
              console.error('Error fetching logged-in user profile:', err);
              this.loading = false;
            },
          });
        },
        error: (err) => {
          console.error('Profile not found:', err);
          this.loading = false;
          this.profileNotFoundError = true;
        },
      });
    });
  }
  
  

  processAvatarUrl() {
    if (this.engineer.avatar && this.engineer.avatar.includes('https://res.cloudinary.com')) {
      // Extract the public ID from the Cloudinary URL
      const cloudName = 'rmsmms'; 
      const urlPattern = `https://res.cloudinary.com/${cloudName}/image/upload/`;
      let publicId = this.engineer.avatar.replace(urlPattern, '');

      // Remove any transformations and file extensions
      if (publicId.includes('/')) {
        const parts = publicId.split('/');
        publicId = parts[parts.length - 1];
      }
      if (publicId.includes('.')) {
        publicId = publicId.split('.')[0];
      }

      // Create the CloudinaryImage instance with desired transformations
      const imgObj = new CloudinaryImage(publicId, { cloudName })
        .format('auto')
        .delivery(quality('auto:best'));

      this.engineer.avatar = imgObj.toURL();

      // For debugging
      console.log('Processed Engineer Avatar URL:', this.engineer.avatar);
    }
  }
}
