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
  FAULTS_LOOKUP_DATA: 'faults_lookup_data',
  LET_CATEGORY: 'let_category',
  SSO_KEY: 'sso_key',
  TOB_LOOKUP_DATA: 'tob_lookup_data',
  TERMS_AND_CONDITIONS: 'terms_and_conditions',
  REFERENCING_INFO: 'referencing_info',
  PROPERTY_LOOKUP_DATA: 'property_lookup_data',
  SSO_URL_ROUTE: 'sso_url_route',
  SOLR_SERACH_TERMS: 'solr_search_terms',
  PORTAL: 'portal',
  SALES_MODULE: 'is_sales_enable'

};

export const USER_TYPES = {
  APPLICANT: {
    index: 4,
    value: 'Applicant',
  },
  TENANT: {
    index: 3,
    value: 'Tenant',
  },
  LANDLORD: {
    index: 2,
    value: 'Landlord',
  },
  CONTRACTOR: {
    index: 12,
    value: 'Contractor',
  },
};

export const FAULT_STATUSES = {
  REPORTED: 1,
  IN_ASSESSMENT: 2,
  QUOTE_REQUESTED: 3,
  QUOTE_RECEIVED: 4,
  WORKSORDER_RAISED: 5,
  WORK_INPROGRESS: 6,
  WORK_COMPLETED: 7,
  INVOICE_SUBMITTED: 8,
  PAID: 9,
  CANCELLED: 10,
  ON_HOLD: 11,
  CLOSED: 12,
  CHECKING_LANDLORD_INSTRUCTIONS: 13,
  QUOTE_PENDING: 14,
  AWAITING_RESPONSE_LANDLORD: 15,
  AWAITING_RESPONSE_TENANT: 16,
  AWAITING_RESPONSE_THIRD_PARTY: 17,
  ESCALATION: 18,
  WORKSORDER_PENDING: 19,
  QUOTE_APPROVED: 20,
  QUOTE_REJECTED: 21,
  AWAITING_JOB_COMPLETION: 22,
  AWAITING_RESPONSE_CONTRACTOR: 23,
  INVOICE_APPROVED: 24,
};

export const ERROR_MESSAGE = {
  DEFAULT: 'We are not able to process this request, Please try again.',
};

export const ERROR_CODE = {
  PARAMETER_MISSING_INVALID: 'PARAMETER_MISSING_INVALID',
  PAYMENT_RULES_CHECKING_FAILED: 'PAYMENT_RULES_CHECKING_FAILED',
  UNPROCESSABLE_ENTITY: 'UNPROCESSABLE_ENTITY'
};

export const HEAD_CATEGORY = {
  ADMIN: 'Admin',
  TENANT: 'Tenant',
  CONTRACTOR: 'Contractor',
};

export const REPORTED_BY_TYPES = [
  {
    index: 'LANDLORD',
    value: 'Landlord',
  },
  {
    index: 'TENANT',
    value: 'Tenant',
  },
  {
    index: 'GUARANTOR',
    value: 'Guarantor',
  },
  {
    index: 'THIRD_PARTY',
    value: 'Third Party',
  },
];

export const FAULT_STAGES = {
  FAULT_LOGGED: 'FAULT_LOGGED',
  FAULT_QUALIFICATION: 'FAULT_QUALIFICATION',
  LANDLORD_INSTRUCTION: 'LANDLORD_INSTRUCTION',
  ARRANGING_CONTRACTOR: 'ARRANGING_CONTRACTOR',
  JOB_COMPLETION: 'JOB_COMPLETION',
  PAYMENT: 'PAYMENT',
};

export const FAULT_STAGES_INDEX = {
  FAULT_LOGGED: 0,
  FAULT_QUALIFICATION: 1,
  LANDLORD_INSTRUCTION: 2,
  ARRANGING_CONTRACTOR: 3,
  JOB_COMPLETION: 4,
  PAYMENT: 5,
};

