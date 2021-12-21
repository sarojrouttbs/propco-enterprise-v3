export interface ApplicationData {
    applicantId: string;
    applicationId: string;
    archivedAt;
    createdAt;
    forename: string;
    holdingDeposit: number;
    isHoldingDepositPaid: boolean;
    isSubmitted: boolean;
    moveInDate;
    numberOfCoApplicants: number;
    offerId: string;
    preferredTenancyEndDate;
    rent: number;
    status: number;
    surname: string;
    title: string;
}