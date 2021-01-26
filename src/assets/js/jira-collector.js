var jq = jQuery.noConflict();

jq.loadScript = function (url, callback) {
    // jq.ajax({
    //     url: 'https://jira.techblue.co.uk/s/d41d8cd98f00b204e9800998ecf8427e-CDN/pu9bd5/811001/be09033ea7858348cd8d5cdeb793189a/2.2.4.7/_/download/batch/com.atlassian.plugins.jquery:jquery/com.atlassian.plugins.jquery:jquery.js?collectorId=26327d00',
    //     dataType: 'script',
    //     success: callback,
    //     async: true
    // });
    jq.ajax({
        url: 'https://jira.techblue.co.uk/s/6eca38536418f90aec448dac1cd5193f-T/pu9bd5/811001/be09033ea7858348cd8d5cdeb793189a/4.0.1/_/download/batch/com.atlassian.jira.collector.plugin.jira-issue-collector-plugin:issuecollector/com.atlassian.jira.collector.plugin.jira-issue-collector-plugin:issuecollector.js?locale=en-GB&collectorId=26327d00',
        dataType: 'script',
        success: callback,
        async: true
    });
}
jq.loadScript();