var commonUtil = require('../../util/common.util.page');
var commonFunction = new commonUtil();
var fault = require('./add.fault.page');

var FaultSummary = function (faultDetails) {
    
    /**
     * Locators for elements used in 'Fault Summary' functionality
     */ 
   
    this.titleEditButton = element(by.xpath("//ion-icon[@name='create-outline']"));
    this.titleEdit = element(by.css("ion-item.edit-title > ion-input > input"));

    this.editFaultTypeList1 = element(by.xpath("//ion-icon[@name='close-circle']/../preceding-sibling::ion-col[2]//ion-select"));
    this.editFaultTypeValue1 = element(by.xpath("//ion-label[contains(text(), '" + faultDetails.editTypeAddition1 + "')]/following-sibling::ion-radio"));
    this.editAdditionalInfo1 = element(by.xpath("//ion-icon[@name='close-circle']/../preceding-sibling::ion-col[1]//input"));

    this.editReporterType = element(by.xpath("//ion-label[contains(text(), '" + faultDetails.editReporter + "')]/following-sibling::ion-radio"));
    this.editAgreement = element(by.xpath("//ion-label[contains(text(), '" + faultDetails.editTenancyAgreement + "')]/following-sibling::ion-radio"));
    this.editReporterList = element(by.xpath("//ion-label[contains(text(), '" + faultDetails.editReporterList + "')]/following-sibling::ion-select"));
    this.editReporterName = element(by.xpath("//ion-label[contains(text(), '" + faultDetails.editReporterName + "')]/following-sibling::ion-radio"));
  
    this.editAccessInfo = element(by.xpath("//ion-label[contains(text(), '" + faultDetails.editAccessInfo + "')]/following-sibling::ion-radio"));
  
    this.reviewSection1Title = element(by.xpath("(//div[@class='sub-heading'])[1]"));
    this.reviewFaultCategory = element(by.xpath("//ion-grid[contains(@class, 'view-details ng')]//ion-col[3]//ion-text[2]"));
    this.reviewUrgencyStatus = element(by.xpath("//ion-grid[contains(@class, 'view-details ng')]//ion-col[4]//ion-text[2]"));
    this.reviewFaultTitle = element(by.xpath("//ion-grid[contains(@class, 'view-details ng')]//ion-col[5]//ion-text[2]"));
    this.reviewDescription = element(by.xpath("//ion-grid[contains(@class, 'view-details ng')]//ion-col[6]//ion-text[2]"));
    this.reviewType = element(by.xpath("//ion-grid[contains(@class, 'view-details ng')]//ion-col[7]//ion-text[2]"));  
    this.reviewAdditionalInfo = element(by.xpath("//ion-grid[contains(@class, 'view-details ng')]//ion-col[8]//ion-text[2]"));
    this.reviewSection2Title = element(by.xpath("(//div[@class='sub-heading'])[2]"));
    this.reviewReporter = element(by.xpath("//ion-text[contains(text(), 'Who reported the repair')]/following-sibling::ion-text"));
    this.reviewReporterTitle = element(by.xpath("//ion-text[contains(text(), 'Forename')]/../preceding-sibling::ion-col[1]/ion-text[2]")); 
    this.reviewForename = element(by.xpath("//ion-text[contains(text(), 'Forename')]/following-sibling::ion-text"));
    this.reviewSurname = element(by.xpath("//ion-text[contains(text(), 'Surname')]/following-sibling::ion-text"));
    this.reviewEmail = element(by.xpath("//ion-text[contains(text(), 'E-mail')]/following-sibling::ion-text"));
    this.reviewMobile = element(by.xpath("//ion-text[contains(text(), 'Mobile')]/following-sibling::ion-text"));
    this.reviewTelephone = element(by.xpath("//ion-text[contains(text(), 'Telephone')]/following-sibling::ion-text"));
    this.reviewSection3Title = element(by.xpath("(//div[@class='sub-heading'])[3]"));
    this.reviewAccessInfo = element(by.xpath("//ion-text[contains(text(), 'Access Information')]/following-sibling::ion-text"));
    this.reviewVulnerableOccupier = element(by.xpath("//ion-text[contains(text(), 'Is there a vulnerable occupier')]/following-sibling::ion-text"));
    this.reviewUsefulInstruction = element(by.xpath("//ion-text[contains(text(), 'Useful Instruction')]/following-sibling::ion-text"));
    
    this.propertyAddress = element(by.css("h2.heading.ng-star-inserted"));
    this.propertyOffice = element(by.xpath("//span[contains(text(), 'Office')]/.."));
    this.managementService = element(by.xpath("//span[contains(text(), 'Management Service')]/.."));
    this.propertyManager = element(by.xpath("//span[contains(text(), 'Property Manager')]/.."));
    this.occupancyStatus = element(by.xpath("//span[contains(text(), 'Occupancy Status')]/.."));
    this.licenceDetails = element(by.xpath("//span[contains(text(), 'Licence Details')]/.."));
    this.communication = element(by.xpath("//span[contains(text(), 'Communication')]/.."));
    this.reportedOn = element(by.xpath("//span[contains(text(), 'Reported On')]/.."));
    this.rentArrears = element(by.xpath("//span[contains(text(), 'Rent Arrears')]/.."));
    this.electricMeterImage = element(by.xpath("//ion-col[contains(text(), 'Electric Meter')]/img"));
    this.waterMeterImage = element(by.xpath("//ion-col[contains(text(), 'Water Meter')]/img"));
    this.gasMeterImage = element(by.xpath("//ion-col[contains(text(), 'Gas Meter')]/img"));
    this.stopTapImage = element(by.xpath("//ion-col[contains(text(), 'Stop Tap')]/img"));
    this.tooltip = element(by.css("div.mat-tooltip"));
    
    this.startProgressBtn = element(by.xpath("//ion-button[contains(text(), 'Start Progress')]"));
    this.messageTitle = element(by.css("h2.alert-title"));
    this.confirmationMessage = element(by.css("div.alert-message"));
    this.confirmationOKBtn = element(by.css("button.ion-color-success")); 
    this.confirmationCancelBtn = element(by.css("button.ion-color-danger")); 
    this.messageOKBtn = element(by.css("button.alert-button")); 
    this.faultStatus = element(by.css("h2.heading-initial > span"));    
      
    this.startFaultProgress = function(faultReported){   
        let addFault = new fault(faultReported); 
        commonFunction.waitForElementToBeVisible(addFault.actionBtn, "Action button for first fault"); 
        commonFunction.clickOnElement(addFault.actionBtn, "Action button");
        commonFunction.waitForElementToBeVisible(this.startProgressBtn, "Start Progress button");
        commonFunction.clickOnElement(this.startProgressBtn, "Start Progress button");
        commonFunction.waitForElementToBeVisible(this.confirmationOKBtn, "Start Progress Confirmation OK button");
        commonFunction.clickOnElement(this.confirmationOKBtn, "Start Progress Confirmation OK button");
        commonFunction.waitForElementToBeVisible(this.faultStatus, "Fault Status");
        if("updatedStatus" in faultReported){
            let faultStatusObj = commonFunction.updateVerificationObject(this.faultStatus, "Fault Status"); 
            expect(faultStatusObj).toContainData(faultReported.updatedStatus);
        }                          
    }

    this.checkReviewDetails = function(faultDetails){
        let addFault = new fault(faultDetails);
        commonFunction.scrollToElement(addFault.reviewTab);
        commonFunction.clickOnElement(addFault.reviewTab, "Review tab");
        commonFunction.scrollToElement(commonFunction.getElementByCssContainingText('ion-button', 'Cancel'));
        if(faultDetails.reviewCategory){
           let reviewCategory = commonFunction.updateVerificationObject(this.reviewFaultCategory, "Review Fault Category"); 
           expect(reviewCategory).toContainData(faultDetails.reviewCategory);   
        }
        if(faultDetails.reviewUrgency){
            let reviewUrgency = commonFunction.updateVerificationObject(this.reviewUrgencyStatus, "Review Urgency Status"); 
            expect(reviewUrgency).toContainData(faultDetails.reviewUrgency);   
        }
        if(faultDetails.reviewTitle){
            let reviewTitle = commonFunction.updateVerificationObject(this.reviewFaultTitle, "Review Fault Title"); 
            expect(reviewTitle).toContainData(faultDetails.reviewTitle);   
        }
        if(faultDetails.reviewDescription){
            let reviewDescriptionObj = commonFunction.updateVerificationObject(this.reviewDescription, "Review Fault Description"); 
            let descriptionList = faultDetails.reviewDescription.split(",");
            descriptionList.forEach((description) => {
               expect(reviewDescriptionObj).toContainData(description);   
            });            
        }
        if(faultDetails.reviewType){
            let reviewTypeObj = commonFunction.updateVerificationObject(this.reviewType, "Review Type Info"); 
            expect(reviewTypeObj).toContainData(faultDetails.reviewType);   
        }
        if(faultDetails.reviewAdditionalInfo){
            let reviewInfoObj = commonFunction.updateVerificationObject(this.reviewAdditionalInfo, "Review Additional Info"); 
            expect(reviewInfoObj).toContainData(faultDetails.reviewAdditionalInfo);   
        }
        if(faultDetails.reviewReporter){
            let reviewReporterObj = commonFunction.updateVerificationObject(this.reviewReporter, "Review Fault Reporter"); 
            expect(reviewReporterObj).toContainData(faultDetails.reviewReporter);   
        }
        if(faultDetails.reviewReporterTitle){
            let reviewReporterTitleObj = commonFunction.updateVerificationObject(this.reviewReporterTitle, "Review Fault Reporter Title"); 
            expect(reviewReporterTitleObj).toContainData(faultDetails.reviewReporterTitle);   
        }
        if(faultDetails.reviewForename){
            let reviewForenameObj = commonFunction.updateVerificationObject(this.reviewForename, "Review Fault Reporter Forename"); 
            expect(reviewForenameObj).toContainData(faultDetails.reviewForename);   
        }
        if(faultDetails.reviewSurname){
            let reviewSurnameObj = commonFunction.updateVerificationObject(this.reviewSurname, "Review Fault Reporter Surname"); 
            expect(reviewSurnameObj).toContainData(faultDetails.reviewSurname);   
        }
        if(faultDetails.reviewEmail){
            let reviewEmailObj = commonFunction.updateVerificationObject(this.reviewEmail, "Review Fault Reporter Email"); 
            expect(reviewEmailObj).toContainData(faultDetails.reviewEmail);   
        }
        if(faultDetails.reviewMobile){
            let reviewMobileObj = commonFunction.updateVerificationObject(this.reviewMobile, "Review Fault Reporter Mobile"); 
            expect(reviewMobileObj).toContainData(faultDetails.reviewMobile);   
        }
        if(faultDetails.reviewTelephone){
            let reviewTelephoneObj = commonFunction.updateVerificationObject(this.reviewTelephone, "Review Fault Reporter Telephone"); 
            expect(reviewTelephoneObj).toContainData(faultDetails.reviewTelephone);   
        }
        if(faultDetails.reviewAccessInfo){
            let reviewAccessInfoObj = commonFunction.updateVerificationObject(this.reviewAccessInfo, "Review Access Information"); 
            expect(reviewAccessInfoObj).toContainData(faultDetails.reviewAccessInfo);   
        }
        if(faultDetails.reviewVulnerableOccupier){
            let reviewVulnerableOcp = commonFunction.updateVerificationObject(this.reviewVulnerableOccupier, "Review Vulnerable Occupier"); 
            expect(reviewVulnerableOcp).toContainData(faultDetails.reviewVulnerableOccupier);   
        }
        if(faultDetails.reviewUsefulInstructions){
            let reviewInstruction = commonFunction.updateVerificationObject(this.reviewUsefulInstruction, "Review Useful Instructions"); 
            expect(reviewInstruction).toContainData(faultDetails.reviewUsefulInstructions);   
        }
    } 
    
    this.checkPropertyDetails = function (propertyDetails){
        let propertyAddressObj = commonFunction.updateVerificationObject(this.propertyAddress, "Property Address"); 
        expect(propertyAddressObj).toContainData(propertyDetails.address);
        let propertyOfficeObj = commonFunction.updateVerificationObject(this.propertyOffice, "Property Office"); 
        expect(propertyOfficeObj).toContainData(propertyDetails.office);
        let managementServiceObj = commonFunction.updateVerificationObject(this.managementService, "Management Service"); 
        expect(managementServiceObj).toContainData(propertyDetails.managementService);
        let propertyManagerObj = commonFunction.updateVerificationObject(this.propertyManager, "Property Manager"); 
        expect(propertyManagerObj).toContainData(propertyDetails.propertyManager);
        let occupancyStatusObj = commonFunction.updateVerificationObject(this.occupancyStatus, "Occupancy Status"); 
        expect(occupancyStatusObj).toContainData(propertyDetails.occupancyStatus);
        let licenceDetailsObj = commonFunction.updateVerificationObject(this.licenceDetails, "Licence Details"); 
        expect(licenceDetailsObj).toContainData(propertyDetails.licenceDetails);
        let communicationObj = commonFunction.updateVerificationObject(this.communication, "Communication"); 
        expect(communicationObj).toContainData(propertyDetails.communication);
        /*let reportedOnObj = commonFunction.updateVerificationObject(this.reportedOn, "Reported On"); 
        expect(reportedOnObj).toContainData(propertyDetails.reportedOn);*/
        let rentArrearsObj = commonFunction.updateVerificationObject(this.rentArrears, "Rent Arrears"); 
        expect(rentArrearsObj).toContainData(propertyDetails.rentArrears);
        commonFunction.mouseHover(this.electricMeterImage);
        let electricMeterObj = commonFunction.updateVerificationObject(this.tooltip, "Electric Meter Location"); 
        expect(electricMeterObj).toContainData(propertyDetails.electricMeter);
        commonFunction.mouseHover(this.waterMeterImage);
        let waterMeterObj = commonFunction.updateVerificationObject(this.tooltip, "Water Meter Location"); 
        expect(waterMeterObj).toContainData(propertyDetails.waterMeter);
        commonFunction.mouseHover(this.gasMeterImage);
        let gasMeterObj = commonFunction.updateVerificationObject(this.tooltip, "Gas Meter Location"); 
        expect(gasMeterObj).toContainData(propertyDetails.gasMeter);
        commonFunction.mouseHover(this.stopTapImage);
        let stopTapObj = commonFunction.updateVerificationObject(this.tooltip, "Stop Tap Location"); 
        expect(stopTapObj).toContainData(propertyDetails.stopTap);
    }

    this.checkFaultSummary = function(faultDetails){
        this.checkPropertyDetails(faultDetails);
        this.checkReviewDetails(faultDetails);
    }

    this.editFaultDetails = function(originalFault){
        let addFault = new fault(faultDetails);        
        commonFunction.scrollToElement(addFault.cancelBtn);
        if(originalFault.editTitle){
           commonFunction.clickOnElement(this.titleEditButton, "Edit Title button");
           this.titleEdit.sendKeys(protractor.Key.chord(protractor.Key.CONTROL, "a"), originalFault.editTitle);
           commonFunction.clickOnElement(addFault.faultDetailsTab, "Fault Details tab");           
        }
        if(originalFault.editUrgency){
            commonFunction.selectFromDropDown(addFault.urgencyStatusList, addFault.urgencyStatusListValue, "Urgency Status list", originalFault.editUrgency);
        }
        if(originalFault.editDescription){
            commonFunction.sendKeysInto(addFault.faultDescriptionInput, originalFault.editDescription);
        }
        if(originalFault.editTypeAddition1){
            commonFunction.selectFromDropDown(this.editFaultTypeList1, this.editFaultTypeValue1, "Type List", originalFault.editTypeAddition1);
            commonFunction.sendKeysInto(this.editAdditionalInfo1, originalFault.editAdditionalInfo1);            
        }  
        commonFunction.clickOnElement(addFault.reportedByTab, "Reported By tab");
        if(originalFault.editReporter){         
            if(originalFault.editReporter.includes("Tenant") || originalFault.editReporter.includes("Guarantor")){
               commonFunction.selectFromDropDown(addFault.reporterTypeList, this.editReporterType, "Fault Reporter Type list", originalFault.editReporter);
               commonFunction.selectFromDropDown(addFault.agreementList, this.editAgreement, "Tenancy Agreement List", originalFault.editTenancyAgreement);
            } else {
                commonFunction.selectFromDropDown(addFault.reporterTypeList, this.editReporterType, "Fault Reporter Type list", originalFault.editReporter);
            }                 
        }
        if(originalFault.editReporterName){
           commonFunction.selectFromDropDown(this.editReporterList, this.editReporterName, "Reporter list", originalFault.editReporterName);
        }
        commonFunction.clickOnElement(addFault.accessInfoTab, "Access Information tab");  
        if(originalFault.editAccessInfo){
           commonFunction.waitForElementToBeVisible(addFault.accessInfoList, "Access Information list"); 
           commonFunction.selectFromDropDown(addFault.accessInfoList, this.editAccessInfo, "Access Information list", originalFault.editAccessInfo);
        }        
        if(originalFault.editIsOccupierVulnerable){
           commonFunction.clickOnElement(addFault.isOccupierVulnerable, "Vulnerable Occupier");                
        } 
        if(originalFault.editUsefulInstruction){
           commonFunction.sendKeysInto(addFault.usefulInstructionInput, originalFault.editUsefulInstruction);                
        } 
        commonFunction.clickOnElement(addFault.mediaDocumentsTab, "Media Documents tab");    
        commonFunction.scrollToElement(addFault.cancelBtn);  
        if(originalFault.editFaultImage){
            commonFunction.uploadImage(addFault.uploadImage, originalFault.editFaultImage, "Fault image");
        }
        if(originalFault.cancelChanges){ 
           commonFunction.scrollToElement(addFault.cancelBtn);   
           commonFunction.waitForElementToBeVisible(addFault.cancelBtn, "Cancel button");         
           commonFunction.clickOnElement(addFault.cancelBtn, "Cancel button");        
        }         
        if(originalFault.submitChanges){
           commonFunction.scrollToElement(addFault.saveForLaterBtn);  
           commonFunction.waitForElementToBeVisible(addFault.saveForLaterBtn, "Save For Later button");
           commonFunction.clickOnElement(addFault.saveForLaterBtn, "Save For Later button");           
        }
    }

    this.deleteFaultDocument = function(faultReported){
        let addFault = new fault(faultReported); 
        commonFunction.clickOnElement(addFault.mediaDocumentsTab, "Media Documents tab");
        commonFunction.scrollToElement(addFault.cancelBtn);
        commonFunction.waitForElementToBeVisible(addFault.initialIssueFolder, "Initial Issue folder");
        commonFunction.clickOnElement(addFault.initialIssueFolder, "Initial Issue folder");
        commonFunction.scrollToElement(addFault.cancelBtn);
        if(faultReported.deleteFile){
            let docs = faultReported.deleteFile.split(",");
            docs.forEach((result) => {
                var deleteFile = element(by.xpath("//img[contains(@src, '" + result + "') and @title='Click To Download']/../../following-sibling::ion-row//ion-icon"));
                commonFunction.waitForElementToBeVisible(deleteFile, "Delete file");
                commonFunction.clickOnElement(deleteFile, "Delete file");
                commonFunction.waitForElementToBeVisible(this.confirmationOKBtn, "Delete file confirmation OK button");
                commonFunction.clickOnElement(this.confirmationOKBtn, "Delete file confirmation OK button");
            });
        };
        commonFunction.scrollToElement(addFault.saveForLaterBtn);  
        commonFunction.waitForElementToBeVisible(addFault.saveForLaterBtn, "Save For Later button");
        commonFunction.clickOnElement(addFault.saveForLaterBtn, "Save For Later button");
    }
}
module.exports = FaultSummary;
