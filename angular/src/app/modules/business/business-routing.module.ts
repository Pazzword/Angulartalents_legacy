import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'src/app/guards/auth.guard';
import { ProfileDetailsRoleGuard } from 'src/app/guards/profile-details-role-guard/profile-details-role.guard';
import { RoleGuard } from 'src/app/guards/role-guard/role.guard';
import { UpdateProfileRoleGuard } from 'src/app/guards/update-profile-role-guard/update-profile-role.guard';
import { BusinessComponent } from './components/business/business.component';
import { ProfileDetailsComponent } from './components/profile-details/profile-details.component';
import { ProfileFormComponent } from './components/profile-form/profile-form.component';
import { ProfileUpdateComponent } from './components/profile-update/profile-update.component';

const routes: Routes = [
  { path: '', component: BusinessComponent },
  {
    // only logged in recruiter can access
    path: 'details',
    component: ProfileDetailsComponent,
    canActivate: [ProfileDetailsRoleGuard],
    data: {
      role: 'engineer'
    }
  },
  {
    // can access if you are logged in, but no role yet
    path: 'form',
    component: ProfileFormComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: {
      role: 'engineer',
    },
  },
  {
    // only loggedin recruiter can access
    path: 'update/:id',
    component: ProfileUpdateComponent,
    canActivate: [AuthGuard, UpdateProfileRoleGuard],
    data: {
      role: 'engineer',
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BusinessRoutingModule {}
