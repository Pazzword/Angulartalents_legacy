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
// import {
//   LocationService,
//   Maps,
// } from 'src/app/services/location-service/location.service';
import { errorMessageGenerator } from 'src/app/shared/helpers';
import { regexValidator } from 'src/app/url-regex.validator';

const place = null as unknown as google.maps.places.PlaceResult;
type Components = typeof place.address_components;
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

  constructor(
    private router: Router,
    // private locationService: LocationService,
    private auth: AuthService,
    private engineerService: EngineerService,
    private ngZone: NgZone,
    private fb: FormBuilder,
    public cloudinary: CloudinaryService,
    private loadingBar: LoadingBarService,
    private commonService: CommonService
  ) {
    // locationService.api.then((maps) => {
    //   this.initAutocomplete(maps);
    // });
  }
  @ViewChild('search')
  public searchElementRef!: ElementRef;

  @ViewChild('map')
  public mapElementRef!: ElementRef;

  // @ViewChild('location') public locationElement!: ElementRef;

  roleTypes = [
    { name: 'Part-time contract', value: 'contract_part_time', checked: false },
    { name: 'Full-time contract', value: 'contract_full_time', checked: false },
    {
      name: 'Part-time employment',
      value: 'employee_part_time',
      checked: false,
    },
    {
      name: 'Full-time employment',
      value: 'employee_full_time',
      checked: false,
    },
  ];

  roleLevels = [
    { name: 'Junior', value: 'junior', checked: false },
    { name: 'Middle', value: 'mid_level', checked: false },
    { name: 'Senior', value: 'senior', checked: false },
    { name: 'Principal', value: 'principal_staff', checked: false },
    { name: 'C-Level', value: 'c_level', checked: false },
  ];

  public place: any;

  public locationFields = [
    'name',
    'cityName',
    'stateCode',
    'countryName',
    'countryCode',
  ];

  // private map!: google.maps.Map;
  imageSrc: string = '';
  coverImg: string = '';

  ngOnInit(): void {
    this.cloudinary.onUploadedPhotoGetLink.subscribe((responseUrl: string) => {
      this.imageSrc = responseUrl;
    });

    this.profileForm = this.fb.group({
      id: ['', [Validators.required]],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      tagLine: ['', Validators.required],
      city: ['', Validators.required],
      state: [''],
      country: ['', Validators.required],
      // location: ['', Validators.required],
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
            new RegExp('(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?'),
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
    this.setProfileToUpdate();
  }

  setProfileToUpdate() {
    this.auth.getMyProfile().subscribe((myProfile) => {
      if (myProfile.user.Avatar) {
        this.imageSrc = myProfile.user.Avatar;
        this.myProfile = myProfile.user;
      }
      const noPrefixLinkedIn = myProfile.user.LinkedIn.split(
        'https://www.linkedin.com/in/'
      )[1];
      const noPrefixWebsite = myProfile.user.Website.split('https://')[1];
      const noPrefixGithub = myProfile.user.Github.split(
        'https://github.com/'
      )[1];
      const noPrefixTwitter = myProfile.user.Twitter.split(
        'https://twitter.com/'
      )[1];
      const noPrefixStackOverflow = myProfile.user.StackOverflow.split(
        'https://stackoverflow.com/users/'
      )[1];

      this.profileForm.patchValue({
        id: myProfile.user.ID,
        firstName: myProfile.user.Firstname,
        lastName: myProfile.user.Lastname,
        tagLine: myProfile.user.Tagline,
        city: myProfile.user.City,
        country: myProfile.user.Country,
        // location: `${myProfile.user.City} ${myProfile.user.Country}`,
        avatar: myProfile.user.Avatar,
        bio: myProfile.user.Bio,
        searchStatus: myProfile.user.SearchStatus,
        website: noPrefixWebsite,
        github: noPrefixGithub,
        twitter: noPrefixTwitter,
        linkedIn: noPrefixLinkedIn,
        stackoverflow: noPrefixStackOverflow,
      });
      let roleTypeArr = this.profileForm.controls['roleType'] as FormArray;
      // setting previously saved roletype values to current form
      myProfile.user.RoleType.forEach((roleType: any) => {
        roleTypeArr.push(new FormControl(roleType));
        this.roleTypes.forEach((item) => {
          if (roleType === item.value) {
            item.checked = true;
          }
        });
      });

      let roleLevelArr = this.profileForm.controls['roleLevel'] as FormArray;
      // setting previously saved rolelevel values to current form
      myProfile.user.RoleLevel.forEach((roleLevel: any) => {
        roleLevelArr.push(new FormControl(roleLevel));
        this.roleLevels.forEach((item) => {
          if (roleLevel === item.value) {
            item.checked = true;
          }
        });
      });

      this.profileForm.controls['github'].disable();
      this.profileForm.controls['linkedIn'].disable();
    });
  }

  // submit the new changes of edit profile
  update() {
    this.submitted = true;
    this.errors = [];
    this.loader.start();

    // If user havent added new image
    if (this.imgFile === undefined) {
      const data = {
        firstName: this.profileForm.value.firstName,
        lastName: this.profileForm.value.lastName,
        tagLine: this.profileForm.value.tagLine,
        city: this.profileForm.value.city,
        country: this.profileForm.value.country,
        avatar: this.profileForm.value.avatar,
        bio: this.profileForm.value.bio,
        searchStatus: this.profileForm.value.searchStatus,
        roleType: this.profileForm.value.roleType,
        roleLevel: this.profileForm.value.roleLevel,
        website: 'https://' + this.profileForm.value.website,
        twitter: 'https://twitter.com/' + this.profileForm.value.twitter,
        stackoverflow:
          'https://stackoverflow.com/users/' +
          this.profileForm.value.stackoverflow,
      };
      if (this.profileForm.valid) {
        this.engineerService.updateEngineer(data).subscribe({
          next: () => {
            this.submitted = false;
            this.commonService.updateUsersDataForHeader({
              image: data.avatar,
              firstName: data.firstName,
              lastName: data.lastName
            })
            this.router.navigate([
              'engineers/details',
              this.profileForm.value.id,
            ]);
            this.loader.stop();

          },
          error: (err) => {
            this.loader.stop();
            console.error(err);
          },
        });
      } else {
        this.errors = errorMessageGenerator(this.profileForm.controls);
        this.loader.stop();
      }
    } else {
      // when user changed avatar
      const formData = new FormData();
      formData.append('file', this.imgFile);
      formData.append('upload_preset', 'yakyhtcu');
      if (this.profileForm.valid) {
        this.cloudinary.uploadImg(formData).subscribe({
          next: (res) => {
            this.profileForm.patchValue({ avatar: res.secure_url });

            const data = {
              firstName: this.profileForm.value.firstName,
              lastName: this.profileForm.value.lastName,
              tagLine: this.profileForm.value.tagLine,
              city: this.profileForm.value.city,
              country: this.profileForm.value.country,
              avatar: res.secure_url,
              bio: this.profileForm.value.bio,
              searchStatus: this.profileForm.value.searchStatus,
              roleType: this.profileForm.value.roleType,
              roleLevel: this.profileForm.value.roleLevel,
              website: 'https://' + this.profileForm.value.website,
              twitter: 'https://twitter.com/' + this.profileForm.value.twitter,
              stackoverflow:
                'https://stackoverflow.com/users/' +
                this.profileForm.value.stackoverflow,
            };
            this.engineerService.updateEngineer(data).subscribe({
              next: () => {
                this.submitted = false;
                this.loader.stop();
                this.commonService.updateUsersDataForHeader({
                  image: data.avatar,
                  firstName: data.firstName,
                  lastName: data.lastName
                })
                this.router.navigate([
                  'engineers/details',
                  this.profileForm.value.id,
                ]);
              },
              error: (err) => {
                this.errors = errorMessageGenerator(this.profileForm.controls);
                this.loader.stop();
                console.error(err);
              },
            });
          },
          error: (err) => {
            this.loader.stop();
            console.error(err);
          },
        });
      } else {
        this.errors = errorMessageGenerator(this.profileForm.controls);
        this.loader.stop();
      }

    }
    // this.commonService.updateEngineerName(this.profileForm.value.firstName)
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
}

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
