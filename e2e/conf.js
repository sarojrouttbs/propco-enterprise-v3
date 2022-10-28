exports.config = {
    seleniumAddress: 'http://localhost:4444/wd/hub',
    capabilities: {
        'browserName': 'chrome',
         chromeOptions: {
            //args: [ "--headless", "--disable-gpu", "--window-size=800,600" ]
            //args: ["--disable-dev-shm-usage"]
         },
        /*'moz:firefoxOptions': {
           // args: [ "--headless" ]
        },*/
        'goog:loggingPrefs': {
            'performance': 'ALL',
            'browser': 'ALL'            
        }       
    },
    framework: 'jasmine',
    restartBrowserBetweenTests: false,
    directConnect: false,
    allScriptsTimeout: 180000,
    jasmineNodeOpts: {
        onComplete: null,
        isVerbose: true,
        showColors: true,
        includeStackTrace: true,
        defaultTimeoutInterval: 300000
    },
    params: require('./configuration.json'),
    suites: {
        fixafault: [
            './features/maintenance/igf-logfault/add.fault.spec.js', 
            './features/maintenance/igf-logfault/fault.summary.spec.js',
            './features/maintenance/igf-logfault/merge.fault.spec.js',
            './features/maintenance/igf-logfault/fault.note.spec.js', 
            './features/maintenance/igf-logfault/fault.escalate.spec.js', 
            './features/maintenance/cli-landlordownrepair/landlord.own.repair.spec.js', 
            './features/maintenance/iac-arrangingcontractor/obtain.quote.spec.js',
            './features/maintenance/iac-arrangingcontractor/proceed.with.worksorder.spec.js',
            './features/maintenance/iac-arrangingcontractor/proceed.agent.necessity.spec.js',
            './features/maintenance/iac-arrangingcontractor/obtain.ll.authorisation.spec.js',
            './features/maintenance/iac-arrangingcontractor/payment.requirement.spec.js',  
            './features/maintenance/ipd-jobpayment/check.invoice.spec.js',
            './features/maintenance/iqf-faultqualification/request.more.information.spec.js',
            './features/maintenance/iqf-faultqualification/close.fault.spec.js',
            './features/maintenance/iqf-faultqualification/fault.urgency.spec.js',
            './features/maintenance/iqf-faultqualification/block.management.spec.js',
            './features/maintenance/iqf-faultqualification/guarantee.warranty.spec.js',
            './features/maintenance/iqf-faultqualification/service.contract.spec.js',
            './features/maintenance/iqf-faultqualification/appliance.cover.spec.js',
            './features/maintenance/idb-dashboard/fault.dashboard.spec.js',
            './features/maintenance/ch-chronologicalhistory/chronological.history.spec.js',  
       ]
    },
    onPrepare: () => {
        require('./util/custom.matcher');
        var getScreenSize = function() {
            return browser.driver.executeScript(function() {
                return {
                    width: window.screen.availWidth,
                    height: window.screen.availHeight
                };
            });
        };
        getScreenSize().then(function(screenSize) {
            console.log("available width: " +screenSize.width);
            console.log("available height: " +screenSize.height);
            if(screenSize.width > 1300 && screenSize.height > 700) {
                console.log("Using available window");
                browser.driver.manage().window().setSize(screenSize.width, screenSize.height);
            } else {
                console.log("Increasing window");
                browser.driver.manage().window().setSize(1366, 768);
            }
        });
        beforeEach(function(){
           // browser.manage().window().maximize();   
            browser.driver.manage().window().setPosition(0,0);         
           // browser.get(browser.params.fixafault_url_qa,180000);
        });
       /* afterEach(function(){
            browser.manage().deleteAllCookies();
            browser.executeScript("window.sessionStorage.clear();window.localStorage.clear();");
        });*/
        var HtmlReporter = require('protractor-beautiful-reporter');
        var path = require('path');
        jasmine.getEnv().addReporter(new HtmlReporter({
            baseDirectory: './reports',
            preserveDirectory: false,
            gatherBrowserLogs: true,
            screenshotsSubfolder: 'images',
            docTitle: 'Automation Report',
            docName: 'ReportIndex.html',

            pathBuilder: function pathBuilder(spec, descriptions, results, capabilities) {
                // Return '<30-12-2016>/<browser>/<specname>' as path for screenshots:
                // Example: '30-12-2016/firefox/list-should work'.
                var currentDate = new Date(),
                    day = currentDate.getDate(),
                    month = currentDate.getMonth() + 1,
                    year = currentDate.getFullYear();

                var validDescriptions = descriptions.map(function (description) {
                    return description.replace('/', '@');
                });

                return path.join(
                    day + "-" + month + "-" + year,
                    capabilities.get('browserName'),
                    validDescriptions.join('-'));
            }
         }).getJasmine2Reporter());

    },
    onComplete: function () {
    }
}
