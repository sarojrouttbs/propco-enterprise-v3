var fault = require('../igf-logfault/add.fault.page');
var faultSummary = require('../igf-logfault/fault.summary.page');
var applianceCover = require('./appliance.cover.page');
var applianceCoverJson = require('../../resources/json/appliancecover.json');

describe('FixAFault Module', function(){

    it('should allow PM to complete Appliance Cover repair', function(){
        let json = applianceCoverJson.faultDetails.applianceCoverComplete; 
        let addFault = new fault(json); 
        let summary = new faultSummary(json);
        let acRepair = new applianceCover(json);
                      
        addFault.createFault(json);        
        summary.startFaultProgress(json);
        acRepair.completeRepair(json);
    });

    it('should allow PM to submit response - Appliance Cover repair not complete', function(){
        let json = applianceCoverJson.faultDetails.applianceCoverComplete; 
        let addFault = new fault(json); 
        let summary = new faultSummary(json);
        let acRepair = new applianceCover(json);
                      
        addFault.createFault(json);        
        summary.startFaultProgress(json);
        acRepair.notCompletedRepair(json);
    });

    it('should allow PM to view Appliance Cover details', function(){
        let json = applianceCoverJson.faultDetails.applianceCoverComplete; 
        let addFault = new fault(json); 
        let summary = new faultSummary(json);
        let acRepair = new applianceCover(json);
                      
        addFault.createFault(json);        
        summary.startFaultProgress(json);
        acRepair.checkACDetails(json);
    });  

    it('should allow PM to switch Appliance Cover repair flow to a different way', function(){
        let json = applianceCoverJson.faultDetails.switchRepairToLLOwnRepair; 
        let addFault = new fault(json); 
        let summary = new faultSummary(json);
        let acRepair = new applianceCover(json);
                      
        addFault.createFault(json);        
        summary.startFaultProgress(json);
        acRepair.changeRepairToLLOwnRepair(json);
    });   
})
