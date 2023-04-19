import { PAYMENT_TYPES } from "src/app/shared/constants";

export const environment = {
  production: true,
  API_BASE_URL: "https://saas-qa.propco.co.uk/v3-dev/api/" ,
  MEDIA_HOST_URL: 'https://saas-qa.propco.co.uk/demolocal/images/',
  PAYMENT_METHOD: PAYMENT_TYPES.STRIPE_ELEMENT,
  PAYMENT_PROD: false,
  FLUTTER_HOST_URL: 'https://embed-qa.propco.co.uk/v3-web/#/'
};
