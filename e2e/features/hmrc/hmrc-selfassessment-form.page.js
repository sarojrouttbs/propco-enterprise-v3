var commonUtil = require('../../util/common.util.page');
var webdriver = require('selenium-webdriver');
const { browser } = require('protractor');
const { element } = require('protractor');
var commonFunction = new commonUtil();

var hmrc = function () {

    this.hmrcHeaderText = element(by.xpath("//h2[text()='HMRC Self-Assessment Form']"));
    this.hmrcFilterManagement = element(by.xpath("//ion-item[contains(@class,'item-interactive item-ionic-selectable')]"));
    this.managementFilterLetOnly = element(by.xpath("//*[contains(@class,'ionic-selectable-group')]/ion-item[4]/ion-icon"));
    this.okButton = element(by.xpath("//*[contains(text(),'OK')]"));
    this.applyFiltersButton = element(by.xpath("//*[contains(text(),'Apply Filters')]"));
    this.resetFiltersButton = element(by.xpath("//*[contains(text(),'Reset Filters')]"));
    this.selectFirstRecord = element(by.xpath("//table[@id='hmrc-landlord-table']/tbody/tr[1]/td[1]/ion-checkbox"));
    this.nextButton = element(by.xpath("//ion-button[contains(text(),'Next')]"));
    this.selectFinancialYearDropdown = element(by.xpath("//*[contains(text(),'Select Financial Year')]/.."));
    this.selectFinancialYearDropdownValue = element(by.xpath("//*[contains(@class,'popover-viewport')]//ion-item[1]"));
    this.previewHMRCReport = element(by.xpath("//i[@mattooltip='Preview HMRC Report']"));
    this.sendButton = element(by.xpath("//ion-button[text()='Send']"));
    this.confirmButton = element(by.xpath("//span[text()='Confirm']"));
    this.progressSummary = element(by.xpath("//div[contains(text(),'We have successfully generated SA form for 0 records & saved the records in DMS.')]"));
    this.progressPercentage = element(by.xpath("//ion-label[contains(text(),'100%')]"));
    this.finishBUtton = element(by.xpath("//ion-button[contains(text(),'Finish')]"));
    this.finishFinalButton = element(by.xpath("//ion-button[contains(text(),'Ignore, i have all i need')]"));
    this.numberOfRecords = element(by.xpath("//table[@aria-label='progressSummary']/tr[2]/td[2]"));
    this.reportClose = element(by.xpath("//ion-buttons[contains(@class,'buttons-last-slot sc-ion-buttons')]"))
    this.managementSelectionValue = element(by.xpath("//div[contains(@class,'ionic-selectable-value-item')]"));
    this.selectAllButton = element(by.xpath("//*[contains(text(),'Select All')]"));
    this.selectNoneButton = element(by.xpath("//*[contains(text(),'Select None')]"));
    this.pagination1 = element(by.xpath("//a[text()='1']"));
    this.paginationFirst = element(by.xpath("//a[text()='First']"));
    this.paginationLast = element(by.xpath("//a[text()='Last']"));
    this.toastMessage = element(by.css("div.toast-message"));
    this.toastMessageCloseBtn = element(by.css("button.toast-close-button")); 
    this.loaderIcon = element(by.css("div#loading"));
    


    this.waitForHMRCPageToLoad = function (toBeVerified) {
        browser.sleep(3000)
        commonFunction.waitForElementToBeVisible(this.hmrcHeaderText, "HMRC Header Text");
        if(toBeVerified) {
            let headerText = commonFunction.updateVerificationObject(this.hmrcHeaderText, "HMRC page header"); 
            expect(headerText).toContainData("HMRC Self-Assessment Form");
        } 
    }

    this.applyFilter = function () {
        commonFunction.waitForElementToBeVisible(this.hmrcFilterManagement, "Management Filter");
        commonFunction.clickOnElement(this.hmrcFilterManagement, "Management Filter list");
        commonFunction.waitForElementToBeVisible(this.managementFilterLetOnly, "Management Filter");
        commonFunction.clickOnElement(this.managementFilterLetOnly, "Let Only");
        commonFunction.waitForElementToBeVisible(this.okButton, "OK Button");
        commonFunction.clickOnElement(this.okButton, "OK button");
        commonFunction.waitForElementToBeVisible(this.applyFiltersButton, "Apply Filter");
        commonFunction.clickOnElement(this.applyFiltersButton, "Apply Filters button");
        browser.sleep(3000);
    }

    this.resetFilter = function () {
        commonFunction.waitForElementToBeVisible(this.resetFiltersButton, "Reset Filter");
        commonFunction.clickOnElement(this.resetFiltersButton, "Reset Filter");
    }

    this.validateSelection = function () {
        commonFunction.waitForElementToBeVisible(this.managementSelectionValue, "Management Filter Value");
        var selectedValue = this.managementSelectionValue.getText();
        expect(selectedValue).toContain("Let Only");
    }

    this.validateFilterReset = function () {
        commonFunction.waitForElementToBeInvisible(this.managementSelectionValue, "Selected value disappears");
    }

    this.selectTableRecord = function () {
        commonFunction.waitForElementToBeVisible(this.selectFirstRecord, "Table first record");
        commonFunction.clickOnElement(this.selectFirstRecord, "First record from the table");
    }

    this.navigateToNextScreen = function () {
        commonFunction.scrollToElement(this.nextButton);
        commonFunction.clickOnElement(this.nextButton, "Next button");
    }

    this.selectFinancialYear = function () {
        commonFunction.waitForElementToBeVisible(this.selectFinancialYearDropdown, "Financial year dropdown");
        commonFunction.clickOnElement(this.selectFinancialYearDropdown, "Financial Year list");
        browser.sleep(2000);
        commonFunction.waitForElementToBeVisible(this.selectFinancialYearDropdownValue, "Financial year value");
        commonFunction.clickOnElement(this.selectFinancialYearDropdownValue, "First value from Financial Year list");
    }

    this.hmrcReportPreview = function () {
        commonFunction.waitForElementToBeVisible(this.previewHMRCReport, "HMRC Preview Report");
        commonFunction.clickOnElement(this.previewHMRCReport, "HMRC Preview Report icon");
        browser.sleep(7000);
        commonFunction.clickOnElement(this.reportClose, "Report Close");
        browser.sleep(2000);
    }


    this.clickOnSendButton = function () {
        commonFunction.waitForElementToBeVisible(this.sendButton, "Send Button")
        commonFunction.clickOnElement(this.sendButton, "Send button");
        commonFunction.waitForElementToBeVisible(this.confirmButton, "Confirm Button");
        commonFunction.clickOnElement(this.confirmButton, "Confirm Button");
    }


    this.validateProgress = function () {
        browser.sleep(3000);
        //commonFunction.waitForElementToBeVisible(this.progressSummary, "Progress Summary");
        commonFunction.waitForElementToBeInvisible(this.loaderIcon, "Loader icon"); 
        commonFunction.waitForElementToBeVisible(this.progressPercentage, "Progress Percentage");
        expect(this.numberOfRecords.getText()).toEqual("1");
    }

    this.validateFinish = function () {
        commonFunction.waitForElementToBeVisible(this.finishBUtton, "Finish Button");
        commonFunction.clickOnElement(this.finishBUtton, "Finish Button");
        commonFunction.waitForElementToBeVisible(this.finishFinalButton, "Finish Button");
        commonFunction.clickOnElement(this.finishFinalButton, "Finish Button");
        this.waitForHMRCPageToLoad();
    }

    this.clickSelectAll = function () {
        commonFunction.waitForElementToBeVisible(this.selectAllButton, "Select All Button");
        commonFunction.clickOnElement(this.selectAllButton, "Select All Button");
    }

    this.clickSelectNone = function () {
        commonFunction.waitForElementToBeVisible(this.selectNoneButton, "Select None Button");
        commonFunction.clickOnElement(this.selectNoneButton, "Select None Button");
    }

    this.validateCheckBoxSelection = function (value) {
        switch (value) {
            case "check":
                let checkBoxes = element.all(by.xpath("//table[@id='hmrc-landlord-table']/tbody/tr/td[1]/ion-checkbox"));
                for (var i = 0; i < checkBoxes.length; ++i) {
                    console.log("checkBoxes value ==>>" + checkBoxes.get(i).getAttribute("aria-checked"));
                    expect(checkBoxes.get(i).getAttribute("aria-checked")).toEqual(true);
                }
                break;
            case "uncheck":
                let unCheck = element.all(by.xpath("//table[@id='hmrc-landlord-table']/tbody/tr/td[1]/ion-checkbox"));
                for (var i = 0; i < unCheck.length; ++i) {
                    console.log("checkBoxes value ==>>" + unCheck.get(i).getAttribute("aria-checked"));
                    expect(unCheck.get(i).getAttribute("aria-checked")).toEqual(false);
                }
                break;
        }
    }

    this.validateCheckBoxSelection = function () {
        browser.sleep(2000);
        expect(!this.paginationFirst.isEnabled()).toBe(false);
        expect(this.paginationLast.isEnabled()).toBe(true);
        commonFunction.clickOnElement(this.paginationLast, "Last Button");
        browser.sleep(2000);
        expect(this.paginationFirst.isEnabled()).toBe(true);
        expect(!this.paginationLast.isEnabled()).toBe(false);
    }

}
module.exports = hmrc;