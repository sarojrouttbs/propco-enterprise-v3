var faultDashboard = require('./fault.dashboard.page');
var faultDashboardJson = require('../../../resources/json/faultdashboard.json');

describe('FixAFault Module', function(){

    it('should allow PM to filter faults using a dashboard bucket', function(){
        let dJson = faultDashboardJson.faultDetails.checkFilterBucket; 
        let dashboard = new faultDashboard(dJson);

        dashboard.checkBucketFilterData(dJson);
    }); 

    it('should allow PM to filter faults on dashboard and check own faults only', function(){
        let dJson = faultDashboardJson.faultDetails.checkMyRepairs; 
        let dashboard = new faultDashboard(dJson);

        dashboard.checkMyRepairs(dJson);
    }); 
      
})
