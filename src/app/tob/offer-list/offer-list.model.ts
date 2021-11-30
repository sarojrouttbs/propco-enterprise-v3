export interface offerData {
    amount: number;
    applicantConfirmedDate: string;
    applicantId: string;
    archivedAt;
    archivedBy;
    comments: string;
    entityType: string;
    forename: string;
    isApplicantConfirmed: boolean;
    isArchived: boolean;
    isLandlordConfirmed: boolean;
    isPropertyAvailable: boolean;
    landlordConfirmedDate: string
    negotiatorId;
    numberOfCoApplicants;
    offerAt: string;
    offerId: string;
    status: number
    surname: string;
    title: string;
}

export interface offerNotesData {
    noteId: number,
    type: number;
    complaint: number;
    category: number;
    userName: string;
    userEmail: string;
    notes: string;
    dateTime: string;
    propertyReference;
    userId: string;
    propertyAddress: string;
    propertyId: string;
}