import { Component, ElementRef, NgZone, ViewChild } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingBarService } from '@ngx-loading-bar/core';
import { AuthService } from 'src/app/services/auth.service';
import { CloudinaryService } from 'src/app/services/cloudinary/cloudinary.service';
import { CommonService } from 'src/app/services/common-service/common.service';
import { EngineerService } from 'src/app/services/engineer-service/engineer.service';
import { errorMessageGenerator } from 'src/app/shared/helpers';
import { regexValidator } from 'src/app/url-regex.validator';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-profile-update',
  templateUrl: './profile-update.component.html',
  styleUrls: ['./profile-update.component.scss'],
})
export class ProfileUpdateComponent {
  myProfile: any;
  errors: Array<any> = [];
  profileForm!: FormGroup;
  submitted = false;
  imgFile: any;
  loader = this.loadingBar.useRef();

  roleTypes = [
    { name: 'Part-time contract', value: 'contract_part_time', checked: false },
    { name: 'Full-time contract', value: 'contract_full_time', checked: false },
    { name: 'Part-time employment', value: 'employee_part_time', checked: false },
    { name: 'Full-time employment', value: 'employee_full_time', checked: false },
  ];

  roleLevels = [
    { name: 'Junior', value: 'junior', checked: false },
    { name: 'Middle', value: 'mid_level', checked: false },
    { name: 'Senior', value: 'senior', checked: false },
    { name: 'Principal', value: 'principal_staff', checked: false },
    { name: 'C-Level', value: 'c_level', checked: false },
  ];

  imageSrc: string = '';
  coverImg: string = '';

  constructor(
    private router: Router,
    private auth: AuthService,
    private engineerService: EngineerService,
    private ngZone: NgZone,
    private fb: FormBuilder,
    public cloudinary: CloudinaryService,
    private loadingBar: LoadingBarService,
    private commonService: CommonService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Initialize the form group with form controls
    this.profileForm = this.fb.group({
      id: ['', [Validators.required]],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      tagLine: ['', Validators.required],
      city: ['', Validators.required],
      state: [''],
      country: ['', Validators.required],
      avatar: new FormControl(''),
      bio: ['', Validators.required],
      searchStatus: ['', Validators.required],
      roleType: this.fb.array([], Validators.required),
      roleLevel: this.fb.array([], Validators.required),
      website: [
        '',
        [
          regexValidator(new RegExp('^((?!https://).)*$'), {
            http: 'true',
          }),
          regexValidator(
            new RegExp('(https?://)?([\\da-z.-]+)\\.(com|co\\.uk)([\\/\\w .-]*)*\\/?'),
            { url: 'true' }
          ),
        ],
      ],
      github: ['', Validators.required],
      twitter: [
        '',
        [
          regexValidator(new RegExp('^((?!https://).)*$'), {
            http: 'true',
          }),
          regexValidator(new RegExp('^[a-zA-Z0-9_-]+/?$'), {
            username: 'true',
          }),
        ],
      ],
      linkedIn: ['', Validators.required],
      stackoverflow: [
        '',
        [
          regexValidator(new RegExp('^((?!https://).)*$'), {
            http: 'true',
          }),
          regexValidator(new RegExp('^[a-z0-9-/]+$'), {
            username: 'true',
          }),
        ],
      ],
    });

    // Populate the form with the engineer's profile data
    this.setProfileToUpdate();
  }

