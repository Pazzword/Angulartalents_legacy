import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingBarService } from '@ngx-loading-bar/core';
import { AuthService } from 'src/app/services/auth.service';
import { BusinessService } from 'src/app/services/business-service/business.service';
import { CloudinaryService } from 'src/app/services/cloudinary/cloudinary.service';
import { CommonService } from 'src/app/services/common-service/common.service';
import { recruiterErrorMessageGenerator } from 'src/app/shared/helpers';
import { regexValidator } from 'src/app/url-regex.validator';

@Component({
  selector: 'app-profile-update',
  templateUrl: './profile-update.component.html',
  styleUrls: ['./profile-update.component.scss'],
})
export class ProfileUpdateComponent {
  profileForm!: FormGroup;
  imageSrc: string = '';
  imgFile: string;
  errors: Array<any> = [];
  submitted: boolean = false;
  loader = this.loadingBar.useRef();

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private auth: AuthService,
    private businessService: BusinessService,
    private cloudinary: CloudinaryService,
    private loadingBar: LoadingBarService,
    private commonService: CommonService
  ) {}

  ngOnInit(): void {
    this.profileForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      company: ['', Validators.required],
      linkedIn: ['', Validators.required],
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
          Validators.required,
        ],
      ],
      bio: ['', Validators.required],
      logo: ['', Validators.required],
      role: ['', Validators.required],
    });

    this.getMyProfile();
  }

  onFileChange(event: any) {
    // getting an image and setting global variable imgFile
    const file = event.target.files[0];
    this.imgFile = file;
    var reader = new FileReader();
    reader.readAsDataURL(file);
    // File Preview
    reader.onload = (event: any) => {
      // setting a preview image without submitting
      this.imageSrc = event.target.result;
    };
  }

  submit() {
    this.submitted = true;
    this.loader.start();

    if (this.imgFile) {
      const formData = new FormData();
      formData.append('file', this.imgFile);
      formData.append('upload_preset', 'yakyhtcu');
      if (this.profileForm.valid) {
        this.cloudinary.uploadImg(formData).subscribe((res) => {
          const data = {
            firstName: this.profileForm.value.firstName,
            lastName: this.profileForm.value.lastName,
            company: this.profileForm.value.company,
            website: 'https://' + this.profileForm.value.website,
            bio: this.profileForm.value.bio,
            logo: res.secure_url,
            role: this.profileForm.value.role,
          };
          this.businessService.updateRecruiter(data).subscribe({
            next: () => {
              this.commonService.updateUsersDataForHeader({
                image: data.logo,
                firstName: data.firstName,
                lastName: data.lastName
              })
              this.router.navigate(['/business/details']);
              this.loader.stop();
            },
            error: (error) => {
              this.loader.stop();
              console.error(error);
            },
          });
        });
      } else {
        this.errors = recruiterErrorMessageGenerator(this.profileForm.controls);
        this.loader.stop();
      }
    } else {
      if (this.profileForm.valid) {
        const data = {
          firstName: this.profileForm.value.firstName,
          lastName: this.profileForm.value.lastName,
          company: this.profileForm.value.company,
          website: 'https://' + this.profileForm.value.website,
          bio: this.profileForm.value.bio,
          logo: this.profileForm.value.logo,
          role: this.profileForm.value.role,
        };
        this.businessService.updateRecruiter(data).subscribe({
          next: () => {
            this.commonService.updateUsersDataForHeader({
              image: data.logo,
              firstName: data.firstName,
              lastName: data.lastName
            })
            this.router.navigate(['/business/details']);
            this.loader.stop();
          },
          error: (error) => {
            console.error(error);
            this.loader.stop();
          },
        });
      } else {
        this.errors = recruiterErrorMessageGenerator(this.profileForm.controls);
        this.loader.stop();
      }
    }
  }

  getMyProfile() {
    this.auth.getMyProfile().subscribe({
      next: (profile) => {
        const noPrefixLinkedIn = profile.user.LinkedIn.split(
          'https://www.linkedin.com/in/'
        )[1];
        const noPrefixWebsite = profile.user.Website.split('https://')[1];
        this.imageSrc = profile.user.Logo;
        this.profileForm.patchValue({
          firstName: profile.user.Firstname,
          lastName: profile.user.Lastname,
          company: profile.user.Company,
          linkedIn: noPrefixLinkedIn,
          website: noPrefixWebsite,
          logo: profile.user.Logo,
          bio: profile.user.Bio,
          role: profile.user.Role,
        });
        this.profileForm.controls['linkedIn'].disable();
      },
      error: (error) => {
        error.log(error);
      },
    });
  }
}
