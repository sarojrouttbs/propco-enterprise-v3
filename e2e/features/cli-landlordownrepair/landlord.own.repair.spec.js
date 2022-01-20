var fault = require('../igf-logfault/add.fault.page');
var faultSummary = require('../igf-logfault/fault.summary.page');
var landlordOwnRepair = require('../cli-landlordownrepair/landlord.own.repair.page');
var llOwnRepairJson = require('../../resources/json/llownrepair.json');

describe('FixAFault Module', function(){

    it('should allow PM to complete Landlord Own Repair process', function(){
        let json = llOwnRepairJson.fault_details.llOwnRepairComplete; 
        let addFault = new fault(json); 
        let summary = new faultSummary(json);
        let llOwnRepair = new landlordOwnRepair(json);
                      
        addFault.createFault(json);        
        summary.startFaultProgress(json);
        llOwnRepair.completeLLOwnRepair(json);
    }); 

    it('should allow PM to edit Landlord contractor details', function(){
        let json = llOwnRepairJson.fault_details.llContractorDetails; 
        let addFault = new fault(json); 
        let summary = new faultSummary(json);
        let llOwnRepair = new landlordOwnRepair(json);
                      
        addFault.createFault(json);        
        summary.startFaultProgress(json);
        llOwnRepair.editContractorDetails(json);
    });

    it('should allow PM to submit response - Landlord does not want to proceed with own contractor', function(){
        let json = llOwnRepairJson.fault_details.llOwnRepairComplete; 
        let addFault = new fault(json); 
        let summary = new faultSummary(json);
        let llOwnRepair = new landlordOwnRepair(json);
                      
        addFault.createFault(json);        
        summary.startFaultProgress(json);
        llOwnRepair.doesNotProceedWithOwnRepair(json);
    });

    it('should allow PM to submit response - Landlord wants to arrange a new contractor', function(){
        let json = llOwnRepairJson.fault_details.llOwnRepairComplete; 
        let addFault = new fault(json); 
        let summary = new faultSummary(json);
        let llOwnRepair = new landlordOwnRepair(json);
                      
        addFault.createFault(json);        
        summary.startFaultProgress(json);
        llOwnRepair.arrangeContractor(json);
    });

    it('should allow PM to submit response - Tenant is not satisfied with repair', function(){
        let json = llOwnRepairJson.fault_details.llOwnRepairComplete; 
        let addFault = new fault(json); 
        let summary = new faultSummary(json);
        let llOwnRepair = new landlordOwnRepair(json);
                      
        addFault.createFault(json);        
        summary.startFaultProgress(json);
        llOwnRepair.resendTenantSatisfyNotification(json);
    });
    
    it('should allow PM to switch Landlord Own Repair flow to a different way', function(){
        let json = llOwnRepairJson.fault_details.switchRepairToObtainQuote; 
        let addFault = new fault(json); 
        let summary = new faultSummary(json);
        let llOwnRepair = new landlordOwnRepair(json);
                      
        addFault.createFault(json);        
        summary.startFaultProgress(json);
        llOwnRepair.changeRepairToObtainQuote(json);
    });
})
