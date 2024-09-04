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
    path: 'form',
    component: ProfileFormComponent,
    // Use AuthGuard only to check if user is logged in
    // Role is checked in the component logic itself
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
