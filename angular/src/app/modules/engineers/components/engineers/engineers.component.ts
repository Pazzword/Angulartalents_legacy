import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { LoadingBarService } from '@ngx-loading-bar/core';
import { PaginationInstance } from 'ngx-pagination';
import { Observable, Subscription } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { EngineerService } from 'src/app/services/engineer-service/engineer.service';
import { CloudinaryImage } from '@cloudinary/url-gen';
import { quality } from "@cloudinary/url-gen/actions/delivery";
@Component({
  selector: 'app-engineers',
  templateUrl: './engineers.component.html',
  styleUrls: ['./engineers.component.scss'],
})
export class EngineersComponent {
  // variables
  engineers = new Array<any>();
  tempEngineers = new Array<any>();
  limit: number = 10;
  page: number = 1;
  total: number = 22;  // TODO: I need total number of all engineers here from Axel
  // pagesCount: Number[] = [1, 2, 3];
  // startIndex = 0;
  // endIndex = 5;
  recruiterId: number;
  engineerId: number;
  selectedLevelIndex: number;
  selectedTypeIndex: number;
  userIs: string;
  // status: boolean = false;
  isMember: boolean = false;
  showBlur: boolean = false;
  showNotFound: boolean = false;
  showPagination: boolean = false;
  loading: boolean = true;
  // countries: any = [];
  selectedCountry: string = '';
  selectedRoleLevel: string = '';
  selectedRoleType: string = '';
  imgObj: CloudinaryImage = new CloudinaryImage(); //needs to be initialized
  imgString: string = ''; //CloudinaryImage;
  keyword = 'name';
  countriesData: any = [];
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
    {
      name: 'Part-time contract',
      value: 'contract_part_time',
      isSelected: false,
    },
    {
      name: 'Full-time contract',
      value: 'contract_full_time',
      isSelected: false,
    },
    {
      name: 'Part-time employment',
      value: 'employee_part_time',
      isSelected: false,
    },
    {
      name: 'Full-time employment',
      value: 'employee_full_time',
      isSelected: false,
    },
  ];

  constructor(
    private engineerService: EngineerService,
    private auth: AuthService,
    private http: HttpClient,
    private loadingBar: LoadingBarService
  ) { }

  ngOnInit(): void {
    this.loader.start();
    this.http
      .get('https://restcountries.com/v3.1/all?fields=name,flags')
      .subscribe({
        next: (data) => {
          for (const [key, value] of Object.entries(data)) {
            this.countriesData.push({
              id: Number(key + 1),
              name: value.name.common,
              flag: value.flags.svg,
            });
          }
        },
        error: (err) => console.error(err),
      });
    this.getMyProfileSub = this.auth.getMyProfile().subscribe({
      next: (res) => {
        if (res.type === 'recruiter' && res.user.IsMember) {
          this.recruiterId = res.user.ID;
          this.isMember = true;
          this.showBlur = true;
          this.userIs = 'recruiter';
        } else {
          this.engineerId = res.user.ID;
          this.userIs = 'engineer';
        }
      },
      error: (err) => {
        console.error(err);
      },
    });
    this.engineerService.getEngineersCount().subscribe({
      next: (res => this.total = res.engineers_count),
      error: (err) => console.error(err)
    })
    // TODO need to get number of all engineers and set it in total
    this.getEngineers();
  }

  // getPageAmout(length: number){

  //   console.log(this.engineers.length)
  //   return new Array(length/20)
  // }

  // getIndex(pageIndex: number){
  // //   this.startIndex = pageIndex * 5;
  // //  this.endIndex = this.startIndex + 5;
  //  this.page = pageIndex+1
  //  this.getEngineers()
  // }
  // prevIndex(){
  //   this.page--
  //   console.log(this.page)
  //   this.getEngineers()
  // }
  // nextIndex(){
  //   this.page++
  //   this.status = !this.status
  //   console.log(this.page)
  //   this.getEngineers()
  // }

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
            this.tempEngineers = [];
            this.loading = false
            this.showPagination = (res.engineers?.length < 10 && res.engineers && this.page === 1) ? false : true
            this.loader.stop();
            res.engineers.forEach((e: any) => {
              if (e.Avatar.includes('https://res.cloudinary.com')) {
                let urlString = e.Avatar.replace('https://res.cloudinary.com/rmsmms/image/upload/', '').replace('.jpg', '').slice(12)
                // changing the image quality setting from cloudinary
                this.imgObj = new CloudinaryImage(urlString, {
                  cloudName: 'dogx6peuh',
                }).format('auto').delivery(quality('auto:best'));;
                // get the string for the img tag
                e.Avatar = this.imgObj.toURL();
                this.tempEngineers.push(e)
              } else {
                this.tempEngineers.push(e)
              }
            })
            this.engineers = this.tempEngineers;

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
            if (res.engineers.length < 10) {
              this.page = 1;
              this.showPagination = false;
              this.engineers = res.engineers;
            } else {
              this.showPagination = true;
              this.engineers = res.engineers;
            }
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
    event === undefined ? (this.selectedCountry = '') : null;
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
