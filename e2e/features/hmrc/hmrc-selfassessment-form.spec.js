var login = require('../login/login.page');
var hmrc = require('./hmrc-selfassessment-form.page');


   describe('HMRC Reporting Module', function(){

    it('should validate navigation to HMRC reporting page', function(){
        let userLogin = new login();  
        let hmrcPage = new hmrc();
        userLogin.navigateToHMRC(); 
        hmrcPage.waitForHMRCPageToLoad("verify");
        userLogin.logoutFromPortal();      
    });

    it('should validate HMRC form send via email', function(){
        let userLogin = new login();  
        let hmrcPage = new hmrc();
        userLogin.navigateToHMRC();
        hmrcPage.waitForHMRCPageToLoad();
        hmrcPage.applyFilter();
        hmrcPage.selectTableRecord();
        hmrcPage.navigateToNextScreen();
        hmrcPage.selectFinancialYear();
        hmrcPage.navigateToNextScreen();
        hmrcPage.hmrcReportPreview();
        hmrcPage.clickOnSendButton();
        hmrcPage.validateProgress();
        hmrcPage.validateFinish();
        userLogin.logoutFromPortal();
    });

    it('should validate reset filter', function(){
        let userLogin = new login();  
        let hmrcPage = new hmrc();
        userLogin.navigateToHMRC();
        hmrcPage.waitForHMRCPageToLoad();
        hmrcPage.applyFilter();
        hmrcPage.validateSelection();
        hmrcPage.resetFilter();
        hmrcPage.validateFilterReset();
        userLogin.logoutFromPortal();
    });

    it('should validate select all select none', function(){
        let userLogin = new login();  
        let hmrcPage = new hmrc();
        userLogin.navigateToHMRC();
        hmrcPage.waitForHMRCPageToLoad();
        hmrcPage.clickSelectAll();
        hmrcPage.validateCheckBoxSelection("check");
        hmrcPage.clickSelectNone();
        hmrcPage.validateCheckBoxSelection("uncheck");
        userLogin.logoutFromPortal();
    });

    it('should validate pagination', function(){
        let userLogin = new login();  
        let hmrcPage = new hmrc();
        userLogin.navigateToHMRC();
        hmrcPage.waitForHMRCPageToLoad();
        hmrcPage.validateCheckBoxSelection();
        userLogin.logoutFromPortal();
    });
})
