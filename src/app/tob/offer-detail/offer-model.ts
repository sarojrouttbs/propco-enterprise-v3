declare namespace OfferModels {
    export interface IApplicantLisResponse {
        entityType: string;
        propcoId: string;
        legacyReference?: any;
        address: string;
        status: string;
        email: string;
        fullName: string;
        dateOfBirth?: any;
        postcode?: any;
        officeCode: string[];
        company?: any;
        entitySuggestion: string;
        entityId: string;
        reference: string;
    }

    export interface IApplicantDetails {
        address: any;
        correspondenceAddress: any;
        addressee: string;
        alternativeEmail: string;
        alternativeFax: string;
        alternativeNo: string;
        annualIncome: number;
        booker: string;
        businessTelephoneNo: string;
        company: string;
        companyContactNo: string;
        companySignatory: string;
        currentPosition: number;
        dateOfBirth: string;
        email: string;
        emergencyNo: string;
        enrolmentNo: string;
        esignatureEmail: string;
        ethnicOrigin: number;
        fax: string;
        forename: string;
        fullName: string;
        gender: boolean;
        guarantorType: number;
        hasPets: boolean;
        homeTelephoneNo: string;
        isEmailVerified: boolean;
        maritalStatus: number;
        mobile: string;
        moveInDate: string;
        name: string;
        nationality: number;
        numberOfAdults: number;
        numberOfChildren: number;
        occupation: string;
        organisationName: string;
        pafref: string;
        petsInfo: string;
        reference: string;
        rentAmount: number;
        rentGuaranteed: number;
        rentingTime: number;
        salutation: string;
        status: number;
        surname: string;
        title: string;
        username: string;
    }

    export interface ILookupResponse {
        index: number;
        value: string;
    }

    export interface IOfferResponse {
        amount: number;
        applicantConfirmedDate: string;
        applicantId: string;
        archivedAt: Date;
        archivedBy: string;
        comments: string;
        createdBy: string;
        entityType: string;
        isApplicantConfirmed: boolean;
        isArchived: boolean;
        isLandlordConfirmed: boolean;
        isTermsAndConditionsAccepted: boolean;
        landlordConfirmedDate: string;
        moveInDate: string;
        negotiatorForename: string;
        negotiatorId: string;
        negotiatorSurname: string;
        numberOfAdults: number;
        numberOfChildren: number;
        offerAt: Date;
        offerClauses: OfferClauses[];
        offerId: string;
        offerRestrictions: OfferRestrictions[];
        propertyId: string;
        rentingTime: number;
        status: number;
    }

    export interface OfferClauses {
        clauseId: number;
        clauseName: string;
        clauseText: string;
        isNegotiable: boolean;
        modifiedBy: string;
        offerClauseId: string;
    }

    export interface OfferRestrictions {
        isNegotiable: boolean;
        key: string;
        modifiedBy: string;
        offerRestrictionId: string;
        value: boolean;
    }
}
