import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { JwtHelperService, JWT_OPTIONS } from "@auth0/angular-jwt";
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './components/home/home.component';
import { SigninComponent } from './components/signin/signin.component';
import { SignupComponent } from './components/signup/signup.component';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { RoleComponent } from './components/role/role.component';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { HeaderComponent } from './components/header/header.component';
import { AuthService } from './services/auth.service';
import { AuthInterceptor } from './interceptors/auth-interceptor.interceptor';
import { PricingComponent } from './components/pricing/pricing.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';
import { FooterComponent } from './components/footer/footer.component';
import { LoadingBarModule } from '@ngx-loading-bar/core';
import { CloudinaryConfiguration, CloudinaryModule } from '@cloudinary/angular-5.x';
import { Cloudinary } from 'cloudinary-core';
import { FileUploadModule } from 'ng2-file-upload';
import { PrivacyPolicyComponent } from './components/privacy-policy/privacy-policy/privacy-policy.component';
import { AboutComponent } from './components/about/about/about.component';
import { TermsAndConditionsComponent } from './components/terms-and-conditions/terms-and-conditions/terms-and-conditions.component';
import { VerifyComponent } from './components/verify/verify/verify.component';
import { MainComponent } from './components/main/main/main.component';
import { EmailVerifyComponent } from './components/email-verify/email-verify/email-verify.component';
import { environment } from 'environments/environments';


@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    SigninComponent,
    SignupComponent,
    RoleComponent,
    NotFoundComponent,
    ForgotPasswordComponent,
    HeaderComponent,
    PricingComponent,
    FooterComponent,
    PrivacyPolicyComponent,
    AboutComponent,
    TermsAndConditionsComponent,
    VerifyComponent,
    MainComponent,
    EmailVerifyComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    CommonModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    ToastrModule.forRoot({ positionClass: 'toast-top-center' }),
    LoadingBarModule,
    CloudinaryModule.forRoot({ Cloudinary },
      {
        cloud_name: environment.cloudinary.cloud_name,      
        upload_preset: environment.cloudinary.upload_preset
      } as CloudinaryConfiguration),
    FileUploadModule,
  ],
  providers: [
    AuthService,
    JwtHelperService,
    { provide: JWT_OPTIONS, useValue: JWT_OPTIONS },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
