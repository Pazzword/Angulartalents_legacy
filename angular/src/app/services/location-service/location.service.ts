// import { Injectable } from '@angular/core';
// import { environment } from 'environments/environments';
// export type Maps = typeof google.maps;
// @Injectable({
//   providedIn: 'root'
// })
// export class LocationService {

//   constructor() { }
//   public readonly api = this.load();

//   private load() {
//     const script = document.createElement('script');
//     script.type = 'text/javascript';
//     script.async = true;
//     script.defer = true;
//     // tslint:disable-next-line:no-bitwise
//     const callbackName = `GooglePlaces_cb_` + ((Math.random() * 1e9) >>> 0);
//     script.src = this.getScriptSrc(callbackName);

//     interface MyWindow {
//       [name: string]: Function;
//     }
//     const myWindow: MyWindow = window as any;

//     const promise = new Promise((resolve, reject) => {
//       myWindow[callbackName] = resolve;
//       script.onerror = reject;
//     });
//     document.body.appendChild(script);
//     return promise.then(() => google.maps);
//   }

//   private getScriptSrc(callback: string): string {
//     interface QueryParams {
//       [key: string]: string;
//     }
//     const query: QueryParams = {
//       v: '3',
//       callback,
//       key: environment.GOOGLE_MAPS_API_KEY,
//       libraries: 'places',
//     };
//     const params = Object.keys(query)
//       .map((key) => `${key}=${query[key]}`)
//       .join('&');
//     return `https://maps.googleapis.com/maps/api/js?${params}&language=en`;
//   }
// }
