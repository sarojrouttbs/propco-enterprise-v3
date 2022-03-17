var commonUtil = require('../../util/common.util.page');
var commonFunction = new commonUtil();
var fault = require('./add.fault.page');
var faultSummary = require('./fault.summary.page');

var FaultEscalate = function () {
    
    /**
     * Locators for elements used in 'Fault Escalate/De-Escalate' functionality
     */ 

    this.escalateBtn = element(by.xpath("//ion-button[contains(text(), 'Escalate')]"));
    this.deEscalateBtn = element(by.xpath("//ion-button[contains(text(), 'De-Escalate')]"));
    this.popupCloseBtn = element(by.css("ion-buttons.buttons-last-slot"));
    this.popupMessage = element(by.css("h5"));
    this.popupTitle = element(by.css("ion-title.title-default"));
    this.popupEscalationReason = element(by.xpath("//ion-textarea[@formcontrolName = 'escalationReason']/div/textarea")); 
    this.popupYesBtn = element(by.xpath("//ion-button[contains(text(), 'Yes')]"));
    this.popupNoBtn = element(by.css("ion-button.cancel-button"));
    this.popupReasonError = element(by.css("div.error-message"));
    this.popupNoConfirmMessage = element(by.css('div.ion-padding-top'));
    this.popupConfirmMessageYesBtn = element(by.xpath("//ion-button[contains(text(), 'Yes')]"));
    this.popupConfirmMessageNoBtn = element(by.xpath("//ion-button[contains(text(), 'No') and contains(@color, 'danger')]"));

    this.faultTableFirstRow = element(by.xpath("//table[@id='faultListTable']/tbody/tr[1]"));
    this.notesEmptyTbl = element(by.xpath("//table[contains(@id, 'DataTables')]/tbody/tr/td"));   
           
    this.escalateFault = function(faultReported){
        let addFault = new fault(faultReported); 
        let fSummary = new faultSummary(faultReported);
        commonFunction.waitForElementToBeVisible(addFault.actionBtn, "Action button for first fault");
        commonFunction.clickOnElement(addFault.actionBtn, "Action button for first fault");
        commonFunction.clickOnElement(this.escalateBtn, "Escalate button");
        commonFunction.waitForElementToBeVisible(this.popupTitle, "Escalate popup");
        if(faultReported.escalateWindowTitle){
            let title = commonFunction.updateVerificationObject(this.popupTitle, "Escalate popup title"); 
            expect(title).toContainData(faultReported.escalateWindowTitle);                   
        } 
        if(faultReported.confirmationMessage1){
            let confirmMsg = commonFunction.updateVerificationObject(this.popupMessage, "Escalate popup confirmation message1"); 
            expect(confirmMsg).toContainData(faultReported.confirmationMessage1);                      
        } 
        if(faultReported.confirmationMessage2){
            let confirmMsg = commonFunction.updateVerificationObject(this.popupMessage, "Escalate popup confirmation message2"); 
            expect(confirmMsg).toContainData(faultReported.confirmationMessage2);                      
        }             
        if(faultReported.escalationReason){
            commonFunction.sendKeysInto(this.popupEscalationReason, faultReported.escalationReason);
        }
        if(faultReported.escalateAction){
            commonFunction.clickOnElement(this.popupYesBtn, "Escalate popup Yes button");
            commonFunction.waitForElementToBeVisible(fSummary.messageTitle, "Popup Message");
            let msgTitle = commonFunction.updateVerificationObject(fSummary.messageTitle, "Popup Message Title"); 
            expect(msgTitle).toContainData(faultReported.messageTitle);
            let msg = commonFunction.updateVerificationObject(fSummary.confirmationMessage, "Popup Message"); 
            expect(msg).toContainData(faultReported.message); 
            commonFunction.clickOnElement(fSummary.messageOKBtn, "Popup Message OK button");
        } else {
            commonFunction.clickOnElement(this.popupNoBtn, "Popup No button");
            if(faultReported.escalationReason){
               let msg = commonFunction.updateVerificationObject(this.popupNoConfirmMessage, "Popup Cancel Confirm Message"); 
               expect(msg).toContainData(faultReported.popupCancelConfirmMessage);  
               commonFunction.clickOnElement(this.popupConfirmMessageYesBtn, "Popup Cancel Confirm Message Yes button");
            }
            let actionButton = element(by.xpath("//ion-button[contains(text(), 'Start')]/following-sibling::i"));
            commonFunction.clickOnElement(actionButton, "Action button of row 1");
        }       
    }

    this.checkEscalationDetails = function(faultReported){
        let addFault = new fault(faultReported); 
        commonFunction.waitForElementToBeVisible(addFault.actionBtn, "Action button for first fault");
        commonFunction.clickOnElement(addFault.categoryTbl, "Fault Table Category of first row");
        if(("escalateAction" in faultReported && faultReported.escalateAction) || ("deEscalateAction" in faultReported && !faultReported.deEscalateAction)){
           let escalatedFault = commonFunction.updateVerificationObjectByAttrib(this.faultTableFirstRow, "Fault in table", "class");
           expect(escalatedFault).toContainData(faultReported.faultUpdate);
        } else {
            let escalatedFault = commonFunction.updateVerificationObjectByAttrib(this.faultTableFirstRow, "Fault in table", "class");
            expect(escalatedFault).not.toContainData(faultReported.faultUpdate);      
        }        
        let tblStatus = commonFunction.updateVerificationObject(addFault.faultStatusTbl, "Status in Fault Table"); 
        expect(tblStatus).toContainData(faultReported.tableFaultStatus);        
    }

    this.deEscalateFault = function(faultReported){
        let addFault = new fault(faultReported); 
        let fSummary = new faultSummary(faultReported);
        commonFunction.waitForElementToBeVisible(addFault.actionBtn, "Action button for first fault");
        commonFunction.clickOnElement(addFault.actionBtn, "Action button for first fault");
        commonFunction.clickOnElement(this.deEscalateBtn, "De-Escalate button");
        commonFunction.waitForElementToBeVisible(fSummary.messageTitle, "De-Escalate popup");
        if(faultReported.deEscalateWindowTitle){
            let title = commonFunction.updateVerificationObject(fSummary.messageTitle, "De-Escalate popup title"); 
            expect(title).toContainData(faultReported.deEscalateWindowTitle);                     
        }
        if(faultReported.confirmationMessage){
            let confirmMsg = commonFunction.updateVerificationObject(fSummary.confirmationMessage, "De-Escalate popup confirmation message"); 
            expect(confirmMsg).toContainData(faultReported.confirmationMessage);                      
        }   
        if(faultReported.deEscalateAction){
            commonFunction.clickOnElement(fSummary.confirmationOKBtn, "De-Escalate popup Yes button");
            commonFunction.waitForElementToBeVisible(fSummary.messageTitle, "Popup Message");
            let msgTitle = commonFunction.updateVerificationObject(fSummary.messageTitle, "Popup Message Title"); 
            expect(msgTitle).toContainData(faultReported.messageTitle);
            let msg = commonFunction.updateVerificationObject(fSummary.confirmationMessage, "Popup Message"); 
            expect(msg).toContainData(faultReported.message); 
            commonFunction.clickOnElement(fSummary.messageOKBtn, "Popup Message OK button");
        } else {
            commonFunction.clickOnElement(fSummary.confirmationCancelBtn, "De-Escalate popup No button");
            let actionButton = element(by.xpath("//ion-button[contains(text(), 'Start')]/following-sibling::i"));
            commonFunction.clickOnElement(actionButton, "Action button of row 1");
        }      
    }

    this.checkEscalateValidations = function(faultReported){
        let addFault = new fault(faultReported); 
        commonFunction.waitForElementToBeVisible(addFault.actionBtn, "Action button for first fault");
        commonFunction.clickOnElement(addFault.actionBtn, "Action button for first fault");
        commonFunction.clickOnElement(this.escalateBtn, "Escalate button");
        commonFunction.waitForElementToBeVisible(this.popupTitle, "Escalate popup");
        commonFunction.clickOnElement(this.popupYesBtn, "Escalate popup Yes button");
        let reasonError = commonFunction.updateVerificationObject(this.popupReasonError, "Escalation Reason Validation Error");
        expect(reasonError).toContainData(faultReported.escalationReasonError);
    }    
}
module.exports = FaultEscalate;
