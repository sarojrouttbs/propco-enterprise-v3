var login = require('../login/login.page');
var marketAppraisal = require('./market.appraisal.page');
var marketAppraisalJson = require('../../resources/json/marketappraisal.json');


   describe('Market Appraisal Module', function(){

    it('should validate navigation to Market Appraisal page', function(){
        let userLogin = new login(); 
        userLogin.loginToMaintenance()                
    });

    it('should validate cancel functionality on Market Appraisal page', function(){
        let json = marketAppraisalJson.appraisalDetails.default;
        let marketApp = new marketAppraisal(json);
        marketApp.cancelFunctionality()                  
    });

    it('should validate mandatory messages for LL without property on Market Appraisal page', function(){
        let json = marketAppraisalJson.appraisalDetails.default;
        let marketApp = new marketAppraisal(json);
        marketApp.navigateToMarketAppraisalPageFromDashboard()
        marketApp.validateMandatoryErrorMessages()
    });

    it('should validate LL without property on Market Appraisal page', function(){
        let json = marketAppraisalJson.appraisalDetails.default;
        let marketApp = new marketAppraisal(json);
        let name = marketApp.randomName();
        marketApp.saveWithoutBooking(json, name)
        marketApp.searchBooking(name)

    });

    it('should validate LL with property on Market Appraisal page', function(){
        let json = marketAppraisalJson.appraisalDetails.default;
        let marketApp = new marketAppraisal(json);
        let name = marketApp.randomName();
        marketApp.addProperty()
        

    });
})
