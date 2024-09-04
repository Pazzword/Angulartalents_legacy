import { Component } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/services/auth.service';
import { CommonService } from 'src/app/services/common-service/common.service';
import { EngineerService } from 'src/app/services/engineer-service/engineer.service';

@Component({
  selector: 'app-profile-details',
  templateUrl: './profile-details.component.html',
  styleUrls: ['./profile-details.component.scss'],
})
export class ProfileDetailsComponent {
  engineer: any;
  userIsMe: Boolean;
  profileNotFoundError: Boolean = false;
  recruiterIsMember: Boolean = false;
  loading: Boolean = true;
  constructor(
    private engineerService: EngineerService,
    private route: ActivatedRoute,
    private auth: AuthService,
    private commonService: CommonService,
    private toastr: ToastrService
  ) {

  }
  ngOnInit(): void {
    this.route.params.subscribe((params: Params) => {
      this.engineerService
        .getEngineer(params['id'])
        .subscribe({
          next: engineerFoundById => {
            this.auth.getMyProfile().subscribe({
              next: (myProfile) => {
                this.loading = false;
                if (myProfile.type === "recruiter") {
                  this.recruiterIsMember = myProfile.user.IsMember
                }
                if (myProfile.type === "engineer" && (myProfile.user.ID === params['id'])) {
                  this.engineer = myProfile.user
                  this.userIsMe = myProfile.user.ID === params['id'];
                  this.commonService.afterCreateProfileMessage$.subscribe({
                    next: res => {
                      console.log(res)
                      if (res) {
                        this.toastr.success('Now you just sit back and wait until companies contact you!', 'All done!', { timeOut: 5000 })
                      }
                    },
                    error: err => {
                      console.log(err)
                    }
                  })
                } else {
                  this.engineer = engineerFoundById.engineer;
                }
              },
              error: (err) => {
                this.loading = false;
                this.engineer = engineerFoundById.engineer;
                console.error(err)
              }
            });


          },
          error: err => {
            console.log('profile not found');
            console.error(err)
            this.loading = false;
            this.profileNotFoundError = true;
          }
        });
    });
  }
}
