var commonUtil = require('../../../util/common.util.page');
var commonFunction = new commonUtil();
var fault = require('../igf-logfault/add.fault.page');
var faultSummary = require('../igf-logfault/fault.summary.page');

var FaultUrgency = function (faultDetails) {
    
    /**
     * Locators for elements used in 'Fault Urgency' functionality
     */ 
    
    this.urgencyHeader = element(by.css("h2.status-pointer"));
    this.urgencyList = element(by.css("ion-list.status-list"));
    this.urgency1Btn = element(by.xpath("//label[text() = '" + faultDetails.urgency1 + "']/.."));
    this.urgency2Btn = element(by.xpath("//label[text() = '" + faultDetails.urgency2 + "']/.."));
    this.urgency3Btn = element(by.xpath("//label[text() = '" + faultDetails.urgency3 + "']/.."));
  
    this.faultRef = element(by.xpath("(//h2[contains(text(), '" + faultDetails.category + "')])[2]/ion-text[1]"));
    this.reasonPopover = element(by.xpath("//ion-select-popover"));
    this.proceedBtn = element(by.xpath("//ion-button[contains(text(),  'Proceed') and contains(@class, 'submit-button')]"));
    this.cancelBtn = element(by.xpath("//ion-button[contains(text(),  'Proceed') and contains(@class, 'submit-button')]/preceding-sibling::ion-button[3]"));
    this.faultTitle = element(by.xpath("(//h2[contains(text(), '" + faultDetails.title + "')])[2]")); 
    
    this.editFaultUrgency = function(faultReported){
        let addFault = new fault(faultReported); 
        let fSummary = new faultSummary(faultReported);
        commonFunction.waitForElementToBeVisible(this.faultTitle, "Fault title");
        commonFunction.scrollToElement(this.urgencyHeader);
        let urgencyHeader = commonFunction.updateVerificationObject(this.urgencyHeader, "Urgency Header after fault creation"); 
        expect(urgencyHeader).toContainData(faultReported.urgencyHeader3);
        commonFunction.clickOnElement(this.urgencyHeader, "Fault Urgency Header");
        commonFunction.waitForElementToBeVisible(this.urgencyList, "Urgency List");
        commonFunction.checkVisibleData('label', faultReported.urgencyOptions, true, "Urgency option is");
        commonFunction.scrollToElement(this.urgency1Btn);
        commonFunction.clickOnElement(this.urgency1Btn, faultReported.urgency1);
        commonFunction.waitForElementToBeVisible(fSummary.messageTitle, "Popup message");
        let urgencyChangeConfirmMsg = commonFunction.updateVerificationObject(fSummary.confirmationMessage, "Change urgency confirmation message"); 
        expect(urgencyChangeConfirmMsg).toContainData(faultReported.urgencyChangeMsg);
        commonFunction.clickOnElement(fSummary.confirmationOKBtn, "Change urgency confirmation OK button");
        commonFunction.waitForElementToBeVisible(this.faultTitle, "Fault title");
        commonFunction.scrollToElement(this.urgencyHeader);
        urgencyHeader = commonFunction.updateVerificationObject(this.urgencyHeader, "Urgency Header after urgency changed to " +faultReported.urgency1); 
        expect(urgencyHeader).toContainData(faultReported.urgencyHeader1);
        commonFunction.scrollToElement(this.cancelBtn);
        commonFunction.clickOnElement(this.cancelBtn, "Cancel button");
        commonFunction.waitForElementToBeVisible(addFault.actionBtn, "Action button for first fault");
        let tblUrgency = commonFunction.updateVerificationObjectByAttrib(addFault.faultUrgencyTbl, "Urgency in Fault Table after urgency changed to " +faultReported.urgency1, "color");
        expect(tblUrgency).toContainData(faultReported.tableUrgency1);
        addFault.viewFault();
        this.changeFaultUrgency(faultReported, faultReported.urgency2);
        commonFunction.scrollToElement(this.urgencyHeader);
        urgencyHeader = commonFunction.updateVerificationObject(this.urgencyHeader, "Urgency Header after urgency changed to " +faultReported.urgency2); 
        expect(urgencyHeader).toContainData(faultReported.urgencyHeader2);
        commonFunction.scrollToElement(this.cancelBtn);
        commonFunction.clickOnElement(this.cancelBtn, "Cancel button");
        commonFunction.waitForElementToBeVisible(addFault.actionBtn, "Action button for first fault");
        tblUrgency = commonFunction.updateVerificationObjectByAttrib(addFault.faultUrgencyTbl, "Urgency in Fault Table after urgency changed to " +faultReported.urgency2, "color");
        expect(tblUrgency).toContainData(faultReported.tableUrgency2);
        addFault.viewFault();
        this.changeFaultUrgency(faultReported, faultReported.urgency3);
        commonFunction.scrollToElement(this.urgencyHeader);
        urgencyHeader = commonFunction.updateVerificationObject(this.urgencyHeader, "Urgency Header after urgency changed to " +faultReported.urgency3); 
        expect(urgencyHeader).toContainData(faultReported.urgencyHeader3);
        commonFunction.scrollToElement(this.cancelBtn);
        commonFunction.clickOnElement(this.cancelBtn, "Cancel button");
        commonFunction.waitForElementToBeVisible(addFault.actionBtn, "Action button for first fault");
        tblUrgency = commonFunction.updateVerificationObjectByAttrib(addFault.faultUrgencyTbl, "Urgency in Fault Table after urgency changed to " +faultReported.urgency3, "color");
        expect(tblUrgency).toContainData(faultReported.tableUrgency3);                   
    }

    this.changeFaultUrgency = function(faultReported, faultUrgency){
        let fSummary = new faultSummary(faultReported);
        commonFunction.waitForElementToBeVisible(this.faultTitle, "Fault title");
        commonFunction.scrollToElement(this.urgencyHeader);
        commonFunction.clickOnElement(this.urgencyHeader, "Fault Urgency Header");
        commonFunction.waitForElementToBeVisible(this.urgencyList, "Urgency List");
        commonFunction.clickOnElement(element(by.xpath("//label[text() = '" + faultUrgency + "']/..")), faultUrgency);
        commonFunction.waitForElementToBeVisible(fSummary.messageTitle, "Popup message");
        commonFunction.clickOnElement(fSummary.confirmationOKBtn, "Change urgency confirmation OK button");
        commonFunction.waitForElementToBeVisible(this.faultTitle, "Fault title");       
    }    
}
module.exports = FaultUrgency;
