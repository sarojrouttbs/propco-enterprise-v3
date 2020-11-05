// tslint:disable-next-line: no-namespace
declare namespace FaultModels {

    export interface IPropertyResponse {
        entityType: string;
        propcoId: string;
        legacyReference?: any;
        address: string;
        status: string;
        email?: any;
        fullName?: any;
        dateOfBirth?: any;
        postcode: string;
        entitySuggestion?: any;
        officeCode: string[];
        managementType: string;
        managementTypeLetCategory: string;
        keyCode: string;
        propertyManager: string;
        propertyRent?: any;
        propertyNegotiator: string;
        propertyLandlord: string[];
        propertyTenant?: any;
        propertyBathrooms?: any;
        propertyReceptions?: any;
        propertyParkings?: any;
        propertyAdvertisedRent?: any;
        propertyAdvertisedRentFrequencyType?: any;
        propertyAgreementDate?: any;
        propertyImage?: any;
        entityId: string;
        reference: string;
        houseType?: any;
        numberOfBedroom?: any;
        furnishingType?: any;
    }
    
    export interface IFaultResponse {
        title: string;
        reference: string;
        status: number;
        category: number;
        notes: string;
        urgencyStatus: number;
        reportedBy: string;
        isTenantPresenceRequired: boolean;
        areOccupiersVulnerable: boolean;
        tenantNotes: string;
        termsAccepted?: any;
        createdAt: string;
        submittedAt: string;
        modifiedAt: string;
        additionalInfo: any[];
        sourceType: string;
        isEscalated?: any;
        escalatedBy?: any;
        escalationReason?: any;
        escalatedAt?: any;
        isDraft: boolean;
        fixfloCategory?: any;
        doesBranchHoldKeys?: any;
        stage: string;
        userSelectedAction?: any;
        confirmedEstimate?: any;
        hasMaintTenancyClause?: any;
        isUnderBlockManagement?: any;
        isUnderWarranty?: any;
        isUnderServiceContract?: any;
        faultId: string;
        propertyId: string;
        agreementId?: any;
        tenantId?: any;
        reportedById: string;
        createdBy: string;
        submittedBy: string;
        assignedTo: string;
        contractorId?: any;
        estimateNotes?:string;
    }

    export interface IContractorResponse {
        entityType: string;
        propcoId: string;
        legacyReference?: any;
        address: string;
        status: string;
        email?: any;
        fullName?: any;
        dateOfBirth?: any;
        postcode: string;
        entitySuggestion?: any;
        officeCode: string[];
        isVatRegistered: any;
        occupation: any;
        isAgentContractorApproved: any;
        entityId: string;
        reference: string; 
    }

}

