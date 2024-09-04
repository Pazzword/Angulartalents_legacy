import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-pricing',
  templateUrl: './pricing.component.html',
  styleUrls: ['./pricing.component.scss']
})
export class PricingComponent {
  @ViewChild('modal', { static: true }) modal: ElementRef;
  contactForm = this.fb.group({
    name: [''],
    email: [''],
    message: ['']
  })
  constructor(private auth: AuthService, private router: Router, private fb: FormBuilder) { }
  getStarted() {
    this.auth.isLoggedIn$.subscribe({
      next: res => {
        if (res) {
          this.modal.nativeElement.click();
        } else {
          console.log('user is not loggedin');
          this.router.navigate(['signin'])
        }
      },
      error: err => console.error(err)
    })
  }
}
