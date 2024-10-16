// email-verify.component.ts
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from 'environments/environments';

@Component({
  selector: 'app-verify',
  templateUrl: './verify.component.html',
  styleUrls: ['./verify.component.scss']
})
export class VerifyComponent implements OnInit {
  loading: boolean = true;
  showError: boolean = false;
  verificationSuccess: boolean = false; // New flag for success message
  url = environment.apiUrl;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router
  ) { }

  ngOnInit(): void {
    const userID = this.route.snapshot.paramMap.get('userID');
    const verificationCode = this.route.snapshot.paramMap.get('verificationCode');

    if (userID && verificationCode) {
      this.http.get(`${this.url}/verify/${userID}/${verificationCode}`).subscribe({
        next: (res) => {
          this.loading = false;
          this.verificationSuccess = true;
          console.log('Email successfully verified');
          // Optionally, redirect after a delay
          setTimeout(() => {
            this.router.navigate(['/signin']); // Redirect to signin page
          }, 5000); // Redirect after 5 seconds
        },
        error: (err) => {
          this.loading = false;
          this.showError = true;
          console.error('Email verification error:', err);
          // Optionally, redirect to error page
          // this.router.navigate(['/verify-error']);
        }
      });
    } else {
      this.loading = false;
      this.showError = true;
      console.error('Invalid verification URL');
      // Optionally, redirect to error page
      // this.router.navigate(['/verify-error']);
    }
  }
}
