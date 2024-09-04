import { Component, ElementRef, NgZone, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service'; // Import AuthService to get user role
import { LoadingBarService } from '@ngx-loading-bar/core';
import { CloudinaryService } from 'src/app/services/cloudinary/cloudinary.service';
import { CommonService } from 'src/app/services/common-service/common.service';
import { EngineerService } from 'src/app/services/engineer-service/engineer.service';
import { errorMessageGenerator } from 'src/app/shared/helpers';
import { regexValidator } from 'src/app/url-regex.validator';

@Component({
  selector: 'app-profile-form',
  templateUrl: './profile-form.component.html',
  styleUrls: ['./profile-form.component.scss'],
})
export class ProfileFormComponent {
  @ViewChild('search') public searchElementRef!: ElementRef;
  @ViewChild('map') public mapElementRef!: ElementRef;
  @ViewChild('location') public locationElement!: ElementRef;
  public place: any;

  profileForm!: FormGroup;
  submitted: boolean = false;
  errors: Array<any> = [];
  imgFile: any;
  coverImgFile: string;
  imageSrc: string = '';
  coverImg: string = '';
  loader = this.loadingBar.useRef();

  roleTypes = [
    { name: 'Part-time contract', value: 'contract_part_time' },
    { name: 'Full-time contract', value: 'contract_full_time' },
    { name: 'Part-time employment', value: 'employee_part_time' },
    { name: 'Full-time employment', value: 'employee_full_time' },
  ];

  roleLevels = [
    { name: 'Junior', value: 'junior' },
    { name: 'Middle', value: 'mid_level' },
    { name: 'Senior', value: 'senior' },
    { name: 'Principal', value: 'principal_staff' },
    { name: 'C-Level', value: 'c_level' },
  ];

  constructor(
    private router: Router,
    private engineerService: EngineerService,
    private ngZone: NgZone,
    private fb: FormBuilder,
    private cloudinary: CloudinaryService,
    private loadingBar: LoadingBarService,
    private commonService: CommonService,
    private authService: AuthService // Inject AuthService
  ) {}

  ngOnInit(): void {
    this.profileForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      tagLine: ['', [Validators.required]],
      city: ['', [Validators.required]],
      state: [''],
      country: ['', [Validators.required]],
      avatar: ['', Validators.required],
      bio: ['', [Validators.required]],
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
      github: [
        '',
        [
          Validators.required,
          regexValidator(new RegExp('^((?!https://).)*$'), {
            http: 'true',
          }),
          regexValidator(new RegExp('^[a-zA-Z0-9-]+/?$'), {
            username: 'true',
          }),
        ],
      ],
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
      linkedIn: [
        '',
        [
          regexValidator(new RegExp('^((?!https://).)*$'), {
            http: 'true',
          }),
          regexValidator(new RegExp('^[a-zA-Z0-9-]+/?$'), {
            username: 'true',
          }),
          Validators.required,
        ],
      ],
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

    // Fetch user data from AuthService
    const user = this.authService.getUserData();
    if (user) {
      // Initialize the form with user data if available
      this.profileForm.patchValue({
        firstName: user.first_name,
        lastName: user.last_name,
        // Other fields as needed
      });
    }
  }

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


submit() {
  this.loader.start();

  // Check if the user is an engineer before proceeding
  const role = this.authService.getRole(); // Get role directly from the AuthService

  if (role === 'engineer') {
      this.submitImgToCloudinary();
  } else {
      this.loader.stop();
      this.errors = ['You do not have permission to create an engineer profile.'];
      console.error('User does not have engineer access');
  }
}

  submitImgToCloudinary() {
    this.submitted = true;
    this.errors = [];
    const formData = new FormData();
    formData.append('file', this.imgFile);
    formData.append('upload_preset', 'flask-upload');

    this.cloudinary.uploadImg(formData).subscribe({
      next: (res) => {
        this.profileForm.patchValue({ avatar: res.secure_url });
        const data = {
          first_name: this.profileForm.value.firstName,
          last_name: this.profileForm.value.lastName,
          tagLine: this.profileForm.value.tagLine,
          city: this.profileForm.value.city,
          country: this.profileForm.value.country,
          avatar: res.secure_url,
          bio: this.profileForm.value.bio,
          searchStatus: this.profileForm.value.searchStatus,
          roleType: this.profileForm.value.roleType,
          roleLevel: this.profileForm.value.roleLevel,
          linkedIn: 'https://www.linkedin.com/in/' + this.profileForm.value.linkedIn,
          website: 'https://' + this.profileForm.value.website,
          github: 'https://github.com/' + this.profileForm.value.github,
          twitter: 'https://twitter.com/' + this.profileForm.value.twitter,
          stackoverflow: 'https://stackoverflow.com/users/' + this.profileForm.value.stackoverflow,
          user: this.authService.getUserData()?.id,
        };

        if (this.profileForm.valid) {
          this.engineerService.createEngineer(data).subscribe({
            next: (response: any) => {
              this.submitted = false;
              this.commonService.updateUsersDataForHeader({
                image: data.avatar,
                firstName: data.first_name,
                lastName: data.last_name,
              });
              this.router.navigate(['engineers/details', response.engineerId]); // Assuming response contains `engineerId`
              this.commonService.afterCreateProfileMessage.next(true);
              this.loader.stop();
            },
            error: (error) => {
              console.error('Error creating engineer:', error);
              this.errors = ['Error creating engineer. Please try again.'];
              this.loader.stop();
            },
          });
        } else {
          this.errors = errorMessageGenerator(this.profileForm.controls);
          this.loader.stop();
        }
      },
      error: (err) => {
        console.error('Error uploading image:', err);
        this.errors = ['Image upload failed. Please try again.'];
        this.loader.stop();
      },
    });
  }

  onFileChange(event: any) {
    const file = event.target.files[0];
    this.imgFile = file;
    var reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event: any) => {
      this.imageSrc = event.target.result;
    };
  }
}
