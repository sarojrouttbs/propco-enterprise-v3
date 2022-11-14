var commonUtil = require('../../util/common.util.page');
var webdriver = require('selenium-webdriver');
var login = require('../login/login.page');
var commonFunction = new commonUtil();
var loginFunction = new login();

var MarketAppraisal = function () {   

    this.cancelButton = element(by.xpath("//*[text()='Cancel']"))
    this.cancelPopText = element(by.xpath("//*[text()='Are you sure you want to cancel?']"))
    this.cancelpopYes = element(by.xpath("//div[contains(@class,'alert-button')]//span[text()='Yes']"))
    this.marketDetailsPageHeader = element(by.xpath("//*[text()=' Marketing Details ']"))

    this.cancelFunctionality = function(){     
        commonFunction.waitForElementToBeVisible(this.marketDetailsPageHeader, "Marketing Details");
        commonFunction.scrollToElement(this.cancelButton);
        commonFunction.clickOnElement(this.cancelButton, "Cancel Button");
        commonFunction.waitForElementToBeVisible(this.cancelPopText, "Market Appraisal - Are you sure you want to cancel?");
        commonFunction.waitForElementToBeVisible(this.cancelpopYes, "Cancel Pop up Yes");
        commonFunction.clickOnElement(this.cancelpopYes, "Cancel Pop up Yes");
        commonFunction.waitForElementToBePresent(loginFunction.marketAppraisalIcon);



    }
}  
module.exports = MarketAppraisal;