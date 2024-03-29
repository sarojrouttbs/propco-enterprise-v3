var login = require('../../login/login.page');
var fault = require('./add.fault.page');
var faultSummary = require('./fault.summary.page');
var faultSummaryJson = require('../../../resources/json/faultsummary.json');

describe('FixAFault Module', function(){

    it('should allow PM to start fault progress - IGF004_01', function(){
        let json = faultSummaryJson.faultDetails.startProgress; 
        let userLogin = new login(); 
        let addFault = new fault(json); 
        let summary = new faultSummary(json);
        
        userLogin.loginToMaintenance();
        addFault.createFault(json);        
        summary.startFaultProgress(json);
        userLogin.logoutFromPortal();  
    }); 
    
    it('should allow PM to review fault details and property information - IGF004_02', function(){
        let json = faultSummaryJson.faultDetails.propertyInformation; 
        let userLogin = new login(); 
        let addFault = new fault(json); 
        let summary = new faultSummary(json);
        
        userLogin.loginToMaintenance();              
        addFault.createFault(json); 
        addFault.viewFault();       
        summary.checkFaultSummary(json);
        userLogin.logoutFromPortal();  
    });

    it('should allow PM to edit fault details - IGF004_03, IGF004_05, IGF004_06, IGF004_08, IGF004_09, IGF004_11, IGF004_12, IGF004_13, IGF004_14', function(){
        let json = faultSummaryJson.faultDetails.editFault; 
        let userLogin = new login(); 
        let addFault = new fault(json); 
        let summary = new faultSummary(json);
        
        userLogin.loginToMaintenance();
        addFault.createFault(json);  
        addFault.viewFault();       
        summary.editFaultDetails(json);
        addFault.checkFaultInformationInTable(json);
        addFault.viewFault();
        summary.checkReviewDetails(json);  
        userLogin.logoutFromPortal();        
    });  

    it('should allow PM to delete fault document - IGF004_10', function(){
        let json = faultSummaryJson.faultDetails.deleteFaultDoc; 
        let userLogin = new login(); 
        let addFault = new fault(json); 
        let summary = new faultSummary(json);
        
        userLogin.loginToMaintenance();
        addFault.createFault(json); 
        addFault.viewFault();       
        summary.deleteFaultDocument(json);
        addFault.viewFault(); 
        addFault.checkFaultDocument(json.deleteFile, false, "Fault document is not present");
        userLogin.logoutFromPortal();  
    });  

    it('should allow PM to cancel changes in fault details - IGF004_16, IGF004_17', function(){
        let json = faultSummaryJson.faultDetails.cancelEdit; 
        let userLogin = new login(); 
        let addFault = new fault(json); 
        let summary = new faultSummary(json);
         
        userLogin.loginToMaintenance();
        addFault.createFault(json);  
        addFault.viewFault();      
        summary.editFaultDetails(json);
        addFault.checkFaultInformationInTable(json);
        addFault.viewFault();
        summary.checkReviewDetails(json);
        userLogin.logoutFromPortal();  
    });
})
