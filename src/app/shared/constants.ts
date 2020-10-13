export const PROPCO = {
  isMobile: true,
  ACCESS_TOKEN: 'access_token',
  LOGIN_DETAILS: 'login_details',
  USER_DETAILS: 'user_details',
  PREVIOUS_URL: 'previous_url',
  WEB_KEY: 'web_key',
  LOOKUP_DATA: 'lookup_data'
};

export const USER_TYPES = {
  APPLICANT: {
    index: 4,
    value: 'Applicant'
  },
  TENANT: {
    index: 3,
    value: 'Tenant'
  },
  LANDLORD: {
    index: 2,
    value: 'Landlord'
  },
  CONTRACTOR: {
    index: 12,
    value: 'Contractor'
  }
};

export const ERROR_MESSAGE = {
  DEFAULT: 'We are not able to process this request, Please try again.'
};

export const ERROR_CODE = {
  PARAMETER_MISSING_INVALID: 'PARAMETER_MISSING_INVALID'
};

export const INSPECTION_TYPES = {
  EPC: 4,
  GAS: 9
}

export const HEAD_CATEGORY = {
  ADMIN: 'Admin',
  TENANT: 'Tenant',
  CONTRACTOR: 'Contractor'
}

export const INVENTORIES = {
  INVENTORY: 349,
  CHECK_IN_REPORT: 350,
  CHECK_OUT_REPORT: 351,
}

export const TENANT_STATUS = {
  CONFIRMED_TENANCY: 4
}

export const MAINTENANCE_TYPE = {
  INVOICE: 'invoice',
  WORKS_ORDER: 'worksorder',
  QUOTE: 'quote'
}

export const MAINTENANCE_STATUS = {
  OUTSTANDING_FEES: 2,
  PAID: 1
}