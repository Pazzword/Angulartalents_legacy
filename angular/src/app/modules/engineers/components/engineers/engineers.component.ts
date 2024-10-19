import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { LoadingBarService } from '@ngx-loading-bar/core';
import { PaginationInstance } from 'ngx-pagination';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { EngineerService } from 'src/app/services/engineer-service/engineer.service';
import { CloudinaryImage } from '@cloudinary/url-gen';
import { quality } from '@cloudinary/url-gen/actions/delivery';

interface CountryData {
  name: {
    common: string;
    official?: string;
    nativeName?: { [key: string]: { official: string; common: string } };
  };
  flags: {
    svg: string;
    png?: string;
    alt?: string;
  };
}

@Component({
  selector: 'app-engineers',
  templateUrl: './engineers.component.html',
  styleUrls: ['./engineers.component.scss'],
})
export class EngineersComponent {
  // variables
  isRecruiter: boolean = false;
  isEngineer: boolean = false;
  engineers: any[] = [];
  limit: number = 10;
  page: number = 1;
  total: number = 22;
  recruiterId: number;
  engineerId: number;
  selectedLevelIndex: number;
  selectedTypeIndex: number;
  userIs: string;
  isMember: boolean = false;
  showBlur: boolean = false;
  showNotFound: boolean = false;
  showPagination: boolean = false;
  loading: boolean = true;
  selectedCountry: string = '';
  selectedRoleLevel: string = '';
  selectedRoleType: string = '';
  keyword = 'name';
  countriesData: { id: number; name: string; flag: string }[] = [];
  loader = this.loadingBar.useRef();
  private getMyProfileSub: Subscription;
  private getEngineersSub: Subscription;
  public config: PaginationInstance = {
    id: 'custom',
    itemsPerPage: 10,
    currentPage: 1,
  };

  roleLevels = [
    { name: 'Junior', value: 'junior', isSelected: false },
    { name: 'Middle', value: 'mid_level', isSelected: false },
    { name: 'Senior', value: 'senior', isSelected: false },
    { name: 'Principal', value: 'principal_staff', isSelected: false },
    { name: 'C-Level', value: 'c_level', isSelected: false },
  ];

  roleTypes = [
    { name: 'Part-time contract', value: 'contract_part_time', isSelected: false },
    { name: 'Full-time contract', value: 'contract_full_time', isSelected: false },
    { name: 'Part-time employment', value: 'employee_part_time', isSelected: false },
    { name: 'Full-time employment', value: 'employee_full_time', isSelected: false },
  ];

  constructor(
    private engineerService: EngineerService,
    private auth: AuthService,
    private http: HttpClient,
    private loadingBar: LoadingBarService
  ) {}

  ngOnInit(): void {
    this.loader.start();
    this.http
      .get<CountryData[]>('https://restcountries.com/v3.1/all?fields=name,flags')
      .subscribe({
        next: (data) => {
          data.forEach((value, index) => {
            this.countriesData.push({
              id: index + 1,
              name: value.name.common,
              flag: value.flags.svg,
            });
          });
        },
        error: (err) => console.error(err),
      });
  
      this.getMyProfileSub = this.auth.getMyProfile().subscribe({
        next: (res) => {
          if (res.role === 'recruiter') {
            this.recruiterId = res.id;
            this.userIs = 'recruiter';
            this.isRecruiter = true;
            this.isMember = res.IsMember || false; // Adjust if necessary
          } else if (res.role === 'engineer') {
            this.engineerId = res.id;
            this.userIs = 'engineer';
            this.isEngineer = true;
            this.isMember = true; // Adjust if necessary
          } else {
            this.isMember = false;
          }
        },
        error: (err) => {
          console.error(err);
          this.isMember = false;
        },
      });

      this.engineerService.getEngineersCount().subscribe({
        next: (res) => {
          if (res && res.count !== undefined) {
            this.total = res.count;
          } else {
            console.error('Engineers count is missing.');
          }
        },
        error: (err) => {
          console.error('Error fetching engineers count:', err);
        },
      });

    // Fetch engineers
    this.getEngineers();
  }

