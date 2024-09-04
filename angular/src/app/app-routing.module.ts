import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { HomeComponent } from './components/home/home.component';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { PricingComponent } from './components/pricing/pricing.component';
import { RoleComponent } from './components/role/role.component';
import { SigninComponent } from './components/signin/signin.component';
import { SignupComponent } from './components/signup/signup.component';
import { AuthGuard } from './guards/auth.guard';
import { RolePageGuard } from './guards/role-page-guard/role-page.guard';
import { PrivacyPolicyComponent } from './components/privacy-policy/privacy-policy/privacy-policy.component';
import { AboutComponent } from './components/about/about/about.component';
import { TermsAndConditionsComponent } from './components/terms-and-conditions/terms-and-conditions/terms-and-conditions.component';
import { VerifyComponent } from './components/verify/verify/verify.component';
import { MainComponent } from './components/main/main/main.component';
import { EmailVerifyComponent } from './components/email-verify/email-verify/email-verify.component';

const routes: Routes = [
  {
    path: '', component: MainComponent, children: [
      { path: '', component: HomeComponent }, // Ensure the home page is accessible
      { path: 'forgot-password', component: ForgotPasswordComponent },
      { path: 'signin', component: SigninComponent },
      { path: 'signup', component: SignupComponent },
      {
        path: 'role',
        component: RoleComponent,
        canActivate: [ RolePageGuard] // Use both AuthGuard and RolePageGuard
      },
      { path: 'pricing', component: PricingComponent },
      { path: 'privacy', component: PrivacyPolicyComponent },
      { path: 'terms', component: TermsAndConditionsComponent },
      { path: 'about', component: AboutComponent },
      { path: 'email-verify/:verificationCode', component: EmailVerifyComponent },
      {
        path: 'engineers',
        loadChildren: () =>
          import('./modules/engineers/engineers.module').then(
            (m) => m.EngineersModule
          ),
      },
      {
        path: 'business',
        canActivate: [AuthGuard],
        loadChildren: () =>
          import('./modules/business/business.module').then(
            (m) => m.BusinessModule
          ),
      },
    ]
  },
  {
    path: 'verify/:userID/:verificationCode', component: VerifyComponent
  },
  { path: '**', component: NotFoundComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes,
    {
      scrollPositionRestoration: 'enabled',
      scrollOffset: [0, 0]
    }
  )],
  exports: [RouterModule],
})
export class AppRoutingModule { }
