// cloudinary.service.ts
import { Injectable, NgZone, Output } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { FileUploader, FileUploaderOptions, ParsedResponseHeaders } from 'ng2-file-upload';
import { Observable, Subject } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CloudinaryService {

  @Output()
  public onUploadedPhotoGetLink: Subject<string> = new Subject<string>();

  public responses: Array<any> = [];

  public hasBaseDropZoneOver: boolean = false;
  public uploader: FileUploader;
  public title: string;

  constructor(
    private zone: NgZone,
    private http: HttpClient,
  ) {
    this.responses = [];

    const uploaderOptions: FileUploaderOptions = {
      url: 'https://api.cloudinary.com/v1_1/dogx6peuh/upload',
      autoUpload: true,
      isHTML5: true,
      removeAfterUpload: true,
      headers: [
        {
          name: 'X-Requested-With',
          value: 'XMLHttpRequest',
        }
      ]
    };
    this.uploader = new FileUploader(uploaderOptions);

    this.uploader.onBuildItemForm = (fileItem: any, form: FormData): any => {
      form.append('upload_preset', 'flask-upload');
      form.append('file', fileItem);
      fileItem.withCredentials = false;
      return { fileItem, form };
    };

    const upsertResponse = (fileItem: { file: any; status?: number; data: any; progress?: any; }) => {
      this.zone.run(() => {
        const existingId = this.responses.reduce((prev, current, index) => {
          if (current.file.name === fileItem.file.name && !current.status) {
            return index;
          }
          return prev;
        }, -1);
        if (existingId > -1) {
          this.responses[existingId] = Object.assign(this.responses[existingId], fileItem);
          if (fileItem.data.url) {
            this.onUploadedPhotoGetLink.next(fileItem.data.url);
          }
        } else {
          this.responses.push(fileItem);
        }
      });
    };

    this.uploader.onCompleteItem = (item: any, response: string, status: number, headers: ParsedResponseHeaders) =>
      upsertResponse({
        file: item.file,
        status,
        data: JSON.parse(response)
      });

    this.uploader.onProgressItem = (fileItem: any, progress: any) =>
      upsertResponse({
        file: fileItem.file,
        progress,
        data: {}
      });
  }

  // This method needs to have the correct upload URL with a trailing slash
  uploadImg(vals: any): Observable<any> {
    const uploadUrl = 'http://localhost:8000/api/upload/';  // Include trailing slash

    // Only use necessary headers to prevent CORS issues
    const headers = new HttpHeaders({
      'X-Requested-With': 'XMLHttpRequest',
    });

    console.log('Data being sent to Cloudinary:', vals); // Log the data being sent

    // Perform the HTTP request with no authorization header
    return this.http.post(uploadUrl, vals, { headers })
      .pipe(
        catchError((error: HttpErrorResponse) => {
          if (error.status === 0) {
            console.error('CORS error occurred:', error);
          } else {
            console.error('Error uploading to Cloudinary:', error);
          }
          return new Observable<any>();
        })
      );
  }


  updateTitle(value: string) {
    this.title = value;
  }

  fileOverBase(e: any): void {
    this.hasBaseDropZoneOver = e;
  }

  getFileProperties(fileProperties: any) {
    if (!fileProperties) {
      return null;
    }
    return Object.keys(fileProperties).map((key) => ({ key: key, value: fileProperties[key] }));
  }
}