export const LL_INSTRUCTION_TYPES = [
  /** Don't change the Sequence of values it will alter the CLI functionality */
  {
    index: 'DOES_OWN_REPAIRS',
    value: 'Landlord does their own repairs',
  },
  {
    index: 'PROCEED_WITH_WORKSORDER',
    value: 'Proceed with Worksorder',
  },
  {
    index: 'OBTAIN_QUOTE',
    value: 'Obtain Quote',
  },
  {
    index: 'OBTAIN_AUTHORISATION',
    value: 'Obtain LL authorisation',
  },
  {
    index: 'GET_AN_ESTIMATE',
    value: 'Get an Estimate',
  },
  {
    index: 'AGENT_OF_NECESSITY',
    value: 'EMERGENCY/URGENT – Proceed as agent of necessity',
  },
];

export const ARRANING_CONTRACTOR_ACTIONS = [
  {
    index: 'PROCEED_WITH_WORKSORDER',
    value: 'Proceed with Worksorder',
  },
  {
    index: 'OBTAIN_QUOTE',
    value: 'Obtain Quote',
  },
  {
    index: 'PROPERTY_VISIT_FOR_QUOTE',
    value: 'Property visit for quote',
  },
  {
    index: 'OBTAIN_AUTHORISATION',
    value: 'Obtain LL Authorisation',
  },
];

export const ACCESS_INFO_TYPES = [
  {
    title: 'Tenant Presence Required',
    value: true,
  },
  {
    title: 'Access with management keys',
    value: false,
  },
];

export const URGENCY_TYPES = {
  EMERGENCY: 1,
  URGENT: 2,
  NON_URGENT: 3,
};

export const REGEX = {
  DECIMAL_REGEX: '[0-9]+(.[0-9][0-9]?)?',
  POSTCODE_VALIDATOR_REGX: '^([aA-pPrR-uUwWyYzZ0-9][aA-hHkK-yY0-9][aAeEhHmMnNpPrRtTvVxXyY0-9]?[aAbBeEhHmMnNpPrRvVwWxXyY0-9]? {1}[0-9][aAbBdD-hHjJlLnN-uUwW-zZ]{2}|gGiIrR 0aAaA)$'
};

export const COMPLETION_METHODS = [
  {
    index: 1,
    value: 'Complete Now',
  },
  {
    index: 2,
    value: 'Email to Tenant',
  },
];

export const FOLDER_NAMES = [
  {
    index: 'initial_issue',
    value: 'Initial Issue',
  },
  {
    index: 'quote_estimates',
    value: 'Quote/Estimates',
  },
  {
    index: 'works_order',
    value: 'Works Order',
  },
  {
    index: 'job_in_progress',
    value: 'Job In Progress',
  },
  {
    index: 'completion',
    value: 'Completion',
  },
  {
    index: 'invoice',
    value: 'Invoice',
  },
  {
    index: 'other',
    value: 'Other',
  },
];

export const REFERENCING = {
  LET_ALLIANCE_REFERENCING_TYPE: 3,
};

export const REFERENCING_TENANT_TYPE = {
  INDIVIDUAL: 1,
  COMPANY: 2,
};

export const SYSTEM_CONFIG = {
  MAXIMUM_FAULT_QUOTE_REJECTION: 'MAXIMUM_FAULT_QUOTE_REJECTION',
  FAULT_MANAGEMENT_LETCAT: 'FAULT_MANAGEMENT_LETCAT',
  FAULT_DEFAULT_NOTE_CATEGORY: 'FAULT_DEFAULT_NOTE_CATEGORY',
  FAULT_DEFAULT_NOTE_TYPE: 'FAULT_DEFAULT_NOTE_TYPE',
  MAX_ACTIVE_QUOTE_CONTRACTOR: 'MAX_ACTIVE_QUOTE_CONTRACTOR',
  FAULT_OVERRIDE_COMMUNICATION_CONSENT: 'FAULT_OVERRIDE_COMMUNICATION_CONSENT',
  HMRC_TAX_HANDLER_SELF_ASSESSMENT_FORM: 'HMRC_TAX_HANDLER_SELF_ASSESSMENT_FORM',
  HMRC_BATCH_PRINT_BASE_URL: 'HMRC_BATCH_PRINT_BASE_URL',
  HMRC_BATCH_PRINT_FOLDER: 'HMRC_BATCH_PRINT_FOLDER',
  ENABLE_CHECK_FOR_EXISTING_RECORDS: 'ENABLE_CHECK_FOR_EXISTING_RECORDS',
  ENABLESINGLETENANTOPTION: 'ENABLESINGLETENANTOPTION',
  ENABLE_SALES_MODULE:'ENABLE_SALES_MODULE',
  PROPCO_SEARCH_URL:'PROPCO_SEARCH_URL',
  ENABLE_SEARCH_FOR_ALL_ENTITY:'ENABLE_SEARCH_FOR_ALL_ENTITY',
  SOLR_BANNER: 'SOLR_BANNER'
};

