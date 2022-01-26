var fault = require('./add.fault.page');
var faultNote = require('./fault.note.page');
var faultNotesJson = require('../../resources/json/faultnotes.json');

describe('FixAFault Module', function(){

    it('should allow PM to add non complaint note to a fault - IGF009_01', function(){
        let fJson = faultNotesJson.faultDetails.faultReported; 
        let nJson = faultNotesJson.faultDetails.nonComplaintNote;
        let addFault = new fault(fJson); 
        let note = new faultNote(nJson);
        
        addFault.createFault(fJson);        
        note.addNote(nJson);       
        note.checkNoteDetails(nJson);
    }); 

    it('should allow PM to add complaint note to a fault', function(){
        let fJson = faultNotesJson.faultDetails.faultReported; 
        let nJson = faultNotesJson.faultDetails.complaintNote;
        let addFault = new fault(fJson); 
        let note = new faultNote(nJson);
        
        addFault.createFault(fJson);        
        note.addNote(nJson);       
        note.checkNoteDetails(nJson);
    }); 

    it('should allow PM to cancel add note action - IGF009_05', function(){
        let fJson = faultNotesJson.faultDetails.faultReported; 
        let nJson = faultNotesJson.faultDetails.cancelNote;
        let addFault = new fault(fJson); 
        let note = new faultNote(nJson);
        
        addFault.createFault(fJson);        
        note.addNote(nJson);       
        note.checkNoteDetails(nJson);
    });

    it('should validate mandatory fields before note creation - IGF009_06', function(){
        let fJson = faultNotesJson.faultDetails.faultReported; 
        let nJson = faultNotesJson.faultDetails.validationNote;
        let addFault = new fault(fJson); 
        let note = new faultNote(nJson);
        
        addFault.createFault(fJson);        
        note.checkNoteValidations(nJson);       
    });    
})
