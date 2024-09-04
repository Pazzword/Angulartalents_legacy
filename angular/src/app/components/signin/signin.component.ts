import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { LoadingBarService } from '@ngx-loading-bar/core';
import { ToastrService } from 'ngx-toastr';


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
    private toastr: ToastrService
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
        // Redirect to the 'role' route upon successful login
        this.auth.getMyProfile().subscribe({
          next: () => {
            this.router.navigate(['/role']);
            this.loader.stop();
          },
          error: (err) => {
            console.error('Profile loading error', err);
            this.toastr.error('Failed to load profile. Redirecting to role setup.');
            this.router.navigate(['/role']);
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
          this.loader.stop();
        } else if (err.status === 401) {
          console.log(err);
          this.showError = true;
          this.toastr.error('Invalid email or password. Please try again.');
          this.loader.stop();
        } else {
          console.log(err);
          this.toastr.error('An error occurred. Please try again.');
          this.loader.stop();
        }
      },
    });
  }
  
}
