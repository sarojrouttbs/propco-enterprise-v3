var commonUtil = require('../../../util/common.util.page');
var commonFunction = new commonUtil();

var ChronologicalHistory = function (faultDetails) {
    
    /**
     * Locators for elements used in 'Chronological History' functionality
     */ 

    this.chIcon = element(by.xpath("//img[@mattooltip='Chronological History']"));
    this.chPopupCloseBtn = element(by.xpath("//ion-buttons[@slot='end']"));
    this.firstHistoryRowTbl = element(by.xpath("//table[@id='chronological']/tbody/tr[1]/td[1]"));
   
    this.includeEBodyCheckbox = element(by.xpath("//input[@type='checkbox']"));
    this.historyTableLengthList = element(by.xpath("//select[@name='chronological_length']"));
    this.historyEntryCountTxt = element(by.css("div#chronological_info"));
    this.firstHistoryPageBtn = element(by.css("a#chronological_first"));
    this.previousHistoryPageBtn = element(by.css("a#chronological_previous"));
    this.nextHistoryPageBtn = element(by.css("a#chronological_next"));
    this.lastHistoryPageBtn = element(by.css("a#chronological_last"));    

    this.checkHistoryEvents = function(faultReported){
        commonFunction.clickOnSpecificElement(by.xpath("//img[@mattooltip='Chronological History']"), "last", "Chronological History icon");
        commonFunction.waitForElementToBeVisible(this.firstHistoryRowTbl, "History table first row");
        commonFunction.clickOnElement(commonFunction.getElementByCssContainingText('ion-button', 'Expand All'), "Expand All button");
        commonFunction.waitForElementToBeVisible(this.firstHistoryRowTbl, "History table first row");
        if(faultReported.historyEventList){
            commonFunction.checkVisibleData('tr.parent td', faultReported.historyEventList, true, "History Event Action/Category is");
        }
        if(faultReported.historyDetailFieldList){
            commonFunction.checkOptionData('tr.res-child td', faultReported.historyDetailFieldList, faultReported.historyDetailValueList, true, "History Event Details");
        }
    }     
    
    this.checkPageData = function(faultReported){
        if(faultReported.entryList){
            let entries = faultReported.entryList.split(",");
            entries.forEach(function(entry){
                let history = new ChronologicalHistory(faultReported);
                commonFunction.scrollToElement(history.historyTableLengthList);
                commonFunction.clickOnElement(history.historyTableLengthList, "Show entries list");
                commonFunction.clickOnSpecificElement(by.cssContainingText('option', entry), "last", "Show " + entry + " entries");
                commonFunction.waitForElementToBeVisible(history.firstHistoryRowTbl, "First event in History table");
                commonFunction.scrollToElement(history.historyEntryCountTxt);
                history.historyEntryCountTxt.getText().then(function(result){ 
                    let totalEvents = result.substring(result.indexOf("f") + 1, result.indexOf("e") - 1);
                    if(parseInt(totalEvents) > parseInt(entry)) {
                        let countText = commonFunction.updateVerificationObject(history.historyEntryCountTxt, "Number of events shown on current page with Show entries option as " + entry); 
                        expect(countText).toContainData("Showing 1 to " + entry);
                    } 
                    if(parseInt(totalEvents) <= parseInt(entry) && parseInt(totalEvents) > 0) {
                        let countText = commonFunction.updateVerificationObject(history.historyEntryCountTxt, "Number of events shown on current page with Show entries option as " + entry); 
                        expect(countText).toContainData("Showing 1 to " + totalEvents);
                    }
                    if(parseInt(totalEvents) > 0){
                        let lastPageNumber = Math.ceil(parseInt(totalEvents) / parseInt(entry));
                        let optList = "1," + lastPageNumber.toString();
                        if(lastPageNumber > 1){
                            commonFunction.checkVisibleData('div#chronological_paginate a', optList , true, "Show entries option as " + entry + " Page number is");
                        }
                    }
                });               
            });
        }  
    }
}
module.exports = ChronologicalHistory;
