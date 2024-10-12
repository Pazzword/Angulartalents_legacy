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
      this.profileForm.patchValue({
        firstName: user.first_name,
        lastName: user.last_name,
      });
    }
  }

  handleChangeRoleType(e: any) {
    const roleTypeArr = this.profileForm.get('roleType') as FormArray;
    if (e.target.checked) {
      roleTypeArr.push(new FormControl(e.target.value));
    } else {
      const index = roleTypeArr.controls.findIndex(
        (x) => x.value === e.target.value
      );
      if (index !== -1) {
        roleTypeArr.removeAt(index);
      }
    }
  }
  
  handleChangeRoleLevel(e: any) {
    const roleLevelArr = this.profileForm.get('roleLevel') as FormArray;
    if (e.target.checked) {
      roleLevelArr.push(new FormControl(e.target.value));
    } else {
      const index = roleLevelArr.controls.findIndex(
        (x) => x.value === e.target.value
      );
      if (index !== -1) {
        roleLevelArr.removeAt(index);
      }
    }
  }
  

  submit() {
    this.loader.start();

    const role = this.authService.getRole(); 

    if (role === 'engineer') {
      console.log('User role is engineer, proceeding with profile creation.');
      this.submitImgToCloudinary();
    } else {
      this.loader.stop();
      this.errors = ['You do not have permission to create an engineer profile.'];
    }
  }

  submitImgToCloudinary() {
    this.submitted = true;
    this.errors = [];
  
    if (!this.imgFile) {
      this.errors.push('Please select an image to upload.');
      this.loader.stop();
      return;
    }
  
    const formData = new FormData();
    formData.append('file', this.imgFile);
    formData.append('upload_preset', 'flask-upload');  
  
    this.cloudinary.uploadImg(formData).subscribe({
      next: (res) => {
        this.profileForm.patchValue({ avatar: res.secure_url });
  
        // Prepare the data to send to your backend
        const data = {
          first_name: this.profileForm.value.firstName,
          last_name: this.profileForm.value.lastName,
          tag_line: this.profileForm.value.tagLine,
          city: this.profileForm.value.city,
          country: this.profileForm.value.country,
          avatar: res.secure_url,
          bio: this.profileForm.value.bio,
          search_status: this.profileForm.value.searchStatus,
          role_type: this.profileForm.value.roleType,
          role_level: this.profileForm.value.roleLevel,
          linkedIn: 'https://www.linkedin.com/in/' + this.profileForm.value.linkedIn,
          website: this.profileForm.value.website
            ? this.profileForm.value.website.startsWith('http')
              ? this.profileForm.value.website
              : 'https://' + this.profileForm.value.website
            : '',
          github: 'https://github.com/' + this.profileForm.value.github,
          twitter: 'https://twitter.com/' + this.profileForm.value.twitter,
          stackoverflow: 'https://stackoverflow.com/users/' + this.profileForm.value.stackoverflow,
        };
  
        console.log('Data being sent to backend:', data);
  
        if (this.profileForm.valid) {
          this.engineerService.createEngineer(data).subscribe({
            next: (response: any) => {
              this.submitted = false;
              localStorage.setItem('engineerProfileId', response.engineerId);
              this.router.navigate(['engineers/details', response.engineerId]);
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
    if (file) {
      this.imgFile = file;
      var reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event: any) => {
        this.imageSrc = event.target.result;
      };
    } else {
      this.errors.push('No file selected.');
    }
  }
}