  setProfileToUpdate() {
    // Fetch the engineer profile directly
    this.engineerService.getMyEngineerProfile().subscribe(
      (engineerProfile) => {
        console.log('ProfileUpdateComponent - engineerProfile:', engineerProfile);

        if (engineerProfile) {
          // Set avatar if available
          if (engineerProfile.avatar) {
            this.imageSrc = engineerProfile.avatar;
          }

          // Handle social links (remove prefix to populate input fields)
          const noPrefixLinkedIn =
            engineerProfile.linkedIn?.split('https://www.linkedin.com/in/')[1] || '';
          const noPrefixWebsite = engineerProfile.website?.split('https://')[1] || '';
          const noPrefixGithub =
            engineerProfile.github?.split('https://github.com/')[1] || '';
          const noPrefixTwitter =
            engineerProfile.twitter?.split('https://twitter.com/')[1] || '';
          const noPrefixStackOverflow =
            engineerProfile.stackoverflow?.split('https://stackoverflow.com/users/')[1] ||
            '';

          // Patch form values
          this.profileForm.patchValue({
            id: engineerProfile.id,
            firstName: engineerProfile.first_name,
            lastName: engineerProfile.last_name,
            tagLine: engineerProfile.tag_line,
            city: engineerProfile.city,
            country: engineerProfile.country,
            avatar: engineerProfile.avatar,
            bio: engineerProfile.bio,
            searchStatus: engineerProfile.search_status,
            website: noPrefixWebsite,
            github: noPrefixGithub,
            twitter: noPrefixTwitter,
            linkedIn: noPrefixLinkedIn,
            stackoverflow: noPrefixStackOverflow,
          });

          // Set role types if available
          if (engineerProfile.role_type && Array.isArray(engineerProfile.role_type)) {
            let roleTypeArr = this.profileForm.controls['roleType'] as FormArray;
            engineerProfile.role_type.forEach((roleType: any) => {
              roleTypeArr.push(new FormControl(roleType));
              this.roleTypes.forEach((item) => {
                if (roleType === item.value) {
                  item.checked = true;
                }
              });
            });
          }

          // Set role levels if available
          if (engineerProfile.role_level && Array.isArray(engineerProfile.role_level)) {
            let roleLevelArr = this.profileForm.controls['roleLevel'] as FormArray;
            engineerProfile.role_level.forEach((roleLevel: any) => {
              roleLevelArr.push(new FormControl(roleLevel));
              this.roleLevels.forEach((item) => {
                if (roleLevel === item.value) {
                  item.checked = true;
                }
              });
            });
          }

          // Detect changes manually
          this.cdr.detectChanges();

          // Disable certain form controls if needed
          this.profileForm.controls['github'].disable();
          this.profileForm.controls['linkedIn'].disable();

          // Mark form fields as touched to ensure UI update
          this.profileForm.markAllAsTouched();
        } else {
          console.error('Engineer profile is undefined');
        }
      },
      (error) => {
        console.error('Error fetching engineer profile:', error);
      }
    );
  }

  // Submit the new changes of edit profile
  update() {
    this.submitted = true;
    this.errors = [];

    if (this.profileForm.invalid) {
      this.errors = errorMessageGenerator(this.profileForm.controls);
      this.loader.stop();
      return; // Prevent submission if the form is invalid
    }

    this.loader.start();

    const formatWebsite = (url: string) => {
      if (!url) return '';
      if (url.startsWith('http')) {
        return url;
      }
      return 'https://' + url;
    };

    const formatTwitter = (handle: string) => {
      if (!handle) return '';
      if (handle.startsWith('http')) {
        return handle;
      }
      return 'https://twitter.com/' + handle;
    };

    const formatStackOverflow = (urlPart: string) => {
      if (!urlPart) return '';
      if (urlPart.startsWith('http')) {
        return urlPart;
      }
      return 'https://stackoverflow.com/users/' + urlPart;
    };

    // Prepare data without avatar
    let data: any = {
      id: this.profileForm.value.id,
      first_name: this.profileForm.value.firstName,
      last_name: this.profileForm.value.lastName,
      tag_line: this.profileForm.value.tagLine,
      city: this.profileForm.value.city,
      country: this.profileForm.value.country,
      bio: this.profileForm.value.bio,
      search_status: this.profileForm.value.searchStatus,
      role_type: this.profileForm.value.roleType,
      role_level: this.profileForm.value.roleLevel,
      website: formatWebsite(this.profileForm.value.website),
      twitter: formatTwitter(this.profileForm.value.twitter),
      stackoverflow: formatStackOverflow(this.profileForm.value.stackoverflow),
    };

    if (this.imgFile !== undefined) {
      // When user changed avatar
      const formData = new FormData();
      formData.append('file', this.imgFile);
      formData.append('upload_preset', 'flask-upload');

      this.cloudinary.uploadImg(formData).subscribe({
        next: (res) => {
          this.profileForm.patchValue({ avatar: res.secure_url });
          data.avatar = res.secure_url;

          this.submitUpdate(data);
        },
        error: (err) => {
          this.loader.stop();
          console.error('Image upload error:', err);
        },
      });
    } else {
      // User hasn't changed the avatar
      data.avatar = this.profileForm.value.avatar;
      this.submitUpdate(data);
    }
  }

