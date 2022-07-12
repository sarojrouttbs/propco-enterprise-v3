var path = require('path');
var cryptoJs = require('crypto-js')

//const { compileFunction } = require('vm');

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
        //this.waitForElement(loc);
        return loc.getAttribute(attribute).then(function(value){
            console.log(value);
            return value;
        });              
    }

    this.getText = function (loc) {        
       // this.waitForElement(loc);
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

    this.scrollToElement = function(loc){
        console.log("Go to Element");
        browser.controlFlow().execute(function(){
            browser.executeScript("arguments[0].scrollIntoView();", loc.getWebElement());
        });
    } 

    this.executeJS = function(script, loc){
        console.log("Executing JavaScript");
        browser.controlFlow().execute(function(){
            browser.executeScript(script, loc.getWebElement());
        });
    }

    this.getAttributeValueOfHiddenElement = function(loc, attrib){
        browser.controlFlow().execute(function () {
            browser.executeScript("arguments[0].setAttribute('type', '');", loc.getWebElement());
        });
        return loc.getAttribute(attrib).then(function(text){
               return text;
        });
    }

    this.mouseHover = function(loc){
        return loc.getWebElement().then(function(result){
            browser.actions().mouseMove(result).perform();
       });
    }

    this.getElementByCssContainingText = function(css, value){
        return element(by.cssContainingText(css, value));    
    }

    this.clickOnElement = function(loc, cName){  
       // this.waitForElement(loc); 
        this.scrollToElement(loc);
        browser.controlFlow().execute(function(){
           browser.executeScript("console.log('" + cName + " is clicked');");          
        });
        loc.click();
        console.log("element clicked " + cName);
    }

    /**
     * function to click on specified element if there are multiple elements
     * @param {WebElement} loc Element locator 'By'
     * @param {String} elementNo Position of element in the list
     * @param {String} cName Element name
     * @param {Number} listIndex Index of element in the list
     */
    this.clickOnSpecificElement = function(loc, elementNo, cName, listIndex){  
        browser.controlFlow().execute(function(){
           browser.executeScript("console.log('" + cName + " is clicked');");          
        }); 
        switch(elementNo){
            case "first":
                let firstElement = element.all(loc).first();
                firstElement.isPresent().then(function(result){
                    let cf = new CommonFunction();
                    if(result){
                        cf.scrollToElement(firstElement);
                        firstElement.click();
                    }
                });
                break;
            case "last": 
                let lastElement = element.all(loc).last();
                lastElement.isPresent().then(function(result){
                    let cf = new CommonFunction();
                    if(result){
                        cf.scrollToElement(lastElement);
                        lastElement.click();
                    }
                }); 
                break;
            case "index":
                let nthElement = element.all(loc).get(listIndex);    
                nthElement.isPresent().then(function(result){
                    let cf = new CommonFunction();
                    if(result){
                        cf.scrollToElement(nthElement);
                        nthElement.click();
                    }
                }); 
                break;
            default:
                let eListEnd = element.all(loc).last();
                eListEnd.isPresent().then(function(result){
                    let cf = new CommonFunction();
                    if(result){
                        cf.scrollToElement(eListEnd);
                        eListEnd.click();
                    }
                }); 
                break;    
        }        
        console.log("element clicked " + cName);
    }
 
    this.sendKeysInto = function(loc, value){        
        console.log("Entering text - " + value); 
        this.waitForElement(loc);
        this.scrollToElement(loc);      
        browser.controlFlow().execute(function(){
           browser.executeScript("console.log('" + value + " is entered');");         
        });
        loc.clear().sendKeys(value);               
    }   

    this.selectFromDropDown = function(locList, locValue, cList, cValue){
        this.clickOnElement(locList, cList);
        this.waitForElementToBeVisible(element(by.xpath("//ion-select-popover")), 'Drop down list');
        browser.sleep(2000);
        this.clickOnElement(locValue, cValue);    
    }

    this.pressEndKey = function(){
        browser.actions().sendKeys(protractor.Key.END).perform();       
    }

    this.pressKey = function(key){
        browser.actions().sendKeys(key).perform();       
    }

    this.uploadImage = function(loc, fileToUpload, value){
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

    this.waitForElementToBeVisible = function(loc, value){  
        browser.controlFlow().execute(function () {
           browser.executeScript("console.log('Waiting for " + value + " to be visible');");           
        });       
        browser.wait(EC.visibilityOf(loc), 280000);
    }

    this.waitForSpecificElementToBeVisible = function(loc, elementNo, value, listIndex ){
        browser.controlFlow().execute(function () {
            browser.executeScript("console.log('Waiting for " + value + " to be visible');");           
        }); 
        switch(elementNo){
            case "first":
                browser.wait(EC.visibilityOf(element.all(loc).first()), 180000);
                break;
            case "last": 
                browser.wait(EC.visibilityOf(element.all(loc).last()), 180000);
                break;
            case "index":
                browser.wait(EC.visibilityOf(element.all(loc).get(listIndex)), 180000);
                break;
            default:
                browser.wait(EC.visibilityOf(element.all(loc).last()), 180000);
                break;    
        }        
    }

    this.waitForElementToBeInvisible = function(loc, value){ 
        browser.controlFlow().execute(function () {
            browser.executeScript("console.log('Waiting for " + value + " to be invisible');");           
        });        
        browser.wait(EC.invisibilityOf(loc), 180000);
    }

    this.setDate = function(dValue, day, month, year, hour, minute){
        const d = new Date();
        let currentDay = d.getDate();
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        let currentMonth = d.getMonth();
        let pastMonth = (d.getMonth() == 0) ? months[11] : months[d.getMonth()-1];
        let futureMonth = (d.getMonth() == 11) ? months[0] : months[d.getMonth()+1];
        switch(dValue){
            case "current":
                this.clickOnElement(element(by.xpath("//button[contains(text(), 'Done')]")), 'Done');
                break;
            case "past":
                if(currentDay < 5){
                  // this.clickOnElement(element(by.xpath("//button[contains(text(), '" + pastMonth + "')]")), pastMonth);
                   this.clickOnElement(element(by.xpath("//ion-picker-column[2]/div/button[contains(@class, 'picker-opt-selected')]/preceding-sibling::button")));
                   this.clickOnElement(element(by.xpath("//button[contains(text(), 'Done')]")), 'Done');
                   break;
                } else{
                    //this.scrollToElement(element(by.css("ion-picker-column:nth-child(2) > div > [opt-index = '" + currentDay-2 + "']")));
                    this.clickOnElement(element(by.css("ion-picker-column:nth-child(2) > div > [opt-index = '" + (currentDay-2).toString() + "']")), currentDay-1);
                    this.clickOnElement(element(by.css("ion-picker-column:nth-child(2) > div > [opt-index = '" + (currentDay-3).toString() + "']")), currentDay-2);
                    this.clickOnElement(element(by.css("ion-picker-column:nth-child(2) > div > [opt-index = '" + (currentDay-4).toString() + "']")), currentDay-3);
                    this.clickOnElement(element(by.xpath("//button[contains(text(), 'Done')]")), 'Done');
                    break;
                } 
            case "future":                
                if(currentDay == 31){
                   // this.clickOnElement(element(by.xpath("//button[contains(text(), '" + futureMonth + "')]")), futureMonth);
                    this.clickOnElement(element(by.xpath("//ion-picker-column[2]/div/button[contains(@class, 'picker-opt-selected')]/following-sibling::button[1]")));
                    this.clickOnElement(element(by.xpath("//button[contains(text(), 'Done')]")), 'Done');
                    break;
                } else{
                    this.getAttribute(element(by.css("ion-picker-column:nth-child(2) > div > [opt-index = '" + currentDay.toString() + "']")), 'class').then(function(text){
                        let cf = new CommonFunction();
                        if(text.includes("picker-opt-disabled")){
                           // cf.clickOnElement(element(by.xpath("//button[contains(text(), '" + futureMonth + "')]")), futureMonth);
                           cf.clickOnElement(element(by.xpath("//ion-picker-column[2]/div/button[contains(@class, 'picker-opt-selected')]/following-sibling::button[1]")));
                           cf.clickOnElement(element(by.xpath("//button[contains(text(), 'Done')]")), 'Done');
                        } else {
                            cf.clickOnElement(element(by.css("ion-picker-column:nth-child(2) > div > [opt-index = '" + currentDay.toString() + "']")), currentDay+1);
                            cf.clickOnElement(element(by.xpath("//button[contains(text(), 'Done')]")), 'Done');
                        }
                    });
                    break;
                }     
            default:  
                this.clickOnElement(element(by.xpath("//button[contains(text(), 'Done')]")), 'Done');   
        }   
    }

    this.checkVisibleData = function(element, optList, conditionResult, msg){
        let expCondition = protractor.ExpectedConditions; 
        if(optList){
          let options = optList.split(",");
          options.forEach(option =>{
              this.scrollToElement(this.getElementByCssContainingText(element, option));
              expect(this.checkCondition(expCondition.visibilityOf(this.getElementByCssContainingText(element, option)))).toBeCorrect(conditionResult, msg + " - " + option);
          });
        }
    }

    this.checkOptionData = function(element, optList, optDataList, conditionResult, msg){
        let expCondition = protractor.ExpectedConditions;
        let options = [];
        let optionData = [];
        if(optList){
           options = optList.split(","); 
        }
        if(optDataList){
            optionData = optDataList.split(","); 
        }
        for(let i = 0; i<options.length; i++){
            this.scrollToElement(this.getElementByCssContainingText(element, optionData[i]));
            expect(this.checkCondition(expCondition.visibilityOf(this.getElementByCssContainingText(element, optionData[i])))).toBeCorrect(conditionResult, msg + " : " + options[i] + " - " + optionData[i]);         
        }
    }
    
    /**
     * Function that returns boolean result after expected condition evaluation
     * @param {Protractor function} expectCondition Protractor function that evaluates user specified expected condition
     * @returns true if expected condition is met within specifed time limit else false
     */
    this.checkCondition = function(expectCondition){
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

    this.getAESEncryptedString = function(message, key){
        return cryptoJs.AES.encrypt(message, key);
    }

    this.getAESDecryptedString = function(encrypted, key){
        return cryptoJs.AES.decrypt(encrypted, key).toString(cryptoJs.enc.Utf8);
    }

    this.updateStepDataObject = function(keyList, valueList){                
        /*return loc.getText().then(function(text){
            var obj = {param:"Original parameter", pValue:"Original value"};
            obj.param  = cMessage;
            obj.pValue = text;
            return obj;
        }); */
        return new Promise (function(resolve,reject) { 
            const obj = {};
            let keys = [];
            let values = [];
            if(keyList){
                keys = keyList.split(","); 
            }
            console.log(keyList);
            keys.forEach(item => {
                console.log(item); 
            });
            if(valueList){
                values = valueList.split(","); 
            }
            console.log(valueList);
            values.forEach(item => {
                console.log(item); 
            });
            for(let i = 0; i<keys.length; i++){
                obj[keys[i]] = values[i];                               
            }
            if (typeof obj != "undefined") {
                console.log("Step data object is created");
                resolve(obj);
            } else {
                reject("Object does not exist");
            }             
        });        
    }

    this.updateStepTestData = function(keyList, valueList){
        /*return new Promise (function(resolve,reject) { 
            let jasmineObj = jasmine.getEnv();
            let keys = [];
            let values = [];
            if(keyList){
                keys = keyList.split(","); 
            }
            if(valueList){
                values = valueList.split(","); 
            }
            for(let i = 0; i<keys.length; i++){
               jasmineObj.setSpecProperty(keys[i],values[i]);  
            }
            if (typeof jasmineObj != "undefined") {
                console.log("Jasmine env object is created");
                resolve(true);
            } else {
                reject("Object does not exist");
            }             
        });*/
        const obj = {};
        let keys = [];
        let values = [];
        if(keyList){
            keys = keyList.split(","); 
        }
        console.log(keyList);
        keys.forEach(item => {
            console.log(item); 
        });
        if(valueList){
            values = valueList.split(","); 
        }
        console.log(valueList);
        values.forEach(item => {
            console.log(item); 
        });
        for(let i = 0; i<keys.length; i++){
            obj[keys[i]] = values[i];                               
        }
        if (typeof obj != "undefined") {
            console.log("Step data object is created");
            expect(obj).toBeValid();
        }
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