export const SYSTEM_OPTIONS = {
  REPAIR_ESTIMATE_QUOTE_THRESHOLD: 'REPAIR_ESTIMATE_QUOTE_THRESHOLD',
  INVOICE_VERIFICATION_THRESHOLD: 'INVOICE_VERIFICATION_THRESHOLD',
  WEB_IMAGE_URL: 'WEB_IMAGE_URL',
  STDVATRATE: 'STDVATRATE',
  DEPOSIT_AUTO_CALCULATION_WEEKS: 'DEPOSIT_AUTO_CALCULATION_WEEKS',
  HOLDING_DEPOSIT_AUTO_CALCULATION_WEEKS: 'HOLDING_DEPOSIT_AUTO_CALCULATION_WEEKS',
  TOB_APPLICATION_RENT_EDITABLE: 'TOB_APPLICATION_RENT_EDITABLE'
};

export const MAINTENANCE_TYPES = {
  QUOTE: 4,
  WORKS_ORDER: 6,
};

export const PAYMENT_METHOD_TYPES = [
  'Bank Transfer',
  'Debit Card',
  // 'Cash',
  // 'Cheque',
  // 'Other'
];

export const PAYMENT_WARNINGS = {
  hasSufficientReserveBalance: `Insufficient funds in Landlord's reserve.`,
  isFaultEstimateLessThanHalfRentOrThresHoldValue:
    'The Works Order is over half months rent or £250.',
  hasRentArrears: 'The Tenant has rent arrears.',
  hasRentPaidUpFront: 'The rent has been paid upfront.',
  hasTenantPaidRentOnTime: 'The tenant does not always pay rent on time.',
  isTenancyGivenNoticeOrInLastMonth:
    'The tenancy is either in the given notice stage or in the last month of tenancy or both.',
  hasOtherInvoicesToBePaid:
    'There are other invoices to be paid from next months rent.',
};

export const CLOSE_REASON = [
  {
    index: 'FAULT_DOES_NOT_EXIST_ANYMORE',
    value: 'Repair does not exist anymore',
  },
  {
    index: 'TENANTS_RESPONSIBILITY',
    value: `Tenant's responsibility`,
  },
  {
    index: 'APPOINTMENT_NOT_BOOKED',
    value: 'Appointment not booked',
  },
  {
    index: 'LANDLORD_WOULD_NOT_FIX',
    value: 'Landlord would not fix',
  },
  {
    index: 'CLOSE_INTERNAL_USE_ONLY',
    value: 'Close - Internal use only',
  },
  {
    index: 'IN_WARRANTY_REPAIR',
    value: 'In-warranty Repair',
  },
  {
    index: 'OTHER',
    value: 'Other',
  },
];

export const CLOSE_REASON_KEYS = {
  FAULT_DOES_NOT_EXIST_ANYMORE: 'FAULT_DOES_NOT_EXIST_ANYMORE',
  TENANTS_RESPONSIBILITY: 'TENANTS_RESPONSIBILITY',
  APPOINTMENT_NOT_BOOKED: 'APPOINTMENT_NOT_BOOKED',
  LANDLORD_WOULD_NOT_FIX: 'LANDLORD_WOULD_NOT_FIX',
  CLOSE_INTERNAL_USE_ONLY: 'CLOSE_INTERNAL_USE_ONLY',
  IN_WARRANTY_REPAIR: 'IN_WARRANTY_REPAIR',
  OTHER: 'OTHER',
};

export const ScriptStore = [];

export const FAULT_QUALIFICATION_ACTIONS = [
  {
    index: 'UNDER_BLOCK_MANAGEMENT',
    value: 'Repair via Block Management/Factors',
  },
  {
    index: 'UNDER_WARRANTY',
    value: 'Repair via Guarantee Management',
  },
  {
    index: 'UNDER_SERVICE_CONTRACT',
    value: 'Repair via Service Contract',
  },
  {
    index: 'LANDLORD_INSTRUCTION',
    value: `Check Landlord's Instructions`,
  },
  {
    index: 'REQUEST_MORE_INFO',
    value: 'Request More Info',
  },
];

