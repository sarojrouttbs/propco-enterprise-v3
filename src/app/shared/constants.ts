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
  TOB_LOOKUP_DATA: 'tob_lookup_data'
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
  INVOICE_APPROVED: 24
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

export const LL_INSTRUCTION_TYPES = [//Don't change the Sequence of values it will alter the CLI functionality 
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
    index: 'GET_AN_ESTIMATE',
    value: 'Get an Estimate'
  },
  {
    index: 'AGENT_OF_NECESSITY',
    value: 'EMERGENCY/URGENT – Proceed as agent of necessity'
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
  MAXIMUM_FAULT_QUOTE_REJECTION: 'MAXIMUM_FAULT_QUOTE_REJECTION',
  FAULT_MANAGEMENT_LETCAT: 'FAULT_MANAGEMENT_LETCAT',
  FAULT_DEFAULT_NOTE_CATEGORY: 'FAULT_DEFAULT_NOTE_CATEGORY',
  FAULT_DEFAULT_NOTE_TYPE: 'FAULT_DEFAULT_NOTE_TYPE',
  MAX_ACTIVE_QUOTE_CONTRACTOR: 'MAX_ACTIVE_QUOTE_CONTRACTOR',
  FAULT_OVERRIDE_COMMUNICATION_CONSENT: 'FAULT_OVERRIDE_COMMUNICATION_CONSENT'
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
  'Debit Card'
  // 'Cash',
  // 'Cheque',
  // 'Other'
];

export const PAYMENT_WARNINGS = {
  'hasSufficientReserveBalance': 'Insufficient funds in Landlord\'s reserve.',
  'isFaultEstimateLessThanHalfRentOrThresHoldValue': 'The Works Order is over half months rent or £250.',
  'hasRentArrears': 'The Tenant has rent arrears.',
  'hasRentPaidUpFront': 'The rent has been paid upfront.',
  'hasTenantPaidRentOnTime': 'The tenant does not always pay rent on time.',
  'isTenancyGivenNoticeOrInLastMonth': 'The tenancy is either in the given notice stage or in the last month of tenancy or both.',
  'hasOtherInvoicesToBePaid': 'There are other invoices to be paid from next months rent.'
};

export const CLOSE_REASON = [
  {
    "index": "FAULT_DOES_NOT_EXIST_ANYMORE",
    "value": "Fault does not exist anymore"
  },
  {
    "index": "TENANTS_RESPONSIBILITY",
    "value": "Tenant's responsibility"
  },
  {
    "index": "APPOINTMENT_NOT_BOOKED",
    "value": "Appointment not booked"
  },
  {
    "index": "LANDLORD_WOULD_NOT_FIX",
    "value": "Landlord would not fix"
  },
  {
    "index": "CLOSE_INTERNAL_USE_ONLY",
    "value": "Close - Internal use only"
  },
  {
    "index": "OTHER",
    "value": "Other"
  }
];

export const CLOSE_REASON_KEYS = {
  "FAULT_DOES_NOT_EXIST_ANYMORE": "FAULT_DOES_NOT_EXIST_ANYMORE",
  "TENANTS_RESPONSIBILITY": "TENANTS_RESPONSIBILITY",
  "APPOINTMENT_NOT_BOOKED": "APPOINTMENT_NOT_BOOKED",
  "LANDLORD_WOULD_NOT_FIX": "LANDLORD_WOULD_NOT_FIX",
  "CLOSE_INTERNAL_USE_ONLY": "CLOSE_INTERNAL_USE_ONLY",
  "OTHER": "OTHER"
};

export const ScriptStore = [
];

export const FAULT_QUALIFICATION_ACTIONS = [
  {
    index: 'UNDER_BLOCK_MANAGEMENT',
    value: 'Repair via Block Management/Factors'
  },
  {
    index: 'UNDER_WARRANTY',
    value: 'Repair via Guarantee Management'
  },
  {
    index: 'UNDER_SERVICE_CONTRACT',
    value: 'Repair via Service Contract'
  },
  {
    index: 'LANDLORD_INSTRUCTION',
    value: 'Check Landlord\'s Instructions'
  },
  {
    index: 'REQUEST_MORE_INFO',
    value: 'Request More Info'
  }
];

export const CERTIFICATES_CATEGORY = ['FAULT_WARRANTY_CATEGORY', 'FAULT_SERVICE_CONTRACT_CATEGORY', 'FAULT_APPLIANCE_COVER_CATEGORY'];
export const DOCUMENTS_TYPE = ['pdf', 'text', 'doc', 'csv', 'docx', 'odt'];

export const KEYS_LOCATIONS = {
  KEY_IN_BRANCH: 'Key in branch',
  DO_NOT_HOLD_KEY: 'We do not hold keys'
}

export const MAX_QUOTE_LIMIT = {
  FAULT_LARGE_QUOTE_LIMIT: 'FAULT_LARGE_QUOTE_LIMIT'
}

