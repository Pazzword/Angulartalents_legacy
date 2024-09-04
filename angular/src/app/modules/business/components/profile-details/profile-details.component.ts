import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
@Component({
  selector: 'app-profile-details',
  templateUrl: './profile-details.component.html',
  styleUrls: ['./profile-details.component.scss'],
})
export class ProfileDetailsComponent {
  recruiter: any;
  private myProfileSub: Subscription;

  constructor(private auth: AuthService) {}

  ngOnInit(): void {
    this.myProfileSub = this.auth.getMyProfile().subscribe({
      next: (res) => (this.recruiter = res.user),
    });
  }

  ngOnDestroy(): void {
    this.myProfileSub.unsubscribe();
  }
}
