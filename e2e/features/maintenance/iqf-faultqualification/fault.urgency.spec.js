var fault = require('../igf-logfault/add.fault.page');
var faultSummary = require('../igf-logfault/fault.summary.page');
var faultUrgency = require('./fault.urgency.page');
var faultUrgencyJson = require('../../../resources/json/faulturgency.json');

describe('FixAFault Module', function(){

    it('should allow PM to edit fault urgency', function(){
        let json = faultUrgencyJson.faultDetails.faultUrgencyComplete; 
        let addFault = new fault(json); 
        let summary = new faultSummary(json);
        let repairUrgency = new faultUrgency(json);
                      
        addFault.createFault(json);        
        summary.startFaultProgress(json);
        repairUrgency.editFaultUrgency(json);
    });   
   
})
