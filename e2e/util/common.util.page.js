var path = require('path');
var cryptoJs = require('crypto-js');
const { browser } = require('protractor');

var CommonFunction = function() {
    
    var EC = protractor.ExpectedConditions;   
        
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

    this.checkOptionDataByAttrib = function(locators, optList, attribList, optDataList){
        let options = [];
        let attributes = [];
        let optionData = [];
        if(optList){
           options = optList.split("`"); 
        }
        if(attribList){
           attributes = attribList.split("`"); 
        }
        if(optDataList){
            optionData = optDataList.split("`"); 
        }
        for(let i = 0; i<options.length; i++){
            this.scrollToElement(locators[i]);
            let optionObj = this.updateVerificationObjectByAttrib((locators[i]), options[i], attributes[i]); 
            expect(optionObj).toContainData(optionData[i]);            
        }
    }

    this.checkOptionToolTip = function(locators, optList, optDataList){
        let options = [];
        let optionData = [];
        if(optList){
           options = optList.split("`"); 
        }
        if(optDataList){
            optionData = optDataList.split("`"); 
        }
        for(let i = 0; i<options.length; i++){
            this.scrollToElement(locators[i]);
            this.mouseHover(locators[i]);
            let optionObj = this.updateVerificationObject(element(by.css("div.mat-tooltip")), options[i]); 
            expect(optionObj).toContainData(optionData[i]);    
        }
    }

    this.checkPageData = function(element, optList, conditionResult, fieldList){
        let expCondition = protractor.ExpectedConditions; 
        if(optList){
          let fields = fieldList.split("`");  
          let options = optList.split("`");
          let i = 0;
          options.forEach(option =>{
              this.scrollToElement(this.getElementByCssContainingText(element, option));
              let field = fields[i];
              expect(this.checkCondition(expCondition.visibilityOf(this.getElementByCssContainingText(element, option)))).toBeCorrect(conditionResult, field + " - " + option);
              if((fields.length - 1) > i){i++;}              
          });
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
    
    this.clickOn = function (loc) {        
        this.waitForElement(loc);  
        loc.click();
        console.log("element clicked ");
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

    this.editOptionData = function(locators, optList, optDataList){
        //let options = [];
        let optionData = [];
        /*if(optList){
           options = optList.split("`"); 
        }*/
        if(optDataList){
            optionData = optDataList.split("`"); 
        }
        for(let i = 0; i<optionData.length; i++){
            console.log("Locator " + locators[i]);
            console.log("Parent " + optList[i]);
            console.log("Data " + optionData[i]);
            if(optionData[i]){
               this.scrollToElement(optList[i]);
              // this.clickOnElement(optList[i], "field");
               this.executeJS("arguments[0].click();", optList[i]); 
               this.sendKeysInto(locators[i], optionData[i]);
               browser.sleep(1000);               
            }                     
        }
    }

    this.executeJS = function(script, loc){
        console.log("Executing JavaScript");
        browser.controlFlow().execute(function(){
            browser.executeScript(script, loc.getWebElement());
        });
    }

    this.getAttribute = function (loc, attribute) {        
        //this.waitForElement(loc);
        return loc.getAttribute(attribute).then(function(value){
            console.log(value);
            return value;
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

    this.getAESEncryptedString = function(message, key){
        return cryptoJs.AES.encrypt(message, key);
    }

    this.getAESDecryptedString = function(encrypted, key){
        return cryptoJs.AES.decrypt(encrypted, key).toString(cryptoJs.enc.Utf8);
    }

    this.getCurrentDate = function(){
        const d = new Date();
        let currentDate = (d.getDate()  < 10 ) ? "0" + d.getDate().toString() : d.getDate().toString();
        let currentMonth = ((d.getMonth() + 1) < 10 ) ? "0" + (d.getMonth() + 1).toString() : (d.getMonth() + 1).toString();
        let currentYear = d.getFullYear().toString();
        let date = currentDate + "/" + currentMonth + "/" + currentYear;
        return date;
    }

    this.getElementByCssContainingText = function(css, value){
        return element(by.cssContainingText(css, value));    
    }

    this.getText = function (loc) {        
       // this.waitForElement(loc);
        loc.getText().then(function(value){
            console.log(value);
            return value;
        });              
    }

    this.logMessage = function(msg){
        browser.controlFlow().execute(function () {
            browser.executeScript("console.log('" + msg + "');");           
         }); 
    }

    this.mouseHover = function(loc){
        return loc.getWebElement().then(function(result){
            browser.actions().mouseMove(result).perform();
       });
    }

    this.pressKey = function(key){
        browser.actions().sendKeys(key).perform();       
    }

    this.pressDownKey = function () {
        browser.actions().sendKeys(protractor.Key.DOWN).perform();       
    } 
    
    this.pressEndKey = function(){
        browser.actions().sendKeys(protractor.Key.END).perform();       
    }
    
    this.pressEnterKey = function () {
        browser.actions().sendKeys(protractor.Key.ENTER).perform();        
    }
       
    this.scrollToElement = function(loc){
        console.log("Go to Element");
        browser.controlFlow().execute(function(){
            browser.executeScript("arguments[0].scrollIntoView();", loc.getWebElement());
        });
    }  
    
    this.selectFromDropDown = function(locList, locValue, cList, cValue){
        this.clickOnElement(locList, cList);
        this.waitForElementToBeVisible(element(by.xpath("//ion-select-popover")), 'Drop down list');
        browser.sleep(2000);
        this.clickOnElement(locValue, cValue);    
    }    
    
    this.sendkeys = function (loc, value) {        
        console.log("Entering text - " + value); 
        this.waitForElement(loc);
        loc.clear().sendKeys(value);               
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

    this.uploadImage = function(loc, fileToUpload, value){
        browser.controlFlow().execute(function () {
           browser.executeScript("console.log('" + value + " is uploaded');");           
        }); 
        console.log("Environment: " + browser.params.environment);
        if(browser.params.environment.includes("remote")){
            var remoteEnv = require('selenium-webdriver/remote');
            browser.setFileDetector(new remoteEnv.FileDetector());
        }
        this.scrollToElement(loc);
        console.log("FileToUpload: " +fileToUpload);
        if(fileToUpload){
            let docs = fileToUpload.split(",");
            docs.forEach(function(result){
                let absolutePath = path.resolve(__dirname, result);
                console.log("Image path: " + absolutePath);
                loc.clear().sendKeys(absolutePath);
            });
        }      
    }

    this.updateStepDataObject = function(keyList, valueList){                
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
        const obj = {};
        let keys = [];
        let values = [];
        if(keyList){
            keys = keyList.split("`"); 
        }
        console.log(keyList);
        keys.forEach(item => {
            console.log(item); 
        });
        if(valueList){
            values = valueList.split("`"); 
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
            expect(obj).toBeValidStepData();
        }
    }    

    this.waitForElement = function (loc){        
        browser.wait(EC.elementToBeClickable(loc), 180000);
    }

    this.waitForElementToBeVisible = function(loc, value){  
        browser.controlFlow().execute(function () {
           browser.executeScript("console.log('Waiting for " + value + " to be visible');");           
        });       
        browser.wait(EC.visibilityOf(loc), 280000);
    }

    this.waitForElementToBeInvisible = function(loc, value){ 
        browser.controlFlow().execute(function () {
            browser.executeScript("console.log('Waiting for " + value + " to be invisible');");           
        });        
        browser.wait(EC.invisibilityOf(loc), 180000);
    }

    this.waitForElementAttrib = function(loc, attrib, attribValue, value, milsec){
        browser.controlFlow().execute(function () {
            browser.executeScript("console.log('Waiting for " + value + " to be visible');");           
        }); 
        let isVisible = function(){
            return loc.getAttribute(attrib).then(result => {
                console.log(result);
                if(result.includes(attribValue)){
                    console.log(result);
                    console.log("Attribute has value");
                    return false;
                } else {
                    console.log("Attribute does not have value");
                    return true;
                }
            })
        }
        browser.wait(isVisible, milsec);
    }

    this.waitForElementToBePresent = function(loc, value){ 
        browser.controlFlow().execute(function () {
            browser.executeScript("console.log('Waiting for " + value + " to be present');");           
        });        
        browser.wait(EC.presenceOf(loc), 180000);
    }

    this.waitForClickableElement = function(loc, sec, value){
        browser.controlFlow().execute(function () {
            browser.executeScript("console.log('Waiting for " + value + " to be clickable');");           
        }); 
        this.scrollToElement(loc);
        let counter = 0;
        do {
            this.getAttribute(loc, "class").then(result => {
                if(result){
                    if(result.includes("button-disabled")){
                        browser.sleep(1000);                                      
                    }
                }                
            });
            this.getAttribute(loc, "aria-disabled").then(result => {
                if(result){
                    if(result.includes("true")){
                        browser.sleep(1000);                                      
                    }
                }                
            });              
            counter++;                   
        } while (counter < sec);
        return loc.isEnabled().then(result =>{
            if(result){
               return true;
            }
            return false; 
        })        
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

/*
* @Author: Sipan.Sarangi
* @Date:   2019-11-19
*/

    this.pressEscapeKey = function () {
        browser.actions().sendKeys(protractor.Key.ESCAPE).perform();   
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

    this.generateRandomString = function(length){       
            var string = '';
            var letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz' //Include numbers if you want
                    for (i = 0; i < length; i++) {
                        string += letters.charAt(Math.floor(Math.random() * letters.length));
                    }
                    return string;                
    }

    this.refreshPage = function(){
        browser.refresh();
        
    }
}
module.exports = CommonFunction;