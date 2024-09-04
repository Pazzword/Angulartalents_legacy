import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EngineersRoutingModule } from './engineers-routing.module';
import { ProfileDetailsComponent } from './components/profile-details/profile-details.component';
import { ProfileFormComponent } from './components/profile-form/profile-form.component';
import { EngineersComponent } from './components/engineers/engineers.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ProfileUpdateComponent } from './components/profile-update/profile-update.component';
import {AutocompleteLibModule} from 'angular-ng-autocomplete';
import { LoadingBarModule } from '@ngx-loading-bar/core';

import { NgxPaginationModule } from 'ngx-pagination';
import { FileUploadModule } from 'ng2-file-upload';
@NgModule({
  declarations: [
    ProfileDetailsComponent,
    ProfileFormComponent,
    EngineersComponent,
    ProfileUpdateComponent
  ],
  imports: [
    AutocompleteLibModule,
    CommonModule,
    EngineersRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    NgxPaginationModule,
    LoadingBarModule,
    FileUploadModule,
  ]
})
export class EngineersModule { }