export const FAULT_QUALIFICATION_ACTION_LIST = {
  UNDER_BLOCK_MANAGEMENT: 'UNDER_BLOCK_MANAGEMENT',
  UNDER_WARRANTY: 'UNDER_WARRANTY',
  UNDER_SERVICE_CONTRACT: 'UNDER_SERVICE_CONTRACT',
  LANDLORD_INSTRUCTION: 'LANDLORD_INSTRUCTION',
  REQUEST_MORE_INFO: 'REQUEST_MORE_INFO',
};

export const CERTIFICATES_CATEGORY = [
  'FAULT_WARRANTY_CATEGORY',
  'FAULT_SERVICE_CONTRACT_CATEGORY',
  'FAULT_APPLIANCE_COVER_CATEGORY',
];
export const DOCUMENTS_TYPE = ['pdf', 'text', 'doc', 'csv', 'docx', 'odt'];

export const KEYS_LOCATIONS = {
  KEY_IN_BRANCH: 'Key in branch',
  DO_NOT_HOLD_KEY: 'We do not hold keys',
};

export const MAX_QUOTE_LIMIT = {
  FAULT_LARGE_QUOTE_LIMIT: 'FAULT_LARGE_QUOTE_LIMIT',
};

export const FILE_IDS = {
  TENANT: 1,
  LANDLORD: 8,
  CONTRACTOR: 11,
  FIX_A_FAULT: 26,
};

export const MAINT_JOB_TYPE = {
  index: 4520,
  value: 'Repair',
};
export const MAINT_REPAIR_SOURCES = {
  CUSTOMER_REPORT: 5126,
  FIXFLO: 3635,
  THIRD_PARTY: 5128,
};
export const MAINT_SOURCE_TYPES = {
  FIXFLO: 'FIXFLO',
};

export const MAINT_CONTACT = {
  CONTACT_TENANT: 'Contact Tenant',
  ACCESS_VIA_KEY: 'Tenant approved access via keys',
};

export const APPOINTMENT_MODAL_TYPE = {
  QUOTE: 'quote',
  MODIFY_QUOTE: 'modify-quote',
  MODIFY_WO: 'modify-wo',
  WO: 'wo',
};

export const OCCUPIERS_VULNERABLE = {
  TRUE: 5120,
  FALSE: 5122,
};

export const REJECTED_BY_TYPE = {
  CONTRACTOR: 11,
  LANDLORD: 8,
};

export const DPP_GROUP = {
  REPAIR_N_MAINTENANCE: 'Repair and Maintenance',
};

export const MAX_DOC_UPLOAD_SIZE = {
  FAULT_DOCUMENT_UPLOAD_SIZE: 'FAULT_DOCUMENT_UPLOAD_SIZE',
};

export const WORKSORDER_RAISE_TYPE = {
  MANUAL: 'manual',
  AUTO: 'auto',
  AUTO_LL_AUTH: 'auto_ll_auth',
};

export const LL_PAYMENT_CONFIG = {
  URGENT: 'FAULT_URGENT_LL_PAYMENT_UNSUCCESSFUL_EMAIL_NUDGE_MINUTES',
  NON_URGENT: 'FAULT_NON_URGENT_LL_PAYMENT_UNSUCCESSFUL_EMAIL_NUDGE_MINUTES',
};

export const FAULT_EVENT_TYPES = [
  {
    'Major Events': [
      'Repair Logged',
      'Progress Started',
      'CLI action selected',
      'Quote Obtained',
      'Converted To WO',
      'WO Raised',
      'Repair Closed',
    ],
  },
  {
    Escalations: ['Escalated', 'De Escalated', 'Repair Snoozed'],
  },
  {
    'Stage Changed': ['Stage Changed'],
  },
  {
    'Status Changed': ['Status Changed'],
  },
  {
    Notifications: ['Response Received'],
  },
  {
    'Notification Sent': ['Notification Sent'],
  },
  {
    Notes: ['Notes Added'],
  },
  {
    Documents: ['Document Added'],
  },
];

