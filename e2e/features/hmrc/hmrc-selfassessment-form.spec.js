var login = require('../login/login.page');
var hmrc = require('./hmrc-selfassessment-form.page');


   describe('HMRC Reporting Module', function(){

    it('should validate navigation to HMRC reporting page', function(){
        let userLogin = new login();  
        userLogin.navigateToHMRC();        
    });

    it('should validate HMRC form send via email', function(){
        let hmrcPage = new hmrc();
        hmrcPage.waitForHMRCPageToLoad();
        hmrcPage.applyFilter()
        hmrcPage.selectTableRecord()
        hmrcPage.navigateToNextScreen()
        hmrcPage.selectFinancialYear()
        hmrcPage.navigateToNextScreen()
        hmrcPage.hmrcReportPreview()
        hmrcPage.clickOnSendButton()
        hmrcPage.validateProgress()
        hmrcPage.validateFinish()
    });

    it('should validate reset filter', function(){
        let hmrcPage = new hmrc();
        hmrcPage.applyFilter()
        hmrcPage.validateSelection()
        hmrcPage.resetFilter()
        hmrcPage.validateFilterReset()

    });

   it('should validate select all select none', function(){
    let hmrcPage = new hmrc();
    hmrcPage.clickSelectAll()
    hmrcPage.validateCheckBoxSelection("check")
    hmrcPage.clickSelectNone()
    hmrcPage.validateCheckBoxSelection("uncheck")

    });

    it('should validate pagination', function(){
        let hmrcPage = new hmrc();
        hmrcPage.validateCheckBoxSelection()

    });
})
