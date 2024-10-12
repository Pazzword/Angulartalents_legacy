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

  // Signup Form initialization
  signupForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],  // Email validation
    password: ['', [Validators.required, Validators.minLength(8)]],  // Password validation
    confirmPassword: ['', Validators.required],  // Confirm password validation
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

  // Sign up method
  signup() {
    console.log('Signup initiated');
    this.loader.start(); // Start the loading bar

    // Check if form is valid
    if (this.signupForm.valid) {
      console.log('Signup form is valid');

      // Retrieve the selected role from AuthService
      const role = this.auth.getRole();  
      console.log('Role retrieved during signup:', role);

      // Ensure role is selected
      if (!role) {
        this.toastr.error('Role is not selected. Please go back and select a role.');
        this.loader.stop(); // Stop the loading bar
        return;
      }

      // Create the signup data
      const signupData = {
        email: this.signupForm.value.email,
        password: this.signupForm.value.password,
        role: role  // Pass the role as part of the signup data
      };

      console.log('Signup data being sent:', signupData);

      // Call signup service method
      this.auth.signup(signupData).subscribe({
        next: (response) => {
          console.log('Signup response:', response);  // Log success response

          // If the role is engineer, redirect to the engineer's profile form
          if (role === 'engineer') {
            this.router.navigate(['/engineers/profile-form']);  // Redirect to profile form for engineers
          } else {
            // For recruiters or other roles, redirect elsewhere
            this.router.navigate(['/dashboard']);  // Redirect to dashboard or other page
          }

          // Display success message
          this.toastr.success('Registration successful! Please check your email to verify your account.');
          this.signupForm.reset();  // Reset the form
          this.loader.stop(); // Stop the loading bar
        },
        error: (error) => {
          console.error('Signup error:', error);  // Log error response
          this.loader.stop(); // Stop the loading bar

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
      this.loader.stop(); // Stop the loading bar
      this.toastr.error('Please fill in the form correctly.');
    }
  }
}
