var fault = require('../igf-logfault/add.fault.page');
var faultSummary = require('../igf-logfault/fault.summary.page');
var obtainQuote = require('../iac-arrangingcontractor/obtain.quote.page');
var obtainQuoteJson = require('../../../resources/json/obtainquote.json');

describe('FixAFault Module', function(){

    it('should allow PM to complete Obtain Quote and Repair process', function(){
        let json = obtainQuoteJson.faultDetails.obtainQuoteComplete; 
        let addFault = new fault(json); 
        let summary = new faultSummary(json);
        let quoteRepair = new obtainQuote(json);
                      
        addFault.createFault(json);        
        summary.startFaultProgress(json);
        quoteRepair.completeQuoteRepair(json);
    }); 

    it('should allow PM to reject Quote request on behalf of contractor', function(){
        let json = obtainQuoteJson.faultDetails.obtainQuoteComplete; 
        let addFault = new fault(json); 
        let summary = new faultSummary(json);
        let quoteRepair = new obtainQuote(json);
                      
        addFault.createFault(json);        
        summary.startFaultProgress(json);
        quoteRepair.rejectQuoteRequest(json);
    });

    it('should allow PM to submit response - contractor could not carry out the quote', function(){
        let json = obtainQuoteJson.faultDetails.obtainQuoteComplete; 
        let addFault = new fault(json); 
        let summary = new faultSummary(json);
        let quoteRepair = new obtainQuote(json);
                      
        addFault.createFault(json);        
        summary.startFaultProgress(json);
        quoteRepair.couldNotCarryOutQuote(json);
    }); 

    it('should allow PM to reject Quote request on behalf of landlord', function(){
        let json = obtainQuoteJson.faultDetails.obtainQuoteComplete; 
        let addFault = new fault(json); 
        let summary = new faultSummary(json);
        let quoteRepair = new obtainQuote(json);
                      
        addFault.createFault(json);        
        summary.startFaultProgress(json);
        quoteRepair.rejectQuote(json);
    });

    it('should validate Quote details', function(){
        let json = obtainQuoteJson.faultDetails.quoteDetails; 
        let addFault = new fault(json); 
        let summary = new faultSummary(json);
        let quoteRepair = new obtainQuote(json);
                      
        addFault.createFault(json);        
        summary.startFaultProgress(json);
        quoteRepair.checkQuoteDetails(json);
    });

    it('should allow PM to edit quote visit time', function(){
        let json = obtainQuoteJson.faultDetails.editQuoteVisitTime; 
        let addFault = new fault(json); 
        let summary = new faultSummary(json);
        let quoteRepair = new obtainQuote(json);
                      
        addFault.createFault(json);        
        summary.startFaultProgress(json);
        quoteRepair.editQuoteVisitTime(json);
    });

    it('should allow PM to switch Obtain Quote Repair flow to a different way', function(){
        let json = obtainQuoteJson.faultDetails.switchRepairToWorksOrder; 
        let addFault = new fault(json); 
        let summary = new faultSummary(json);
        let quoteRepair = new obtainQuote(json);
                      
        addFault.createFault(json);        
        summary.startFaultProgress(json);
        quoteRepair.changeRepairToWorksOrder(json);
    });

   })
