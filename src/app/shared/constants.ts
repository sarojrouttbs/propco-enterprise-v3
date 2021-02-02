export const PROPCO = {
  isMobile: true,
  ACCESS_TOKEN: 'access_token',
  LOGIN_DETAILS: 'login_details',
  USER_DETAILS: 'user_details',
  PREVIOUS_URL: 'previous_url',
  WEB_KEY: 'web_key',
  LOOKUP_DATA: 'lookup_data',
  REFERENCING_LOOKUP_DATA: 'referencing_lookup_data',
  REFERENCING_PRODUCT_LIST: 'referencing_product_list',
  FAULTS_LOOKUP_DATA: 'faults_lookup_data'
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
  PARAMETER_MISSING_INVALID: 'PARAMETER_MISSING_INVALID',
  PAYMENT_RULES_CHECKING_FAILED: 'PAYMENT_RULES_CHECKING_FAILED'
};

export const HEAD_CATEGORY = {
  ADMIN: 'Admin',
  TENANT: 'Tenant',
  CONTRACTOR: 'Contractor'
};

export const REPORTED_BY_TYPES = [
  {
    index: 'LANDLORD',
    value: 'Landlord'
  },
  {
    index: 'TENANT',
    value: 'Tenant'
  },
  {
    index: 'GUARANTOR',
    value: 'Guarantor'
  },
  {
    index: 'THIRD_PARTY',
    value: 'Third Party'
  }
];

export const FAULT_STAGES = {
  FAULT_LOGGED: 'FAULT_LOGGED',
  FAULT_QUALIFICATION: 'FAULT_QUALIFICATION',
  LANDLORD_INSTRUCTION: 'LANDLORD_INSTRUCTION',
  ARRANGING_CONTRACTOR: 'ARRANGING_CONTRACTOR',
  JOB_COMPLETION: 'JOB_COMPLETION',
  PAYMENT: 'PAYMENT'
};

export const FAULT_STAGES_INDEX = {
  FAULT_LOGGED: 0,
  FAULT_QUALIFICATION: 1,
  LANDLORD_INSTRUCTION: 2,
  ARRANGING_CONTRACTOR: 3,
  JOB_COMPLETION: 4,
  PAYMENT: 5
};

export const LL_INSTRUCTION_TYPES = [
  {
    index: 'DOES_OWN_REPAIRS',
    value: 'Landlord does their own repairs'
  },
  {
    index: 'PROCEED_WITH_WORKSORDER',
    value: 'Proceed with Worksorder'
  },
  {
    index: 'OBTAIN_QUOTE',
    value: 'Obtain Quote'
  },
  {
    index: 'OBTAIN_AUTHORISATION',
    value: 'Obtain LL authorisation',
  },
  {
    index: 'PROCEED_AS_NECESSARY',
    value: 'EMERGENCY/URGENT – Proceed as agent of necessity'
  },
  {
    index: 'GET_AN_ESTIMATE',
    value: 'Get an Estimate'
  }
];

export const ARRANING_CONTRACTOR_ACTIONS = [
  {
    index: 'PROCEED_WITH_WORKSORDER',
    value: 'Proceed with Worksorder'
  },
  {
    index: 'OBTAIN_QUOTE',
    value: 'Obtain Quote'
  },
  {
    index: 'PROPERTY_VISIT_FOR_QUOTE',
    value: 'Property visit for quote',
  },
  {
    index: 'OBTAIN_AUTHORISATION',
    value: 'Obtain LL Authorisation',
  }
];

export const ACCESS_INFO_TYPES = [
  {
    title: 'Tenant Presence Required',
    value: true
  },
  {
    title: 'Access with management keys',
    value: false
  }
];

export const URGENCY_TYPES = {
  EMERGENCY: 1,
  URGENT: 2,
  NON_URGENT: 3
};

export const REGEX = {
  DECIMAL_REGEX: '[0-9]+(\.[0-9][0-9]?)?'
};

