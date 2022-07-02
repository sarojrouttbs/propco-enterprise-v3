exports.config = {
    seleniumAddress: 'http://magnus.techblue.co.uk:4444/wd/hub',
    capabilities: {
        'browserName': 'chrome',
         chromeOptions: {
            //args: [ "--headless", "--disable-gpu", "--window-size=800,600" ]
         },
        'moz:firefoxOptions': {
            args: [ "--headless" ]
        },
        'goog:loggingPrefs': {
            'performance': 'ALL',
            'browser': 'ALL'
        }
    },
    framework: 'jasmine',
    restartBrowserBetweenTests: false,
    directConnect: false,
    allScriptsTimeout: 300000,
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
            './features/igf-logfault/add.fault.spec.js', 
            './features/igf-logfault/fault.summary.spec.js',
            './features/igf-logfault/merge.fault.spec.js',
            './features/igf-logfault/fault.note.spec.js', 
            './features/igf-logfault/fault.escalate.spec.js', 
            './features/cli-landlordownrepair/landlord.own.repair.spec.js', 
            './features/iac-arrangingcontractor/obtain.quote.spec.js',
            './features/iac-arrangingcontractor/proceed.with.worksorder.spec.js',
            './features/iac-arrangingcontractor/proceed.agent.necessity.spec.js'              
       ]
    },
    onPrepare: () => {
        require('./util/custom.matcher');
        beforeEach(function(){
            browser.manage().window().maximize();
            browser.get(browser.params.application_url_qa,180000);
        });
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
