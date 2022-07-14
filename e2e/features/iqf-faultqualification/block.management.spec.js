var fault = require('../igf-logfault/add.fault.page');
var faultSummary = require('../igf-logfault/fault.summary.page');
var blockManagement = require('./block.management.page');
var blockManagementJson = require('../../resources/json/blockmanagement.json');

describe('FixAFault Module', function(){

    it('should allow PM to complete block management repair', function(){
        let json = blockManagementJson.faultDetails.blockManagementComplete; 
        let addFault = new fault(json); 
        let summary = new faultSummary(json);
        let bmRepair = new blockManagement(json);
                      
        addFault.createFault(json);        
        summary.startFaultProgress(json);
        bmRepair.completeRepair(json);
    });

    it('should allow PM to submit response - block management repair not complete', function(){
        let json = blockManagementJson.faultDetails.blockManagementComplete; 
        let addFault = new fault(json); 
        let summary = new faultSummary(json);
        let bmRepair = new blockManagement(json);
                      
        addFault.createFault(json);        
        summary.startFaultProgress(json);
        bmRepair.notCompletedRepair(json);
    });

    it('should allow PM to view block management details', function(){
        let json = blockManagementJson.faultDetails.blockManagementComplete; 
        let addFault = new fault(json); 
        let summary = new faultSummary(json);
        let bmRepair = new blockManagement(json);
                      
        addFault.createFault(json);        
        summary.startFaultProgress(json);
        bmRepair.checkBMDetails(json);
    });  

    it('should allow PM to switch block management repair flow to a different way', function(){
        let json = blockManagementJson.faultDetails.switchRepairToLLOwnRepair; 
        let addFault = new fault(json); 
        let summary = new faultSummary(json);
        let bmRepair = new blockManagement(json);
                      
        addFault.createFault(json);        
        summary.startFaultProgress(json);
        bmRepair.changeRepairToLLOwnRepair(json);
    });   
})
