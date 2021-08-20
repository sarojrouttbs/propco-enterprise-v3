var commonUtil = require('../../util/common.util.page');
var commonFunction = new commonUtil();
var fault = require('./add.fault.page');
var faultSummary = require('./fault.summary.page');

var MergeFault = function (faultDetails) {
    
    /**
     * Locators for elements used in 'Merge Fault' functionality
     */ 

    this.mergeBtn = element(by.xpath("//ion-button[contains(text(), 'Merge')]"));
    this.closeBtn = element(by.xpath("//ion-button[contains(text(), 'Close')]"));
    this.popupTitle = element(by.css("ion-title.title-default"));
    this.closePopupReasonList = element(by.xpath("//ion-select[contains(@aria-label, 'Please select a reason for closing this fault')]"));
    this.closePopupReason = element(by.xpath("//ion-label[contains(text(), '" + faultDetails.closeReason + "')]/following-sibling::ion-radio"));
    this.closePopupSaveBtn = element(by.css("ion-button.save-button")); 
    this.closePopupCancelBtn = element(by.css("ion-button.cancel-button"));
    this.cancelPopupYesBtn = element(by.xpath("//ion-button[contains(text(), 'Yes')]"));
    this.cancelPopupNoBtn = element(by.xpath("//ion-button[contains(text(), 'No') and contains(@color, 'danger')]"));

    this.moreFiltersList = element(by.xpath("//ion-select[contains(@aria-label, 'More Filters')]"));
    this.moreFilterTypeValue1 = element(by.xpath("//ion-label[contains(text(), '" + faultDetails.moreFilterType1 + "')]/following-sibling::ion-radio"));
    this.moreFilterTypeList = element(by.xpath("//ionic-selectable[contains(@searchplaceholder, '" + faultDetails.moreFilterType1 + "')]"));
    
    this.moreFilterSearchInput = element(by.xpath("//input[@type='search']"));
    this.searchApplyBtn = element(by.css("ion-button.selectable-btn.ion-color-success"));
    this.searchClearBtn = element(by.xpath("//ion-button[contains(text(), 'Clear')]"));
    this.searchCancelBtn = element(by.xpath("//ion-button[contains(text(), 'Cancel')]"));

    this.searchFilterInput = element(by.xpath("//ion-label[contains(text(), 'Search by')]/following-sibling::ion-input/input"));
    this.applyFilterBtn = element(by.xpath("//ion-button[contains(text(), 'Apply Filter')]"));
    this.resetFilterBtn = element(by.xpath("//ion-button[contains(text(), 'Reset Filter')]"));
    this.firstRowTbl = element(by.xpath("//table[@id='faultListTable']/tbody/tr[1]/td[1]"));

    this.proceedBtn = element(by.xpath("//ion-button[contains(text(), 'Proceed') and contains(@class, 'submit-button')]"));
    this.obtainQuoteBtn = element(by.xpath("//ion-button[contains(text(), 'Obtain Quote')]"));
    this.proceedWithWOBtn = element(by.xpath("//ion-button[contains(text(), 'Proceed with Worksorder')]"));
    this.confirmedEstimateInput = element(by.xpath("//input[@formcontrolname = 'confirmedEstimate']"));
    this.contractorInput = element(by.xpath("//ion-input[@formcontrolname = 'contractor']/input"));
    this.contractorSearchValue = element(by.xpath("//label[contains(text(), '" + faultDetails.contractor + "')]/.."));
    this.nominalCodeList = element(by.xpath("//ionic-selectable[@formcontrolName = 'nominalCode']"));
    this.requiredByDate = element(by.xpath("//ion-datetime[@formcontrolname = 'requiredDate']"));
    this.requiredByDateDoneBtn = element(by.xpath("//button[contains(text(), 'Done')]"));
    this.contractorCheckbox = element(by.css("ion-checkbox.list-checkbox"));
    this.skipPaymentBtn = element(by.xpath("//ion-button[contains(text(), 'SKIP')]"));
    this.skipReason = element(by.xpath("//ion-label[contains(text(), 'Reason')]/following-sibling::ion-textarea/div/textarea"));
    this.submitBtn = element(by.xpath("//ion-button[contains(text(), 'SUBMIT')]"));
    this.responseStatus = element(by.xpath("//h2[contains(text(),'Awaiting')]"));
    this.quotationLabel = element(by.xpath("//ion-label[contains(text(), 'Quotation')]"));
    this.contractorLabel = element(by.xpath("//ion-label[contains(text(), 'Contractor')]"));
    this.cancelBtn = element(by.xpath("//ion-button[contains(text(), 'Proceed') and contains(@class, 'submit-button')]/preceding-sibling::ion-button[3]"));


    var faultList = new Map();

    this.createFaultList = function(mergedFault){
        if(mergedFault.parentFaultIndex){
            let pFault = element(by.xpath("//table[@id='faultListTable']/tbody/tr[" + mergedFault.parentFaultIndex + "]/td[1]/ion-badge"));
            let pFaultId = pFault.getText().then(function(text){return text;}); 
            faultList.set('parentFault', pFaultId);         
        } 
        if(mergedFault.childFaultIndices){ 
            let i = 1;
            let faultRows = mergedFault.childFaultIndices.split(",");
            faultRows.forEach(faultRow => {
              let cFault = element(by.xpath("//table[@id='faultListTable']/tbody/tr[" + faultRow + "]/td[1]/ion-badge")); 
              let cFaultId = cFault.getText().then(function(text){return text;});             
              faultList.set('childFault' + i, cFaultId); 
              i = i+1;          
           });    
        }        
    }
            
    this.mergeFaults = function(mergedFault){  
        let addFault = new fault(mergedFault); 
        let fSummary = new faultSummary(mergedFault);        
        commonFunction.waitForElementToBeVisible(addFault.actionBtn, "Action button for first fault"); 
        if(mergedFault.parentFaultIndex){
           let mergeFaultTbl = element(by.xpath("//table[@id='faultListTable']/tbody/tr[" + mergedFault.parentFaultIndex + "]/td[9]/ion-checkbox"));
           commonFunction.clickOnElement(mergeFaultTbl, "Merge fault checkbox of row " + mergedFault.parentFaultIndex);
        }
        let faultRows = mergedFault.childFaultIndices.split(",");
        if(mergedFault.childFaultIndices){ 
           faultRows.forEach(faultRow => {
               let mergeFaultTbl = element(by.xpath("//table[@id='faultListTable']/tbody/tr[" + faultRow + "]/td[9]/ion-checkbox"));
               commonFunction.clickOnElement(mergeFaultTbl, "Merge fault checkbox of row " + faultRow);          
           });           
        }
        if(mergedFault.mergeAction){
           let actionBtn = element(by.xpath("//table[@id='faultListTable']/tbody/tr[" + mergedFault.parentFaultIndex + "]//i")); 
           commonFunction.clickOnElement(actionBtn, "Action button of row " + mergedFault.parentFaultIndex);
           commonFunction.clickOnElement(this.mergeBtn, "Merge button"); 
           commonFunction.waitForElementToBeVisible(fSummary.messageTitle, "Popup Messaage");        
           if(mergedFault.mergeAction.includes("Y")){
              commonFunction.clickOnElement(fSummary.confirmationOKBtn, "Merge Confirmation OK button");
           } else {
                if(mergedFault.message1){
                   let msgTitle = commonFunction.updateVerificationObject(fSummary.messageTitle, "Popup Message Title"); 
                   expect(msgTitle).toContainData(mergedFault.messageTitle);
                   faultList.get("parentFault").then(function(text){
                       let fSummary = new faultSummary(mergedFault);
                       let msg = commonFunction.updateVerificationObject(fSummary.confirmationMessage, "Popup Message");
                       expect(msg).toContainData(mergedFault.message1 + " " + text + " " + mergedFault.message2); 
                   });                                        
                }
                 commonFunction.clickOnElement(fSummary.confirmationCancelBtn, "Merge Confirmation Cancel button"); 
           } 
        }             
    }

    this.searchFaultByIdAddress = function(searchFault){
        commonFunction.scrollToElement(this.searchFilterInput);
        commonFunction.sendKeysInto(this.searchFilterInput, searchFault);
        commonFunction.clickOnElement(this.applyFilterBtn, "Apply Filter button");
        commonFunction.waitForElementToBeVisible(this.firstRowTbl, "Table First Row");
    }

    this.searchByMoreFilter = function(filterType, filterValues){
        commonFunction.scrollToElement(this.moreFiltersList);
        commonFunction.selectFromDropDown(this.moreFiltersList, this.moreFilterTypeValue1, "More Filters list", filterType);
        commonFunction.clickOnElement(this.moreFilterTypeList, "More Filter Type List");
        let filterList = filterValues.split(",");
        filterList.forEach(filterValue => {
            commonFunction.sendKeysInto(this.moreFilterSearchInput, filterValue);
            let moreFilterSearchResult = element(by.xpath("//ion-label[contains(text(), '" + filterValue + "')]/following-sibling::ion-icon"));
            commonFunction.waitForElement(moreFilterSearchResult, "Search Result");
            commonFunction.clickOnElement(moreFilterSearchResult, "More Filter Type Value search");
        });      
        commonFunction.clickOnElement(this.searchApplyBtn, "More Filter Type Search Apply button");
    }

    this.checkMergedFaultDetails = function(mergedFault){
        let addFault = new fault(mergedFault); 
        let fSummary = new faultSummary(mergedFault);
        commonFunction.waitForElementToBeVisible(addFault.actionBtn, "Action button for first fault"); 
        for(let faultType of faultList.keys()){
            if(faultType.includes("childFault")){
                faultList.get(faultType).then(function(text){
                    let merge = new MergeFault(mergedFault);
                    merge.searchFaultByIdAddress(text);
                    let searchedFaultObj = commonFunction.updateVerificationObject(merge.firstRowTbl, "Searched Fault  " + text); 
                    expect(searchedFaultObj).toContainData(mergedFault.searchedVisibleFault);
                });
                commonFunction.clickOnElement(this.resetFilterBtn, "Reset Filter button");
                commonFunction.waitForElementToBeVisible(this.firstRowTbl, "Table First Row");
                this.searchByMoreFilter(mergedFault.moreFilterType1, mergedFault.moreFilterType1Value);
                faultList.get(faultType).then(function(text){
                    let merge = new MergeFault(mergedFault);
                    merge.searchFaultByIdAddress(text);
                });
                faultList.get("parentFault").then(function(text){
                    let tblJobTitle = commonFunction.updateVerificationObject(addFault.jobTitleTbl, "Job title of merged child Fault"); 
                    expect(tblJobTitle).toContainData(mergedFault.tableJobTitle + " " + text);
                });
                commonFunction.clickOnElement(this.resetFilterBtn, "Reset Filter button");
                commonFunction.waitForElementToBeVisible(this.firstRowTbl, "Table First Row");             
            }
        }
        faultList.get("parentFault").then(function(text){
            let merge = new MergeFault(mergedFault);
            merge.searchFaultByIdAddress(text);
        });        
        addFault.viewFault();
        commonFunction.scrollToElement(addFault.cancelBtn);
        if(mergedFault.parentFaultDescription){
           let descriptionObj = commonFunction.updateVerificationObjectByAttrib(addFault.faultDescriptionInput, "Parent Fault Description", "value"); 
           let descriptionList = mergedFault.parentFaultDescription.split(",");
           descriptionList.forEach(description => {
              expect(descriptionObj).toContainData(description); 
           });           
        }
        let typeObj = commonFunction.updateVerificationObjectByAttrib(fSummary.editFaultTypeList1, "Parent Fault Details Type", "aria-label");
        expect(typeObj).toContainData(mergedFault.parentFaultTypeValue);
        let additionalInfo = commonFunction.updateVerificationObjectByAttrib(fSummary.editAdditionalInfo1, "Parent Fault Additional Info", "value"); 
        expect(additionalInfo).toContainData(mergedFault.parentAdditionalInfo);
        commonFunction.clickOnElement(addFault.accessInfoTab, "Access Information tab");
        let usefulInstruction = commonFunction.updateVerificationObject(addFault.usefulInstructionInput, "Parent Fault Useful Instructions"); 
        expect(usefulInstruction).toContainData(mergedFault.parentUsefulInstruction);
        commonFunction.scrollToElement(addFault.mediaDocumentsTab);
        addFault.checkFaultDocument(mergedFault.parentFile, true, "Fault document is present");
        commonFunction.clickOnElement(addFault.reviewTab, "Review Tab");
        commonFunction.scrollToElement(addFault.cancelBtn);
        fSummary.checkReviewDetails(mergedFault);        
    }
    
    this.checkMergeValidations = function(mergedFault){
        let fSummary = new faultSummary(mergedFault);
        commonFunction.waitForElementToBeVisible(fSummary.messageTitle, "Popup Message");
        if(mergedFault.message){
           let msgTitle = commonFunction.updateVerificationObject(fSummary.messageTitle, "Popup Message Title"); 
           expect(msgTitle).toContainData(mergedFault.messageTitle);
           let msg = commonFunction.updateVerificationObject(fSummary.confirmationMessage, "Popup Message"); 
           expect(msg).toContainData(mergedFault.message); 
           commonFunction.clickOnElement(fSummary.messageOKBtn, "Popup Message OK button"); 
        }
    }

    this.checkChildFaultDetails = function(faultDetails){
        let addFault = new fault(faultDetails);
        commonFunction.waitForElementToBeVisible(addFault.issueIdTbl, "First Fault Issue"); 
        for(let faultType of faultList.keys()){
            if(faultType.includes(faultDetails.childFault)){
                faultList.get(faultType).then(function(text){
                    let merge = new MergeFault(faultDetails);
                    merge.searchFaultByIdAddress(text);                    
                });
                addFault.checkFaultInformationInTable(faultDetails);
                commonFunction.clickOnElement(this.resetFilterBtn, "Reset Filter button");
                commonFunction.waitForElementToBeVisible(this.firstRowTbl, "Table First Row");
            } 
        }
    }

    this.checkParentFaultDetails = function(faultDetails){
        let addFault = new fault(faultDetails);
        let fSummary = new faultSummary(faultDetails);
        commonFunction.waitForElementToBeVisible(addFault.issueIdTbl, "First Fault Issue"); 
        faultList.get("parentFault").then(function(text){
            let merge = new MergeFault(faultDetails);
            merge.searchFaultByIdAddress(text);
        });  
        addFault.checkFaultInformationInTable(faultDetails);
        addFault.viewFault();
        commonFunction.clickOnElement(addFault.reviewTab, "Review Tab");
        commonFunction.scrollToElement(addFault.cancelBtn);
        fSummary.checkReviewDetails(faultDetails);       
    }

    this.closeFaultOnDashboard = function(faultDetails){
        let addFault = new fault(faultDetails);
        let fSummary = new faultSummary(faultDetails);
        commonFunction.waitForElementToBeVisible(addFault.issueIdTbl, "First Fault Issue"); 
        commonFunction.clickOnElement(addFault.actionBtn, "Action button of first fault");
        commonFunction.clickOnElement(this.closeBtn, "Close button");
        commonFunction.waitForElementToBeVisible(this.popupTitle, "Popup Message");
        commonFunction.selectFromDropDown(this.closePopupReasonList, this.closePopupReason, "Close Reason List", faultDetails.closeReason);
        if(faultDetails.closeAction){
            if(faultDetails.closeAction.includes("Y")){
                commonFunction.clickOnElement(this.closePopupSaveBtn, "Close Popup Submit button");
            } else {
                commonFunction.clickOnElement(this.closePopupCancelBtn, "Close Popup Cancel button");
                commonFunction.clickOnElement(this.cancelPopupYesBtn, "Cancel Popup Yes button");
            }
        }
    }

    this.mergeClosedFaults = function(mergedFault){
        let addFault = new fault(mergedFault); 
        let fSummary = new faultSummary(mergedFault);            
        commonFunction.waitForElementToBeVisible(addFault.actionBtn, "Action button for first fault");
        for(let faultType of faultList.keys()){
            if(faultType.includes("childFault")){
               faultList.get(faultType).then(function(text){
                   let merge = new MergeFault(mergedFault);
                   merge.searchFaultByIdAddress(text);
               }); 
               this.closeFaultOnDashboard(mergedFault);           
            }
        }
        commonFunction.clickOnElement(this.resetFilterBtn, "Reset Filter button");
        commonFunction.waitForElementToBeVisible(this.firstRowTbl, "Table First Row");
        this.searchByMoreFilter(mergedFault.moreFilterType1, mergedFault.moreFilterType1Value);              
        for(let faultType of faultList.keys()){
            if(faultType.includes("childFault")){
               faultList.get(faultType).then(function(text){
                   let merge = new MergeFault(mergedFault);
                   merge.searchFaultByIdAddress(text);
               }); 
               let mergeFaultTbl = element(by.xpath("//table[@id='faultListTable']/tbody/tr[1]/td[9]/ion-checkbox"));
               commonFunction.clickOnElement(mergeFaultTbl, "Merge fault checkbox of row 1");           
            }
        }
        faultList.get("parentFault").then(function(text){
            let merge = new MergeFault(mergedFault);
            merge.searchFaultByIdAddress(text); 
        }); 
        let mergeFaultTbl = element(by.xpath("//table[@id='faultListTable']/tbody/tr[1]/td[9]/ion-checkbox"));
        commonFunction.clickOnElement(mergeFaultTbl, "Merge fault checkbox of row 1"); 
        commonFunction.clickOnElement(addFault.actionBtn, "Action button of row 1");
        commonFunction.clickOnElement(this.mergeBtn, "Merge button"); 
        commonFunction.waitForElementToBeVisible(fSummary.messageTitle, "Popup Messaage");
        commonFunction.clickOnElement(fSummary.confirmationOKBtn, "Merge Confirmation OK button");
        commonFunction.waitForElementToBeVisible(addFault.toastMessage, "Flash Messaage");
        let toastMsg = commonFunction.updateVerificationObject(addFault.toastMessage, "Error Message"); 
        expect(toastMsg).toContainData(mergedFault.message);
        let actionButton = element(by.xpath("//ion-button[contains(text(), 'Start')]/following-sibling::i"));
        commonFunction.clickOnElement(actionButton, "Action button of row 1");
        addFault.viewFault();
        commonFunction.clickOnElement(addFault.reviewTab, "Review Tab");
        commonFunction.scrollToElement(addFault.cancelBtn);
        fSummary.checkReviewDetails(mergedFault);        
    }

    this.createFaultQuoteWO = function(faultDetails){
        let addFault = new fault(faultDetails); 
        let fSummary = new faultSummary(faultDetails);            
        commonFunction.waitForElementToBeVisible(addFault.actionBtn, "Action button for first fault");
        fSummary.startFaultProgress(faultDetails);
        commonFunction.scrollToElement(this.proceedBtn);
        commonFunction.clickOnElement(this.proceedBtn, "Proceed button");
        commonFunction.clickOnElement(fSummary.confirmationOKBtn, "Proceed Confirmation Yes button");
        commonFunction.waitForElementToBeVisible(fSummary.faultStatus, "Fault Status");
        if("contractorInput" in faultDetails){
           commonFunction.scrollToElement(this.proceedWithWOBtn);
           commonFunction.clickOnElement(this.proceedWithWOBtn, "Proceed With Works Order button");
           commonFunction.scrollToElement(this.contractorInput);
           commonFunction.sendKeysInto(this.contractorInput, faultDetails.contractorInput);
           commonFunction.waitForElementToBeVisible(this.contractorSearchValue, "Contractor Search Result");
           commonFunction.clickOnElement(this.contractorSearchValue, "Contractor Search Result");
        } else {
            commonFunction.scrollToElement(this.obtainQuoteBtn);
            commonFunction.clickOnElement(this.obtainQuoteBtn, "Obtain Quote button");
        }        
        commonFunction.scrollToElement(this.proceedBtn);
        commonFunction.sendKeysInto(this.confirmedEstimateInput, faultDetails.confirmedEstimate);
        commonFunction.clickOnElement(this.proceedBtn, "Proceed button");
        commonFunction.clickOnElement(fSummary.confirmationOKBtn, "Proceed Confirmation Yes button");
        commonFunction.waitForElementToBeVisible(fSummary.faultStatus, "Fault Status");
        commonFunction.scrollToElement(this.nominalCodeList);
        commonFunction.clickOnElement(this.nominalCodeList, "Nominal Code List");
        let nominalCodeValue = element(by.xpath("//ion-label[contains(text(), '" + faultDetails.nominalCode + "')]/following-sibling::ion-icon"));
        commonFunction.clickOnElement(nominalCodeValue, "Nominal Code Value");
        commonFunction.clickOnElement(this.searchApplyBtn, "Nominal Code Search Apply button");
        commonFunction.scrollToElement(this.requiredByDate);
        commonFunction.clickOnElement(this.requiredByDate, "Required By Date picker");
        commonFunction.clickOnElement(this.requiredByDateDoneBtn, "Required By Date Done button");
        commonFunction.waitForElementToBeVisible(this.requiredByDate, "Required By Date");
        if("contractorInput" in faultDetails === false){
           commonFunction.scrollToElement(this.contractorCheckbox);
           commonFunction.clickOnElement(this.contractorCheckbox, "Contractor Checkbox");
        }        
        commonFunction.scrollToElement(this.proceedBtn);
        commonFunction.clickOnElement(this.proceedBtn, "Proceed button");
        if("contractorInput" in faultDetails){
           commonFunction.clickOnElement(this.skipPaymentBtn, "Skip Payment button");
           commonFunction.sendKeysInto(this.skipReason, faultDetails.skipReason);
           commonFunction.clickOnElement(this.submitBtn, "Submit button");
           commonFunction.waitForElementToBeVisible(this.contractorLabel, "Contractor Label");
        } else {
            commonFunction.clickOnElement(fSummary.confirmationOKBtn, "Proceed Confirmation Yes button");
            commonFunction.waitForElementToBeVisible(this.quotationLabel, "Quotation Label");
        }
        commonFunction.scrollToElement(this.cancelBtn);
        commonFunction.clickOnElement(this.cancelBtn, "Cancel button");
    }

    this.mergeFaultWithQuoteWO = function(mergedFault){
        let addFault = new fault(mergedFault); 
        let fSummary = new faultSummary(mergedFault);            
        commonFunction.waitForElementToBeVisible(addFault.actionBtn, "Action button for first fault");
        for(let faultType of faultList.keys()){
            if(faultType.includes("childFault")){
               faultList.get(faultType).then(function(text){
                   let merge = new MergeFault(mergedFault);
                   merge.searchFaultByIdAddress(text);
               }); 
               this.createFaultQuoteWO(mergedFault);                          
            }
        }
        commonFunction.waitForElementToBeVisible(addFault.actionBtn, "Action button for first fault");
        for(let faultType of faultList.keys()){
            if(faultType.includes("childFault")){
               faultList.get(faultType).then(function(text){
                   let merge = new MergeFault(mergedFault);
                   merge.searchFaultByIdAddress(text);
               }); 
               let mergeFaultTbl = element(by.xpath("//table[@id='faultListTable']/tbody/tr[1]/td[9]/ion-checkbox"));
               commonFunction.clickOnElement(mergeFaultTbl, "Merge fault checkbox of row 1");
               this.checkMergeValidations(mergedFault);           
            }            
        }
        faultList.get("parentFault").then(function(text){
            let merge = new MergeFault(mergedFault);
            merge.searchFaultByIdAddress(text); 
        }); 
        addFault.viewFault();
        commonFunction.clickOnElement(addFault.reviewTab, "Review Tab");
        commonFunction.scrollToElement(addFault.cancelBtn);
        fSummary.checkReviewDetails(mergedFault); 
    }
}
module.exports = MergeFault;
