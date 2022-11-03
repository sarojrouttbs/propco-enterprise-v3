var commonUtil = require('../../util/common.util.page');
var commonFunction = new commonUtil();

var Login = function () {     
    
    /**
     * Locators for elements used in 'Login' functionality  
     */
    
    
    this.userName = element(by.xpath("//ion-input[@formcontrolname='username']"));
    this.userNameInput = element(by.xpath("//ion-input[@formcontrolname='username']/input"));
    this.userPwd = element(by.xpath("//ion-input[@formcontrolname='password']"));
    this.userPwdInput = element(by.xpath("//ion-input[@formcontrolname='password']/input"));
    this.domainList = element(by.xpath("//ion-select[@formcontrolname='domainId']")); 
    this.domainValue = element(by.xpath("//ion-label[contains(text(), '" + browser.params.domain + "')]/following-sibling::ion-radio"));
    this.loginBtn =  element(by.xpath("//ion-button[@type='submit']"));
    this.userProfileBtn = element(by.css("ion-fab.alphabet-box > ion-fab-button"));
    this.logoutBtn = element(by.xpath("//img[@title='Logout']"));
    this.logoutConfirmYesBtn = element(by.css("button.ion-color-success"));
    this.logoutConfirmNoBtn = element(by.css("button.alert-button-role-cancel"));
    this.tobLogoutBtn = element(by.xpath("//ion-fab-list//img[contains(@src, 'logout')]"));
    this.dashboardIcon = element(by.xpath("//p[contains(text(), '" + browser.params.module + "')]/preceding-sibling::i"));
    this.marketAppraisalIcon = element(by.css("i.propcoicon-available-property-list"));
    this.reportingLink = element(by.xpath("//span[text()='Reporting']"));
    this.hmrcAssessmentFormLink = element(by.xpath("//button[text()='HMRC Self-Assessment Form']"));
   
    this.loginToPortal = function() { 
        commonFunction.waitForElementToBeVisible(this.userPwdInput, "User Password"); 
        commonFunction.sendKeysInto(this.userNameInput, browser.params.username);
        commonFunction.selectFromDropDown(this.domainList, this.domainValue, "Domain list", browser.params.domain);
        commonFunction.sendKeysInto(this.userPwdInput, browser.params.password);
        browser.sleep(3000);
        commonFunction.clickOnElement(this.loginBtn, "Login button");
        browser.sleep(5000);            
    }   

    this.loginToMaintenance = function(){
        if(browser.params.environment.includes("Portal")){
            browser.get(browser.params.agent_url_qa,180000);
            this.loginToPortal();
            this.marketAppraisalIcon.isPresent().then(result => {
                commonFunction.clickOnElement(this.dashboardIcon, "Dashboard icon " + browser.params.module);
            })
        } else{
            browser.get(browser.params.fixafault_url_qa,180000);
        }
    }

    this.logoutFromPortal = function () {    
        if(browser.params.environment.includes("Portal")){    
            commonFunction.waitForElementToBeVisible(this.logoutBtn, "Logout button"); 
            // commonFunction.clickOnElement(this.userProfileBtn, "User profile button");
            commonFunction.clickOnElement(this.logoutBtn, "Logout button");
            commonFunction.waitForElementToBeVisible(this.logoutConfirmYesBtn, "Logout confirm popup");
            commonFunction.clickOnElement(this.logoutConfirmYesBtn, "Logout button");
            commonFunction.waitForElementToBeVisible(this.userPwd, "User password");
        }
    }    

    this.navigateToHMRC = function(){
        if(browser.params.environment.includes("Portal")){
            browser.get(browser.params.agent_url_qa,180000);
            this.loginToPortal();
            this.marketAppraisalIcon.isPresent().then(result => {
                commonFunction.mouseHover(this.reportingLink);
                browser.sleep(3000);
                commonFunction.clickOnElement(this.hmrcAssessmentFormLink, "Navigation Link " + browser.params.module);
            })
        } else{
            browser.get(browser.params.fixafault_url_qa,180000);
        }
    }
}
module.exports = Login;