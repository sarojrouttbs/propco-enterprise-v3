var fault = require('../igf-logfault/add.fault.page');
var faultSummary = require('../igf-logfault/fault.summary.page');
var mergeFault = require('../igf-logfault/merge.fault.page');
var faultClosure = require('./close.fault.page');
var faultClosureJson = require('../../resources/json/closefault.json');

describe('FixAFault Module', function(){

    it('should allow PM to view a fault and close it', function(){
        let json = faultClosureJson.faultDetails.faultClosureComplete; 
        let addFault = new fault(json); 
        let summary = new faultSummary(json);
        let closeFault = new faultClosure(json);
                      
        addFault.createFault(json);        
        summary.startFaultProgress(json);
        closeFault.completeFaultClosure(json);
    });

    it('should allow PM to close a fault from dashboard', function(){
        let json = faultClosureJson.faultDetails.faultClosureDashboard; 
        let addFault = new fault(json); 
        let merge = new mergeFault(json);
        let closeFault = new faultClosure(json);
                      
        addFault.createFault(json);        
        merge.createFaultQuoteWO(json);
        closeFault.completeFaultClosureFromDashboard(json);
    });
   
})