  getEngineers() {
    this.getEngineersSub = this.engineerService
      .getEngineers(
        this.page,
        this.limit,
        this.selectedCountry,
        this.selectedRoleType,
        this.selectedRoleLevel
      )
      .subscribe({
        next: (res) => {
          if (res.engineers !== null) {
            this.loading = false;
            this.showPagination =
              res.engineers.length < 10 && this.page === 1 ? false : true;
            this.loader.stop();
  
            // Process each engineer's avatar
            this.engineers = res.engineers.map((engineer: any) => {
              engineer.avatar = this.processAvatarUrl(engineer.avatar);
              return engineer;
            });
  
            // Add this line to log engineers data
            console.log('Engineers data:', this.engineers);
          } else {
            this.engineers = [];
          }
        },
        error: (err) => {
          this.loader.stop();
          console.error(err);
        },
      });
  }

  processAvatarUrl(avatarUrl: string): string {
    if (avatarUrl && avatarUrl.includes('https://res.cloudinary.com')) {
      // Extract the public ID from the Cloudinary URL
      const cloudName = 'rmsmms';
      const urlPattern = `https://res.cloudinary.com/${cloudName}/image/upload/`;
      let publicId = avatarUrl.replace(urlPattern, '');
  
      // Remove the version prefix, like 'v1234567890/'
      publicId = publicId.replace(/^v\d+\/?/, '');
  
      // Remove any file extensions
      if (publicId.includes('.')) {
        publicId = publicId.substring(0, publicId.lastIndexOf('.'));
      }
  
      // Create the CloudinaryImage instance with desired transformations
      const imgObj = new CloudinaryImage(publicId, { cloudName })
        .format('auto')
        .delivery(quality('auto:best'));
  
      return imgObj.toURL();
    } else {
      return avatarUrl ? avatarUrl : 'assets/empty-avatar.png';
    }
  }
  

  pageChangeEvent(event: number) {
    this.page = event;
    this.getEngineers();
  }

  applyFilter() {
    this.page = 1;
    this.showNotFound = false;
    this.getEngineersSub = this.engineerService
      .getEngineers(
        this.page,
        this.limit,
        this.selectedCountry,
        this.selectedRoleType,
        this.selectedRoleLevel
      )
      .subscribe({
        next: (res) => {
          if (res.engineers) {
            this.showPagination = res.engineers.length < 10 ? false : true;
            // Process each engineer's avatar
            this.engineers = res.engineers.map((engineer: any) => {
              engineer.avatar = this.processAvatarUrl(engineer.avatar);
              return engineer;
            });
          } else {
            this.showNotFound = true;
            this.showPagination = false;
            this.engineers = [];
          }
        },
        error: (err) => {
          console.error(err);
        },
      });
  }

  selectCountry(item: any) {
    this.selectedCountry = item?.name;
  }

  onCountryCleared(event: void) {
    this.selectedCountry = '';
  }

  handleChangeRoleLevel(e: any, index: any) {
    this.selectedLevelIndex = e.target.checked ? index : undefined;
    if (e.target.checked) {
      this.selectedRoleLevel = e.target.value;
    } else {
      this.selectedRoleLevel = '';
    }
  }

  handleChangeRoleType(e: any, index: any) {
    this.selectedTypeIndex = e.target.checked ? index : undefined;
    if (e.target.checked) {
      this.selectedRoleType = e.target.value;
    } else {
      this.selectedRoleType = '';
    }
  }

  clearFilter() {
    this.roleLevels.forEach((c) => (c.isSelected = false));
    this.roleTypes.forEach((c) => (c.isSelected = false));
    this.page = 1;
    this.selectedCountry = '';
    this.selectedRoleLevel = '';
    this.selectedRoleType = '';
    this.getEngineers();
  }

  ngOnDestroy(): void {
    this.getMyProfileSub.unsubscribe();
    this.getEngineersSub.unsubscribe();
  }
}
