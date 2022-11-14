var fault = require('./add.fault.page');
var faultEscalate = require('./fault.escalate.page');
var faultEscalateJson = require('../../../resources/json/faultescalate.json');

describe('FixAFault Module', function(){

    it('should allow PM to escalate a fault - IGF010_01', function(){
        let fJson = faultEscalateJson.faultDetails.faultReported; 
        let eJson = faultEscalateJson.faultDetails.escalateFault;
        let addFault = new fault(fJson); 
        let escalate = new faultEscalate();
        
        addFault.createFault(fJson);        
        escalate.escalateFault(eJson);       
        escalate.checkEscalationDetails(eJson);
    }); 

    it('should allow PM to de-escalate a fault - IGF010_02', function(){
        let fJson = faultEscalateJson.faultDetails.faultReported; 
        let eJson = faultEscalateJson.faultDetails.escalateFault;
        let dJson = faultEscalateJson.faultDetails.deEscalateFault;
        let addFault = new fault(fJson); 
        let escalate = new faultEscalate();
              
        addFault.createFault(fJson);        
        escalate.escalateFault(eJson); 
        escalate.deEscalateFault(dJson);      
        escalate.checkEscalationDetails(dJson);
    });

    it('should allow PM to cancel fault escalation - IGF010_03', function(){
        let fJson = faultEscalateJson.faultDetails.faultReported; 
        let eJson = faultEscalateJson.faultDetails.cancelEscalateFault;
        let addFault = new fault(fJson); 
        let escalate = new faultEscalate();
        
        addFault.createFault(fJson);        
        escalate.escalateFault(eJson);       
        escalate.checkEscalationDetails(eJson);
    });

    it('should allow PM to cancel fault de-escalation - IGF010_04', function(){
        let fJson = faultEscalateJson.faultDetails.faultReported; 
        let eJson = faultEscalateJson.faultDetails.escalateFault;
        let dJson = faultEscalateJson.faultDetails.cancelDeEscalateFault;
        let addFault = new fault(fJson); 
        let escalate = new faultEscalate();
              
        addFault.createFault(fJson);        
        escalate.escalateFault(eJson); 
        escalate.deEscalateFault(dJson);      
        escalate.checkEscalationDetails(dJson);
    }); 

    it('should validate mandatory fields before fault escalation - IGF009_05', function(){
        let fJson = faultEscalateJson.faultDetails.faultReported; 
        let eJson = faultEscalateJson.faultDetails.validationEscalate;
        let addFault = new fault(fJson); 
        let escalate = new faultEscalate();
        
        addFault.createFault(fJson);        
        escalate.checkEscalateValidations(eJson);       
    });  
})
