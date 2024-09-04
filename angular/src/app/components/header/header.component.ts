import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { updateObjectForHeader } from 'src/app/models/header-data';
import { AuthService } from 'src/app/services/auth.service';
import { CommonService } from 'src/app/services/common-service/common.service';
import { EngineerService } from 'src/app/services/engineer-service/engineer.service';
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  myProfileID: any;
  myProfileName: string;
  myProfileImg: string = 'assets/empty-avatar.png';
  showMyEngineerProfile: Boolean = false;
  showMyBusinessProfile: Boolean = false;
  private isLoggedInSub: Subscription;
  private myProfileSub: Subscription;
  private updatedUserDataForHeaderSub: Subscription;

  constructor(
    public auth: AuthService,
    public engineerService: EngineerService,
    private commonService: CommonService,
  ) {
    this.updatedUserDataForHeaderSub =
      this.commonService.updatedUserDataForHeader$.subscribe({
        next: (data: updateObjectForHeader) => {
          this.myProfileImg = data.image;
          this.myProfileName = `${data.firstName} ${data.lastName}`;
        },
        error: (err) => {
          console.error(err);
        },
      });

    this.isLoggedInSub = this.auth.isLoggedIn$.subscribe((isLoggedIn) => {
      if (isLoggedIn) {
        this.myProfileSub = this.auth.getMyProfile().subscribe({
          next: (res) => {
            this.myProfileImg = res.user?.Avatar || res.user?.Logo || 'assets/empty-avatar.png';
            this.myProfileID = res.user?.ID;
            if (res.type === 'engineer') {
                this.showMyEngineerProfile = true;
                this.myProfileName = `${res.user?.Firstname || ''} ${res.user?.Lastname || ''}`;
            }
            if (res.type === 'recruiter') {
                this.showMyBusinessProfile = true;
                this.myProfileName = `${res.user?.Firstname || ''} ${res.user?.Lastname || ''}`;
            }
        },
          error: (error) => {
            console.error(error);
            if (error.error.code === 'authentication.validate_token') {
              this.auth.signout();
            }
          },
        });
      }
    });
  }

  ngOnDestroy(): void {
    this.isLoggedInSub.unsubscribe();
    this.myProfileSub.unsubscribe();
    this.updatedUserDataForHeaderSub.unsubscribe();
  }

  signout() {
    this.myProfileImg =
      'https://microbiology.ucr.edu/sites/default/files/styles/form_preview/public/blank-profile-pic.png';
    this.showMyBusinessProfile = false;
    this.showMyEngineerProfile = false;
    this.myProfileID = null;
    this.auth.signout();
  }
}
