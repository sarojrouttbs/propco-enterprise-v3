export interface Params {
  route?: any;
  entityId: string;
  reference: string;
  entityTitle: string;
  purpose: number;
}

export interface Property {
  state: string;
  params: Params;
  entityId: string;
  entity: string;
  entityTitle: string;
  reference: string;
  isSelected: boolean;
  pageRef: string;
}

export interface LANDLORD {
  state: string;
  params: Params;
  entityId: string;
  entity: string;
  entityTitle: string;
  reference: string;
  isSelected: boolean;
  pageRef: string;
}

export interface PropertHmoLicence {
  applicationNumber?: any;
  numberOfPropertyVisitsRequired?: any;
  maxPerson?: any;
  hasLandlordPreviouslyFailedFppt: boolean;
  comments: string;
  applicationMadebyLookup?: any;
  isPropertyLicenced: boolean;
  licenceCertificateNumber: string;
  licenceScheme?: any;
  status?: any;
  requiredLicence?: any;
  licenceStatus?: any;
  licenceDuration?: any;
  licenceIssueDate: string;
  licenceExpiryDate: string;
  licenceHolder?: any;
  licenceRefusalHistory?: any;
  licenceCriminalRecord?: any;
  licenceSchemeLookup: number;
  licenceStatusLookup: number;
  licenceHolderLookup: number;
  reasonOfFailureLookup: number;
  licenceConditions?: any;
  licenceUpdatedAt?: any;
  createdAt: string;
  modifiedAt: string;
  isLicenceRequired: boolean;
  relevantLicenceLookup?: any;
  relevantLicence?: any;
  isLicenceSchemeUpdatedByUser: boolean;
  licenceSchemeUpdatedByUserAt?: any;
  requiredLicenceLookup?: any;
  hmoRegisterId: number;
  statusChangedDate?: any;
  licenceId: string;
  propertyId: string;
  councilId: string;
  agreementId: string;
  localAuthorityId: string;
  hmoLicensed: boolean;
  hmoLicenceExpiryDate: string
}

export interface IPropertyDetails {
  numberOfBedroom : number,
  noOfSingleBedrooms:number,
  noOfDoubleBedrooms:number,
  isStudio:boolean,
  publishedAddress:string,
  hasUploadedToWebsite:boolean,
  numberOfBathroom:number,
  ensuite:number,
  showerRooms:number,
  advertisementRent:string,
  advertisementRentFrequency: string,
  isPropertyOfTheWeek:boolean,
  numberOfReceptions:number,
  numberOfFloors: number,
  availableFromDate:string,
  availableToDate:string,
  hasLiftAccess:boolean,
  houseType:string,
  furnishingType:string,
  kitchenStyle:string,
  doesStudentLet:boolean,
  propertyStyle:string,
  propertyAge:string,
  decorativeCondition: string,
  overAllCondition:string,
  doesStudentFriendly:boolean,
  parking:string,
  garage:string,
  heatingType:string,
  garden:string,
  doesExclusiveWaterTax:boolean,
  floorArea:string,
  floorAreaType:string,
  landArea:string,
  landAreaTypes:string,
  doesExclusiveCouncilTax:boolean,
  isReferral:boolean
}