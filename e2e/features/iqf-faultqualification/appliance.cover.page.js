var commonUtil = require('../../util/common.util.page');
var commonFunction = new commonUtil();
var faultSummary = require('../igf-logfault/fault.summary.page');

var ApplianceCover = function (faultDetails) {
    
    /**
     * Locators for elements used in 'Appliance Cover Repair' functionality
     */ 
    
    this.acYesBtn = element(by.xpath("//ion-radio-group[@formcontrolname='isUnderServiceContract']//ion-label[contains(text(),'Yes')]/preceding-sibling::ion-radio"));
    this.acNoBtn = element(by.xpath("//ion-radio-group[@formcontrolname='isUnderServiceContract']//ion-label[contains(text(),'No')]/preceding-sibling::ion-radio"));
    this.acViewBtn = element(by.xpath("//h3[contains(text(), 'Service Contract/ Appliance Cover')]/following-sibling::ion-row//ion-button")); 
    this.firstACRecord = element(by.xpath("//tbody[@formarrayname='propertyCertificateList']/tr[2]//ion-checkbox"));
    this.acDetailsCloseBtn = element(by.xpath("//app-property-certificate-modal//ion-button")); 
    this.popupTitle = element(by.css ("ion-title.title-default"));
    this.proceedBtn = element(by.xpath("//ion-button[contains(text(),  'Proceed') and contains(@class, 'submit-button')]"));
    this.faultActionStatus = element(by.css("div.banner > h2.banner-heading")); 
   
    this.responseQuestion = element(by.css("div.question-answer > h6.ng-star-inserted"));
    this.dateTimeTypeList = element(by.xpath("//ion-select[contains(@formcontrolname, 'dateTimeType')]"));
    this.dateTimeType = element(by.xpath("//ion-label[contains(text(), '" + faultDetails.dateTimeType + "')]/following-sibling::ion-radio"));
    this.dateTimeBtn = element(by.xpath("//ion-datetime[contains(@formcontrolname, 'dateTime')]"));
    this.dateTimeDoneBtn = element(by.xpath("//button[contains(text(), 'Done')]"));
    this.nextStepTxt = element(by.xpath("//ion-text[contains(text(), 'Please note')]/.."));
  
    this.faultTitle = element(by.xpath("(//h2[contains(text(), '" + faultDetails.title + "')])[2]")); 
    this.ccCompnay = element(by.xpath("//ion-input[contains(@formcontrolname, 'company')]/input"));
    this.ccName = element(by.xpath("//ion-input[contains(@formcontrolname, 'name')]/input"));
    this.ccTelephone = element(by.xpath("//ion-input[contains(@formcontrolname, 'telephone')]/input"));
    this.ccEmail = element(by.xpath("//ion-input[contains(@formcontrolname, 'email')]/input"));
    this.dateTimeBtnLLContractor = element(by.xpath("//ion-datetime[contains(@formcontrolname, 'estimatedVisitAt')]"));
    this.pastDateErrorLLContractor = element(by.xpath("//ion-label[contains(text(), 'Visit Date')]/../following-sibling::ion-text"));
    this.ccConsentCheckbox = element(by.xpath("//ion-checkbox[contains(@formcontrolname, 'hasContractorConsent')]"));
    this.markJobCompletePopupTitle = element(by.css("ion-title.title-default"));
    this.markJobCompletePopupTxt = element(by.css("app-job-completion-modal > ion-content > form > ion-grid > ion-row > ion-col > h6"));
    this.actionAfterSMFTE = element(by.xpath("//app-close-fault//h3"));
    this.displayedReason = element(by.xpath("//app-close-fault//h5"));
    
    this.completeRepair = function(faultReported){
        let fSummary = new faultSummary(faultReported);
        commonFunction.waitForElementToBeVisible(this.faultTitle, "Fault title");
        commonFunction.scrollToElement(this.acYesBtn);
        commonFunction.clickOnElement(this.acYesBtn, 'Appliance Cover Yes button');
        commonFunction.clickOnElement(this.acViewBtn, "Appliance Cover View button");
        commonFunction.waitForElementToBeVisible(this.acDetailsCloseBtn);
        commonFunction.clickOnElement(this.firstACRecord, "First Appliance Cover record");
        commonFunction.clickOnElement(this.acDetailsCloseBtn, "Appliance Cover Close button");
        commonFunction.scrollToElement(this.proceedBtn);
        commonFunction.clickOnElement(this.proceedBtn, "Proceed button");
        let acConfirmationMsg = commonFunction.updateVerificationObject(fSummary.confirmationMessage, "Appliance Cover Repair Confirmation Message"); 
        expect(acConfirmationMsg).toContainData(faultReported.acRepairConfirmMsg);
        commonFunction.clickOnElement(fSummary.confirmationOKBtn, "Appliance Cover Repair confirmation OK button");
        commonFunction.waitForElementToBeVisible(this.faultActionStatus, "Fault action status");        
        commonFunction.scrollToElement(fSummary.faultStatus);
        let smeFaultStatus = commonFunction.updateVerificationObject(fSummary.faultStatus, "Fault Status after Appliance Cover repair is chosen"); 
        expect(smeFaultStatus).toContainData(faultReported.faultStatusSME); 
        commonFunction.scrollToElement(this.faultActionStatus);           
        let smeFaultAction = commonFunction.updateVerificationObject(this.faultActionStatus, "Fault Action after Appliance Cover repair is chosen"); 
        expect(smeFaultAction).toContainData(faultReported.faultActionSME);
        commonFunction.scrollToElement(this.responseQuestion);
        let smeFaultActionQuestion = commonFunction.updateVerificationObject(this.responseQuestion, "SME - Question which requires an action"); 
        expect(smeFaultActionQuestion).toContainData(faultReported.faultActionSMEQuestion); 
        commonFunction.scrollToElement(this.acViewBtn);
        commonFunction.clickOnElement(this.acViewBtn, "Appliance Cover View button");
        commonFunction.waitForElementToBeVisible(this.acDetailsCloseBtn);
        let acDetailsPopupTitle = commonFunction.updateVerificationObject(this.popupTitle, "Appliance Cover Details popup title"); 
        expect(acDetailsPopupTitle).toContainData(faultReported.acDetailsPopupTitle); 
        commonFunction.clickOnElement(this.acDetailsCloseBtn, "Appliance Cover Details close button");
        commonFunction.scrollToElement(commonFunction.getElementByCssContainingText('ion-button', faultReported.positiveResponseSME));
        commonFunction.clickOnElement(commonFunction.getElementByCssContainingText('ion-button', faultReported.positiveResponseSME), faultReported.positiveResponseSME);
        commonFunction.waitForElementToBeVisible(this.markJobCompletePopupTxt, "Mark Job Complete popup");
        let jobCompletePopupTitle = commonFunction.updateVerificationObject(this.markJobCompletePopupTitle, "Mark Job Complete popup title"); 
        expect(jobCompletePopupTitle).toContainData(faultReported.markJobCompleteTitle);
        let jobCompletePopupText = commonFunction.updateVerificationObject(this.markJobCompletePopupTxt, "Mark Job Complete popup text"); 
        expect(jobCompletePopupText).toContainData(faultReported.markJobCompleteTxt);
        commonFunction.clickOnElement(this.dateTimeBtn, "Date time picker");
        commonFunction.setDate(faultReported.jobCompleteDateValue);
        commonFunction.clickOnElement(commonFunction.getElementByCssContainingText('ion-button','YES'), "Mark Job Complete popup Yes button");
        commonFunction.waitForElementToBeVisible(this.faultActionStatus, "Fault action status");
        commonFunction.scrollToElement(fSummary.faultStatus);
        let acfteFaultStatus = commonFunction.updateVerificationObject(fSummary.faultStatus, "Fault Status after job is completed"); 
        expect(acfteFaultStatus).toContainData(faultReported.faultStatusSMFTE);
        commonFunction.scrollToElement(this.faultActionStatus);
        let acfteFaultAction = commonFunction.updateVerificationObject(this.faultActionStatus, "Fault Action after job is completed SMFTE"); 
        expect(acfteFaultAction).toContainData(faultReported.faultActionSMFTE);
        commonFunction.scrollToElement(this.responseQuestion);
        let acfteFaultActionQuestion = commonFunction.updateVerificationObject(this.responseQuestion, "Question which requires an action SMFTE"); 
        expect(acfteFaultActionQuestion).toContainData(faultReported.faultActionSMFTEQuestion);
        commonFunction.scrollToElement(commonFunction.getElementByCssContainingText('ion-button', faultReported.positiveResponseSMFTE));
        commonFunction.clickOnElement(commonFunction.getElementByCssContainingText('ion-button', faultReported.positiveResponseSMFTE), faultReported.positiveResponseSMFTE);
        let tenantSatisfyConfirmationMsg = commonFunction.updateVerificationObject(fSummary.confirmationMessage, "Tenant satisfied and fault closure Confirmation Message"); 
        expect(tenantSatisfyConfirmationMsg).toContainData(faultReported.tenantSatisfyConfirmationMsg);
        commonFunction.clickOnElement(fSummary.confirmationOKBtn, "Tenant satisfied and fault closure confirmation OK button");
        commonFunction.waitForElementToBeVisible(this.faultActionStatus, "Fault action status");
        commonFunction.scrollToElement(this.faultActionStatus);
        let acfteResponseFaultAction = commonFunction.updateVerificationObject(this.faultActionStatus, "Fault Action after tenant is satisfied"); 
        expect(acfteResponseFaultAction).toContainData(faultReported.faultActionAfterSMFTE);
        let acfteResponseNextAction = commonFunction.updateVerificationObject(this.actionAfterSMFTE, "Next Action after tenant is satisfied"); 
        expect(acfteResponseNextAction).toContainData(faultReported.faultNextActionAfterSMFTE);
        commonFunction.scrollToElement(this.displayedReason);
        let closeReasonDisplayed = commonFunction.updateVerificationObject(this.displayedReason, "Fault closure reason"); 
        expect(closeReasonDisplayed).toContainData(faultReported.faultCloseReason);  
        commonFunction.scrollToElement(fSummary.faultStatus);
        let acfteResponseFaultStatus = commonFunction.updateVerificationObject(fSummary.faultStatus, "Fault Status after tenant is satisfied"); 
        expect(acfteResponseFaultStatus).toContainData(faultReported.faultStatusAfterSMFTE);
    } 

    this.notCompletedRepair = function(faultReported){
        let fSummary = new faultSummary(faultReported);
        commonFunction.waitForElementToBeVisible(this.faultTitle, "Fault title");
        commonFunction.scrollToElement(this.acYesBtn);
        commonFunction.clickOnElement(this.acYesBtn, 'Appliance Cover Yes button');
        commonFunction.clickOnElement(this.acViewBtn, "Appliance Cover View button");
        commonFunction.waitForElementToBeVisible(this.acDetailsCloseBtn);
        commonFunction.clickOnElement(this.firstACRecord, "First Appliance Cover record");
        commonFunction.clickOnElement(this.acDetailsCloseBtn, "Appliance Cover Close button");
        commonFunction.scrollToElement(this.proceedBtn);
        commonFunction.clickOnElement(this.proceedBtn, "Proceed button");
        commonFunction.clickOnElement(fSummary.confirmationOKBtn, "Appliance Cover Repair confirmation OK button");
        commonFunction.waitForElementToBeVisible(this.faultActionStatus, "Fault action status");        
        commonFunction.scrollToElement(fSummary.faultStatus);
        let smeFaultStatus = commonFunction.updateVerificationObject(fSummary.faultStatus, "Fault Status after Appliance Cover repair is chosen"); 
        expect(smeFaultStatus).toContainData(faultReported.faultStatusSME); 
        commonFunction.scrollToElement(commonFunction.getElementByCssContainingText('ion-button', faultReported.negativeResponseSME));
        commonFunction.clickOnElement(commonFunction.getElementByCssContainingText('ion-button', faultReported.negativeResponseSME), faultReported.negativeResponseSME);
        let repairNotCompleteConfirmationMsg = commonFunction.updateVerificationObject(fSummary.confirmationMessage, "Appliance Cover Repair not completed confirmation message"); 
        expect(repairNotCompleteConfirmationMsg).toContainData(faultReported.repairNotCompleteConfirmMsg);
        commonFunction.clickOnElement(fSummary.confirmationOKBtn, "Appliance Cover Repair not completed confirmation OK button");
        commonFunction.waitForElementToBeVisible(this.faultActionStatus, "Fault action status"); 
        commonFunction.scrollToElement(fSummary.faultStatus);
        let faultStatusRepairNotComplete = commonFunction.updateVerificationObject(fSummary.faultStatus, "Fault Status after repair not completed by Appliance Cover"); 
        expect(faultStatusRepairNotComplete).toContainData(faultReported.faultStatusNegativeSMEResponse); 
        commonFunction.scrollToElement(this.faultActionStatus);
        let smeResponseFaultAction = commonFunction.updateVerificationObject(this.faultActionStatus, "Fault Action after repair not completed by Appliance Cover"); 
        expect(smeResponseFaultAction).toContainData(faultReported.faultActionSMEResponse);
        commonFunction.scrollToElement(commonFunction.getElementByCssContainingText('ion-button', faultReported.negativeResponseSME));
        let responseSelectedSME = commonFunction.updateVerificationObjectByAttrib(commonFunction.getElementByCssContainingText('ion-button', faultReported.negativeResponseSME), "Submitted Response SME", "color");
        expect(responseSelectedSME).toContainData(faultReported.smeSubmittedResponse);
        commonFunction.scrollToElement(this.nextStepTxt);
        let nextStepText = commonFunction.updateVerificationObject(this.nextStepTxt, "Next Step after repair not completed response - SME"); 
        expect(nextStepText).toContainData(faultReported.nextStepSMEResponse);       
    } 
    
    this.checkACDetails = function(faultReported){
        commonFunction.waitForElementToBeVisible(this.faultTitle, "Fault title");
        commonFunction.scrollToElement(this.acViewBtn);
        commonFunction.clickOnElement(this.acViewBtn, "Appliance Cover View button");
        commonFunction.checkOptionData('tbody[formarrayname="propertyCertificateList"] > tr:nth-child(2) > td', faultReported.acColumns, faultReported.acRowData, true, "AC Table");
        commonFunction.clickOnElement(this.firstACRecord, "First Appliance Cover record");
        commonFunction.checkOptionData('ion-grid.details-section ion-col', faultReported.acFields, faultReported.acDetails, true, "AC Details");
        commonFunction.clickOnElement(this.acDetailsCloseBtn, "AC Details Close button");
    }    
     
    this.changeRepairToLLOwnRepair = function(faultReported){
        let fSummary = new faultSummary(faultReported);
        commonFunction.waitForElementToBeVisible(this.faultTitle, "Fault title");
        commonFunction.scrollToElement(this.acYesBtn);
        commonFunction.clickOnElement(this.acYesBtn, 'Appliance Cover Yes button');
        commonFunction.clickOnElement(this.acViewBtn, "Appliance Cover View button");
        commonFunction.waitForElementToBeVisible(this.acDetailsCloseBtn);
        commonFunction.clickOnElement(this.firstACRecord, "First Appliance Cover record");
        commonFunction.clickOnElement(this.acDetailsCloseBtn, "Appliance Cover Close button");
        commonFunction.scrollToElement(this.proceedBtn);
        commonFunction.clickOnElement(this.proceedBtn, "Proceed button");
        commonFunction.clickOnElement(fSummary.confirmationOKBtn, "Appliance Cover Repair confirmation OK button");
        commonFunction.waitForElementToBeVisible(this.faultActionStatus, "Fault action status");        
        commonFunction.scrollToElement(fSummary.faultStatus);
        let smeFaultStatus = commonFunction.updateVerificationObject(fSummary.faultStatus, "Fault Status after Appliance Cover repair is chosen"); 
        expect(smeFaultStatus).toContainData(faultReported.faultStatusSME);        
        commonFunction.scrollToElement(commonFunction.getElementByCssContainingText('h6','Want to proceed in a different way?'));
        commonFunction.checkVisibleData('ion-button', faultReported.differentWayOptions, true, "Different way repair option is");
        commonFunction.scrollToElement(commonFunction.getElementByCssContainingText('ion-button',faultReported.differentRepair));
        commonFunction.clickOnElement(commonFunction.getElementByCssContainingText('ion-button',faultReported.differentRepair), faultReported.differentRepair);
        commonFunction.scrollToElement(this.proceedBtn);
        commonFunction.clickOnElement(this.proceedBtn, "Proceed button");
        let diffRepairConfirmMsg1 = commonFunction.updateVerificationObject(fSummary.confirmationMessage, "Different Repair Confirmation Message"); 
        expect(diffRepairConfirmMsg1).toContainData(faultReported.diffRepairConfirmationMsg1);
        commonFunction.clickOnElement(fSummary.confirmationOKBtn, "Different repair confirmation OK button");
        commonFunction.waitForElementToBeVisible(this.faultActionStatus, "Fault action status");
        commonFunction.scrollToElement(fSummary.faultStatus);
        let cliFaultStatus = commonFunction.updateVerificationObject(fSummary.faultStatus, "Fault Status after reaching to CLI stage"); 
        expect(cliFaultStatus).toContainData(faultReported.cliUpdatedStatus); 
        commonFunction.scrollToElement(this.faultActionStatus);
        commonFunction.checkVisibleData('ion-button', faultReported.cliOptions, true, "CLI repair option is");
        commonFunction.scrollToElement(commonFunction.getElementByCssContainingText('ion-button', faultReported.cliAction));
        commonFunction.clickOnElement(commonFunction.getElementByCssContainingText('ion-button', faultReported.cliAction), faultReported.cliAction);
        commonFunction.scrollToElement(this.proceedBtn);
        commonFunction.clickOnElement(this.proceedBtn, "Proceed button");
        let llRepairConfirmationMsg1 = commonFunction.updateVerificationObject(fSummary.confirmationMessage, "LL Own Repair Confirmation Message1"); 
        expect(llRepairConfirmationMsg1).toContainData(faultReported.cliOwnRepairConfirmMsg1);
        let llRepairConfirmationMsg2 = commonFunction.updateVerificationObject(fSummary.confirmationMessage, "LL Own Repair Confirmation Message2"); 
        expect(llRepairConfirmationMsg2).toContainData(faultReported.cliOwnRepairConfirmMsg2);
        commonFunction.clickOnElement(fSummary.confirmationOKBtn, "Proceed to LL Own Repair confirmation OK button");
        commonFunction.waitForElementToBeVisible(this.faultActionStatus, "Fault action status");
        commonFunction.scrollToElement(fSummary.faultStatus);      
        let lrleFaultStatus = commonFunction.updateVerificationObject(fSummary.faultStatus, "Fault Status after selecting CLI action LL Own Repair"); 
        expect(lrleFaultStatus).toContainData(faultReported.faultStatusLRLE);
        commonFunction.scrollToElement(this.faultActionStatus);
        commonFunction.scrollToElement(this.responseQuestion);
        commonFunction.scrollToElement(commonFunction.getElementByCssContainingText('ion-button', faultReported.positiveResponseLRLE));
        commonFunction.clickOnElement(commonFunction.getElementByCssContainingText('ion-button', faultReported.positiveResponseLRLE), faultReported.positiveResponseLRLE);
        commonFunction.clickOnElement(fSummary.confirmationOKBtn, "Work In Progress confirmation OK button");
        commonFunction.waitForElementToBeVisible(this.faultActionStatus, "Fault action status");
        commonFunction.scrollToElement(fSummary.faultStatus);
        let lrleResponseFaultStatus = commonFunction.updateVerificationObject(fSummary.faultStatus, "Fault Status after landlord response to LRLE"); 
        expect(lrleResponseFaultStatus).toContainData(faultReported.faultStatusAfterLRLE);
        commonFunction.scrollToElement(this.faultActionStatus);
        commonFunction.scrollToElement(commonFunction.getElementByCssContainingText('ion-button', faultReported.positiveResponseLRLE));
        commonFunction.scrollToElement(commonFunction.getElementByCssContainingText('ion-button', "Add Contractor Details"));
        commonFunction.clickOnElement(commonFunction.getElementByCssContainingText('ion-button',  "Add Contractor Details"),  "Add Contractor Details button");
        commonFunction.waitForElementToBeVisible(this.ccCompnay, "Add Contractor Details popup");
        commonFunction.sendKeysInto(this.ccCompnay, faultReported.ccCompany);
        commonFunction.sendKeysInto(this.ccName, faultReported.ccName);
        let rNo1 = Math.floor((Math.random() * 100000) + 1);
        let rNo2 = Math.floor((Math.random() * 10000) + 1);
        let telephone = parseInt(faultReported.ccTelephone, 10);
        commonFunction.sendKeysInto(this.ccTelephone, (telephone + rNo1 + rNo2).toString());
        commonFunction.clickOnElement(this.dateTimeTypeList, "Date/Time Type list");
        commonFunction.clickOnElement(this.dateTimeType, "Date/Time Type option");
        commonFunction.clickOnElement(this.dateTimeBtnLLContractor, "Date/Time Picker");
        commonFunction.setDate(faultReported.visitDateValue);
        commonFunction.scrollToElement(this.ccConsentCheckbox);
        commonFunction.clickOnElement(this.ccConsentCheckbox, "Contractor consent checkbox");
        commonFunction.clickOnElement(commonFunction.getElementByCssContainingText('ion-button',  "SAVE"),  "SAVE button");
        commonFunction.waitForElementToBeVisible(this.faultActionStatus, "Fault action status");
        commonFunction.scrollToElement(fSummary.faultStatus);
        let lcleFaultStatus = commonFunction.updateVerificationObject(fSummary.faultStatus, "Fault Status after visit time scheduled"); 
        expect(lcleFaultStatus).toContainData(faultReported.faultStatusLCLE);
        commonFunction.scrollToElement(this.faultActionStatus);
        commonFunction.scrollToElement(this.responseQuestion);
        commonFunction.scrollToElement(commonFunction.getElementByCssContainingText('ion-button', faultReported.positiveResponseLCLE));
        commonFunction.clickOnElement(commonFunction.getElementByCssContainingText('ion-button', faultReported.positiveResponseLCLE), faultReported.positiveResponseLCLE);
        commonFunction.waitForElementToBeVisible(this.markJobCompletePopupTxt, "Mark Job Complete popup");
        let jobCompletePopupText = commonFunction.updateVerificationObject(this.markJobCompletePopupTxt, "Mark Job Complete popup text"); 
        expect(jobCompletePopupText).toContainData(faultReported.markJobCompleteTxt);
        commonFunction.clickOnElement(this.dateTimeBtn, "Date time picker");
        commonFunction.setDate(faultReported.jobCompleteDateValue);
        commonFunction.clickOnElement(commonFunction.getElementByCssContainingText('ion-button','YES'), "Mark Job Complete popup Yes button");
        commonFunction.waitForElementToBeVisible(this.faultActionStatus, "Fault action status");
        commonFunction.scrollToElement(fSummary.faultStatus);
        let lfteFaultStatus = commonFunction.updateVerificationObject(fSummary.faultStatus, "Fault Status after job is completed"); 
        expect(lfteFaultStatus).toContainData(faultReported.faultStatusLFTE);
        commonFunction.scrollToElement(this.faultActionStatus);
        commonFunction.scrollToElement(this.responseQuestion);
        commonFunction.scrollToElement(commonFunction.getElementByCssContainingText('ion-button', faultReported.positiveResponseLFTE));
        commonFunction.clickOnElement(commonFunction.getElementByCssContainingText('ion-button', faultReported.positiveResponseLFTE), faultReported.positiveResponseLFTE);
        let tenantSatisfyConfirmationMsg = commonFunction.updateVerificationObject(fSummary.confirmationMessage, "Tenant satisfied and fault closure Confirmation Message"); 
        expect(tenantSatisfyConfirmationMsg).toContainData(faultReported.tenantSatisfyConfirmationMsg);
        commonFunction.clickOnElement(fSummary.confirmationOKBtn, "Tenant satisfied and fault closure confirmation OK button");
        commonFunction.waitForElementToBeVisible(this.faultActionStatus, "Fault action status");
        commonFunction.scrollToElement(this.faultActionStatus);
        commonFunction.scrollToElement(this.displayedReason);
        let closeReasonDisplayed = commonFunction.updateVerificationObject(this.displayedReason, "Fault closure reason"); 
        expect(closeReasonDisplayed).toContainData(faultReported.faultCloseReason);  
        commonFunction.scrollToElement(fSummary.faultStatus);
        let lfteResponseFaultStatus = commonFunction.updateVerificationObject(fSummary.faultStatus, "Fault Status after tenant is satisfied"); 
        expect(lfteResponseFaultStatus).toContainData(faultReported.faultStatusAfterLFTE);
    }
}
module.exports = ApplianceCover;