export const FILE_IDS = {
  TENANT: 1,
  LANDLORD: 8,
  CONTRACTOR: 11,
  FIX_A_FAULT: 26
}

export const MAINT_JOB_TYPE = {
  "index": 4520,
  "value": "Repair"
}
export const MAINT_REPAIR_SOURCES = {
  CUSTOMER_REPORT: 5126,
  FIXFLO: 3635,
  THIRD_PARTY: 5128
}
export const MAINT_CONTACT = {
  CONTACT_TENANT: 'Contact Tenant',
  ACCESS_VIA_KEY: 'Tenant approved access via keys'
}

export const APPOINTMENT_MODAL_TYPE = {
  QUOTE: 'quote',
  MODIFY_QUOTE: 'modify-quote',
  MODIFY_WO: 'modify-wo',
  WO: 'wo'
}

export const OCCUPIERS_VULNERABLE = {
  TRUE: 5120,
  FALSE: 5122
}

export const REJECTED_BY_TYPE = {
  CONTRACTOR: 11,
  LANDLORD: 8
}

export const DPP_GROUP = {
  REPAIR_N_MAINTENANCE: 'Repair and Maintenance'
}

export const MAX_DOC_UPLOAD_SIZE = {
  FAULT_DOCUMENT_UPLOAD_SIZE: 'FAULT_DOCUMENT_UPLOAD_SIZE'
}

export const WORKSORDER_RAISE_TYPE = {
  MANUAL: 'manual',
  AUTO: 'auto',
  AUTO_LL_AUTH: 'auto_ll_auth'
}

export const LL_PAYMENT_CONFIG = {
  URGENT: 'FAULT_URGENT_LL_PAYMENT_UNSUCCESSFUL_EMAIL_NUDGE_MINUTES',
  NON_URGENT: 'FAULT_NON_URGENT_LL_PAYMENT_UNSUCCESSFUL_EMAIL_NUDGE_MINUTES'
}

export const FAULT_EVENT_TYPES = [
  {
    "Major Events": [
      "Fault Logged",
      "Progress Started",
      "CLI action selected",
      "Quote Obtained",
      "Converted To WO",
      "WO Raised",
      "Fault Closed"
    ]
  },
  {
    "Escalations": [
      "Escalated",
      "De Escalated",
      "Fault Snoozed"
    ]
  },
  {
    "Stage Changed": [
      "Stage Changed"
    ]
  },
  {
    "Status Changed": [
      "Status Changed"
    ]
  },
  {
    "Notifications": [
      "Response Received"
    ]
  },
  {
    "Notification Sent": [
      "Notification Sent"
    ]
  },
  {
    "Notes": [
      "Notes Added"
    ]
  },
  {
    "Documents": [
      "Document Added"
    ]
  }
]

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
  FAULT_SNOOZED: 16
}

export const QUOTE_CC_STATUS_ID = {
  REJECTED: 3
}

export const NOTES_ORIGIN = {
  FAULT_STAGE: 'FAULT_STAGE',
  DASHBOARD: 'DASHBOARD'
}

export const RECIPIENT = [
  'Landlord',
  'Tenant',
  'Contractor'
];

export const RECIPIENTS = {
  'LANDLORD': 'Landlord',
  'TENANT': 'Tenant',
  'CONTRACTOR': 'Contractor'
};

export const PROPERTY_LINK_STATUS = {
  'CURRENT': 'Current'
};

export const DATE_TIME_TYPES = [
  {
    "index": "DATE_WITH_TIME",
    "value": "Date with time"
  },
  {
    "index": "DATE_WITH_SESSION",
    "value": "Date with session"
  }
];

export const DATE_TIME_TYPES_KEYS = {
  "DATE_WITH_TIME": "DATE_WITH_TIME",
  "DATE_WITH_SESSION": "DATE_WITH_SESSION",
}

export const MAINTENANCE_TYPES_FOR_SEND_EMAIL = {
  QUOTE: 'quote',
  WO: 'wo',
  ESTIMATE: 'estimate'
}

export const FAULT_STAGES_ACTIONS = {
  FAULT_LOGGED : 'LOGGED'
}


export const NGX_QUILL_EDITOR_TOOLBAR_SETTINGS = {
  toolbar: {
    container: [
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'align': [] }]
    ]
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
  COUNTER_OFFER_BY_APPLICANT: 7
};

export const NOTES_TYPE = {
  OFFER: 'OFFER',
  FAULT: 'FAULT'
}

export const APPLICATION_STATUSES = {
  NEW: 0,
  DRAFT: 1,
  ACCEPTED: 2,
  REJECTED: 3,
  ON_HOLD: 4
};

export const APPLICATION_ACTION_TYPE = {
  SAVE_FOR_LATER: 'saveForLater'
}