export const COMPLETION_METHODS = [
  {
    index: 1,
    value: 'Complete Now'
  },
  {
    index: 2,
    value: 'Email to Tenant'
  }
];

export const FOLDER_NAMES = [
  {
    "index": "initial_issue",
    "value": "Initial Issue"
  },
  {
    "index": "quote_estimates",
    "value": "Quote/Estimates"
  },
  {
    "index": "works_order",
    "value": "Works Order"
  },
  {
    "index": "job_in_progress",
    "value": "Job In Progress"
  },
  {
    "index": "completion",
    "value": "Completion"
  },
  {
    "index": "invoice",
    "value": "Invoice"
  },
  {
    "index": "other",
    "value": "Other"
  }
];

export const REFERENCING = {
  LET_ALLIANCE_REFERENCING_TYPE: 3
};

export const REFERENCING_TENANT_TYPE = {
  INDIVIDUAL: 1,
  COMPANY: 2
};

export const SYSTEM_CONFIG = {
  MAXIMUM_FAULT_QUOTE_REJECTION: 'MAXIMUM_FAULT_QUOTE_REJECTION'
};

export const SYSTEM_OPTIONS = {
  REPAIR_ESTIMATE_QUOTE_THRESHOLD: 'REPAIR_ESTIMATE_QUOTE_THRESHOLD',
  INVOICE_VERIFICATION_THRESHOLD: 'INVOICE_VERIFICATION_THRESHOLD'
};

export const MAINTENANCE_TYPES = {
  QUOTE: 4,
  WORKS_ORDER: 6
};

export const PAYMENT_METHOD_TYPES = [
  'Bank Transfer',
  'Cash',
  'Cheque',
  'Other'
];

export const PAYMENT_WARNINGS = {
  'hasSufficientReserveBalance': 'Insufficient funds in Landlord\'s reserve.',
  'isFaultEstimateLessThanHalfRentOrThresHoldValue': 'The Works Order is over half months rent or £250.',
  'hasRentArrears': 'The Tenant has rent arrears.',
  'hasRentPaidUpFront': 'The rent has been paid upfront.',
  'hasTenantPaidRentOnTime': 'The tenant does not always pay rent on time.',
  'isTenancyGivenNoticeOrInLastMonth': 'The tenancy is in Given Notice stage.',
  'hasOtherInvoicesToBePaid': 'There are other invoices to be paid from next months rent.'
};

export const CANCEL_REASON = [
  {
    "index": "FAULT_DOES_NOT_EXIST_ANYMORE",
    "value": "Fault does not exist anymore"
  },
  {
    "index": "TENANTS_RESPONSIBILITY",
    "value": "Tenant's responsibility"
  },
  {
    "index": "OTHER",
    "value": "Other"
  }
];

export const ScriptStore = [
  {
    name: 'jiraJquery', 
    src: 'https://jira.techblue.co.uk/s/d41d8cd98f00b204e9800998ecf8427e-CDN/pu9bd5/811001/be09033ea7858348cd8d5cdeb793189a/2.2.4.7/_/download/batch/com.atlassian.plugins.jquery:jquery/com.atlassian.plugins.jquery:jquery.js?collectorId=26327d00'
  },
  {
    name: 'jiraIssueCollector',
   src: 'https://jira.techblue.co.uk/s/6eca38536418f90aec448dac1cd5193f-T/pu9bd5/811001/be09033ea7858348cd8d5cdeb793189a/4.0.1/_/download/batch/com.atlassian.jira.collector.plugin.jira-issue-collector-plugin:issuecollector/com.atlassian.jira.collector.plugin.jira-issue-collector-plugin:issuecollector.js?locale=en-GB&collectorId=26327d00'
  }
];

export const CERTIFICATES_CATEGORY = {
  FAULT_UNDER_SERVICE_CONTRACT_CATEGORY: '4940',
  FAULT_UNDER_WARRANTY_CATEGORY: '4938'
}
