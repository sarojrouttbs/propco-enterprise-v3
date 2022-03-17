var fault = require('../igf-logfault/add.fault.page');
var faultSummary = require('../igf-logfault/fault.summary.page');
var guaranteeWarranty = require('./guarantee.warranty.page');
var guaranteeWarrantyJson = require('../../resources/json/guaranteewarranty.json');

describe('FixAFault Module', function(){

    it('should allow PM to complete Guarantee Warranty repair', function(){
        let json = guaranteeWarrantyJson.faultDetails.guaranteeWarrantyComplete; 
        let addFault = new fault(json); 
        let summary = new faultSummary(json);
        let gwRepair = new guaranteeWarranty(json);
                      
        addFault.createFault(json);        
        summary.startFaultProgress(json);
        gwRepair.completeRepair(json);
    });

    it('should allow PM to submit response - Guarantee management repair not complete', function(){
        let json = guaranteeWarrantyJson.faultDetails.guaranteeWarrantyComplete; 
        let addFault = new fault(json); 
        let summary = new faultSummary(json);
        let gwRepair = new guaranteeWarranty(json);
                      
        addFault.createFault(json);        
        summary.startFaultProgress(json);
        gwRepair.notCompletedRepair(json);
    });

    it('should allow PM to view Guarantee Warranty details', function(){
        let json = guaranteeWarrantyJson.faultDetails.guaranteeWarrantyComplete; 
        let addFault = new fault(json); 
        let summary = new faultSummary(json);
        let gwRepair = new guaranteeWarranty(json);
                      
        addFault.createFault(json);        
        summary.startFaultProgress(json);
        gwRepair.checkGWDetails(json);
    });  

    it('should allow PM to switch Guarantee Warranty repair flow to a different way', function(){
        let json = guaranteeWarrantyJson.faultDetails.switchRepairToLLOwnRepair; 
        let addFault = new fault(json); 
        let summary = new faultSummary(json);
        let gwRepair = new guaranteeWarranty(json);
                      
        addFault.createFault(json);        
        summary.startFaultProgress(json);
        gwRepair.changeRepairToLLOwnRepair(json);
    });   
})
