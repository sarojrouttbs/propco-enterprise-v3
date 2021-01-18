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
        estimationNotes?: string;
        stageAction: string;
        landlordOwnContractor:string[];
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

    export interface IUpdateNotification {
        isAccepted: boolean;
        submittedByType: string;
        isEscalateFault: boolean;
        isVoided: boolean;
    }

    export interface IMaintenanceQuoteResponse {
        worksOrderNumber: string;
        invoiceNumber?: any;
        amount?: any;
        raisedAmount?: any;
        paidAmount?: any;
        description: string;
        postdate: string;
        status?: any;
        jobType?: any;
        repairSource?: any;
        contact?: any;
        orderedBy: string;
        orderedByContact?: any;
        requiredStartDate?: any;
        requiredCompletionDate: string;
        actualCompletionDate?: any;
        keysLocation?: any;
        returnKeysTo?: any;
        accessDetails?: any;
        fullDescription: string;
        itemType: number;
        isAuthorised?: any;
        isDisputed?: any;
        isCancelled?: any;
        isCompleted?: any;
        completedDate?: any;
        quoteStatus: boolean;
        nominalCode?: any;
        invoiceDate?: any;
        quoteContractors: QuoteContractor[];
        createdAt: string;
        modifiedAt: string;
        selectedContractorId: string;
        maintenanceId: string;
    }

    export interface QuoteContractor {
        reference: string;
        name: string;
        company: string;
        email: string;
        mobile: string;
        skills: string[];
        address: Address;
        isRejected: boolean;
        rejectionReason?: any;
        contractorId: string;
    }

    export interface Address {
        addressLine1: string;
        addressLine2: string;
        addressLine3?: any;
        county: string;
        country?: any;
        street?: any;
        buildingName?: any;
        buildingNumber: string;
        postcode: string;
        latitude?: any;
        longitude?: any;
        locality?: any;
        town: string;
        pafReference: string;
    }

    export interface NominalCode {
        description: string;
        isVatApplicable: string;
        nominalCode?: string;
        nominalType: string;
        concat: string;
    }

    export interface IFaultWorksorderRules {
        hasOtherInvoicesToBePaid: boolean;
        hasRentArrears: boolean;
        hasRentPaidUpFront: boolean;
        hasSufficientReserveBalance: boolean;
        hasTenantPaidRentOnTime: boolean;
        isFaultEstimateLessThanHalfRentOrThresHoldValue: boolean;
        isTenancyGivenNoticeOrInLastMonth: boolean;
    }

}

