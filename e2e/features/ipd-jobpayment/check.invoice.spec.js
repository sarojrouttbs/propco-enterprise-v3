var fault = require('../igf-logfault/add.fault.page');
var faultSummary = require('../igf-logfault/fault.summary.page');
var checkInvoice = require('./check.invoice.page');
var checkInvoiceJson = require('../../resources/json/checkinvoice.json');

describe('FixAFault Module', function(){

    it('should allow PM to check invoice and accept/reject it', function(){
        let json = checkInvoiceJson.faultDetails.checkInvoiceComplete; 
        let addFault = new fault(json); 
        let summary = new faultSummary(json);
        let repairInvoice = new checkInvoice(json);
                      
        addFault.createFault(json);        
        summary.startFaultProgress(json);
        repairInvoice.reviewInvoice(json);
    }); 
      
})
