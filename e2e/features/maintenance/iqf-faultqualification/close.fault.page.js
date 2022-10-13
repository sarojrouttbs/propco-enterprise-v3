var commonUtil = require('../../../util/common.util.page');
var commonFunction = new commonUtil();
var fault = require('../igf-logfault/add.fault.page');
var faultSummary = require('../igf-logfault/fault.summary.page');
var mergeFault = require('../igf-logfault/merge.fault.page');

var CloseFault = function (faultDetails) {
    
    /**
     * Locators for elements used in 'Close Fault' functionality
     */ 
    
    this.closeReasonList = element(by.xpath("//ion-select[contains(@formcontrolname, 'closedReason')]"));
    this.closeReason1 = element(by.xpath("//ion-label[contains(text(), '" + faultDetails.closeReason1 + "')]/following-sibling::ion-radio"));
    this.closeReason2 = element(by.xpath("//ion-label[contains(text(), '" + faultDetails.closeReason2 + "')]/following-sibling::ion-radio"));
    this.closeReason = element(by.xpath("//ion-label[contains(text(), '" + faultDetails.closeReason + "')]/following-sibling::ion-radio"));
    this.closeReasonDetails = element(by.xpath("//ion-textarea[contains(@formcontrolname, 'otherReason')]/div/textarea"));
    this.closeReasonError = element(by.xpath("//ion-select[contains(@formcontrolname, 'closedReason')]/../following-sibling::app-validation-message/div"));
    this.closeReasonDetailsError = element(by.xpath("//ion-textarea[contains(@formcontrolname, 'otherReason')]/../following-sibling::app-validation-message/div"));

    this.faultRef = element(by.xpath("(//h2[contains(text(), '" + faultDetails.category + "')])[2]/ion-text[1]"));
    this.reasonPopover = element(by.xpath("//ion-select-popover"));
    this.proceedBtn = element(by.xpath("//ion-button[contains(text(),  'Proceed') and contains(@class, 'submit-button')]"));
    this.cancelBtn = element(by.xpath("//ion-button[contains(text(),  'Proceed') and contains(@class, 'submit-button')]/preceding-sibling::ion-button[3]"));
    this.faultActionStatus = element(by.css("div.banner > h2.banner-heading")); 
  
    this.faultTitle = element(by.xpath("(//h2[contains(text(), '" + faultDetails.title + "')])[2]")); 
    this.actionAfterLFTE = element(by.xpath("//app-close-fault//h3"));
    this.displayedReason = element(by.xpath("//app-close-fault//h5"));
    
    this.completeFaultClosure = function(faultReported){
        let addFault = new fault(faultReported); 
        let fSummary = new faultSummary(faultReported);
        commonFunction.waitForElementToBeVisible(this.faultTitle, "Fault title");
        commonFunction.scrollToElement(commonFunction.getElementByCssContainingText('ion-button', 'Close Fault'));
        commonFunction.clickOnElement(commonFunction.getElementByCssContainingText('ion-button', 'Close Fault'), 'Close Fault button');
        commonFunction.clickOnElement(commonFunction.getElementByCssContainingText('ion-button', 'SUBMIT'), 'Submit button');
        let reasonErrorMsg = commonFunction.updateVerificationObject(this.closeReasonError, "Close Reason Error Message"); 
        expect(reasonErrorMsg).toContainData(faultReported.errorMessage);
        commonFunction.clickOnElement(this.closeReasonList, "Close Reason list");
        commonFunction.waitForElementToBeVisible(this.reasonPopover, "Reason List");
        commonFunction.checkVisibleData('ion-label', faultReported.closeReasonOptions, true, "Close Reason option is");
        commonFunction.clickOnElement(this.closeReason1, faultReported.closeReason1);
        commonFunction.clickOnElement(commonFunction.getElementByCssContainingText('ion-button', 'SUBMIT'), 'Submit button');
        reasonErrorMsg = commonFunction.updateVerificationObject(this.closeReasonDetailsError, "Close Reason Error Message"); 
        expect(reasonErrorMsg).toContainData(faultReported.errorMessage);
        commonFunction.clickOnElement(this.closeReasonList, "Close Reason list");
        commonFunction.clickOnElement(this.closeReason2, faultReported.closeReason2);
        commonFunction.clickOnElement(commonFunction.getElementByCssContainingText('ion-button', 'SUBMIT'), 'Submit button');
        reasonErrorMsg = commonFunction.updateVerificationObject(this.closeReasonDetailsError, "Close Reason Error Message"); 
        expect(reasonErrorMsg).toContainData(faultReported.errorMessage);
        commonFunction.clickOnElement(this.closeReasonList, "Close Reason list");
        commonFunction.clickOnElement(this.closeReason, faultReported.closeReason);
        commonFunction.clickOnElement(commonFunction.getElementByCssContainingText('ion-button', 'SUBMIT'), 'Submit button');
        commonFunction.waitForElementToBeVisible(this.faultActionStatus, "Fault action status");
        commonFunction.scrollToElement(fSummary.faultStatus);
        let closeResponseFaultStatus = commonFunction.updateVerificationObject(fSummary.faultStatus, "Fault Status after fault is closed"); 
        expect(closeResponseFaultStatus).toContainData(faultReported.faultStatusAfterClosure);  
        commonFunction.scrollToElement(this.faultActionStatus);
        let closeResponseFaultAction = commonFunction.updateVerificationObject(this.faultActionStatus, "Fault Action after fault is closed"); 
        expect(closeResponseFaultAction).toContainData(faultReported.faultActionAfterClosure);
        let closeResponseNextAction = commonFunction.updateVerificationObject(this.actionAfterLFTE, "Next Action after fault is closed"); 
        expect(closeResponseNextAction).toContainData(faultReported.faultNextActionAfterClosure);
        commonFunction.scrollToElement(this.displayedReason);
        let closeReasonDisplayed = commonFunction.updateVerificationObject(this.displayedReason, "Fault closure reason"); 
        expect(closeReasonDisplayed).toContainData(faultReported.faultCloseReason);  
        commonFunction.scrollToElement(this.proceedBtn);
        let proceedBtnStatus = commonFunction.updateVerificationObjectByAttrib(this.proceedBtn, "Proceed button disabled", "aria-disabled");
        expect(proceedBtnStatus).toContainData(faultReported.proceedBtnStatus);  
        commonFunction.scrollToElement(this.faultRef);
        let faultId = this.faultRef.getText().then(function(text){return text});
        commonFunction.scrollToElement(this.cancelBtn);   
        commonFunction.clickOnElement(this.cancelBtn, "Cancel button");
        commonFunction.waitForElementToBeVisible(addFault.actionBtn, "Action button for first fault"); 
        this.checkClosedFault(faultReported, faultId);            
    }

    this.checkClosedFault = function(faultReported, faultId){
        let addFault = new fault(faultReported); 
        let merge = new mergeFault(faultReported);
        commonFunction.waitForElementToBeVisible(addFault.actionBtn, "Action button for first fault"); 
        merge.searchFaultByIdAddress(faultId);
        let searchedFaultObj = commonFunction.updateVerificationObject(merge.firstRowTbl, "Searched Fault without Closed filter"); 
        expect(searchedFaultObj).toContainData(faultReported.searchedVisibleFault);
        commonFunction.clickOnElement(merge.resetFilterBtn, "Reset Filter button");
        commonFunction.waitForElementToBeVisible(merge.firstRowTbl, "Table First Row");
        merge.searchByMoreFilter(faultReported.moreFilterType1, faultReported.moreFilterType1Value);
        merge.searchFaultByIdAddress(faultId);
        let tblFaultId = commonFunction.updateVerificationObject(addFault.faultUrgencyTbl, "Id in Fault Table"); 
        expect(tblFaultId).toContainData(faultId); 
        let tblStatus = commonFunction.updateVerificationObject(addFault.faultStatusTbl, "Status in Fault Table"); 
        expect(tblStatus).toContainData(faultReported.faultStatusAfterClosure);
    }

    this.closeFault = function(faultReported, from){
        let addFault = new fault(faultReported);
        let merge = new mergeFault(faultReported);
        switch(from){
            case "fault":
                commonFunction.scrollToElement(commonFunction.getElementByCssContainingText('ion-button', 'Close Fault'));
                commonFunction.clickOnElement(commonFunction.getElementByCssContainingText('ion-button', 'Close Fault'), 'Close Fault button');
                commonFunction.waitForElementToBeVisible(merge.popupTitle, "Popup Message");
                break;
            case "dashboard":
                commonFunction.clickOnElement(addFault.actionBtn, "Action button of first fault");
                commonFunction.clickOnElement(merge.closeBtn, "Close button");
                commonFunction.waitForElementToBeVisible(merge.popupTitle, "Popup Message");
                break;
            default:
                break;                   
        }
        commonFunction.selectFromDropDown(this.closeReasonList, this.closeReason, "Close Reason List", faultReported.closeReason);
        if(faultReported.closeReason.includes("Other") || faultReported.closeReason.includes("Internal use")){
           commonFunction.sendKeysInto(this.closeReasonDetails, faultReported.closeDetails);
        }
        commonFunction.clickOnElement(commonFunction.getElementByCssContainingText('ion-button', 'SUBMIT'), 'Submit button');      
    }

    this.completeFaultClosureFromDashboard = function(faultReported){
        let addFault = new fault(faultReported);
        let merge = new mergeFault(faultReported);
        commonFunction.waitForElementToBeVisible(addFault.issueIdTbl, "First Fault Issue");
        let faultId = addFault.faultUrgencyTbl.getText().then(function(text){return text});
        merge.searchFaultByIdAddress(faultId);
        commonFunction.clickOnElement(addFault.actionBtn, "Action button of first fault");
        commonFunction.clickOnElement(merge.closeBtn, "Close button");
        commonFunction.waitForElementToBeVisible(merge.popupTitle, "Popup Message");
        commonFunction.clickOnElement(this.closeReasonList, "Close Reason list");
        commonFunction.waitForElementToBeVisible(this.reasonPopover, "Reason List");
        commonFunction.checkVisibleData('ion-label', faultReported.closeReasonOptions, true, "Close Reason option is");
        commonFunction.clickOnElement(this.closeReason1, "Close Reason1");
        commonFunction.clickOnElement(commonFunction.getElementByCssContainingText('ion-button', 'CANCEL'), 'CANCEL button');
        commonFunction.clickOnElement(commonFunction.getElementByCssContainingText('ion-button', 'Yes'), 'Yes button');
        commonFunction.waitForElementToBeVisible(addFault.issueIdTbl, "First Fault Issue");
        commonFunction.clickOnElement(commonFunction.getElementByCssContainingText('ion-button', 'Reset Filters'), 'Reset Filters button');
        commonFunction.waitForElementToBeVisible(addFault.issueIdTbl, "First Fault Issue");
        merge.searchFaultByIdAddress(faultId);
        this.closeFault(faultReported, "dashboard");
        commonFunction.waitForElementToBeVisible(merge.firstRowTbl, "Table First Row");
        commonFunction.clickOnElement(commonFunction.getElementByCssContainingText('ion-button', 'Reset Filters'), 'Reset Filters button');
        this.checkClosedFault(faultReported, faultId);          
    }
}
module.exports = CloseFault;
