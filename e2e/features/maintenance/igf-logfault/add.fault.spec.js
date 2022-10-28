var login = require('../../login/login.page');
var fault = require('./add.fault.page');
var addFaultJson = require('../../../resources/json/addfault.json');

describe('FixAFault Module', function(){
   
    it('should allow PM to create a repair on behalf of Tenant - IGF002_01, IGF002_02', function(){
        let json = addFaultJson.faultDetails.tenant; 
        let userLogin = new login(); 
        let addFault = new fault(json); 
  
        userLogin.loginToMaintenance();
        addFault.createFault(json);
        addFault.checkFaultInformationInTable(json);   
        userLogin.logoutFromPortal();          
    });

    it('should not allow repair creation for Non Fully Managed Property - IGF002_03', function(){
         let json = addFaultJson.faultDetails.nfmProperty; 
         let userLogin = new login(); 
         let addFault = new fault(json); 
         
         userLogin.loginToMaintenance();
         addFault.addFaultForNFMProperty(json);     
         userLogin.logoutFromPortal();   
     });

    it('should allow PM to save repair details for later - IGF002_05, IGF002_06', function(){
         let json = addFaultJson.faultDetails.saveForLater;
         let userLogin = new login();  
         let addFault = new fault(json); 
         
         userLogin.loginToMaintenance();
         addFault.saveFaultForLater(json);    
         userLogin.logoutFromPortal();    
    });

    it('should allow PM to upload multiple repair documents - IGF002_07', function(){
         let json = addFaultJson.faultDetails.uploadFaultDocs; 
         let userLogin = new login(); 
         let addFault = new fault(json); 
          
         userLogin.loginToMaintenance();
         addFault.createFault(json);
         addFault.viewFault();
         addFault.checkFaultDocument(json.deleteFile, true, "Repair document is present");     
         userLogin.logoutFromPortal();   
    });    
    
    it('should allow PM to create a repair on behalf of Landlord - IGF002_08', function(){
         let json = addFaultJson.faultDetails.landlord; 
         let userLogin = new login(); 
         let addFault = new fault(json); 
          
         userLogin.loginToMaintenance();
         addFault.createFault(json);
         addFault.checkFaultInformationInTable(json); 
         userLogin.logoutFromPortal();       
    });    

    it('should allow PM to create a repair on behalf of Guarantor - IGF002_09', function(){
         let json = addFaultJson.faultDetails.guarantor; 
         let userLogin = new login(); 
         let addFault = new fault(json); 
         
         userLogin.loginToMaintenance();
         addFault.createFault(json);
         addFault.checkFaultInformationInTable(json);       
         userLogin.logoutFromPortal(); 
    });

    it('should allow PM to create a repair on behalf of Third Party - IGF002_10', function(){
         let json = addFaultJson.faultDetails.thirdParty; 
         let userLogin = new login(); 
         let addFault = new fault(json); 
          
         userLogin.loginToMaintenance();
         addFault.createFault(json);
         addFault.checkFaultInformationInTable(json);       
         userLogin.logoutFromPortal(); 
    });

    it('should validate mandatory fields during repair creation - IGF002_11', function(){
         let json = addFaultJson.faultDetails.errorValidation; 
         let userLogin = new login(); 
         let addFault = new fault(json); 
         
         userLogin.loginToMaintenance();
         addFault.checkFaultDetailsValiadation(json);       
         userLogin.logoutFromPortal(); 
    }); 

    it('should not create repair if repair creation is cancelled - IGF002_12', function(){
         let json = addFaultJson.faultDetails.cancelFault; 
         let userLogin = new login(); 
         let addFault = new fault(json); 
          
         userLogin.loginToMaintenance();
         addFault.checkFaultDetailsValiadation(json);       
         userLogin.logoutFromPortal(); 
    }); 
    
    it('should allow repair creation on behalf of any Tenant for Multi-Tenant Property - IGF002_14', function(){
         let json = addFaultJson.faultDetails.multiTenantProperty; 
         let userLogin = new login(); 
         let addFault = new fault(json); 
          
         userLogin.loginToMaintenance();
         addFault.addFaultForMultiTenantProperty(json);      
         userLogin.logoutFromPortal(); 
    });

    it('should not allow repair title to be greater than 70 characters - IGF002_15', function(){
         let json = addFaultJson.faultDetails.faultTitleError; 
         let userLogin = new login(); 
         let addFault = new fault(json); 
           
         userLogin.loginToMaintenance();
         addFault.checkFaultTitleLength(json);       
         userLogin.logoutFromPortal(); 
    });
     
})
