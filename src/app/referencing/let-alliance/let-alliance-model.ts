// tslint:disable-next-line: no-namespace
declare namespace letAllianceModels {
    interface Address {
        addressLine1: string;
        addressLine2: string;
        addressLine3: string;
        locality: string;
        town: string;
        county: string;
        country: string;
        street?: any;
        buildingName: string;
        buildingNumber: string;
        postcode: string;
        latitude?: any;
        longitude?: any;
        displayAddress?: any;
    }

    interface Bullets {
        bullet1?: any;
        bullet2?: any;
        bullet3?: any;
        bullet4?: any;
        bullet5?: any;
        bullet6?: any;
        bullet7?: any;
        bullet8?: any;
        bullet9?: any;
        bullet10?: any;
    }

    interface EmergencyResponseService {
        isERSEnabled?: any;
        eriProduct?: any;
        inceptionDate?: any;
        renewalDate?: any;
        cancelledDate?: any;
    }

    export interface IPropertyResponse {
        reference: string;
        legacyReference?: any;
        managementType: number;
        managementTypeDescription: string;
        address: Address;
        status: number;
        numberOfBedroom: number;
        numberOfBathroom?: any;
        houseType?: any;
        parking?: any;
        furnishingType?: any;
        furnishingTypeDescription?: any;
        tenancyRent?: any;
        frequencyType?: any;
        deposit?: any;
        tenancyDeposit: number;
        managementCommission?: any;
        publishedAddress?: any;
        smallDescription?: any;
        fullDescription?: any;
        restrictions?: any;
        media?: any;
        bullets: Bullets;
        numberOfSmokeAlarms?: any;
        numberOfFloors?: any;
        numberOfCOAlarms?: any;
        emergencyResponseService: EmergencyResponseService;
        createdAt: string;
        modifiedAt: string;
        propertyManager: string;
        propertyInspector: string;
        alarmCode?: any;
        hasLetBefore?: any;
        hasGas?: any;
        hasPat?: any;
        hasElectricalIndemnitySigned?: any;
        hasOil?: any;
        hasSolidFuel?: any;
        stopTapLocation?: any;
        epcAssetRating?: any;
        numberOfReceptions?: any;
        advertisedRentType?: any;
        holdingDeposit?: any;
        rentCategory?: any;
        rentFrequency?: any;
        depositScheme?: any;
        expenditureLimit?: any;
        landlordOccupancy?: any;
        gasMeterLocation?: any;
        waterMeterLocation?: any;
        electricMeterLocation?: any;
        propcoId: number;
        propertyId: string;
        office: string;
        advertisementRent: number;
        managementUserId?: any;
        inspectionUserId?: any;
    }

    interface Tenant {
        depositStatus?: any;
        rentShare?: any;
        isReferencingRequired?: boolean;
        tenantId: string;
        isLead: boolean;
    }

    export interface ITenancyResponse {
        [x: string]: any;
        status: number;
        rent: number;
        rentFrequency: number;
        frequencyType: number;
        deposit: number;
        officeCode: string;
        tenancyStartDate: string;
        tenancyEndDate: string;
        originalStartDate: string;
        originalEndDate: string;
        contractType: number;
        checkInDate?: any;
        nextClaimDate?: any;
        checkOutDate?: any;
        legacyReference?: any;
        hasCheckedIn?: any;
        numberOfReferencingOccupants?: number;
        propcoAgreementId: number;
        agreementId: string;
        tenants: Tenant[];
        depositScheme?: any;
    }

    export interface ITenantListResponse {
        agreementStatus: number;
        reference: string;
        status: number;
        address: Address;
        addressee: string;
        name: string;
        dateOfBirth?: any;
        homeTelephoneNo?: any;
        businessTelephoneNo?: any;
        email: string;
        alternativeEmail?: any;
        mobile: string;
        createdAt: string;
        modifiedAt: string;
        legacyReference?: any;
        isLead: boolean;
        title?: any;
        forename: string;
        surname: string;
        propcoId: number;
        tenantId: string;
        agreementId: string;
    }

    export interface ITenantResponse {
        reference: string;
        title?: any;
        surname: string;
        forename: string;
        name: string;
        homeTelephoneNo?: any;
        businessTelephoneNo?: any;
        email: string;
        alternativeEmail?: any;
        esignatureEmail?: any;
        mobile: string;
        alternativeNo?: any;
        fax?: any;
        alternativeFax?: any;
        company?: any;
        companyContactNo?: any;
        companySignatory?: any;
        status: number;
        emergencyNo?: any;
        booker?: any;
        fullName: string;
        address: Address;
        pafref?: any;
        organisationName?: any;
        rentGuaranteed?: any;
        dateOfBirth?: any;
        enrolmentNo?: any;
        rentAmount?: any;
        maritalStatus?: any;
        gender?: any;
        nationality?: any;
        ethnicOrigin?: any;
        legacyReference?: any;
        depositStatus?: any;
        correspondenceAddress: Address;
        username?: any;
        propcoId: number;
        tenantId: string;
        referencingApplicationStatus: number;
    }

    export interface IGuarantorResponse {
        reference: string;
        displayAs?: any;
        rentGuaranteed?: any;
        address: Address;
        name?: any;
        homeTelephoneNo?: any;
        businessTelephoneNo?: any;
        alternativeEmail?: any;
        esignatureEmail?: any;
        alternativeNo?: any;
        fax?: any;
        alternativeFax?: any;
        emergencyNo?: any;
        booker?: any;
        fullName?: any;
        dateOfBirth?: any;
        enrolmentNo?: any;
        rentAmount?: any;
        maritalStatus?: any;
        gender?: any;
        nationality?: any;
        ethnicOrigin?: any;
        legacyReference?: any;
        forename: string;
        surname: string;
        email: string;
        mobile: string;
        title: string;
        propcoId: number;
        guarantorId: string;
        referencingApplicationStatus: number;
    }
}

