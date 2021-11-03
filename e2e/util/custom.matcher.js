var matchersUtil = require('protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine');

beforeAll(function() {
    jasmine.addMatchers({
        toContainData : function (matchersUtil) {
            return {
                compare: function(actual, expected) {
                    if (expected === undefined) {
                              expected = '';
                    }
                    var result = {};
                    result.pass = matchersUtil.contains(actual.pValue, expected)
                    if (result.pass) {
                        console.log("test pass");
                        result.message = actual.param + " - Expected data: " + expected + " Actual data: " + actual.pValue;
                    } else {
                        console.log("test fail");
                        result.message = actual.param + " - Expected data: " + expected + " Actual data: " + actual.pValue;
                    }
                    return result;                    
                }
            };  	 
        }
    });

    jasmine.addMatchers({
        toBeCorrect : function () {
            return {
                compare: function(actual, expected, msg) {
                    if (expected === undefined) {
                              expected = '';
                    }
                    var result = {};
                    if (actual == expected) {
                        console.log("test pass");
                        result.pass = true;
                        result.message = msg;
                    } else {
                        console.log("test fail");
                        result.pass = false;
                        result.message = "Condition " + msg + " not true";
                    }
                    return result;                    
                }
            };  	 
        }
    });
})