export const FAULT_EVENT_TYPES_ID = {
  RESPONSE_RECEIVED: 12,
  NOTIFICATION_SENT: 15,
  NOTES_ADDED: 13,
  STAGE_CHANGED: 10,
  CLI_ACTION_SELECTED: 3,
  STATUS_CHANGED: 11,
  DOCUMENT_ADDED: 14,
  ESCALATED: 8,
  FAULT_CLOSED: 7,
  FAULT_SNOOZED: 16,
};

export const QUOTE_CC_STATUS_ID = {
  REJECTED: 3,
};

export const NOTES_ORIGIN = {
  FAULT_STAGE: 'FAULT_STAGE',
  DASHBOARD: 'DASHBOARD',
};

export const RECIPIENT = ['Landlord', 'Tenant', 'Contractor'];

export const RECIPIENTS = {
  LANDLORD: 'Landlord',
  TENANT: 'Tenant',
  CONTRACTOR: 'Contractor',
};

export const PROPERTY_LINK_STATUS = {
  CURRENT: 'Current',
};

export const DATE_TIME_TYPES = [
  {
    index: 'DATE_WITH_TIME',
    value: 'Date with time',
  },
  {
    index: 'DATE_WITH_SESSION',
    value: 'Date with session',
  },
];

export const DATE_TIME_TYPES_KEYS = {
  DATE_WITH_TIME: 'DATE_WITH_TIME',
  DATE_WITH_SESSION: 'DATE_WITH_SESSION',
};

export const MAINTENANCE_TYPES_FOR_SEND_EMAIL = {
  QUOTE: 'quote',
  WO: 'wo',
  ESTIMATE: 'estimate',
};

export const FAULT_STAGES_ACTIONS = {
  FAULT_LOGGED: 'LOGGED',
};

export const NGX_QUILL_EDITOR_TOOLBAR_SETTINGS = {
  toolbar: {
    container: [
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      [{ color: [] }, { background: [] }],
      [{ align: [] }],
    ],
  },
};

export const OFFER_STATUSES = {
  NEW: 0,
  ACCEPTED: 1,
  REJECTED: 2,
  WITHDRAWN_BY_APPLICANT: 3,
  WITHDRAWN_BY_LANDLORD: 4,
  AGREED_IN_PRINCIPLE: 5,
  COUNTER_OFFER_BY_LL_AGENT: 6,
  COUNTER_OFFER_BY_APPLICANT: 7,
};

export const NOTES_TYPE = {
  OFFER: 'OFFER',
  FAULT: 'FAULT',
  PROPERTY: 'PROPERTY',
  MANAGEMENT_INSPECTION: 'MANAGEMENT_INSPECTION',
  SAFETY_INSPECTIONS: 'SAFETY_INSPECTIONS',
  SAFETY_DEVICES: 'SAFETY_DEVICES'
};

export const APPLICATION_STATUSES = {
  NEW: 0,
  DRAFT: 1,
  ACCEPTED: 2,
  REJECTED: 3,
  ON_HOLD: 4,
};

export const APPLICATION_ACTION_TYPE = {
  SAVE_FOR_LATER: 'SAVE_FOR_LATER',
};

export const ENTITY_TYPE = {
  AGENT: 'AGENT',
  LET_APPLICANT: 'LET_APPLICANT',
  PROPERTY: 'PROPERTY',
  LANDLORD: 'LANDLORD',
  APPLICANT: 'APPLICANT',
  CONTRACTOR: 'CONTRACTOR',
  TENANT: 'TENANT',
  COTENANT: 'COTENANT',
  VENDER: 'VENDOR',
};

export const PAYMENT_TYPES = {
  WORLDPAY_OWNFORM: 'WORLDPAY_OWNFORM',
  WORLDPAY_REDIRECT: 'WORLDPAY_REDIRECT',
  BARCLAYCARD_REDIRECT: 'BARCLAYCARD_REDIRECT',
  STRIPE_ELEMENT: 'STRIPE_ELEMENT',
};

