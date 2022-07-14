var fault = require('../igf-logfault/add.fault.page');
var faultSummary = require('../igf-logfault/fault.summary.page');
var proceedWorksorder = require('./proceed.with.worksorder.page');
var proceedWorksorderJson = require('../../resources/json/proceedworksorder.json');

describe('FixAFault Module', function(){

    it('should allow PM to complete Works Order process', function(){
        let json = proceedWorksorderJson.faultDetails.proceedWorksorderComplete; 
        let addFault = new fault(json); 
        let summary = new faultSummary(json);
        let woRepair = new proceedWorksorder(json);
                      
        addFault.createFault(json);        
        summary.startFaultProgress(json);
        woRepair.completeWorksorder(json);
    }); 

    it('should allow PM to reject Works Order request on behalf of contractor', function(){
        let json = proceedWorksorderJson.faultDetails.proceedWorksorderComplete; 
        let addFault = new fault(json); 
        let summary = new faultSummary(json);
        let woRepair = new proceedWorksorder(json);
                      
        addFault.createFault(json);        
        summary.startFaultProgress(json);
        woRepair.rejectWorksOrderRequest(json);
    });

    it('should allow PM to submit response - contractor could not complete the job', function(){
        let json =  proceedWorksorderJson.faultDetails.proceedWorksorderComplete; 
        let addFault = new fault(json); 
        let summary = new faultSummary(json);
        let woRepair = new proceedWorksorder(json);
                      
        addFault.createFault(json);        
        summary.startFaultProgress(json);
        woRepair.couldNotCompleteJob(json);
    }); 

    it('should validate Works Order details', function(){
        let json =  proceedWorksorderJson.faultDetails.worksOrderDetails; 
        let addFault = new fault(json); 
        let summary = new faultSummary(json);
        let woRepair = new proceedWorksorder(json);
                      
        addFault.createFault(json);        
        summary.startFaultProgress(json);
        woRepair.checkWorksOrderDetails(json);
    });

    it('should allow PM to edit Works Order visit time', function(){
        let json =  proceedWorksorderJson.faultDetails.editWOVisitTime; 
        let addFault = new fault(json); 
        let summary = new faultSummary(json);
        let woRepair = new proceedWorksorder(json);
                      
        addFault.createFault(json);        
        summary.startFaultProgress(json);
        woRepair.editWOVisitTime(json);
    });

    it('should allow PM to switch Works Order Repair flow to a different way', function(){
        let json =  proceedWorksorderJson.faultDetails.switchRepairToLLOwnRepair; 
        let addFault = new fault(json); 
        let summary = new faultSummary(json);
        let woRepair = new proceedWorksorder(json);
                      
        addFault.createFault(json);        
        summary.startFaultProgress(json);
        woRepair.changeRepairToLLOwnRepair(json);
    });  
})
