var commonUtil = require('../../util/common.util.page');
var commonFunction = new commonUtil();
var fault = require('./add.fault.page');
var faultSummary = require('./fault.summary.page');

var FaultNote = function (faultDetails) {
    
    /**
     * Locators for elements used in 'Fault Notes' functionality
     */ 

    this.addNoteBtn = element(by.xpath("//ion-button[contains(text(), 'Add Note')]"));
    this.popupCloseBtn = element(by.css("ion-buttons.buttons-last-slot"));
    this.popupTitle = element(by.css("ion-title.title-default"));
    this.popupEnteredOn = element(by.xpath("//ion-datetime[@formcontrolname = 'date']/input"));
    this.popupComplaintBtn = element(by.xpath("//ion-toggle[@formcontrolname = 'complaint']"));
    this.popupCategoryList = element(by.xpath("//ion-select[@formcontrolname = 'category']"));
    this.popupCategoryValue = element(by.xpath("//ion-label[contains(text(), '" + faultDetails.noteCategory + "')]/following-sibling::ion-radio"));
    this.popupTypeList = element(by.xpath("//ion-select[@formcontrolname = 'type']"));
    this.popupTypeValue = element(by.xpath("//ion-label[contains(text(), '" + faultDetails.noteType + "')]/following-sibling::ion-radio"));
    this.popupNotes = element(by.xpath("//ion-textarea[@formcontrolName = 'notes']/div/textarea")); 
    this.popupSubmitBtn = element(by.xpath("//ion-button[contains(text(), 'Submit')]"));
    this.popupNotesError = element(by.css("div.error-message"));

    this.notesEmptyTbl = element(by.xpath("//table[contains(@id, 'DataTables')]/tbody/tr/td"));
    this.notesTblPreviousBtn = element(by.xpath("//a[contains(@id, 'DataTables') and contains(text(), 'Previous')]"));
    this.notesDateTbl = element(by.css("td.dtr-control"));
    this.notesTypeTbl = element(by.xpath("//td[@class = 'dtr-control']/following-sibling::td[2]"));
    this.notesComplaintTbl = element(by.xpath("//td[@class = 'dtr-control']/following-sibling::td[3]"));
    this.notesCategoryTbl = element(by.xpath("//td[@class = 'dtr-control']/following-sibling::td[4]"));
    this.notesUserTbl = element(by.xpath("//td[@class = 'dtr-control']/following-sibling::td[5]"));
    this.notesViewTbl = element(by.xpath("//td[@class = 'dtr-control']/following-sibling::td[6]/i"));

    var noteDate = "";
       
    this.addNote = function(faultReported){
        let addFault = new fault(faultReported); 
        commonFunction.waitForElementToBeVisible(addFault.actionBtn, "Action button for first fault");
        commonFunction.clickOnElement(addFault.actionBtn, "Action button for first fault");
        commonFunction.clickOnElement(this.addNoteBtn, "Add Note button");
        commonFunction.waitForElementToBeVisible(this.popupTitle, "Add Note popup");
        if(faultReported.noteWindowTitle){
            this.popupTitle.getText().then(function(text){
                expect(text).toBeCorrect(faultReported.noteWindowTitle, "Add Note popup title - " + text);                
            });           
        }        
        noteDate = commonFunction.getAttributeValueOfHiddenElement(this.popupEnteredOn, "value").then(function(text){
            let dateArr = text.split("-");
            let noteEntryDate = dateArr[2] + "/" + dateArr[1] + "/" + dateArr[0];
            return noteEntryDate;
        });               
        if(faultReported.complaint.includes("Yes")){
            commonFunction.clickOnElement(this.popupComplaintBtn, "Complaint toggle button");
        }
        if(faultReported.noteCategory){
            commonFunction.selectFromDropDown(this.popupCategoryList, this.popupCategoryValue, "Category List", faultReported.noteCategory);
        }
        if(faultReported.noteType){
            commonFunction.selectFromDropDown(this.popupTypeList, this.popupTypeValue, "Category List", faultReported.noteType);
        }
        if(faultReported.notes){
            commonFunction.sendKeysInto(this.popupNotes, faultReported.notes);
        }
        if(faultReported.submitNotes){
            commonFunction.clickOnElement(this.popupSubmitBtn, "Popup Submit button");
        } else {
            commonFunction.clickOnElement(this.popupCloseBtn, "Popup Close button");
        }
        let actionButton = element(by.xpath("//ion-button[contains(text(), 'Start')]/following-sibling::i"));
        commonFunction.clickOnElement(actionButton, "Action button of row 1");
    }

    this.checkNoteDetails = function(faultReported){
        let addFault = new fault(faultReported); 
        let fSummary = new faultSummary(faultReported);
        commonFunction.waitForElementToBeVisible(addFault.actionBtn, "Action button for first fault");
        commonFunction.scrollToElement(this.notesTblPreviousBtn);  
        if(faultReported.submitNotes){      
            let tblNoteDate = commonFunction.updateVerificationObject(this.notesDateTbl, "Date in Notes table");
            expect(tblNoteDate).toContainData(noteDate);
            let tblNoteType = commonFunction.updateVerificationObject(this.notesTypeTbl, "Type in Notes table");
            expect(tblNoteType).toContainData(faultReported.noteType);
            let tblNoteComplaint = commonFunction.updateVerificationObject(this.notesComplaintTbl, "Complaint in Notes table");
            expect(tblNoteComplaint).toContainData(faultReported.complaint);
            let tblNoteCategory = commonFunction.updateVerificationObject(this.notesCategoryTbl, "Category in Notes table");
            expect(tblNoteCategory).toContainData(faultReported.noteCategory);
            let tblNoteUser = commonFunction.updateVerificationObject(this.notesUserTbl, "User in Notes table");
            expect(tblNoteUser).toContainData(faultReported.user);
            commonFunction.clickOnElement(this.notesViewTbl, "View button in Notes table");
            commonFunction.waitForElementToBeVisible(fSummary.messageTitle, "Popup Message");
            if(faultReported.notes){
                let msgTitle = commonFunction.updateVerificationObject(fSummary.messageTitle, "Popup Message Title"); 
                expect(msgTitle).toContainData(faultReported.messageTitle);
                let msg = commonFunction.updateVerificationObject(fSummary.confirmationMessage, "Popup Message"); 
                expect(msg).toContainData(faultReported.notes); 
                commonFunction.clickOnElement(fSummary.messageOKBtn, "Popup Message OK button"); 
            }
        } else {
            let noteInfo = commonFunction.updateVerificationObject(this.notesEmptyTbl, "Info in Notes table");
            expect(noteInfo).toContainData(faultReported.tblNoteInfo);
        }
    }

    this.checkNoteValidations = function(faultReported){
        let addFault = new fault(faultReported); 
        commonFunction.waitForElementToBeVisible(addFault.actionBtn, "Action button for first fault");
        commonFunction.clickOnElement(addFault.actionBtn, "Action button for first fault");
        commonFunction.clickOnElement(this.addNoteBtn, "Add Note button");
        commonFunction.waitForElementToBeVisible(this.popupTitle, "Add Note popup");
        commonFunction.clickOnElement(this.popupSubmitBtn, "Popup Submit button");
        let noteError = commonFunction.updateVerificationObject(this.popupNotesError, "Notes Validation Error");
        expect(noteError).toContainData(faultReported.notesError);
    }    
}
module.exports = FaultNote;
