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
  url = environment.apiUrl;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router
  ) { }

  ngOnInit(): void {
    const userID = this.route.snapshot.paramMap.get('userID');  // Ensure userID is captured
    const verificationCode = this.route.snapshot.paramMap.get('verificationCode');

    if (userID && verificationCode) {
      this.http.get(`${this.url}/api/verify/${userID}/${verificationCode}`).subscribe({
        next: (res) => {
          this.loading = false;
          console.log('Email successfully verified');
          this.router.navigate(['/signin']); // Redirect to signin page
        },
        error: (err) => {
          this.loading = false;
          this.showError = true;
          console.error(err);
          console.log('Something went wrong with email verification');
          this.router.navigate(['/verify-error']); // Redirect to error page
        }
      });
    } else {
      this.showError = true;
      this.loading = false;
      console.error('Invalid verification URL');
      this.router.navigate(['/verify-error']); // Redirect to error page
    }
  }
}
