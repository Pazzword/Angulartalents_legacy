import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProfileDetailsComponent } from './components/profile-details/profile-details.component';
import { ProfileFormComponent } from './components/profile-form/profile-form.component';
import { EngineersComponent } from './components/engineers/engineers.component';
import { ProfileUpdateComponent } from './components/profile-update/profile-update.component';
import { RoleGuard } from 'src/app/guards/role-guard/role.guard';
import { AuthGuard } from 'src/app/guards/auth.guard';
import { UpdateProfileRoleGuard } from 'src/app/guards/update-profile-role-guard/update-profile-role.guard';

const routes: Routes = [
  { path: '', component: EngineersComponent },
  {
    path: 'details/:id',
    component: ProfileDetailsComponent,
  },
  {
    path: 'form/:id',  // Ensure form editing uses ID
    component: ProfileFormComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'form',  // This route can be used when creating a new profile (no ID needed)
    component: ProfileFormComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'update/:id',
    component: ProfileUpdateComponent,
    canActivate: [AuthGuard, UpdateProfileRoleGuard],
    data: {
      role: 'engineer',  // Ensure role type consistency
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EngineersRoutingModule {}