export const PAYMENT_CONFIG = {
  WORLDPAY_OWNFORM: {
    TEST: {
      URL: '/complete',
    },
    PROD: {
      URL: '/complete',
    },
  },
  WORLDPAY_REDIRECT: {
    TEST_URL: 'https://secure-test.worldpay.com/wcc/purchase',
    PROD_URL: 'https://secure.worldpay.com/wcc/purchase',
    INST_ID: 1034945, //1277936,
    MERCHANT_CODE: 'TARACOPROPERM1'//'PROPCOTESTM1',
  },
  BARCLAYCARD_REDIRECT: {
    TEST_URL: 'https://mdepayments.epdq.co.uk/ncol/test/orderstandard_utf8.asp',
    PROD_URL: 'https://payments.epdq.co.uk/ncol/prod/orderstandard_utf8.asp',
    PSPID: 'RAMAN123',
    SHA_IN_PASS: 'B+gbQ;RyjJBFM!i8bZQV4%WQei;2=x%S',
  },
  STRIPE_ELEMENT: {
    TEST: {
      frontEndConfig: {
        publishableKey: "pk_test_51MAbP2IXDb8tSMRBgPquMx4ACRSyQp4LHL7UgDBtDAAHGVsC4RjHoc4ZGh4SgXTu1KO7mxieV2cXyhnNrVw4rE7a00H1qxdhUT",
        appearance: {
          theme: "stripe",
          labels: "floating"
            },
            elementOptions: {
              locale: "en-GB"
            },
            stripeIntentOptions: {
              currency: "GBP",
              payment_method_types: ["card"],
              country: "GB"
            },
            stripeBrandInfo: {
              website: "https://stripe.com/"
            }
        },
        nodeConfig: {
          secret_key: "sk_test_51MAbP2IXDb8tSMRBrz0pfzNZ9XzgrIqquidcnFLUZJ91L8vweaGfoF2U7XookrNHZzBLPBdMupGPc3nsH8fojqDh00BiSo2nIM"
        }
    },
    PROD: {
      frontEndConfig: {
        publishableKey: "pk_test_51MAbP2IXDb8tSMRBgPquMx4ACRSyQp4LHL7UgDBtDAAHGVsC4RjHoc4ZGh4SgXTu1KO7mxieV2cXyhnNrVw4rE7a00H1qxdhUT",
        appearance: {
          theme: "stripe",
          labels: "floating"
            },
            elementOptions: {
              locale: "en-GB"
            },
            stripeIntentOptions: {
              currency: "GBP",
              payment_method_types: ["card"],
              country: "GB"
            },
            stripeBrandInfo: {
              website: "https://stripe.com/"
            }
        },
        nodeConfig: {
            "secret_key": "sk_test_51MAbP2IXDb8tSMRBrz0pfzNZ9XzgrIqquidcnFLUZJ91L8vweaGfoF2U7XookrNHZzBLPBdMupGPc3nsH8fojqDh00BiSo2nIM"
        }
    }
}
};

export const APPLICATION_ENTITIES = {
  AGENT: 1,
  APPLICANT: 2,
};

export const REFERENCING_TYPES = {
  HOMELET: 'HOMELET',
  LETTINGS_HUB: 'LETTINGS_HUB',
};

export const DEFAULT_MESSAGES = {
  NO_DATA_FOUND: 'No data found!',
  NO_RECORD_FOUND: 'No record found!',
  NO_DETAILS_AVAILABLE: 'No details available',
  NO_TENANCY_AVAILABLE: 'No tenancies associated with this property.',
  errors: {
    SOMETHING_WENT_WRONG: 'Something went wrong'
  },
  NOT_AVAILABLE_TEXT: 'Not Available',
  AVAILABLE_SOON: 'Available Soon',
  NO_DATA_AVAILABLE: 'No data available.',
  UNDER_DEVELOPMENT: 'This functionality is under developement.'
};

export const FAULT_NOTIFICATION_STATE = {
  NO_RESPONSE: 'No response',
  AWAITING_RESPONSE: 'Awaiting response',
  RESPONSE_RECEIVED: 'Response Received',
  AWAITING_PAYMENT: 'Awaiting Payment',
  INVOICE_PAID: 'Invoice paid',
};

export const DEFAULTS = {
  NOT_AVAILABLE: '-'
};

