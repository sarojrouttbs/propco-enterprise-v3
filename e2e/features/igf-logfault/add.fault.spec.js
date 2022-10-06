var fault = require('./add.fault.page');
var fileUtil = require('../../util/file.util.page');
var addFaultJson = require('../../resources/json/addfault.json');
var fileFunction = new fileUtil();

describe('FixAFault Module', function(){
   
    it('should allow PM to create a repair on behalf of Tenant - IGF002_01, IGF002_02', function(done){
        let json = addFaultJson.faultDetails.tenant; 
        let addFault = new fault(json); 

        try{ 
            fileFunction.downloadFileFrom(json.fileSource, json.faultImage).then(result => {
                console.log("File available: " + result);
                addFault.createFault(json, result);
                addFault.checkFaultInformationInTable(json);
                done();                                                                    
            }, 120000) 
        } catch(error){
            console.log("File is not available for upload: " + error);            
        }            
    }, 240000);

    /* it('should not allow repair creation for Non Fully Managed Property - IGF002_03', function(){
         let json = addFaultJson.faultDetails.nfmProperty; 
         let addFault = new fault(json); 
                      
         addFault.addFaultForNFMProperty(json);       
     });

     it('should allow PM to save repair details for later - IGF002_05, IGF002_06', function(){
         let json = addFaultJson.faultDetails.saveForLater; 
         let addFault = new fault(json); 
                      
         addFault.saveFaultForLater(json);       
     });

     it('should allow PM to upload multiple repair documents - IGF002_07', function(){
         let json = addFaultJson.faultDetails.uploadFaultDocs; 
         let addFault = new fault(json); 
                  
         addFault.createFault(json);
         addFault.viewFault();
         addFault.checkFaultDocument(json.deleteFile, true, "Repair document is present");       
     });    
    
     it('should allow PM to create a repair on behalf of Landlord - IGF002_08', function(){
         let json = addFaultJson.faultDetails.landlord; 
         let addFault = new fault(json); 
                      
         addFault.createFault(json);
         addFault.checkFaultInformationInTable(json);       
     });    

     it('should allow PM to create a repair on behalf of Guarantor - IGF002_09', function(){
         let json = addFaultJson.faultDetails.guarantor; 
         let addFault = new fault(json); 
                      
         addFault.createFault(json);
         addFault.checkFaultInformationInTable(json);       
     });

     it('should allow PM to create a repair on behalf of Third Party - IGF002_10', function(){
         let json = addFaultJson.faultDetails.thirdParty; 
         let addFault = new fault(json); 
                      
         addFault.createFault(json);
         addFault.checkFaultInformationInTable(json);       
     });

     it('should validate mandatory fields during repair creation - IGF002_11', function(){
         let json = addFaultJson.faultDetails.errorValidation; 
         let addFault = new fault(json); 
                      
         addFault.checkFaultDetailsValiadation(json);       
     });    

     it('should not create repair if repair creation is cancelled - IGF002_12', function(){
         let json = addFaultJson.faultDetails.cancelFault; 
         let addFault = new fault(json); 
                      
         addFault.checkFaultDetailsValiadation(json);       
     }); 
    
     it('should allow repair creation on behalf of any Tenant for Multi-Tenant Property - IGF002_14', function(){
         let json = addFaultJson.faultDetails.multiTenantProperty; 
         let addFault = new fault(json); 
                      
         addFault.addFaultForMultiTenantProperty(json);      
     });

     it('should not allow repair title to be greater than 70 characters - IGF002_15', function(){
         let json = addFaultJson.faultDetails.faultTitleError; 
         let addFault = new fault(json); 
                      
         addFault.checkFaultTitleLength(json);       
     });
     */
})
