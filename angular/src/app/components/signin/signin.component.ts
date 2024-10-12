// signin.component.ts

import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { LoadingBarService } from '@ngx-loading-bar/core';
import { ToastrService } from 'ngx-toastr';
import { CommonService } from 'src/app/services/common-service/common.service'; // Import CommonService

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.scss'],
})
export class SigninComponent {
  showError: boolean = false;
  fieldTextType: boolean;
  profile: any;
  loader = this.loadingBar.useRef();

  signinForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  confirmEmailError: boolean = false;

  constructor(
    private auth: AuthService,
    private fb: FormBuilder,
    private router: Router,
    private loadingBar: LoadingBarService,
    private toastr: ToastrService,
    private commonService: CommonService // Inject CommonService
  ) {}

  toggleFieldTextType() {
    this.fieldTextType = !this.fieldTextType;
  }

  ngOnInit(): void {
    this.loader.stop();
  }

  signin() {
    this.loader.start();
    if (this.signinForm.invalid) {
      this.loader.stop();
      this.toastr.error('Please fill in your email and password');
      return;
    }

    const reqObject = {
      email: this.signinForm.value.email!,
      password: this.signinForm.value.password!,
    };

    this.auth.signin(reqObject).subscribe({
      next: () => {
        // Immediately fetch profile after login to determine role
        this.auth.getMyProfile().subscribe({
          next: (profile) => {
            console.log('Profile loaded during login:', profile);

            // Update header with user data
            this.commonService.updateUsersDataForHeader({
              image: profile.avatar,
              firstName: profile.first_name,
              lastName: profile.last_name,
            });

            // Check the user's role and redirect accordingly
            if (profile.type === 'engineer') {
              this.router.navigate(['/engineers/form']); // Redirect to engineer form
            } else if (profile.type === 'recruiter') {
              this.router.navigate(['/business/form']); // Redirect to recruiter form
            } else {
              // If no valid role, fallback to the role selection page
              this.router.navigate(['']);
            }
            this.loader.stop();
          },
          error: (err) => {
            console.error('Profile loading error', err);
            this.toastr.error('Failed to load profile. Redirecting to role setup.');
            this.router.navigate(['/role']); // Fallback if there's an error fetching profile
            this.loader.stop();
          },
        });
      },
      error: (err) => {
        this.showError = false;
        this.confirmEmailError = false;
        if (err.status === 403) {
          console.log(err);
          this.confirmEmailError = true;
          this.toastr.error('Email not verified. Please check your inbox.');
        } else if (err.status === 401) {
          console.log(err);
          this.showError = true;
          this.toastr.error('Invalid email or password. Please try again.');
        } else {
          console.log(err);
          this.toastr.error('An error occurred. Please try again.');
        }
        this.loader.stop();
      },
    });
  }
}
