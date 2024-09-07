import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { CustomValidators } from 'src/app/matching-passwords.validator';
import { LoadingBarService } from '@ngx-loading-bar/core';
import { CommonService } from 'src/app/services/common-service/common.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
})
export class SignupComponent {
  fieldTextType: boolean;
  repeatFieldTextType: boolean;
  loader = this.loadingBar.useRef(); // Loading bar reference

  signupForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],  // Email field validation
    password: [
      '',
      Validators.compose([Validators.required, Validators.minLength(8)]),  // Password field validation
    ],
    confirmPassword: [
      '',
      [Validators.required],
    ],
  }, { validator: CustomValidators.MatchingPasswords });

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private toastr: ToastrService,
    private loadingBar: LoadingBarService,
    private commonService: CommonService
  ) {}

  // Toggle password visibility
  toggleFieldTextType() {
    this.fieldTextType = !this.fieldTextType;
  }

  // Toggle confirm password visibility
  toggleRepeatFieldTextType() {
    this.repeatFieldTextType = !this.repeatFieldTextType;
  }

  signup() {
    console.log('Signup initiated');
    this.loader.start(); // Start loading bar

    // Check if form is valid
    if (this.signupForm.valid) {
      console.log('Signup form is valid');

      const role = this.auth.getRole();  // Retrieve role from AuthService
      console.log('Role retrieved during signup:', role);

      // Check if role is selected
      if (!role) {
        this.toastr.error('Role is not selected. Please go back and select a role.');
        this.loader.stop(); // Stop loading bar
        return;
      }

      const signupData = {
        email: this.signupForm.value.email,
        password: this.signupForm.value.password,
        role: role  // Include role in the signup data
      };

      console.log('Signup data being sent:', signupData);

      // Call signup service method
      this.auth.signup(signupData).subscribe({
        next: (response) => {
          console.log('Signup response:', response);  // Log success response
          this.toastr.success('Registration successful! Please check your email to verify your account.');
          this.signupForm.reset();  // Reset the form
          this.router.navigate(['/email-verify']);  // Navigate to email verification page
          this.loader.stop(); // Stop loading bar
        },
        error: (error) => {
          console.error('Signup error:', error);  // Log error response
          this.loader.stop(); // Stop loading bar

          // Show error message based on response
          if (error.error.detail === 'user already created') {
            this.toastr.error('Account already exists');
          } else {
            this.toastr.error('Registration failed. Please try again.');
          }
        }
      });
    } else {
      console.log('Signup form is invalid');
      this.loader.stop(); // Stop loading bar
      this.toastr.error('Please fill in the form correctly.');
    }
  }
}
