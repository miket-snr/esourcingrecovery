// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  apiUrl: 'http://localhost:4000',
  apikey: 'GENAPP',
  BASE_API: 'https://io.bidvestfm.co.za/BIDVESTFM_API_AUTH',
  BASE_API2: 'https://io.bidvestfm.co.za/BIDVESTFM_API_AUTH',
  BASE_POST: 'https://io.bidvestfm.co.za/BIDVESTFM_API_GEN/genpost',
  tempuser: { username: 'tempuser',   firstName: 'temp',  lastName: 'user', role: 'all',
  cellno: '0835225169',  sundry: 'mike@mikethomson.biz' }
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
