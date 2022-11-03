var login = require('../login/login.page');
var marketAppraisal = require('./market.appraisal.page');

   describe('Market Appraisal Module', function(){

    it('should validate navigation to Market Appraisal page', function(){
        let userLogin = new login(); 
        userLogin.loginToMaintenance()  
              
    });

    it('should validate cancel functionality on Market Appraisal page', function(){
        let marketApp = new marketAppraisal();
        let userLogin = new login(); 
        marketApp.cancelFunctionality()

        userLogin.logoutFromPortal();          
    });
})
