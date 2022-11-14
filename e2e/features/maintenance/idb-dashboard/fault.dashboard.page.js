var commonUtil = require('../../../util/common.util.page');
var commonFunction = new commonUtil();

var FaultDashboard = function (faultDetails) {
    
    /**
     * Locators for elements used in 'Fault Dashboard' functionality
     */ 
    this.addFaultBtn = element(by.xpath("//ion-button[contains(text(), 'Add Fault')]"));
   
    this.activeRepairsFltr = element(by.xpath("//ion-checkbox[@formcontrolname = 'repairCheckbox']"));
    this.activeRepairsCount = element(by.xpath("//ion-checkbox[@formcontrolname = 'repairCheckbox']/../following-sibling::div[1]"));
    this.emergencyFltr = element(by.xpath("//ion-checkbox[@formcontrolname = 'emergency']"));
    this.emergencyCount = element(by.xpath("//ion-checkbox[@formcontrolname = 'emergency']/../following-sibling::div[1]"));    
    this.urgentFltr = element(by.xpath("//ion-checkbox[@formcontrolname = 'urgent']"));
    this.urgentCount = element(by.xpath("//ion-checkbox[@formcontrolname = 'urgent']/../following-sibling::div[1]"));
    this.nonUrgentFltr = element(by.xpath("//ion-checkbox[@formcontrolname = 'nonUrgent']"));
    this.nonUrgentCount = element(by.xpath("//ion-checkbox[@formcontrolname = 'nonUrgent']/../following-sibling::div[1]"));
    this.inAssessmentFltr = element(by.xpath("//ion-checkbox[@formcontrolname = 'assessment']"));
    this.inAssessmentCount = element(by.xpath("//ion-checkbox[@formcontrolname = 'assessment']/../following-sibling::div[1]"));
    this.automationFltr = element(by.xpath("//ion-checkbox[@formcontrolname = 'automation']"));
    this.automationCount = element(by.xpath("//ion-checkbox[@formcontrolname = 'automation']/../following-sibling::div[1]"));
    this.invoiceFltr = element(by.xpath("//ion-checkbox[@formcontrolname = 'invoice']"));
    this.invoiceCount = element(by.xpath("//ion-checkbox[@formcontrolname = 'invoice']/../following-sibling::div[1]"));
    this.escalationFltr = element(by.xpath("//ion-checkbox[@formcontrolname = 'escalation']"));
    this.escalationCount = element(by.xpath("//ion-checkbox[@formcontrolname = 'escalation']/../following-sibling::div[1]"));
    this.fromDateBtn = element(by.xpath("//ion-datetime[@formcontrolname = 'fromDate']"));
    this.toDateBtn = element(by.xpath("//ion-datetime[@formcontrolname = 'toDate']"));
   
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
   
    this.showMyRepairBtn = element(by.xpath("//ion-toggle[@formcontrolname = 'showMyRepairs']"));
    this.faultTableLengthList = element(by.xpath("//select[@name='faultListTable_length']"));
    this.faultCountTxt = element(by.css("div#faultListTable_info"));
    this.firstPageBtn = element(by.css("a#faultListTable_first"));
    this.previousPageBtn = element(by.css("a#faultListTable_previous"));
    this.nextPageBtn = element(by.css("a#faultListTable_next"));
    this.lastPageBtn = element(by.css("a#faultListTable_last"));    

   
    this.checkBucketFilterData = function(faultReported){
        commonFunction.waitForElementToBeVisible(this.firstRowTbl, "First Fault");          
        commonFunction.scrollToElement(this.addFaultBtn);
        if(faultReported.filterList){
            let filters = faultReported.filterList.split(",");
            filters.forEach(function(filter){
               let dashboard = new FaultDashboard(faultReported);
               commonFunction.scrollToElement(element(by.xpath("//div[text()='" + filter + "']/preceding-sibling::div[2]/ion-checkbox")));
               commonFunction.clickOnElement(element(by.xpath("//div[text()='" + filter + "']/preceding-sibling::div[2]/ion-checkbox")), "Filter " +filter);
               commonFunction.waitForElementToBeVisible(dashboard.firstRowTbl, "First Fault"); 
               let bucketCount = element(by.xpath("//div[text()='" + filter + "']/preceding-sibling::div[1]")).getText();
               commonFunction.scrollToElement(dashboard.faultCountTxt);
               let countText = commonFunction.updateVerificationObject(dashboard.faultCountTxt, "Total number of faults shown in table for filter - " +filter); 
               expect(countText).toContainData(bucketCount);
               let pageFaults = element.all(by.css("table i"));
               pageFaults.count().then(function(pFaults){
                   switch(filter){
                       case "Emergency":
                           let emergencyFaults = element.all(by.css("ion-badge.ion-color-danger"));
                           emergencyFaults.count().then(function(count){
                               expect(count).toBeCorrect(pFaults, "Number of emergency faults displayed on the current page - " + count);
                           }); 
                           break; 
                       case "Urgent":
                           let urgentFaults = element.all(by.css("ion-badge.ion-color-warning"));
                           urgentFaults.count().then(function(count){
                               expect(count).toBeCorrect(pFaults, "Number of urgent faults displayed on the current page - " + count);
                           });
                           break; 
                       case "Non urgent":
                           let nonUrgentFaults = element.all(by.css("ion-badge.ion-color-success"));
                           nonUrgentFaults.count().then(function(count){
                               expect(count).toBeCorrect(pFaults, "Number of non urgent faults displayed on the current page - " + count);
                           });
                           break;
                       case "Escalation":
                           let escalatedFaults = element.all(by.css("table tr.escalated"));
                           escalatedFaults.count().then(function(count){
                               expect(count).toBeCorrect(pFaults, "Number of escalated faults displayed on the current page - " + count);
                           });
                           break;                               
                       default:
                           break;                    
                   }  
               });                   
            });
        }
    }

    this.checkMyRepairs = function(faultReported){
        commonFunction.waitForElementToBeVisible(this.firstRowTbl, "First Fault");          
        commonFunction.scrollToElement(this.showMyRepairBtn);
        commonFunction.clickOnElement(this.showMyRepairBtn, "Show my repairs toggle button");
        commonFunction.waitForElementToBeVisible(this.firstRowTbl, "First Fault"); 
        this.checkPageData(faultReported); 
        let pageFaults = element.all(by.css("table i"));
        pageFaults.count().then(function(pFaults){
            let myFaults = element.all(by.cssContainingText("tbody td:nth-child(6)", faultReported.myUser));
            myFaults.count().then(function(count){
               expect(count).toBeCorrect(pFaults, "Number of my faults displayed on the current page - " + count);
            });   
        });
        commonFunction.scrollToElement(this.lastPageBtn);
        this.lastPageBtn.isEnabled().then(function(result){
            let dashboard = new FaultDashboard(faultReported);
            if(result){
                commonFunction.clickOnElement(dashboard.lastPageBtn, "Last page button");
                commonFunction.waitForElementToBeVisible(dashboard.firstPageBtn, "First page button");
                let pageFaults = element.all(by.css("table i"));
                pageFaults.count().then(function(pFaults){
                    let myFaults = element.all(by.cssContainingText("tbody td:nth-child(6)", faultReported.myUser));
                    myFaults.count().then(function(count){
                        expect(count).toBeCorrect(pFaults, "Number of my faults displayed on the last page - " + count);
                    });   
                });
            } 
        });        
    }

    this.checkPageData = function(faultReported){
        if(faultReported.entryList){
            let entries = faultReported.entryList.split(",");
            entries.forEach(function(entry){
                let dashboard = new FaultDashboard(faultReported);
                commonFunction.scrollToElement(dashboard.faultTableLengthList);
                commonFunction.clickOnElement(dashboard.faultTableLengthList, "Show entries list");
                commonFunction.clickOnElement(commonFunction.getElementByCssContainingText('option', entry), "Show " + entry + " entries");
                commonFunction.waitForElementToBeVisible(dashboard.firstRowTbl, "First Fault");
                commonFunction.scrollToElement(dashboard.faultCountTxt);
                dashboard.faultCountTxt.getText().then(function(result){ 
                    let totalFaults = result.substring(result.indexOf("f") + 1, result.indexOf("e") - 1);
                    if(parseInt(totalFaults) > parseInt(entry)) {
                        let countText = commonFunction.updateVerificationObject(dashboard.faultCountTxt, "Number of faults shown on current page with Show entries option as " + entry); 
                        expect(countText).toContainData("Showing 1 to " + entry);
                    } 
                    if(parseInt(totalFaults) <= parseInt(entry) && parseInt(totalFaults) > 0) {
                        let countText = commonFunction.updateVerificationObject(dashboard.faultCountTxt, "Number of faults shown on current page with Show entries option as " + entry); 
                        expect(countText).toContainData("Showing 1 to " + totalFaults);
                    }
                    if(parseInt(totalFaults) > 0){
                        let lastPageNumber = Math.ceil(parseInt(totalFaults) / parseInt(entry));
                        let optList = "1," + lastPageNumber.toString();
                        if(lastPageNumber > 1){
                            commonFunction.checkVisibleData('a', optList , true, "Show entries option as " + entry + " Page number is");
                        }
                    }
                });               
            });
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
}
module.exports = FaultDashboard;
