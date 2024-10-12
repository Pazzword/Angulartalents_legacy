import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { updateObjectForHeader } from 'src/app/models/header-data';
import { AuthService } from 'src/app/services/auth.service';
import { CommonService } from 'src/app/services/common-service/common.service';
import { EngineerService } from 'src/app/services/engineer-service/engineer.service';
import { ToastrService } from 'ngx-toastr';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnDestroy {
  myProfileID: string | null = null;
  myProfileName: string = '';
  myProfileImg: string = 'assets/empty-avatar.png';
  showMyEngineerProfile: boolean = false;
  showMyBusinessProfile: boolean = false;
  private isLoggedInSub: Subscription;
  private myProfileSub: Subscription;
  private updatedUserDataForHeaderSub: Subscription;

  constructor(
    public auth: AuthService,
    private engineerService: EngineerService,
    private commonService: CommonService,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef
  ) {
    // Subscribe to updates from CommonService
    this.updatedUserDataForHeaderSub = this.commonService.updatedUserDataForHeader$.subscribe({
      next: (data: updateObjectForHeader) => {
        this.processAvatarUrl(data.image || 'assets/empty-avatar.png');
        this.myProfileName = `${data.firstName || ''} ${data.lastName || ''}`;
        this.cdr.detectChanges(); // Ensure Angular picks up the changes in avatar and name
      },
      error: (err) => {
        console.error(err);
      },
    });

    // Subscribe to login status changes
    this.isLoggedInSub = this.auth.isLoggedIn$.subscribe((isLoggedIn) => {
      if (isLoggedIn) {
        // Fetch the user's profile
        this.myProfileSub = this.auth.getMyProfile().subscribe({
          next: (res) => {
            if (res) {
              console.log('HeaderComponent - res:', res);

              // Determine user role and fetch appropriate profile data
              if (res.role === 'engineer') {
                this.showMyEngineerProfile = true;

                // Fetch engineer profile to get avatar and name
                this.engineerService.getMyEngineerProfile().subscribe({
                  next: (engineerRes) => {
                    console.log('HeaderComponent - engineerRes:', engineerRes);
                    this.myProfileID = engineerRes.id || null;
                    this.myProfileName = `${engineerRes.first_name || ''} ${engineerRes.last_name || ''}`;

                    // Set avatar from engineer profile
                    const avatarUrl = engineerRes.avatar || 'assets/empty-avatar.png';
                    this.processAvatarUrl(avatarUrl);

                    this.cdr.detectChanges(); // Ensure updates are reflected after getting engineer profile
                  },
                  error: (err) => {
                    console.error('Error fetching engineer profile:', err);
                  },
                });
              } else if (res.role === 'recruiter') {
                this.showMyBusinessProfile = true;
                this.myProfileID = res.business_profile_id || null;

                // Fetch recruiter profile to get avatar and name (assuming similar service exists)
                // If you have a RecruiterService, use it here
                // For demonstration, we'll assume avatar and name are in res
                this.myProfileName = `${res.first_name || ''} ${res.last_name || ''}`;
                const avatarUrl = res.avatar || res.logo || 'assets/empty-avatar.png';
                this.processAvatarUrl(avatarUrl);

                this.cdr.detectChanges(); // Ensure changes in profile information are detected
              } else {
                // Handle other roles or default case
                this.myProfileName = `${res.first_name || ''} ${res.last_name || ''}`;
                const avatarUrl = res.avatar || 'assets/empty-avatar.png';
                this.processAvatarUrl(avatarUrl);

                this.cdr.detectChanges();
              }
            }
          },
          error: (error) => {
            console.error('Error fetching profile:', error);
            if (error.error?.code === 'authentication.validate_token') {
              this.auth.signout();
            }
          },
        });
      } else {
        // Reset profile information when logged out
        this.myProfileImg = 'assets/empty-avatar.png';
        this.showMyBusinessProfile = false;
        this.showMyEngineerProfile = false;
        this.myProfileID = null;
        this.myProfileName = '';
        this.cdr.detectChanges(); // Ensure UI reflects logout status
      }
    });
  }

  processAvatarUrl(avatar: string) {
    console.log('Original Avatar URL:', avatar);

    // Directly use avatar URL if available
    if (avatar) {
      this.myProfileImg = avatar;
    } else {
      this.myProfileImg = 'assets/empty-avatar.png';
    }

    // Trigger change detection to ensure Angular picks up the change
    this.cdr.detectChanges();
  }

  ngOnDestroy(): void {
    this.isLoggedInSub?.unsubscribe();
    this.myProfileSub?.unsubscribe();
    this.updatedUserDataForHeaderSub?.unsubscribe();
  }

  signout() {
    this.myProfileImg = 'assets/empty-avatar.png';
    this.showMyBusinessProfile = false;
    this.showMyEngineerProfile = false;
    this.myProfileID = null;
    this.myProfileName = '';
    this.auth.signout();
  }
}
