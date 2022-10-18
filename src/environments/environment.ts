// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

import { PAYMENT_TYPES } from "src/app/shared/constants";

export const environment = {
  production: false,
  API_BASE_URL: "http://localhost:3001/api/v1/", 
  // API_BASE_URL: "https://saas-uat-api.propco.co.uk/v3-dev/api/",
  MEDIA_HOST_URL: 'https://saas-qa.propco.co.uk/demolocal/',
  PAYMENT_METHOD: PAYMENT_TYPES.BARCLAYCARD_REDIRECT,
  PAYMENT_PROD: false,
  FLUTTER_HOST_URL: 'http://172.20.10.4:8080/#/'
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
