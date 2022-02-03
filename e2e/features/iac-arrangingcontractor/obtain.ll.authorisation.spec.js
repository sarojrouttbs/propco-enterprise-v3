var fault = require('../igf-logfault/add.fault.page');
var faultSummary = require('../igf-logfault/fault.summary.page');
var obtainLLAuthorisation = require('./obtain.ll.authorisation.page');
var obtainLLAuthorisationJson = require('../../resources/json/obtainllauthorisation.json');

describe('FixAFault Module', function(){

    it('should allow PM to complete Obtain LL Authorisation process', function(){
        let json = obtainLLAuthorisationJson.faultDetails.obtainLLAuthorisationComplete; 
        let addFault = new fault(json); 
        let summary = new faultSummary(json);
        let llAuthorisationRepair = new obtainLLAuthorisation(json);
                      
        addFault.createFault(json);        
        summary.startFaultProgress(json);
        llAuthorisationRepair.completeRepair(json);
    }); 

    it('should allow PM to reject repair estimate on behalf of landlord', function(){
        let json = obtainLLAuthorisationJson.faultDetails.obtainLLAuthorisationComplete; 
        let addFault = new fault(json); 
        let summary = new faultSummary(json);
        let llAuthorisationRepair = new obtainLLAuthorisation(json);
                                   
        addFault.createFault(json);        
        summary.startFaultProgress(json);
        llAuthorisationRepair.rejectEstimateRequest(json);
    });
   
    it('should allow PM to switch Obtain LL Authorisation Repair flow to a different way', function(){
        let json =  obtainLLAuthorisationJson.faultDetails.switchRepairToLLOwnRepair; 
        let addFault = new fault(json); 
        let summary = new faultSummary(json);
        let llAuthorisationRepair = new obtainLLAuthorisation(json);
                      
        addFault.createFault(json);        
        summary.startFaultProgress(json);
        llAuthorisationRepair.changeRepairToLLOwnRepair(json);
    });  
})
