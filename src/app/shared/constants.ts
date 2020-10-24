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

export const HEAD_CATEGORY = {
  ADMIN: 'Admin',
  TENANT: 'Tenant',
  CONTRACTOR: 'Contractor'
}

export const REPORTED_BY_TYPES = [
  {
      "index": "LANDLORD",
      "value": "Landlord"
  },
  {
      "index": "TENANT",
      "value": "Tenant"
  },
  {
      "index": "GUARANTOR",
      "value": "Guarantor"
  },
  {
      "index": "THIRD_PARTY",
      "value": "Third Party"
  }
]

export const FAULT_STAGES = {
  FAULT_LOGGED : 'FAULT_LOGGED',
  FAULT_QUALIFICATION: 'FAULT_QUALIFICATION',
  LANDLORD_INSTRUCTION: 'LANDLORD_INSTRUCTION',
  ARRANGING_CONTRACTOR: 'ARRANGING_CONTRACTOR',
  JOB_COMPLETION: 'JOB_COMPLETION',
  PAYMENT: 'PAYMENT'
}