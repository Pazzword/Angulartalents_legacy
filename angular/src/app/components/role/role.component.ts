import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-role',
  templateUrl: './role.component.html',
  styleUrls: ['./role.component.scss']
})
export class RoleComponent {
  constructor(private auth: AuthService, private router: Router, private toastr: ToastrService) {}

  ngOnInit(): void {
    this.auth.getMyProfile().subscribe({
      next: (res) => {
        if (res.type === 'recruiter') {
          this.router.navigate(['/business/form']); // Adjust redirect
        } else if (res.type === 'engineer') {
          this.router.navigate(['/engineers/form']); // Adjust redirect
        } else {
          this.router.navigate(['/role']);
        }
      },
      error: () => {
        this.router.navigate(['/role']);
      }
    });
  }

  selectRole(role: string) {
    this.auth.setRole(role);  // Set role using AuthService
    this.toastr.success(`Role ${role} selected`);

    // Directly navigate to form based on role
    if (role === 'recruiter') {
      this.router.navigate(['/business/form']);
    } else if (role === 'engineer') {
      this.router.navigate(['/engineers/form']);
    }
  }
}
