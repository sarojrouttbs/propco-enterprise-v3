var fault = require('../igf-logfault/add.fault.page');
var faultSummary = require('../igf-logfault/fault.summary.page');
var requestMoreInformation = require('./request.more.information.page');
var requestMoreInformationJson = require('../../resources/json/requestmoreinfo.json');

describe('FixAFault Module', function(){

    it('should allow PM to complete repair process after tenant provides requested information', function(){
        let json = requestMoreInformationJson.faultDetails.requestMoreInfoComplete; 
        let addFault = new fault(json); 
        let summary = new faultSummary(json);
        let requestMoreInfo = new requestMoreInformation(json);
                      
        addFault.createFault(json);        
        summary.startFaultProgress(json);
        requestMoreInfo.completeRepairAfterMoreInfo(json);
    });

    it('should allow PM to submit response - requested information not received from tenant', function(){
        let json = requestMoreInformationJson.faultDetails.requestMoreInfoComplete; 
        let addFault = new fault(json); 
        let summary = new faultSummary(json);
        let requestMoreInfo = new requestMoreInformation(json);
                      
        addFault.createFault(json);        
        summary.startFaultProgress(json);
        requestMoreInfo.receiveNoInfo(json);
    }); 

    it('should allow PM to switch repair flow to a different way when more info is requested from tenant', function(){
        let json = requestMoreInformationJson.faultDetails.switchRepairToLLOwnRepair; 
        let addFault = new fault(json); 
        let summary = new faultSummary(json);
        let requestMoreInfo = new requestMoreInformation(json);
                      
        addFault.createFault(json);        
        summary.startFaultProgress(json);
        requestMoreInfo.changeRepairToLLOwnRepair(json);
    });    
})
