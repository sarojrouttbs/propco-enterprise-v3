var login = require('../../login/login.page');
var fault = require('./add.fault.page');
var mergeFault = require('./merge.fault.page');
var mergeFaultJson = require('../../../resources/json/mergefault.json');

describe('FixAFault Module', function(){

   /* it('should allow PM to merge 2 faults of same type - IGF008_01', function(){
        let pJson = mergeFaultJson.faultDetails.parentFault; 
        let cJson = mergeFaultJson.faultDetails.childFault1;
        let mJson = mergeFaultJson.faultDetails.merge2SameFaults;
        let userLogin = new login(); 
        let addParentFault = new fault(pJson); 
        let addChildFault = new fault(cJson);
        let merge = new mergeFault(mJson);
        
        userLogin.loginToMaintenance();
        addChildFault.createFault(cJson);        
        addParentFault.createFault(pJson); 
        merge.createFaultList(mJson);       
        merge.mergeFaults(mJson);
        merge.checkMergedFaultDetails(mJson);
        userLogin.logoutFromPortal();  
    }); 

    it('should allow PM to merge 2 faults of different type - IGF008_02', function(){
        let pJson = mergeFaultJson.faultDetails.parentFault; 
        let cJson = mergeFaultJson.faultDetails.childFault3;
        let mJson = mergeFaultJson.faultDetails.merge2DiffFaults;
        let userLogin = new login(); 
        let addParentFault = new fault(pJson); 
        let addChildFault = new fault(cJson);
        let merge = new mergeFault(mJson);
        
        userLogin.loginToMaintenance();
        addChildFault.createFault(cJson);        
        addParentFault.createFault(pJson); 
        merge.createFaultList(mJson);       
        merge.mergeFaults(mJson);
        merge.checkMergedFaultDetails(mJson);
        userLogin.logoutFromPortal();  
    }); 

    it('should allow PM to merge 3 faults - IGF008_03', function(){
        let pJson = mergeFaultJson.faultDetails.parentFault; 
        let c1Json = mergeFaultJson.faultDetails.childFault1;
        let c2Json = mergeFaultJson.faultDetails.childFault2;
        let mJson = mergeFaultJson.faultDetails.merge3SameFaults;
        let userLogin = new login(); 
        let addParentFault = new fault(pJson); 
        let addChild1Fault = new fault(c1Json);
        let addChild2Fault = new fault(c2Json);
        let merge = new mergeFault(mJson);
        
        userLogin.loginToMaintenance();
        addChild1Fault.createFault(c1Json); 
        addChild2Fault.createFault(c2Json);         
        addParentFault.createFault(pJson); 
        merge.createFaultList(mJson);       
        merge.mergeFaults(mJson);
        merge.checkMergedFaultDetails(mJson);
        userLogin.logoutFromPortal();  
    }); 

    it('should not allow PM to merge faults reported on different properties - IGF008_04', function(){
        let pJson = mergeFaultJson.faultDetails.parentFault; 
        let cJson = mergeFaultJson.faultDetails.childFault5;
        let mJson = mergeFaultJson.faultDetails.mergeDiffPropFaults;
        let userLogin = new login(); 
        let addParentFault = new fault(pJson); 
        let addChildFault = new fault(cJson);
        let merge = new mergeFault(mJson);
        
        userLogin.loginToMaintenance();
        addChildFault.createFault(cJson);        
        addParentFault.createFault(pJson); 
        merge.createFaultList(mJson);       
        merge.mergeFaults(mJson);
        merge.checkMergeValidations(mJson);
        merge.checkChildFaultDetails(cJson);
        merge.checkParentFaultDetails(pJson);
        userLogin.logoutFromPortal();  
    }); 

    it('should not allow PM to merge more than 3 faults', function(){
        let pJson = mergeFaultJson.faultDetails.parentFault; 
        let c1Json = mergeFaultJson.faultDetails.childFault1;
        let c2Json = mergeFaultJson.faultDetails.childFault2;
        let c3Json = mergeFaultJson.faultDetails.childFault4;
        let mJson = mergeFaultJson.faultDetails.merge4Faults;
        let userLogin = new login(); 
        let addParentFault = new fault(pJson); 
        let addChild1Fault = new fault(c1Json);
        let addChild2Fault = new fault(c2Json);
        let addChild3Fault = new fault(c3Json);
        let merge = new mergeFault(mJson);
        
        userLogin.loginToMaintenance();
        addChild3Fault.createFault(c3Json);
        addChild2Fault.createFault(c2Json);  
        addChild1Fault.createFault(c1Json);    
        addParentFault.createFault(pJson); 
        merge.createFaultList(mJson);       
        merge.mergeFaults(mJson);
        merge.checkMergeValidations(mJson);
        merge.checkChildFaultDetails(c1Json);
        merge.checkChildFaultDetails(c2Json);
        merge.checkChildFaultDetails(c3Json);
        merge.checkParentFaultDetails(pJson);
        userLogin.logoutFromPortal();  
    });*/

    it('should not allow PM to merge faults which have requested Quotes - IGF008_05', function(){
        let pJson = mergeFaultJson.faultDetails.parentFault; 
        let cJson = mergeFaultJson.faultDetails.childFault1;
        let mJson = mergeFaultJson.faultDetails.mergeFaultsWithQuote;
        let userLogin = new login(); 
        let addParentFault = new fault(pJson); 
        let addChildFault = new fault(cJson);
        let merge = new mergeFault(mJson);
        
        userLogin.loginToMaintenance();
        addChildFault.createFault(cJson);        
        addParentFault.createFault(pJson); 
        merge.createFaultList(mJson);       
        merge.mergeFaultWithQuoteWO(mJson);     
        userLogin.logoutFromPortal();    
    }); 

    it('should not allow PM to merge faults which have requested Works Order - IGF008_06', function(){
        let pJson = mergeFaultJson.faultDetails.parentFault; 
        let cJson = mergeFaultJson.faultDetails.childFault1;
        let mJson = mergeFaultJson.faultDetails.mergeFaultsWithWO;
        let userLogin = new login(); 
        let addParentFault = new fault(pJson); 
        let addChildFault = new fault(cJson);
        let merge = new mergeFault(mJson);
        
        userLogin.loginToMaintenance();
        addChildFault.createFault(cJson);        
        addParentFault.createFault(pJson); 
        merge.createFaultList(mJson);       
        merge.mergeFaultWithQuoteWO(mJson); 
        userLogin.logoutFromPortal();        
    }); 

    /*it('should not allow PM to merge completed faults - IGF008_07', function(){
        let pJson = mergeFaultJson.faultDetails.parentFault; 
        let cJson = mergeFaultJson.faultDetails.childFault1;
        let mJson = mergeFaultJson.faultDetails.mergeClosedFaults;
        let userLogin = new login(); 
        let addParentFault = new fault(pJson); 
        let addChildFault = new fault(cJson);
        let merge = new mergeFault(mJson);
        
        userLogin.loginToMaintenance();
        addChildFault.createFault(cJson);        
        addParentFault.createFault(pJson); 
        merge.createFaultList(mJson);       
        merge.mergeClosedFaults(mJson);  
        userLogin.logoutFromPortal();       
    }); 

    it('should allow PM to cancel merge faults - IGF008_09', function(){
        let pJson = mergeFaultJson.faultDetails.parentFault; 
        let cJson = mergeFaultJson.faultDetails.childFault1;
        let mJson = mergeFaultJson.faultDetails.cancelMergeFaults;
        let userLogin = new login(); 
        let addParentFault = new fault(pJson); 
        let addChildFault = new fault(cJson);
        let merge = new mergeFault(mJson);
        
        userLogin.loginToMaintenance();
        addChildFault.createFault(cJson);        
        addParentFault.createFault(pJson); 
        merge.createFaultList(mJson);       
        merge.mergeFaults(mJson);
        merge.checkChildFaultDetails(cJson);
        merge.checkParentFaultDetails(pJson);
        userLogin.logoutFromPortal();  
    }); */  
    
})
