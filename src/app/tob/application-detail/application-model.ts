declare namespace ApplicationModels {
    export interface IApplicationRestrictions {
        key?: string;
        value?: boolean;
        isNegotiable?: boolean;
    }

    export interface IApplicationClauses {
        clauseId?: string;
        clauseName?: string;
        clauseText?: string;
        isNegotiable?: boolean;
        clauseScope?: string
        clauseNumber?: string
        clauseHeadingId?: string
    }

    export interface IApplicationRequest {
        propertyId: string;
        offerId?: string;
        rent?: number;
        status: number;
        hasInfoPermission?: boolean;
        isTermsAndConditionsAccepted?: boolean;
        isHoldingDepositPaid?: boolean;
        depositAmount?: number;
        isNoDepositScheme?: boolean;
        rentingTime?: number;
        rentDueDay?: number;
        numberOfAdults?: number;
        numberOfChildren?: number;
        hasSameHouseholApplicants?: boolean;
        numberOfHouseHolds?: number;
        isExpired?: boolean;
        createdById: string;
        createdBy: string;
        applicationRestrictions: IApplicationRestrictions[];
        applicationClauses: IApplicationClauses[];
    }


    export interface IAddress {
        addressLine1: string;
        addressLine2: string;
        addressLine3: string;
        county: string;
        country?: any;
        street?: any;
        buildingName: string;
        buildingNumber: string;
        postcode: string;
        latitude?: any;
        longitude?: any;
        locality?: any;
        town: string;
        pafReference?: any;
    }

    export interface IGuarantorRequest {
        reference?: string;
        displayAs?: string;
        rentGuaranteed?: any;
        title?: string;
        forename?: string;
        surname?: string;
        email?: string;
        mobile?: string;
        propcoId?: number;
        guarantorId?: string;
        address?: IAddress;
    }

    export interface IGuarantorResponse {
        guarantorId: string;
    }

    export interface ApplicationRestriction {
        value: boolean;
        isNegotiable: boolean;
        applicationRestrictionId: string;
        key: string;
        restrictionName: string;
    }

    export interface ApplicationClause {
        clauseId: number;
        clauseText: string;
        clauseName: string;
        isNegotiable: boolean;
        applicationClauseId: string;
    }

    export interface IApplicationResponse {
        hasInfoPermission: boolean;
        isTermsAndConditionsAccepted: boolean;
        isHoldingDepositPaid: boolean;
        rent: number;
        depositAmount: number;
        isNoDepositScheme: boolean;
        moveInDate: string;
        rentingTime: number;
        rentDueDay: number;
        preferredTenancyEndDate: string;
        numberOfAdults: number;
        numberOfChildren: number;
        hasSameHouseholdApplicants: boolean;
        numberOfHouseHolds: number;
        status: number;
        isExpired: boolean;
        createdBy: string;
        isSubmitted: boolean;
        submittedBy?: any;
        submittedAt?: any;
        applicationRestrictions: ApplicationRestriction[];
        applicationClauses: ApplicationClause[];
        applicationId: string;
        propertyId: string;
        applicantId?: any;
        offerId?: any;
        paidById: string;
        createdById: string;
        submittedById?: any;
    }

    export interface ICoApplicants {
        isLead: boolean;
        email: string;
        title: string;
        init?: any;
        surname: string;
        forename: string;
        displayAs: string;
        applicationApplicantId: string;
        applicantId: string;
        mobile: string;
    }


}