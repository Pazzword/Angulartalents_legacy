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



  selectRole(role: string) {
    console.log(`Selected role: ${role}`);
    this.auth.setRole(role);  // Set role using AuthService
    this.toastr.success(`Role ${role} selected`);
  
    // Redirect to the signup page after role selection
    this.router.navigate(['/signup']);
  }
}
