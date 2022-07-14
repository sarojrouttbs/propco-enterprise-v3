var commonUtil = require('../../util/common.util.page');
var commonFunction = new commonUtil();
var faultSummary = require('../igf-logfault/fault.summary.page');

var BlockManagement = function (faultDetails) {
    
    /**
     * Locators for elements used in 'Block Management Repair' functionality
     */ 
    
    this.bmYesBtn = element(by.xpath("//ion-radio-group[@formcontrolname='isUnderBlockManagement']//ion-label[contains(text(),'Yes')]/preceding-sibling::ion-radio"));
    this.bmNoBtn = element(by.xpath("//ion-radio-group[@formcontrolname='isUnderBlockManagement']//ion-label[contains(text(),'No')]/preceding-sibling::ion-radio"));
    this.bmViewBtn = element(by.xpath("//h3[contains(text(), 'Block Management')]/following-sibling::ion-row//ion-button")); 
    this.bmDetailsCloseBtn = element(by.xpath("//app-block-management-modal//ion-button")); 
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
    this.actionAfterBMFTE = element(by.xpath("//app-close-fault//h3"));
    this.displayedReason = element(by.xpath("//app-close-fault//h5"));
    
    this.completeRepair = function(faultReported){
        let fSummary = new faultSummary(faultReported);
        commonFunction.waitForElementToBeVisible(this.faultTitle, "Fault title");
        commonFunction.scrollToElement(this.bmYesBtn);
        commonFunction.clickOnElement(this.bmYesBtn, 'Block Management Yes button');
        commonFunction.scrollToElement(this.proceedBtn);
        commonFunction.clickOnElement(this.proceedBtn, "Proceed button");
        let bmConfirmationMsg = commonFunction.updateVerificationObject(fSummary.confirmationMessage, "Block Management Repair Confirmation Message"); 
        expect(bmConfirmationMsg).toContainData(faultReported.bmRepairConfirmMsg);
        commonFunction.clickOnElement(fSummary.confirmationOKBtn, "Block Management Repair confirmation OK button");
        commonFunction.waitForElementToBeVisible(this.faultActionStatus, "Fault action status");        
        commonFunction.scrollToElement(fSummary.faultStatus);
        let bmeFaultStatus = commonFunction.updateVerificationObject(fSummary.faultStatus, "Fault Status after Block Management repair is chosen"); 
        expect(bmeFaultStatus).toContainData(faultReported.faultStatusBME); 
        commonFunction.scrollToElement(this.faultActionStatus);           
        let bmeFaultAction = commonFunction.updateVerificationObject(this.faultActionStatus, "Fault Action after Block Management repair is chosen"); 
        expect(bmeFaultAction).toContainData(faultReported.faultActionBME);
        commonFunction.scrollToElement(this.responseQuestion);
        let bmeFaultActionQuestion = commonFunction.updateVerificationObject(this.responseQuestion, "BME - Question which requires an action"); 
        expect(bmeFaultActionQuestion).toContainData(faultReported.faultActionBMEQuestion); 
        commonFunction.scrollToElement(this.bmViewBtn);
        commonFunction.clickOnElement(this.bmViewBtn, "Block Management View button");
        commonFunction.waitForElementToBeVisible(this.bmDetailsCloseBtn);
        let bmDetailsPopupTitle = commonFunction.updateVerificationObject(this.popupTitle, "Block Management Details popup title"); 
        expect(bmDetailsPopupTitle).toContainData(faultReported.bmDetailsPopupTitle); 
        commonFunction.clickOnElement(this.bmDetailsCloseBtn, "Block Management Details close button");
        commonFunction.scrollToElement(commonFunction.getElementByCssContainingText('ion-button', faultReported.positiveResponseBME));
        commonFunction.clickOnElement(commonFunction.getElementByCssContainingText('ion-button', faultReported.positiveResponseBME), faultReported.positiveResponseBME);
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
        let bmfteFaultStatus = commonFunction.updateVerificationObject(fSummary.faultStatus, "Fault Status after job is completed"); 
        expect(bmfteFaultStatus).toContainData(faultReported.faultStatusBMFTE);
        commonFunction.scrollToElement(this.faultActionStatus);
        let bmfteFaultAction = commonFunction.updateVerificationObject(this.faultActionStatus, "Fault Action after job is completed BMFTE"); 
        expect(bmfteFaultAction).toContainData(faultReported.faultActionBMFTE);
        commonFunction.scrollToElement(this.responseQuestion);
        let bmfteFaultActionQuestion = commonFunction.updateVerificationObject(this.responseQuestion, "Question which requires an action BMFTE"); 
        expect(bmfteFaultActionQuestion).toContainData(faultReported.faultActionBMFTEQuestion);
        commonFunction.scrollToElement(commonFunction.getElementByCssContainingText('ion-button', faultReported.positiveResponseBMFTE));
        commonFunction.clickOnElement(commonFunction.getElementByCssContainingText('ion-button', faultReported.positiveResponseBMFTE), faultReported.positiveResponseBMFTE);
        let tenantSatisfyConfirmationMsg = commonFunction.updateVerificationObject(fSummary.confirmationMessage, "Tenant satisfied and fault closure Confirmation Message"); 
        expect(tenantSatisfyConfirmationMsg).toContainData(faultReported.tenantSatisfyConfirmationMsg);
        commonFunction.clickOnElement(fSummary.confirmationOKBtn, "Tenant satisfied and fault closure confirmation OK button");
        commonFunction.waitForElementToBeVisible(this.faultActionStatus, "Fault action status");
        commonFunction.scrollToElement(this.faultActionStatus);
        let bmfteResponseFaultAction = commonFunction.updateVerificationObject(this.faultActionStatus, "Fault Action after tenant is satisfied"); 
        expect(bmfteResponseFaultAction).toContainData(faultReported.faultActionAfterBMFTE);
        let bmfteResponseNextAction = commonFunction.updateVerificationObject(this.actionAfterBMFTE, "Next Action after tenant is satisfied"); 
        expect(bmfteResponseNextAction).toContainData(faultReported.faultNextActionAfterBMFTE);
        commonFunction.scrollToElement(this.displayedReason);
        let closeReasonDisplayed = commonFunction.updateVerificationObject(this.displayedReason, "Fault closure reason"); 
        expect(closeReasonDisplayed).toContainData(faultReported.faultCloseReason);  
        commonFunction.scrollToElement(fSummary.faultStatus);
        let bmfteResponseFaultStatus = commonFunction.updateVerificationObject(fSummary.faultStatus, "Fault Status after tenant is satisfied"); 
        expect(bmfteResponseFaultStatus).toContainData(faultReported.faultStatusAfterBMFTE);
    } 

    this.notCompletedRepair = function(faultReported){
        let fSummary = new faultSummary(faultReported);
        commonFunction.waitForElementToBeVisible(this.faultTitle, "Fault title");
        commonFunction.scrollToElement(this.bmYesBtn);
        commonFunction.clickOnElement(this.bmYesBtn, 'Block Management Yes button');
        commonFunction.scrollToElement(this.proceedBtn);
        commonFunction.clickOnElement(this.proceedBtn, "Proceed button");
        commonFunction.clickOnElement(fSummary.confirmationOKBtn, "Block Management Repair confirmation OK button");
        commonFunction.waitForElementToBeVisible(this.faultActionStatus, "Fault action status");        
        commonFunction.scrollToElement(fSummary.faultStatus);
        let bmeFaultStatus = commonFunction.updateVerificationObject(fSummary.faultStatus, "Fault Status after Block Management repair is chosen"); 
        expect(bmeFaultStatus).toContainData(faultReported.faultStatusBME); 
        commonFunction.scrollToElement(commonFunction.getElementByCssContainingText('ion-button', faultReported.negativeResponseBME));
        commonFunction.clickOnElement(commonFunction.getElementByCssContainingText('ion-button', faultReported.negativeResponseBME), faultReported.negativeResponseBME);
        let repairNotCompleteConfirmationMsg = commonFunction.updateVerificationObject(fSummary.confirmationMessage, "Block Management Repair not completed confirmation message"); 
        expect(repairNotCompleteConfirmationMsg).toContainData(faultReported.repairNotCompleteConfirmMsg);
        commonFunction.clickOnElement(fSummary.confirmationOKBtn, "Block Management Repair not completed confirmation OK button");
        commonFunction.waitForElementToBeVisible(this.faultActionStatus, "Fault action status"); 
        commonFunction.scrollToElement(fSummary.faultStatus);
        let faultStatusRepairNotComplete = commonFunction.updateVerificationObject(fSummary.faultStatus, "Fault Status after repair not completed by Block Management"); 
        expect(faultStatusRepairNotComplete).toContainData(faultReported.faultStatusNegativeBMEResponse); 
        commonFunction.scrollToElement(this.faultActionStatus);
        let bmeResponseFaultAction = commonFunction.updateVerificationObject(this.faultActionStatus, "Fault Action after repair not completed by Block Management"); 
        expect(bmeResponseFaultAction).toContainData(faultReported.faultActionBMEResponse);
        commonFunction.scrollToElement(commonFunction.getElementByCssContainingText('ion-button', faultReported.negativeResponseBME));
        let responseSelectedBME = commonFunction.updateVerificationObjectByAttrib(commonFunction.getElementByCssContainingText('ion-button', faultReported.negativeResponseBME), "Submitted Response BME", "color");
        expect(responseSelectedBME).toContainData(faultReported.bmeSubmittedResponse);
        commonFunction.scrollToElement(this.nextStepTxt);
        let nextStepText = commonFunction.updateVerificationObject(this.nextStepTxt, "Next Step after repair not completed response - BME"); 
        expect(nextStepText).toContainData(faultReported.nextStepBMEResponse);       
    } 
    
    this.checkBMDetails = function(faultReported){
        commonFunction.waitForElementToBeVisible(this.faultTitle, "Fault title");
        commonFunction.scrollToElement(this.bmViewBtn);
        commonFunction.clickOnElement(this.bmViewBtn, "Block Management View button");
        commonFunction.checkOptionData('ion-text', faultReported.bmFields, faultReported.bmDetails, true, "BM Details");
        commonFunction.checkVisibleData('ion-text',faultReported.bmRepairCoverage, true, "BM covers");
        commonFunction.clickOnElement(this.bmDetailsCloseBtn, "BM Details Close button");
    }    
     
    this.changeRepairToLLOwnRepair = function(faultReported){
        let fSummary = new faultSummary(faultReported);
        commonFunction.waitForElementToBeVisible(this.faultTitle, "Fault title");
        commonFunction.scrollToElement(this.bmYesBtn);
        commonFunction.clickOnElement(this.bmYesBtn, 'Block Management Yes button');
        commonFunction.scrollToElement(this.proceedBtn);
        commonFunction.clickOnElement(this.proceedBtn, "Proceed button");
        commonFunction.clickOnElement(fSummary.confirmationOKBtn, "Block Management Repair confirmation OK button");
        commonFunction.waitForElementToBeVisible(this.faultActionStatus, "Fault action status");        
        commonFunction.scrollToElement(fSummary.faultStatus);
        let bmeFaultStatus = commonFunction.updateVerificationObject(fSummary.faultStatus, "Fault Status after Block Management repair is chosen"); 
        expect(bmeFaultStatus).toContainData(faultReported.faultStatusBME);        
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
module.exports = BlockManagement;