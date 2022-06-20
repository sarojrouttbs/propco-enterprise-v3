var fault = require('../igf-logfault/add.fault.page');
var faultSummary = require('../igf-logfault/fault.summary.page');
var paymentRequirement = require('./payment.requirement.page');
var paymentRequirementJson = require('../../resources/json/paymentrequirement.json');

describe('FixAFault Module', function(){

    it("should allow PM to complete repair after Landlord's payment", function(){
        let json = paymentRequirementJson.faultDetails.paymentRequirementComplete; 
        let addFault = new fault(json); 
        let summary = new faultSummary(json);
        let payRequirementRepair = new paymentRequirement(json);
                      
        addFault.createFault(json);        
        summary.startFaultProgress(json);
        payRequirementRepair.completeRepairAfterPayment(json);
    }); 

    it("should allow PM to complete repair without pre-payment", function(){
        let json = paymentRequirementJson.faultDetails.paymentRequirementComplete; 
        let addFault = new fault(json); 
        let summary = new faultSummary(json);
        let payRequirementRepair = new paymentRequirement(json);
                      
        addFault.createFault(json);        
        summary.startFaultProgress(json);
        payRequirementRepair.completeRepairWithoutPrePayment(json);
    }); 

    it('should allow PM to switch Payment Requirement Repair flow to a different way', function(){
        let json =  paymentRequirementJson.faultDetails.switchRepairToLLOwnRepair; 
        let addFault = new fault(json); 
        let summary = new faultSummary(json);
        let payRequirementRepair = new paymentRequirement(json);
                      
        addFault.createFault(json);        
        summary.startFaultProgress(json);
        payRequirementRepair.changeRepairToLLOwnRepair(json);
    });  
})
