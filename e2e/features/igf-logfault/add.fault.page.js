var commonUtil = require('../../util/common.util.page');
var commonFunction = new commonUtil();

var Fault = function (faultDetails) {     
    
    /**
     * Locators for elements used in 'Log a Fault' and 'Dashboard Fault Table' functionality  
     */
      
    this.addFaultBtn = element(by.xpath("//ion-button[contains(text(), 'Add Repair')]"));
    this.resetFilterBtn = element(by.xpath("//ion-button[contains(text(), 'Reset Filters')]"));
    this.closeSearchBtn = element(by.xpath("//ion-button[contains(text(), 'close')]"));
    this.propSearchInput = element(by.xpath("//input[@data-placeholder='Start typing to search']"));
    this.propSearchResult = element(by.css('span.mat-option-text'));
    this.headingText = element(by.css('h2.heading'));
    this.faultCategory = element(by.xpath("//h4[contains(text(), '" + faultDetails.category + "')]"));
    this.faultUrgency = element(by.xpath("//ion-button[contains(text(), '" + faultDetails.urgency + "')]"));
      
    this.faultTitleInput = element(by.xpath("//ion-input[@formcontrolname='title']/input"));
    this.nextBtn = element(by.xpath("(//ion-button[contains(text(), 'Next')])[1]"));
    this.cancelBtn = element(by.xpath("(//ion-button[contains(text(), 'Cancel')])[1]"));
    this.backBtn = element(by.xpath("//ion-button[contains(text(), 'Back')]"));
    this.saveForLaterBtn = element(by.xpath("(//ion-button[contains(text(), 'Save for later')])[1]"));
    this.faultDetailsTab = element(by.xpath("//div[contains(text(), 'Fault Details')]"));
    this.reportedByTab = element(by.xpath("//div[contains(text(), 'Reported By')]"));
    this.accessInfoTab = element(by.xpath("//div[contains(text(), 'Access Information')]"));
    this.mediaDocumentsTab = element(by.xpath("//div[contains(text(), 'Media / Documents')]"));
    this.reviewTab = element(by.xpath("//div[contains(text(), 'Review')]"));

    this.faultDescriptionInput = element(by.xpath("//ion-textarea[@formcontrolname = 'notes']//textarea"));
    this.faultTypeList1 = element(by.xpath("//ion-select[@aria-label='Type']"));
    this.faultTypeValue1 = element(by.xpath("//ion-label[contains(text(), '" + faultDetails.typeAddition1 + "')]/following-sibling::ion-radio"));
    this.typeAdditionalInfoInput1 = element(by.xpath("//ion-label[contains(text(), 'Additional Info')]/following-sibling::ion-input/input"));   
    this.additionalInfoAddBtn1 = element(by.xpath("//ion-label[contains(text(), 'Additional Info')]/../../following-sibling::ion-col/ion-button")); 
    this.faultTypeList2 = element(by.xpath("//ion-select[@aria-label='Type']"));
    this.faultTypeValue2 = element(by.xpath("//ion-label[contains(text(), '" + faultDetails.typeAddition2 + "')]/following-sibling::ion-radio"));
    this.typeAdditionalInfoInput2 = element(by.xpath("//ion-label[contains(text(), 'Fault description')]/../../../../../../form[2]//ion-input/input")); 
    this.additionalInfoAddBtn2 = element(by.xpath("//ion-label[contains(text(), 'Fault description')]/../../../../../../form[2]//ion-button")); 
    this.urgencyStatusList = element(by.xpath("//ion-select[@formcontrolname='urgencyStatus']"));
    this.urgencyStatusListValue = element(by.xpath("//ion-label[normalize-space(text())='" + faultDetails.editUrgency + "']/following-sibling::ion-radio"));

    this.reporterTypeList = element(by.xpath("//ion-label[contains(text(), 'Who reported')]/following-sibling::ion-select"));
    this.reporterType = element(by.xpath("//ion-label[contains(text(), '" + faultDetails.reporter + "')]/following-sibling::ion-radio"));
    this.agreementList = element(by.xpath("//ion-label[contains(text(), 'Select agreement')]/following-sibling::ion-select"));
    this.agreement = element(by.xpath("//ion-label[contains(text(), '" + faultDetails.tenancyAgreement + "')]/following-sibling::ion-radio"));

    this.reporterList = element(by.xpath("//ion-label[contains(text(), '" + faultDetails.reporterList + "')]/following-sibling::ion-select"));
    this.reporterName = element(by.xpath("//ion-label[contains(text(), '" + faultDetails.reporterName + "')]/following-sibling::ion-radio"));
    
    this.accessInfoList = element(by.xpath("//ion-label[contains(text(), 'Access information')]/following-sibling::ion-select"));
    this.accessInfo = element(by.xpath("//ion-label[contains(text(), '" + faultDetails.accessInfo + "')]/following-sibling::ion-radio"));
    this.isOccupierVulnerable = element(by.xpath("//ion-toggle[@formcontrolname = 'areOccupiersVulnerable']"));
    this.usefulInstructionInput = element(by.xpath("//ion-textarea[@formcontrolname = 'tenantNotes']//textarea"));

    this.uploadImage = element(by.xpath("//span[contains(text(), 'Drag files')]/preceding-sibling::input"));
    this.browseFilesBtn = element(by.xpath("//label[contains(text(), 'Browse Files')]"));
    this.uploadForm = element(by.xpath("//span[contains(text(), 'Drag files')]/.."));
    this.initialIssueFolder = element(by.xpath("//ion-icon[@title='Click to View Documents']"));
    this.submitBtn = element(by.xpath("//ion-button[contains(text(), 'Submit')]"));
        
    this.issueIdTbl = element(by.xpath("//table[@id='faultListTable']/tbody/tr[1]/td[1]"));
    this.faultUrgencyTbl = element(by.xpath("//table[@id='faultListTable']/tbody/tr[1]/td[1]/ion-badge"));
    this.reportedOnTbl = element(by.xpath("//table[@id='faultListTable']/tbody/tr[1]/td[2]"));  
    this.categoryTbl = element(by.xpath("//table[@id='faultListTable']/tbody/tr[1]/td[3]"));
    this.propertyTbl = element(by.xpath("//table[@id='faultListTable']/tbody/tr[1]/td[4]"));
    this.officeTbl = element(by.xpath("//table[@id='faultListTable']/tbody/tr[1]/td[5]"));
    this.managerTbl = element(by.xpath("//table[@id='faultListTable']/tbody/tr[1]/td[6]"));
    this.jobTitleTbl = element(by.xpath("//table[@id='faultListTable']/tbody/tr[1]/td[7]"));
    this.reporterTbl = element(by.xpath("//table[@id='faultListTable']/tbody/tr[1]/td[8]"));
    this.faultStatusTbl = element(by.xpath("//table[@id='faultListTable']/tbody/tr[1]/td[10]"));
    this.viewFirstFault = element(by.xpath("//table[@id='faultListTable']/tbody/tr[1]//i"));

    this.titleRow = element(by.css("ion-row.main-row"));
    this.titleError = element(by.xpath("//ion-label[contains(text(), 'Title')]/../following-sibling::app-validation-message/div"));
    this.descriptionError = element(by.xpath("//ion-label[contains(text(), 'description')]/../following-sibling::app-validation-message/div"));
    this.agreementError = element(by.xpath("//ion-select[@aria-label='Select agreement*']/../following-sibling::app-validation-message/div"));
    this.tenantNameError = element(by.xpath("//ion-select[@aria-label='Select Tenant*']/../following-sibling::app-validation-message/div"));
    this.accessInfoError = element(by.xpath("//ion-select[@aria-label='Access information*']/../following-sibling::app-validation-message/div"));

    this.loader = element(by.css("div.spinner-bg"));
    this.toastMessage = element(by.css("div.toast-message"));     
    
    this.actionBtn = element(by.xpath("//table[@id='faultListTable']/tbody/tr[1]//i"));
    this.viewBtn = element(by.xpath("//ion-button[contains(text(), 'View')]"));  
    

    this.createFault = function(faultAttrib){ 
        commonFunction.waitForElementToBeVisible(this.addFaultBtn, "Add Fault button");          
        commonFunction.clickOnElement(this.addFaultBtn, "Add Fault button");        
        if(faultAttrib.propertyId){
          commonFunction.sendKeysInto(this.propSearchInput, faultAttrib.propertyId);
          commonFunction.clickOnElement(this.propSearchResult, "Property Search result");
        }
        commonFunction.waitForElementToBeVisible(this.headingText, "Heading Text");
        commonFunction.scrollToElement(this.faultCategory);
        commonFunction.clickOnElement(this.faultCategory, "Fault Category");
        if(faultAttrib.urgency){
          commonFunction.clickOnElement(this.faultUrgency, "Fault Urgency button"); 
        }                  
        if(faultAttrib.title){
          commonFunction.sendKeysInto(this.faultTitleInput, faultAttrib.title);
        }       
        commonFunction.clickOnElement(this.nextBtn, "Next button");
        commonFunction.scrollToElement(this.nextBtn);          
        if(faultAttrib.description){
          commonFunction.sendKeysInto(this.faultDescriptionInput, faultAttrib.description);
        } 
        if(faultAttrib.typeAddition1){
          commonFunction.selectFromDropDown(this.faultTypeList1, this.faultTypeValue1, "Type List", faultAttrib.typeAddition1);
          commonFunction.sendKeysInto(this.typeAdditionalInfoInput1, faultAttrib.additionalInfo1);
          commonFunction.clickOnElement(this.additionalInfoAddBtn1, "Additional Info1 Add button");
        }  
        if(faultAttrib.typeAddition2){
          commonFunction.selectFromDropDown(this.faultTypeList2, this.faultTypeValue2, "Type List", faultAttrib.typeAddition2);
          commonFunction.sendKeysInto(this.typeAdditionalInfoInput2, faultAttrib.additionalInfo2);
          commonFunction.clickOnElement(this.additionalInfoAddBtn2, "Additional Info2 Add button");
        }  
        commonFunction.clickOnElement(this.nextBtn, "Next button");        
        if(faultAttrib.reporter){         
          if(faultAttrib.reporter.includes("Tenant")){
             commonFunction.selectFromDropDown(this.agreementList, this.agreement, "Tenancy Agreement List", faultAttrib.tenancyAgreement);
          } else if (faultAttrib.reporter.includes("Guarantor")){
            commonFunction.selectFromDropDown(this.reporterTypeList, this.reporterType, "Fault Reporter Type list", faultAttrib.reporter);
            commonFunction.selectFromDropDown(this.agreementList, this.agreement, "Tenancy Agreement List", faultAttrib.tenancyAgreement);
          } else {
              commonFunction.selectFromDropDown(this.reporterTypeList, this.reporterType, "Fault Reporter Type list", faultAttrib.reporter);
          }                 
        }
        commonFunction.selectFromDropDown(this.reporterList, this.reporterName, "Reporter list", faultAttrib.reporterName);
        commonFunction.clickOnElement(this.nextBtn, "Next button");        
        if(faultAttrib.accessInfo){
          commonFunction.selectFromDropDown(this.accessInfoList, this.accessInfo, "Access Information list", faultAttrib.accessInfo);
        }        
        if(faultAttrib.isOccupierVulnerable){
          commonFunction.clickOnElement(this.isOccupierVulnerable, "Vulnerable Occupier");                
        } 
        if(faultAttrib.usefulInstruction){
          commonFunction.sendKeysInto(this.usefulInstructionInput, faultAttrib.usefulInstruction);                
        }            
        commonFunction.clickOnElement(this.nextBtn, "Next button");
        commonFunction.scrollToElement(this.nextBtn);        
        if(faultAttrib.faultImage){
          commonFunction.uploadImage(this.uploadImage, faultAttrib.faultImage, "Fault image");
        } 
        commonFunction.scrollToElement(this.reviewTab);       
        commonFunction.clickOnElement(this.reviewTab, "Review Tab");         
        commonFunction.scrollToElement(this.submitBtn);
        commonFunction.clickOnElement(this.submitBtn, "Submit button");          
    }

    this.checkFaultInformationInTable = function(faultDetailsTbl){    
        commonFunction.waitForElementToBeVisible(this.actionBtn, "Action button for first fault");       
       if(faultDetailsTbl.tableUrgency){
         let tblUrgency = commonFunction.updateVerificationObjectByAttrib(this.faultUrgencyTbl, "Urgency in Fault Table", "color");
         expect(tblUrgency).toContainData(faultDetailsTbl.tableUrgency);
       }
       if(faultDetailsTbl.tableCategory){
         let tblCategory = commonFunction.updateVerificationObject(this.categoryTbl, "Category in Fault Table");
         expect(tblCategory).toContainData(faultDetailsTbl.tableCategory);
       }
       if(faultDetailsTbl.tablePropertyId){
         let tblProperty1 = commonFunction.updateVerificationObject(this.propertyTbl, "Property id in Fault Table"); 
         expect(tblProperty1).toContainData(faultDetailsTbl.tablePropertyId); 
       }
       if(faultDetailsTbl.tablePropertyAddress){
         let tblProperty2 = commonFunction.updateVerificationObject(this.propertyTbl, "Property address in Fault Table"); 
         expect(tblProperty2).toContainData(faultDetailsTbl.tablePropertyAddress);
       }
       if(faultDetailsTbl.tableOffice){
         let tblOffice = commonFunction.updateVerificationObject(this.officeTbl, "Property office in Fault Table"); 
         expect(tblOffice).toContainData(faultDetailsTbl.tableOffice);
       } 
       if(faultDetailsTbl.tableManager){
         let tblManager = commonFunction.updateVerificationObject(this.managerTbl, "Property manager in Fault Table"); 
         expect(tblManager).toContainData(faultDetailsTbl.tableManager);    
       } 
       if(faultDetailsTbl.tableJobTitle){
         let tblJobTitle = commonFunction.updateVerificationObject(this.jobTitleTbl, "Job title in Fault Table"); 
         expect(tblJobTitle).toContainData(faultDetailsTbl.tableJobTitle);
       }   
       if(faultDetailsTbl.tableReporter){
         let tblReporter = commonFunction.updateVerificationObject(this.reporterTbl, "Reported By in Fault Table"); 
         expect(tblReporter).toContainData(faultDetailsTbl.tableReporter); 
       } 
       if(faultDetailsTbl.tableFaultStatus){
         let tblStatus = commonFunction.updateVerificationObject(this.faultStatusTbl, "Status in Fault Table"); 
         expect(tblStatus).toContainData(faultDetailsTbl.tableFaultStatus);
       }              
    }
  
    /**
     * Function that creates a fault for Non-fully managed property
     * @param {Object} nfmProperty Non-fully managed property data 
     */
    this.addFaultForNFMProperty = function(nfmProperty){
        commonFunction.clickOnElement(this.addFaultBtn, "Add Fault button"); 
        commonFunction.sendKeysInto(this.propSearchInput, nfmProperty.propertyId);
        let searchResult = commonFunction.updateVerificationObject(this.propSearchResult, "Property search result"); 
        expect(searchResult).toContainData(nfmProperty.searchResult);
    }

    this.viewFault = function(){
        commonFunction.waitForElementToBeVisible(this.actionBtn, "Action button for first fault"); 
        commonFunction.clickOnElement(this.actionBtn, "Action button");
        commonFunction.clickOnElement(this.viewBtn, "View button"); 
        commonFunction.waitForElementToBeVisible(this.faultDetailsTab, "Fault Details tab");
    }

    this.checkFaultDocument = function(docList, conditionResult, msg){
        let expCondition = protractor.ExpectedConditions; 
        //this.viewFault();
        commonFunction.clickOnElement(this.mediaDocumentsTab, "Media Documents tab");
        commonFunction.scrollToElement(this.cancelBtn);
        commonFunction.clickOnElement(this.initialIssueFolder, "Initial Issue folder"); 
        commonFunction.scrollToElement(this.cancelBtn);
        if(docList){
          let docs = docList.split(",");
          docs.forEach(function(result){
              var deleteFile = element(by.xpath("//img[contains(@src, '" + result + "') and @title='Click To Download']/../../following-sibling::ion-row//ion-icon"));
              expect(commonFunction.checkCondition(expCondition.visibilityOf(deleteFile))).toBeCorrect(conditionResult, msg + " - " + result);
          });
        }
    }

    this.checkFaultTitleLength = function(faultProperty){
        commonFunction.clickOnElement(this.addFaultBtn, "Add Fault button"); 
        commonFunction.sendKeysInto(this.propSearchInput, faultProperty.propertyId);
        commonFunction.clickOnElement(this.propSearchResult, "Property Search result");
        commonFunction.clickOnElement(this.faultCategory, "Fault Category");
        commonFunction.sendKeysInto(this.faultTitleInput, faultProperty.title);
        commonFunction.clickOnElement(this.faultUrgency, "Fault Urgency button");  
        let faultTitleError = commonFunction.updateVerificationObject(this.titleError, "Fault title error"); 
        expect(faultTitleError).toContainData(faultProperty.titleError);
    }

    this.addFaultForMultiTenantProperty = function(mtProperty){
         this.createFault(mtProperty); 
         this.checkFaultInformationInTable(mtProperty);        
         this.viewFault();
         commonFunction.scrollToElement(this.nextBtn);
         commonFunction.clickOnElement(this.nextBtn, "Next button");         
         let tenantName = commonFunction.updateVerificationObjectByAttrib(this.reporterList, "Tenant name", "aria-label");
         expect(tenantName).toContainData(mtProperty.reporterName);
         commonFunction.clickOnElement(this.reporterList, "Reporter List");
         let coTenant = element(by.xpath("//ion-label[contains(text(), '" + mtProperty.reporterName1 + "')]"));
         let tenant2 = commonFunction.updateVerificationObject(coTenant, "Co-tenant Name"); 
         expect(tenant2).toContainData(mtProperty.reporterName1);
        // commonFunction.clickOnElement(this.cancelBtn, "Cancel button");
        // this.checkFaultInformationInTable(mtProperty);
    }

    this.checkFaultDetailsValiadation = function(faultValidation){
        commonFunction.clickOnElement(this.addFaultBtn, "Add Fault button");          
        if(faultValidation.propertyId){
          commonFunction.sendKeysInto(this.propSearchInput, faultValidation.propertyId);
          commonFunction.clickOnElement(this.propSearchResult, "Property Search result");
        }
        commonFunction.clickOnElement(this.faultCategory, "Fault Category");
        if(faultValidation.validation){
          commonFunction.clickOnElement(this.faultTitleInput, "Fault Title");
          commonFunction.clickOnElement(this.faultUrgency, "Fault Urgency");
          let titleErrorMsg = commonFunction.updateVerificationObject(this.titleError, "Fault title error"); 
          expect(titleErrorMsg).toContainData(faultValidation.titleError);
          commonFunction.sendKeysInto(this.faultTitleInput, faultValidation.title);
          commonFunction.clickOnElement(this.nextBtn, "Next button");
          commonFunction.waitForElementToBeVisible(this.faultDetailsTab, "Fault Details tab");
          commonFunction.scrollToElement(this.nextBtn);
          commonFunction.clickOnElement(this.reportedByTab, "Reported By tab");
          commonFunction.waitForElementToBeVisible(this.reporterList, "Reporter Name list");
          commonFunction.clickOnElement(this.accessInfoTab, "Access Information tab");
          commonFunction.waitForElementToBeVisible(this.accessInfoList, "Access Information list");
          commonFunction.clickOnElement(this.reviewTab, "Review tab");
          commonFunction.clickOnElement(this.faultDetailsTab, "Fault Details tab");
          commonFunction.waitForElementToBeVisible(this.faultDescriptionInput, "Fault Description");
          let descriptionErrorMsg = commonFunction.updateVerificationObject(this.descriptionError, "Fault description error"); 
          expect(descriptionErrorMsg).toContainData(faultValidation.descriptionError);
          commonFunction.clickOnElement(this.reportedByTab, "Reported By tab");
          commonFunction.waitForElementToBeVisible(this.reporterList, "Reporter Name list");
          let agreementErrorMsg = commonFunction.updateVerificationObject(this.agreementError, "Tenancy agreement error"); 
          expect(agreementErrorMsg).toContainData(faultValidation.agreementError);          
          let tenantNameMsg = commonFunction.updateVerificationObject(this.tenantNameError, "Tenant name error"); 
          expect(tenantNameMsg).toContainData(faultValidation.tenantNameError);
          commonFunction.clickOnElement(this.accessInfoTab, "Access Information tab");
          commonFunction.waitForElementToBeVisible(this.accessInfoList, "Access Information list");
          let accessInfoMsg = commonFunction.updateVerificationObject(this.accessInfoError, "Access Information error"); 
          expect(accessInfoMsg).toContainData(faultValidation.accessInfoError);         
        } else {
          commonFunction.sendKeysInto(this.faultTitleInput, faultValidation.title);
          commonFunction.clickOnElement(this.nextBtn, "Next button");
          commonFunction.waitForElementToBeVisible(this.faultDetailsTab, "Fault Details tab");
          commonFunction.scrollToElement(this.nextBtn);
          commonFunction.sendKeysInto(this.faultDescriptionInput, faultValidation.description);
          commonFunction.clickOnElement(this.nextBtn, "Next button");
          if(faultValidation.reporter){         
            if(faultValidation.reporter.includes("Tenant")){
              commonFunction.selectFromDropDown(this.agreementList, this.agreement, "Tenancy Agreement List", faultValidation.tenancyAgreement);
            } else if (faultValidation.reporter.includes("Guarantor")){
              commonFunction.selectFromDropDown(this.reporterTypeList, this.reporterType, "Fault Reporter Type list", faultValidation.reporter);
              commonFunction.selectFromDropDown(this.agreementList, this.agreement, "Tenancy Agreement List", faultValidation.tenancyAgreement);
            } else {
                commonFunction.selectFromDropDown(this.reporterTypeList, this.reporterType, "Fault Reporter Type list", faultValidation.reporter);
            }                 
          }
          commonFunction.selectFromDropDown(this.reporterList, this.reporterName, "Reporter list", faultValidation.reporterName);
          commonFunction.scrollToElement(this.nextBtn);
          commonFunction.clickOnElement(this.nextBtn, "Next button");
          commonFunction.selectFromDropDown(this.accessInfoList, this.accessInfo, "Access Information list", faultValidation.accessInfo);
          commonFunction.scrollToElement(this.nextBtn);
          commonFunction.clickOnElement(this.nextBtn, "Next button");
          commonFunction.scrollToElement(this.nextBtn);
          commonFunction.uploadImage(this.uploadImage, faultValidation.faultImage, "Fault image");
          if(faultValidation.cancelFault){
            commonFunction.scrollToElement(this.cancelBtn);
            commonFunction.clickOnElement(this.cancelBtn, "Cancel button");
            commonFunction.waitForElementToBeVisible(this.actionBtn, "Action button for first fault"); 
            let tblJobTitle = commonFunction.updateVerificationObject(this.jobTitleTbl, "Job title in Fault Table"); 
            expect(tblJobTitle).not.toContainData(faultValidation.title);
          }
        }      
    }

    this.saveFaultForLater = function(faultSaveLater){
      commonFunction.clickOnElement(this.addFaultBtn, "Add Fault button");          
      if(faultSaveLater.propertyId){
        commonFunction.sendKeysInto(this.propSearchInput, faultSaveLater.propertyId);
        commonFunction.clickOnElement(this.propSearchResult, "Property Search result");
      }
      commonFunction.clickOnElement(this.faultCategory, "Fault Category");
      commonFunction.sendKeysInto(this.faultTitleInput, faultSaveLater.title);
      commonFunction.clickOnElement(this.nextBtn, "Next button");
      commonFunction.waitForElementToBeVisible(this.faultDetailsTab, "Fault Details tab");
      commonFunction.scrollToElement(this.nextBtn);
      commonFunction.sendKeysInto(this.faultDescriptionInput, faultSaveLater.description);
      commonFunction.clickOnElement(this.saveForLaterBtn, "SaveForLater button");
      commonFunction.waitForElementToBeVisible(this.actionBtn, "Action button for first fault");
      var tblJobTitle = commonFunction.updateVerificationObject(this.jobTitleTbl, "Job title in Fault Table"); 
      expect(tblJobTitle).toContainData(faultSaveLater.tableJobTitle); 
      this.viewFault();
      commonFunction.scrollToElement(this.nextBtn);
      commonFunction.clickOnElement(this.nextBtn, "Next button");
      if(faultSaveLater.reporter){         
        if(faultSaveLater.reporter.includes("Tenant")){
          commonFunction.selectFromDropDown(this.agreementList, this.agreement, "Tenancy Agreement List", faultSaveLater.tenancyAgreement);
        } else if (faultSaveLater.reporter.includes("Guarantor")){
          commonFunction.selectFromDropDown(this.reporterTypeList, this.reporterType, "Fault Reporter Type list", faultSaveLater.reporter);
          commonFunction.selectFromDropDown(this.agreementList, this.agreement, "Tenancy Agreement List", faultSaveLater.tenancyAgreement);
        } else {
            commonFunction.selectFromDropDown(this.reporterTypeList, this.reporterType, "Fault Reporter Type list", faultSaveLater.reporter);
        }                 
      }
      commonFunction.selectFromDropDown(this.reporterList, this.reporterName, "Reporter list", faultSaveLater.reporterName);
      commonFunction.scrollToElement(this.nextBtn);
      commonFunction.clickOnElement(this.nextBtn, "Next button");
      commonFunction.selectFromDropDown(this.accessInfoList, this.accessInfo, "Access Information list", faultSaveLater.accessInfo);
      commonFunction.scrollToElement(this.nextBtn);
      commonFunction.clickOnElement(this.nextBtn, "Next button");
      commonFunction.scrollToElement(this.nextBtn);
      commonFunction.uploadImage(this.uploadImage, faultSaveLater.faultImage, "Fault image");
      commonFunction.scrollToElement(this.saveForLaterBtn);
      commonFunction.clickOnElement(this.saveForLaterBtn, "SaveForLater button"); 
      this.checkFaultInformationInTable(faultSaveLater);
    }    
}
module.exports = Fault;
