var path = require('path');

var CommonFunction = function() {
    
    var EC = protractor.ExpectedConditions;   
        
    this.waitForElement = function (loc){        
        browser.wait(EC.elementToBeClickable(loc), 180000);
    }

    this.validation = function(loc,expectedResult){        
        this.waitForElement(loc);        
        loc.getText().then(function(actualResult) {
            if(actualResult == expectedResult){
                console.log("Verified, Actual Text -  " + actualResult  + " Expected - " + expectedResult + "")
            }else {
                console.log("verification failed, Actual Text - " + actualResult + " Expected - " + expectedResult + "")
            }
        });        
    }
    
    this.clickOn = function (loc) {        
        this.waitForElement(loc);  
        loc.click();
        console.log("element clicked ");
    }

    this.getAttribute = function (loc, attribute) {        
        this.waitForElement(loc);
        loc.getAttribute(attribute).then(function(value){
            console.log(value);
        });              
    }

    this.getText = function (loc) {        
        this.waitForElement(loc);
        loc.getText().then(function(value){
            console.log(value);
            return value;
        });              
    }

    this.sendkeys = function (loc, value) {        
        console.log("Entering text - " + value); 
        this.waitForElement(loc);
        loc.clear().sendKeys(value);               
    }  

    this.pressEnterKey = function () {
        browser.actions().sendKeys(protractor.Key.ENTER).perform();        
    }

    this.pressDownKey = function () {
        browser.actions().sendKeys(protractor.Key.DOWN).perform();       
    }    

/**
 * Common functions for FixAFault module
 */

    this.scrollToElement = function (loc){
        console.log("Go to Element");
        browser.controlFlow().execute(function () {
            browser.executeScript("arguments[0].scrollIntoView();", loc.getWebElement());
        });
    } 

    this.getAttributeValueOfHiddenElement = function (loc, attrib){
        browser.controlFlow().execute(function () {
            browser.executeScript("arguments[0].setAttribute('type', '');", loc.getWebElement());
        });
        return loc.getAttribute(attrib).then(function(text){
               return text;
        });
    }

    this.mouseHover = function (loc){
        return loc.getWebElement().then(function(result){
            browser.actions().mouseMove(result).perform();
       });
    }

    this.clickOnElement = function (loc, cName) {  
        this.waitForElement(loc); 
        this.scrollToElement(loc);
        browser.controlFlow().execute(function(){
           browser.executeScript("console.log('" + cName + " is clicked');");          
        }); 
        loc.click();
        console.log("element clicked " + cName);
    }
 
    this.sendKeysInto = function (loc, value) {        
        console.log("Entering text - " + value); 
        this.waitForElement(loc);
        this.scrollToElement(loc);      
        browser.controlFlow().execute(function(){
           browser.executeScript("console.log('" + value + " is entered');");         
        });
        loc.clear().sendKeys(value);               
    }   

    this.selectFromDropDown = function (locList, locValue, cList, cValue){
        this.clickOnElement(locList, cList);
        this.clickOnElement(locValue, cValue);    
    }

    this.pressEndKey = function () {
        browser.actions().sendKeys(protractor.Key.END).perform();       
    }

    this.uploadImage = function (loc, fileToUpload, value){
        browser.controlFlow().execute(function () {
           browser.executeScript("console.log('" + value + " is uploaded');");           
        }); 
        this.scrollToElement(loc);
        console.log(fileToUpload);
        if(fileToUpload){
            let docs = fileToUpload.split(",");
            docs.forEach(function(result){
                let absolutePath = path.resolve(__dirname, result);
                loc.clear().sendKeys(absolutePath);
            });
        }      
    }

    this.waitForElementToBeVisible = function (loc, value){  
        browser.controlFlow().execute(function () {
           browser.executeScript("console.log('Waiting for " + value + " to be visible');");           
        });       
        browser.wait(EC.visibilityOf(loc), 180000);
    }

    this.waitForElementToBeInvisible = function (loc, value){ 
        browser.controlFlow().execute(function () {
            browser.executeScript("console.log('Waiting for " + value + " to be invisible');");           
        });        
        browser.wait(EC.invisibilityOf(loc), 180000);
    }
    
    /**
     * Function that returns boolean result after expected condition evaluation
     * @param {Protractor function} expectCondition Protractor function that evaluates user specified expected condition
     * @returns true if expected condition is met within specifed time limit else false
     */
    this.checkCondition = function (expectCondition){
        return browser.wait(expectCondition, 30000).then(function(){
            return true;
        }, function() {
            return false;
        });
    } 
    
    /**
     * Function that returns object used for verification of text
     * @param {WebElement} loc Element locator
     * @param {String} cMessage Custom message to be shown in Report after verification
     * @returns Object with properties - inner text of an element, custom message
     */
    this.updateVerificationObject = function(loc, cMessage){                
        return loc.getText().then(function(text){
            var obj = {param:"Original parameter", pValue:"Original value"};
            obj.param  = cMessage;
            obj.pValue = text;
            return obj;
        });              
    }
    
    /**
     * Function that returns object used for verification of attribute value
     * @param {WebElement} loc Element locator
     * @param {String} cMessage Custom message to be shown in Report after verification
     * @param {String} attrib Attribute of an element
     * @returns Object with properties - attribute value of the element, custom message
     */
    this.updateVerificationObjectByAttrib = function(loc, cMessage, attrib){                
        return loc.getAttribute(attrib).then(function(text){
            var obj = {param:"Original parameter", pValue:"Original value"};
            obj.param  = cMessage;
            obj.pValue = text;
            return obj;
        });              
    }

/*
* @Author: Sipan.Sarangi
* @Date:   2019-11-19
*/

    this.pressEscapeKey = function () {
        browser.actions().sendKeys(protractor.Key.ESCAPE).perform();   
    }

    this.verification = function (loc, expectedText) {
        loc.getText().then(function (text) {
            if (text == expectedText){
                console.log("verified Actual Text - "+text+" Expecetd - "+expectedText+"");
            }else{
                console.log("verify failed Actual Text - "+text+" Expecetd - "+expectedText+"");
                throw Error ('Actual and Expected Not Match')
            }
        });
    }


    this.isObjectAvailable = function (loc, element_name) {
        loc.isDisplayed().then(function (result) {
            if (result) {
                console.log(element_name+" Present")
            } else {
                throw Error (element_name+' Not Present')
            }
        });
    }

    this.isObjectNotAvailable = function (loc, element_name) {
        expect(loc.isDisplayed()).toEqual(false);
    }

    this.coloumTextMatch = function (loc,expectedText) {
        loc.getText().then(function (text) {
            //console.log(text.length);        
            for (i=0; i<text.length; i++) {
                if (text[i] == expectedText){
                    console.log("verified Actual Text - ["+text[i]+"] Expecetd - ["+expectedText+"]")                
                }else{
                    console.log("verify failed Actual Text - ["+text[i]+"] Expecetd - ["+expectedText+"]")  
                    throw Error ('Actual and Expected Not Match')                
                }
            };
        });    
    }

    this.coloumTextMatchIncludes = function (loc,expectedText) {
        loc.getText().then(function (text) {
            for (i=0; i<text.length; i++) {
                if (text[i].includes(expectedText)){
                    console.log("verified Actual Text - "+text[i]+" It Includes - "+expectedText+"")                
                }else{
                    console.log("verify failed Actual Text - "+text[i]+" It Not Includes - "+expectedText+"")  
                    throw Error ('Actual and Expected Not Match')                
                }
            };
        });        
    }
}
module.exports = CommonFunction;