var fault = require('../igf-logfault/add.fault.page');
var faultSummary = require('../igf-logfault/fault.summary.page');
var obtainQuote = require('../iac-arrangingcontractor/obtain.quote.page');
var chronologicalHistory = require('./chronological.history.page');
var chronologicalHistoryJson = require('../../../resources/json/chronologicalhistory.json');

describe('FixAFault Module', function(){

    it('should allow PM to check chronological history events for a reported fault', function(){
        let chJson = chronologicalHistoryJson.faultDetails.reportedFault; 
        let addFault = new fault(chJson); 
        let history = new chronologicalHistory(chJson);
                  
        addFault.createFault(chJson);
        addFault.viewFault();
        history.checkHistoryEvents(chJson);
    }); 

    it('should allow PM to check multiple chronological history events', function(){
        let chJson = chronologicalHistoryJson.faultDetails.switchRepairToWorksOrder; 
        let addFault = new fault(chJson);
        let summary = new faultSummary(chJson); 
        let quoteRepair = new obtainQuote(chJson);
        let history = new chronologicalHistory(chJson);       
                      
        addFault.createFault(chJson);      
        summary.startFaultProgress(chJson);
        quoteRepair.changeRepairToWorksOrder(chJson);
        history.checkHistoryEvents(chJson);
        history.checkPageData(chJson);
    });      
})
