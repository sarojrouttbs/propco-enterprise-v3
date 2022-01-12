export interface OfferData {
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

export interface OfferNotesData {
    category: number;
    noteId: number;
    complaint: number;
    notes: string;
    postedAt: string;
    type: number
    userEmail: string;
    userId: string;
    userName: string;
}