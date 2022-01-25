var fault = require('../igf-logfault/add.fault.page');
var faultSummary = require('../igf-logfault/fault.summary.page');
var proceedAgentNecessity = require('./proceed.agent.necessity.page');
var proceedAgentNecessityJson = require('../../resources/json/proceedagentnecessity.json');

describe('FixAFault Module', function(){

    it('should allow PM to complete Proceed As Agent of Necessity repair', function(){
        let json = proceedAgentNecessityJson.fault_details.proceedAgentNecessityComplete; 
        let addFault = new fault(json); 
        let summary = new faultSummary(json);
        let agentNecessityRepair = new proceedAgentNecessity(json);
                      
        addFault.createFault(json);        
        summary.startFaultProgress(json);
        agentNecessityRepair.completeNecessityRepair(json);
    }); 

    it('should allow PM to reject Works Order request on behalf of contractor during Proceed As Agent of Necessity repair', function(){
        let json = proceedAgentNecessityJson.fault_details.proceedAgentNecessityComplete; 
        let addFault = new fault(json); 
        let summary = new faultSummary(json);
        let agentNecessityRepair = new proceedAgentNecessity(json);
                      
        addFault.createFault(json);        
        summary.startFaultProgress(json);
        agentNecessityRepair.rejectWorksOrderRequest(json);
    });

    it('should allow PM to submit response during Proceed As Agent of Necessity repair - contractor could not complete the job', function(){
        let json =  proceedAgentNecessityJson.fault_details.proceedAgentNecessityComplete;  
        let addFault = new fault(json); 
        let summary = new faultSummary(json);
        let agentNecessityRepair = new proceedAgentNecessity(json);
                      
        addFault.createFault(json);        
        summary.startFaultProgress(json);
        agentNecessityRepair.couldNotCompleteJob(json);
    }); 

    it('should validate Works Order details during Proceed As Agent of Necessity repair', function(){
        let json =  proceedAgentNecessityJson.fault_details.worksOrderDetails; 
        let addFault = new fault(json); 
        let summary = new faultSummary(json);
        let agentNecessityRepair = new proceedAgentNecessity(json);
                      
        addFault.createFault(json);        
        summary.startFaultProgress(json);
        agentNecessityRepair.checkWorksOrderDetails(json);
    });

    it('should allow PM to edit Works Order visit time during Proceed As Agent of Necessity repair', function(){
        let json =  proceedAgentNecessityJson.fault_details.editWOVisitTime; 
        let addFault = new fault(json); 
        let summary = new faultSummary(json);
        let agentNecessityRepair = new proceedAgentNecessity(json);
                      
        addFault.createFault(json);        
        summary.startFaultProgress(json);
        agentNecessityRepair.editWOVisitTime(json);
    });

    it('should allow PM to switch Proceed As Agent of Necessity repair Repair flow to a different way', function(){
        let json =  proceedAgentNecessityJson.fault_details.switchRepairToLLOwnRepair; 
        let addFault = new fault(json); 
        let summary = new faultSummary(json);
        let agentNecessityRepair = new proceedAgentNecessity(json);
                      
        addFault.createFault(json);        
        summary.startFaultProgress(json);
        agentNecessityRepair.changeRepairToLLOwnRepair(json);
    });  
})
