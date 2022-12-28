var commonUtil = require('../../util/common.util.page');
var webdriver = require('selenium-webdriver');
var login = require('../login/login.page');
const { element } = require('protractor');
var commonFunction = new commonUtil();
var loginFunction = new login();

var MarketAppraisal = function (appraisalDetails) {

    this.cancelButton = element(by.xpath("//*[text()='Cancel']"))
    this.cancelPopText = element(by.xpath("//*[text()='Are you sure you want to cancel?']"))
    this.cancelpopYes = element(by.xpath("//div[contains(@class,'alert-button')]//span[text()='Yes']"))
    this.marketDetailsPageHeader = element(by.xpath("//*[text()=' Marketing Details ']"))
    this.marketAppraisalIcon = element(by.css("i.propcoicon-available-property-list"));
    this.dashboardIcon = element(by.xpath("//p[contains(text(), '" + browser.params.module + "')]/preceding-sibling::i"));
    this.saveWithoutBookingButton = element(by.xpath("//ion-button[text()='Save Without Booking']"));
    this.mandatoryMessagesClass = by.xpath("//div[contains(@class,'error-message')]")
    this.howDidYouFindUsList = element(by.xpath("//ion-label[contains(text(), 'How did you find us?')]/following-sibling::ion-select"));
    this.howDidYouFindUs = element(by.xpath("//ion-label[contains(text(), '"+ appraisalDetails.howDidYouFindUs +"')]/following-sibling::ion-radio"))
    this.officeList = element(by.xpath("//ion-label[contains(text(), 'Office')]/following-sibling::ion-select"))
    this.officeListValue = element(by.xpath("//ion-label[contains(text(), '"+ appraisalDetails.office +"')]/following-sibling::ion-radio"))
    this.ownershipList = element(by.xpath("//ion-label[contains(text(), 'Ownership')]/following-sibling::ion-select"))
    this.ownershipListValue = element(by.xpath("//ion-label[contains(text(), '"+ appraisalDetails.owenership +"')]/following-sibling::ion-radio"))
    this.landlordStatusList = element(by.xpath("//ion-label[contains(text(), 'Landlord Status')]/following-sibling::ion-select"))
    this.landlordStatusListValue = element(by.xpath("//ion-label[contains(text(), '"+ appraisalDetails.landlordStatus +"')]/following-sibling::ion-radio"))
    this.numberOfOwners = element(by.xpath("//ion-label[contains(text(), 'Number of Owners')]/following-sibling::ion-input/input"))
    this.mobile = element(by.xpath("//ion-label[contains(text(), 'Mobile')]/following-sibling::ion-input/input"))
    this.home = element(by.xpath("//ion-label[contains(text(), 'Home')]/following-sibling::ion-input/input"))
    this.work = element(by.xpath("//ion-label[contains(text(), 'Work')]/following-sibling::ion-input/input"))
    this.email = element(by.xpath("//ion-label[contains(text(), 'Email')]/following-sibling::ion-input/input"))
    this.displayAsButton = element(by.xpath("//ion-label[contains(text(), 'Display As')]/../../following-sibling::ion-col/ion-button"))
    this.titleList = element(by.xpath("//ion-label[contains(text(), 'Title')]/following-sibling::ion-select"))
    this.titleValue = element(by.xpath("//ion-label[text()= '"+ appraisalDetails.title +"']/following-sibling::ion-radio"))
    this.forename = element(by.xpath("//ion-label[contains(text(), 'Forename')]/following-sibling::ion-input/input"))    
    this.surname = element(by.xpath("//ion-label[contains(text(), 'Surname')]/following-sibling::ion-input/input"))
    this.popUpSave = element(by.xpath("//ion-button[contains(text(),'save')]"))
    this.addAddressButton = element(by.xpath("//ion-label[contains(text(), 'Registered')]/../following-sibling::ion-col/ion-button"))
    this.postCode = element(by.xpath("//ion-label[contains(text(), 'Postcode')]/following-sibling::ion-input/input"))
    this.postCodeFindButton = element(by.xpath("//ion-button[text()='Find']"))
    this.selectAddressList = element(by.xpath("//ion-label[contains(text(), 'Select Address')]/following-sibling::ion-select"))
    this.selectAddressListValue = element(by.xpath("//ion-label[text()= '"+appraisalDetails.address+"']/following-sibling::ion-radio"))
    this.addressPopUpSaveButton = element(by.xpath("//ion-title[contains(text(),'Registered Address')]/../../following-sibling::ion-footer//ion-button"))
    this.acceptancePopUp = element(by.xpath("//span[text()='Yes']"))
    this.marketAppraisalPopUpText = element(by.xpath("//div[contains(text(),'Contact')]"))
    this.marketAppraisalPopUpOkButton = element(by.xpath("//span[contains(text(),'OK')]"))
    this.searchBox = element(by.xpath("//input[@placeholder= 'Start typing to search Contacts']"))
    this.searchResultList = element(by.xpath("//ion-list[@role= 'list']"))
    this.fieldValue = element(by.xpath("//ion-label[text()='Display As ']/following-sibling::ion-input/input"))
    this.goToPropertyButton = element(by.xpath("//ion-button[text()='Go To Property']"));
    this.copyAddressButton = element(by.xpath("//*[text()=' Property Address ']/../../following-sibling::div//ion-button[contains(text(),'Copy')]"))
    this.bedroomList = element(by.xpath("//ion-label[contains(text(), 'Bedrooms')]/following-sibling::ion-select"))
    this.bedroomValue = element(by.xpath("//ion-label[text()= '"+ appraisalDetails.bedroom +"']/following-sibling::ion-radio"))
    this.proprtyAgeList = element(by.xpath("//ion-label[contains(text(), 'Property Age')]/following-sibling::ion-select"))
    this.propertyAgeValue = element(by.xpath("//ion-label[text()= '"+ appraisalDetails.propertyAge +"']/following-sibling::ion-radio"))
    this.parkingList = element(by.xpath("//ion-label[contains(text(), 'Parking')]/following-sibling::ion-select"))
    this.parkingValue = element(by.xpath("//ion-label[text()= '"+ appraisalDetails.parking +"']/following-sibling::ion-radio"))
    this.typeList = element(by.xpath("//ion-label[contains(text(), 'Type')]/following-sibling::ion-select"))
    this.typeValue = element(by.xpath("//ion-label[text()= '"+ appraisalDetails.type +"']/following-sibling::ion-radio"))
    this.styleList = element(by.xpath("//ion-label[contains(text(), 'Style')]/following-sibling::ion-select"))
    this.styleValue = element(by.xpath("//ion-label[text()= '"+ appraisalDetails.style +"']/following-sibling::ion-radio"))
    this.lettingDetailsExpandButton = element(by.xpath("//*[text()=' Letting Details ']/..//div/span"))
    this.statusList = element(by.xpath("//ion-label[contains(text(), 'Status ')]/following-sibling::ion-select"))
    this.statusValue = element(by.xpath("//ion-label[text()= '"+ appraisalDetails.status +"']/following-sibling::ion-radio"))
    this.officeList1 = element(by.xpath("//*[text()=' Letting Details ']/../../../div//ion-label[contains(text(), 'Office')]/following-sibling::ion-select"))
    this.officeValue1 = element(by.xpath("//ion-label[text()= '"+ appraisalDetails.office1 +"']/following-sibling::ion-radio"))
    this.howLongList = element(by.xpath("//ion-label[contains(text(), 'How Long Looking to Let? ')]/following-sibling::ion-select"))
    this.howLOngValue = element(by.xpath("//ion-label[text()= '"+ appraisalDetails.howLOng +"']/following-sibling::ion-radio"))
    this.rentRangeTo = element(by.xpath("//input[contains(@class,'currency-input') and @formcontrolname='maximum']"))
    this.rentRangeFrom = element(by.xpath("//input[contains(@class,'currency-input') and @formcontrolname='minimum']"))
    this.datePicker = element(by.xpath("//*[@id='availableFromDate']/ion-input/input"))

    this.cancelFunctionality = function () {
        commonFunction.waitForElementToBeVisible(this.marketDetailsPageHeader, "Marketing Details");
        commonFunction.scrollToElement(this.cancelButton);
        commonFunction.clickOnElement(this.cancelButton, "Cancel Button");
        commonFunction.waitForElementToBeVisible(this.cancelPopText, "Market Appraisal - Are you sure you want to cancel?");
        commonFunction.waitForElementToBeVisible(this.cancelpopYes, "Cancel Pop up Yes");
        commonFunction.clickOnElement(this.cancelpopYes, "Cancel Pop up Yes");
        commonFunction.waitForElementToBePresent(loginFunction.marketAppraisalIcon);
    }

    this.navigateToMarketAppraisalPageFromDashboard = function () {
        browser.sleep(2000);
        this.marketAppraisalIcon.isPresent().then(result => {
            commonFunction.clickOnElement(this.dashboardIcon, "Dashboard icon " + browser.params.module);
            commonFunction.waitForElementToBeVisible(this.marketDetailsPageHeader, "Marketing Details");
        })
    }

    this.validateMandatoryErrorMessages = function () {
        browser.sleep(2000);
        commonFunction.scrollToElement(this.saveWithoutBookingButton);
        commonFunction.clickOnElement(this.saveWithoutBookingButton, "SaveWithoutBookingButton Button");
        browser.sleep(2000);

        let count = 0;
        let errorMessagesList = element.all(this.mandatoryMessagesClass);
        errorMessagesList.each(function (element, index) {
            element.getText().then(function (text) {
                console.log("Error Message" + index, text);
                expect(text).toEqual("This field is required.")
                count++;
            });
        }).then(() => {
            console.log("count=====" + count)
            expect(count).toBe(8)
        });

    }

    this.saveWithoutBooking = function(appraisalDetails, name){
        //Marketing Details
        commonFunction.selectFromDropDown(this.howDidYouFindUsList, this.howDidYouFindUs, "How Did You Find Us", appraisalDetails.howDidYouFindUs)
        commonFunction.selectFromDropDown(this.officeList, this.officeListValue, "Office", appraisalDetails.office )
        commonFunction.selectFromDropDown(this.ownershipList, this.ownershipListValue, "Ownership", appraisalDetails.owenership )
        commonFunction.selectFromDropDown(this.landlordStatusList, this.landlordStatusListValue, "Landlord Status", appraisalDetails.landlordStatus )
        commonFunction.sendKeysInto(this.numberOfOwners, appraisalDetails.numberOfOwners)
    
        //Contact name and address
        commonFunction.clickOnElement(this.displayAsButton, "DisplayAsButton Button");
        browser.sleep(3000);
        commonFunction.selectFromDropDown(this.titleList, this.titleValue, "HTitleow Did You Find Us", appraisalDetails.title)
        commonFunction.sendKeysInto(this.forename, name)
        commonFunction.sendKeysInto(this.surname, name)
        commonFunction.clickOnElement(this.popUpSave, "save on pop up");

        //Address
        commonFunction.clickOnElement(this.addAddressButton, "AddAddressButton Button");
        commonFunction.sendKeysInto(this.postCode, appraisalDetails.postcode)
        commonFunction.clickOnElement(this.postCodeFindButton, "post code find button");
        commonFunction.selectFromDropDown(this.selectAddressList, this.selectAddressListValue, "Select Address", appraisalDetails.address)
        browser.sleep(3000);
        commonFunction.clickOnElement(this.addressPopUpSaveButton, "AddAddress pop up save Button");
        

        //contact details
        commonFunction.sendKeysInto(this.mobile, appraisalDetails.phone)
        commonFunction.sendKeysInto(this.home, appraisalDetails.phone)
        commonFunction.sendKeysInto(this.work, appraisalDetails.phone)
        commonFunction.sendKeysInto(this.email, appraisalDetails.email)

        commonFunction.scrollToElement(this.saveWithoutBookingButton);
        commonFunction.clickOnElement(this.saveWithoutBookingButton, "SaveWithoutBookingButton Button");

        commonFunction.waitForElementToBeVisible(this.acceptancePopUp, "Accept Pop up");
        commonFunction.clickOnElement(this.acceptancePopUp, "Accept Pop up");

        commonFunction.waitForElementToBeVisible(this.marketAppraisalPopUpText, "pop up text");
        commonFunction.verification(this.marketAppraisalPopUpText, "Contact Mr " +name +" "+ name+ " has been created successfully")
     
        commonFunction.clickOnElement(this.marketAppraisalPopUpOkButton, "Accept Pop up ok");
        commonFunction.waitForElementToBePresent(loginFunction.marketAppraisalIcon);
        
    }

    this.randomName = function(){
        return commonFunction.generateRandomString(5);
    }

    this.searchBooking = function(name){
        browser.sleep(2000);
        this.navigateToMarketAppraisalPageFromDashboard();
        browser.sleep(3000);
        commonFunction.sendKeysInto(this.searchBox, name)
        browser.sleep(3000);
        commonFunction.clickOnElement(this.searchResultList, "Search results list");
        browser.sleep(3000);       
    }

    this.addProperty = function(){
        browser.sleep(2000);
        commonFunction.scrollToElement(this.goToPropertyButton);
        commonFunction.clickOnElement(this.goToPropertyButton, "GoToPropertyButton Button");

        commonFunction.clickOnElement(this.copyAddressButton, "CopyAddressButton Button");

        commonFunction.selectFromDropDown(this.bedroomList, this.bedroomValue, "Bedroom", appraisalDetails.bedroom)
        commonFunction.selectFromDropDown(this.proprtyAgeList, this.propertyAgeValue, "Property Age", appraisalDetails.propertyAge)
        commonFunction.selectFromDropDown(this.parkingList, this.parkingValue, "Parking", appraisalDetails.parking)
        commonFunction.selectFromDropDown(this.typeList, this.typeValue, "Type", appraisalDetails.type)
        commonFunction.selectFromDropDown(this.styleList, this.styleValue, "style", appraisalDetails.style)

        commonFunction.clickOnElement(this.lettingDetailsExpandButton, "expand letting section")
        browser.sleep(3000);
        commonFunction.scrollToElement(this.statusList)

        commonFunction.selectFromDropDown(this.statusList, this.statusValue, "status", appraisalDetails.status)
        commonFunction.selectFromDropDown(this.officeList1, this.officeValue1, "office", appraisalDetails.office1)
        commonFunction.selectFromDropDown(this.howLongList, this.howLOngValue, "how long", appraisalDetails.howLOng)
        browser.sleep(1000);
        commonFunction.sendkeys(this.rentRangeTo, "50000")
        commonFunction.sendkeys(this.rentRangeFrom, "10000")
        browser.sleep(1000);
        commonFunction.sendkeys(this.datePicker, commonFunction.getCurrentDate())
        browser.sleep(2000);
        commonFunction.scrollToElement(this.saveWithoutBookingButton);
        commonFunction.clickOnElement(this.saveWithoutBookingButton, "saveWithoutBookingButton Button");

        commonFunction.waitForElementToBeVisible(this.marketAppraisalPopUpText, "pop up text");
        commonFunction.verification(this.marketAppraisalPopUpText, "The Contact and/or the Property and their association has been created/modified successfully")
     
        commonFunction.clickOnElement(this.marketAppraisalPopUpOkButton, "Accept Pop up ok");
        commonFunction.waitForElementToBePresent(loginFunction.marketAppraisalIcon);


        browser.sleep(3000);
    }
    
}

module.exports = MarketAppraisal;