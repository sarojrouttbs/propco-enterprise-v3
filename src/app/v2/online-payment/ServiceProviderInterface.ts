export interface ServiceProviderConf {
    paymentServiceProvider: string
    paymentProcess: string
    stripeConfig: StripeConfig
    paymentDetail: PaymentDetail
  }
  
  export interface StripeConfig {
    publishableKey: string
    secretKey: string
  }
  
  export interface PaymentDetail {
    amount: number
    propertyReference: string
    propertyAddress: PropertyAddress
    propertyId: string
    entityId: string
    entityType: string
    reference: string
    title: any
    foreName: string
    surName: string
    middleName: string
    salutation: string
    displayAs: string
    email: string
  }
  
  export interface PropertyAddress {
    addressLine1: string
    addressLine2: string
    addressLine3: string
    county: string
    country: string
    street: any
    buildingName: string
    buildingNumber: string
    postcode: string
    latitude: string
    longitude: string
    organisationName: string
    plotNumber: any
    locality: string
    town: string
    pafReference: string
  }
  