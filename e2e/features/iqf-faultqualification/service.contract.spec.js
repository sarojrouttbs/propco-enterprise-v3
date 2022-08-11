var fault = require('../igf-logfault/add.fault.page');
var faultSummary = require('../igf-logfault/fault.summary.page');
var serviceContract = require('./service.contract.page');
var serviceContractJson = require('../../resources/json/servicecontract.json');

describe('FixAFault Module', function(){

    it('should allow PM to complete Service Contract repair', function(){
        let json = serviceContractJson.faultDetails.serviceContractComplete; 
        let addFault = new fault(json); 
        let summary = new faultSummary(json);
        let scRepair = new serviceContract(json);
                      
        addFault.createFault(json);        
        summary.startFaultProgress(json);
        scRepair.completeRepair(json);
    });

    it('should allow PM to submit response - Service Contract repair not complete', function(){
        let json = serviceContractJson.faultDetails.serviceContractComplete; 
        let addFault = new fault(json); 
        let summary = new faultSummary(json);
        let scRepair = new serviceContract(json);
                      
        addFault.createFault(json);        
        summary.startFaultProgress(json);
        scRepair.notCompletedRepair(json);
    });

    it('should allow PM to view Service Contract details', function(){
        let json = serviceContractJson.faultDetails.serviceContractComplete; 
        let addFault = new fault(json); 
        let summary = new faultSummary(json);
        let scRepair = new serviceContract(json);
                      
        addFault.createFault(json);        
        summary.startFaultProgress(json);
        scRepair.checkSCDetails(json);
    });  

    it('should allow PM to switch Service Contract repair flow to a different way', function(){
        let json = serviceContractJson.faultDetails.switchRepairToLLOwnRepair; 
        let addFault = new fault(json); 
        let summary = new faultSummary(json);
        let scRepair = new serviceContract(json);
                      
        addFault.createFault(json);        
        summary.startFaultProgress(json);
        scRepair.changeRepairToLLOwnRepair(json);
    });   
})