export const AGENT_WORKSPACE_CONFIGS = {
  localStorageName: 'entity_tabs_menu',
  property: {
    pageTitleMap: {
      'dashboard': 'Dashboard',
      'details': 'Property Details',
      'offers': 'Offers',
      'applications': 'Applications',
      'marketing-activity': 'Marketing Activity',
      'tenancy': 'Tenancies',
      'rent': 'Rent/Invoices',
      'periodic-visit': 'Periodic Visit',
      'maintenance': 'Maintenance',
      'notes': 'Notes',
      'keys': 'Keys',
      'particulars': 'Particulars',
      'safety-device': 'Safety Devices/Alarms',
      'whitegoods': 'Service/White Goods',
      'safety': 'Safety Devices/Alarms',
      'clauses': 'Clauses',
      'media': 'Media',
      'user-assignments': 'User Assignments'
    }
  },
  landlord: {
    pageTitleMap: {
      'contact-info': 'Contact Info'
    }
  }
};

export const LOGIN_PAGE_TEXT_MESSAGES = [
  { MESSAGE: 'Whether you’re an established nationwide agent or you’re looking for best in class tools and platforms, PropCo Online Property Management Software has everything you need.' },
  { MESSAGE: 'Cloud-based Lettings, Management, and Client Accounting System, which embraces the latest technology with ease of use and customer satisfaction.' }
];

export const BUILD_DETAILS = {
  BUILD_NUMBER: '1.4.1',
  BUILD_MONTH_YEAR: 'Aug 2022'
};

export const TITLES = [
  { index: 0, value: 'Mr' },
  { index: 1, value: 'Mrs' },
  { index: 2, value: 'Ms' },
  { index: 3, value: 'Lady' },
  { index: 4, value: 'Dr' },
  { index: 5, value: 'Lord' },
  { index: 6, value: 'Mr & Mrs' },
  { index: 7, value: 'Mr & Ms' },
  { index: 8, value: 'Mr & Miss' },
  { index: 9, value: 'Miss' },
  { index: 10, value: 'Prof' },
  { index: 11, value: 'Rt.hon' },
  { index: 12, value: 'Lt.Sqd' },
];

export const OWNERSHIP = [
  { index: 'jointly', value: 'Jointly' },
  { index: 'solely', value: 'Solely' }
];

export const MARKET_APPRAISAL = {
  contact_type: 'contact',
  property_type: 'property',
}

export const search_Text = {
  lanlord: 'LANDLORD',
  property: 'PROPERTY',
}

export const MARKETING_ACTIVITY_TYPES = {
  EMAIL: 'email',
  SMS: 'sms',
  MAILSHOT: 'mailshot',
  VIEWED: 'viewed',
  BOOKED: 'booked'
}

export const DATE_FORMAT = {
  DATE: 'dd/MM/yyyy',
  DATE_TIME: 'dd/MM/yyyy HH:mm',
  TIME: 'HH:mm',
  TIME_SECONDS: 'HH:mm:ss',
  DATE_TIME_SECONDS: 'dd/MM/yyyy HH:mm:ss',
  DISPLAY_DATE: 'DD MMM YYYY',
  DISPLAY_DATE_TIME: 'DD MMM YYYY HH:mm',
  INPUT_DATE: 'MM/DD/YYYY',
  INPUT_DATE_TIME: 'MM/DD/YYYY HH:mm',
  DISPLAY_DATE_1: 'DD/MM/YYYY',
  DISPLAY_DATE_TIME_1: 'DD/MM/YYYY HH:mm',
  YEAR_DATE_TIME: 'yyyy-MM-dd HH:mm:ss',
  YEAR_DATE_TIME_1: 'yyyy-MM-ddTHH:mm',
  YEAR_DATE: 'yyyy-MM-dd',
  MAX_DATE: '2050-12-31'
}

export const HMRC = {
  START_DATE: '2017-04-06',
  END_DATE: '2018-04-05',
  SEARCH_ON_COLUMNS_KEYS: [
    { index: 'PROPERTY_REFERENCE', value: 'Property Reference' },
    { index: 'PROPERTY_ADDRESS', value: 'Property Address' },
    { index: 'LANDLORD_FULLNAME', value: 'Landlord/Owner Full Name' },
    { index: 'LANDLORD_ADDRESS', value: 'Landlord Address' },
  ]
}