  submitUpdate(data: any) {
    this.engineerService.updateEngineer(data).subscribe({
      next: () => {
        this.submitted = false;
        this.commonService.updateUsersDataForHeader({
          image: data.avatar,
          firstName: data.first_name,
          lastName: data.last_name,
        });
        this.router.navigate(['engineers/details', this.profileForm.value.id]);
        this.loader.stop();
      },
      error: (err) => {
        this.loader.stop();
        console.error('Update error:', err);

        if (err.status === 400 && err.error) {
          // Backend validation error
          this.setValidationErrors(err.error);
        } else {
          // Other errors
          this.errors.push('An unexpected error occurred. Please try again later.');
        }
      },
    });
  }

  setValidationErrors(errors: any) {
    for (const field in errors) {
      if (this.profileForm.controls[field]) {
        // Set the error on the form control
        this.profileForm.controls[field].setErrors({ serverError: errors[field][0] });
      } else {
        // Handle non-field errors
        this.errors.push(`${field}: ${errors[field]}`);
      }
    }
  }

  // ROLE TYPE
  handleChangeRoleType(e: any) {
    let roleTypeArr = this.profileForm.get('roleType') as FormArray;
    if (e.target.checked) {
      roleTypeArr.push(new FormControl(e.target.value));
    } else {
      let i = 0;
      roleTypeArr.controls.forEach((type) => {
        if (type.value === e.target.value) {
          roleTypeArr.removeAt(i);
          return;
        }
        i++;
      });
    }
  }

  // ROLE LEVEL
  handleChangeRoleLevel(e: any) {
    let roleLevelArr = this.profileForm.get('roleLevel') as FormArray;
    if (e.target.checked) {
      roleLevelArr.push(new FormControl(e.target.value));
    } else {
      let i = 0;
      roleLevelArr.controls.forEach((level) => {
        if (level.value === e.target.value) {
          roleLevelArr.removeAt(i);
          return;
        }
        i++;
      });
    }
  }

  // AVATAR
  onFileChange(event: any) {
    const file = event.target.files[0];
    this.imgFile = file;
    var reader = new FileReader();
    reader.readAsDataURL(file);
    // File Preview
    reader.onload = (event: any) => {
      this.imageSrc = event.target.result;
    };
  }
}


  // LOCATION
  // initAutocomplete(maps: Maps) {
  //   setTimeout(() => {
  //     let autocomplete = new maps.places.Autocomplete(
  //       this.searchElementRef?.nativeElement as HTMLInputElement
  //     );
  //     autocomplete.addListener('place_changed', () => {
  //       this.ngZone.run(() => {
  //         this.onPlaceChange(autocomplete.getPlace());
  //       });
  //     });
  //   }, 1000);
  // }

  // LOCATION
  // onPlaceChange(place: any) {
  //   const location = this.locationFromPlace(place);
  //   console.log(location)
  //   this.profileForm.patchValue({
  //     city: location?.cityName,
  //     country: location?.countryName,
  //   });
  // }
  // public locationFromPlace(place: google.maps.places.PlaceResult) {
  //   const components = place.address_components;
  //   if (components === undefined) {
  //     return null;
  //   }

  //   const areaLevel3 = getShort(components, 'administrative_area_level_3');
  //   const locality = getLong(components, 'locality');

  //   const cityName = locality || areaLevel3;
  //   const countryName = getLong(components, 'country');
  //   const countryCode = getShort(components, 'country');
  //   const stateCode = getShort(components, 'administrative_area_level_1');
  //   const name = place.name !== cityName ? place.name : null;

  //   return {
  //     name,
  //     cityName,
  //     countryName,
  //     countryCode,
  //     stateCode,
  //   };
  // }


// function getComponent(components: Components, name: string) {
//   return components?.filter(
//     (component: { types: string[] }) => component.types[0] === name
//   )[0];
// }

// function getLong(components: Components, name: string) {
//   const component = getComponent(components, name);
//   return component && component.long_name;
// }

// function getShort(components: Components, name: string) {
//   const component = getComponent(components, name);
//   return component && component.short_name;
// }