export const DATE_RANGE_CONFIG_LIST = [{
  index: 'Week to Date',
  value: 'Week to Date'
},
{
  index: 'Month to Date',
  value: 'Month to Date'
},
{
  index: 'Year to Date',
  value: 'Year to Date'
},
{
  index: 'Last Month',
  value: 'Last Month'
}];

export const DATE_RANGE_CONFIG = {
  'WEEK_TO_DATE': 'Week to Date',
  'MONTH_TO_DATE': 'Month to Date',
  'YEAR_TO_DATE': 'Year to Date',
  'LAST_MONTH': 'Last Month'
};

export const HMRC_CONFIG = {
  EMAIL_REGEX: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/,
  HMRC_SENDER_EMAIL_ACCOUNT: 'HMRC_SENDER_EMAIL_ACCOUNT',
  DOWNLOAD_PDF_INFO_TEXT: 'Please note that download pdf is only available for the records with print in their preference'
}

export const HMO_LICENCE_CONFIG = {
  NO_SCHEME: 4,
  HMO_RISK_DEFAULT: 'Not yet checked',
  HMO_LICENCE_EXPIRY_DATE_DEFAULT: 'Unknown'
}

export const CHECKED_IN_OUT_STATUS = {
  CHECKED_IN: 'Checked In',
  CHECKED_OUT: 'Checked Out'
}

export const CURRENCY_MASK_CONFIGURATION = {
  align: 'left',
  allowNegative: false,
  decimal: '.',
  precision: 2,
  prefix: '£ ',
  suffix: '',
  thousands: ','
}

export const PROPERTY_CLAUSE_SCOPE = {
  FEATURE: 'Feature',
  ROOM: 'Room',
  PROPERTY: 'Property'
}

export const HMRC_ERROR_MESSAGES = {
  FACING_PROBLEM_TO_FETCH_DETAILS: 'We are currently experiencing some problem in fetching the landlords, please contact helpdesk.',
  FACING_PROBLEM_TO_GENERATE_REPORT: 'We are currently experiencing some problem in generating the self-assessment form, please contact helpdesk.',
  ANOTHER_PROCESS_IS_RUNNING: 'We cannot proceed since another action is in progress.',
  PREVIEW_PDF_ERROR: 'We are currently experiencing some problem in providing the preview right now.',
  DOWNLOAD_BILLING_CSV_ERROR: 'We are currently experiencing some problem in downloading the file for billing purpose.',
  DOWNLOAD_SUMMARY_SHEET_ERROR: 'We are currently experiencing some problem in downloading the summary sheet.',
  DOWNLOAD_FORM_ERROR: 'We are currently experiencing some problem in printing the form.',
  GET_DETAILS_ERROR: 'We are currently experiencing some problem in getting the details, please contact helpdesk.'
}

export const HMRC_PREFERENCE_ORDER = [
  { order: 1, index: 1 },
  { order: 2, index: 2 },
  { order: 3, index: 3 },
  { order: 4, index: 4 },
  { order: 5, index: 6 },
  { order: 6, index: 5 },
  { order: 7, index: 0 }
]

export const RENT_CATEGORY = {
  STUDENT: 1
}

export const TOB_SUCCESS_MESSAGES = {
  PROPERTY_RESERVED_SUCCESSFULLY: {
    title: 'Congratulations!',
    message: 'Holding deposit is marked as paid, Property has been reserved successfully.<br><br><b>Next Step</b> : Please add the amount to the Tenant reserve manually.'
  }
}

export const propertyAgreementStatus = [2, 5, 6] //[Confirmed, Given Notice, Extended]

export const STRIPE_ELEMENT_CONFIG = {
  frontEndConfig: {
    publishableKey: "",
    appearance: {
      theme: 'stripe',
      labels: 'floating'
    },
    elementOptions: {
      locale: 'en-GB'
    },
    stripeIntentOptions: {
      currency: 'GBP',
      payment_method_types: ['card'],
      country: 'GB'
    },
    stripeBrandInfo: {
      website: 'https://stripe.com/'
    }
  },
  nodeConfig: {
    secret_key: ''
  }
}

export const SOLR_CONFIG = {
  enableHistory:true
}

export const postcodeSettings = {
  maxLength:16,
  alertMessage: {
    title: 'Postcode',
    message: 'Currently, the address search is available for UK postcodes only. Please enter non-UK postcodes & addresses manually'
  }
}