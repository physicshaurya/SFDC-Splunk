// This extension is based on work done by Viktor Gavrysh with the Buffalo Splunk tool. His code has been stolen
// and highly modified to suit the needs of the PDX Performance team. For questions reach out to Daryl Kurtz (dkurtz@salesforce.com)
//

var skillGroup;
var skillId;
chrome.storage.sync.get('assignedSkill', function (result) {
    var skillGroup = result.assignedSkill;
    if (skillGroup == "Performance") {
        skillId = "a0446000001eRuj";
        };
    if (skillGroup == "Security") {
        skillId = "a0446000001eTBS";
        };
    if (skillGroup == "Analytics") {
        skillId = "a0446000001eTBX";
        };
});


function populate() {
    chrome.tabs.query({
            "active": true
        },
        function (tabs) {
            tabs.forEach(getFromTab);
        });

}

function getFromTab(tab) {

    console.log(tab.url);
    if (tab.url.indexOf('splunk-web.crz.salesforce.com') < 0) {
        console.log('Not a Splunk page.');
        return;
    }
    var sCode = "var result=''; var sel=window.getSelection();" +
        " var tr = sel.anchorNode.parentNode.parentNode;" +
        " if(tr.tagName.toLowerCase()=='tr') {;" +
        "   for(i=0; i<tr.children.length; ++i) result+= (i==0 ? '' : '|') + tr.children[i].textContent.trim();" +
        " }" +
        " result";
    chrome.tabs.executeScript(tab.id, {
        code: sCode
    }, function (result) {
        console.log(result[0]);
        var ar = result[0].split('|');
        if (ar.length != 4) return;
        if (!ar[2].startsWith('00D')) return;
        //if($.trim($('#org').val()).length > 0) return;

        $('#instance1').val(ar[0]);
        $('#instance2').val(ar[1]);
        $('#org').val(ar[2]);
        $('#user').val(ar[3]);
        $('#earliest').val(ar[4]);
        setValToLocalStorage();
    });

}

function doGackQuery(action) {
    $('#validationMessage').empty();
    clearMessagesBeforeNextCall();

    // Validate user input
    var instance1Str = $.trim($('#instance1').val());
    var instance2Str = $.trim($('#instance2').val());
    var orgStr = $.trim($('#org').val());
    var userStrChk = $.trim($('#user').val());
    var earliestStr = $.trim($('#earliest').val());
    var latestStr = $.trim($('#latest').val());
    var cutoffStr = $.trim($('#cutoff').val());
    var cutoffStr2 = $.trim($('#cutoff2').val());
    var customTime = $.trim($('#customSeconds').val()) + '000';
    var gackIdSearch = $.trim($('#gackIdSearch').val());
    var stacktraceIdSearch = $.trim($('#stacktraceIdSearch').val());
    var gackSearchStr = '';

    var validationPTag = '';

    if (gackIdSearch.length == 0 && stacktraceIdSearch.length == 0) {
        validationPTag += '<li> Gack or Stacktrace ID</li>';
    } else if (gackIdSearch.length == 0) {
        var gackSearchStr = 'stacktraceId=' + stacktraceIdSearch;
    } else if (stacktraceIdSearch.length == 0) {
        var gackSearchStr = 'gackUniqueId=' + gackIdSearch;
    } else {
        var gackSearchStr = 'stacktraceId=' + stacktraceIdSearch + ' gackUniqueId=' + gackIdSearch;
    }

    if (orgStr.length == 0) {
        validationPTag += '<li> Organization ID </li>';
    }
    if (userStrChk.length == 0) {
        var userStr = '';
    } else {
        var userStr = ' ' + userStrChk;
    }
    if (instance1Str.length == 0) {
        validationPTag += '<li> Source Instance </li>';
    }
    if (action == 9 && customTime == '000') {
        validationPTag += '<li> Custom Duration</li>';
    }
    if (action == 2 && instance1Str.length == 0) {
        validationPTag += '<li> Target Instance </li>';
    }
    if (earliestStr.length == 0) {
        validationPTag += '<li> Earliest time </li>';
    }
    if (cutoffStr.length == 0) {
        validationPTag += '<li> Cutoff Interval </li>';
    } else {
        if (isNaN(cutoffStr)) validationPTag += '<li> Cutoff interval is not numeric </li>';
    }

    if (validationPTag.length > 0) {
        validationPTag = '<div style="display:list-item">Some input parameters are missing/invalid</div>' + '<ul>' + validationPTag + '</ul>';
        $('#validationMessage').append(validationPTag).show();
        //alert("Error");
        return;
    }

    var timeInterval = ' earliest=' + earliestStr;
    var cutoffTime = 'time()';

    if (latestStr.length > 0) {
        timeInterval += ' latest=' + latestStr;
        cutoffTime = 'strptime("' + latestStr + '", "%m/%d/%Y:%H:%M:%S")';
    }
    var cutoffInterval = parseInt(cutoffStr) * 60;

    var splunk_url;
    var splunk_buttonName;

    if (action == 1) { // Search by Gack ID
        splunk_url = 'index=' + instance1Str + ' ' + orgStr + userStr + timeInterval +
            ' ' + gackSearchStr;
        splunk_buttonName = 'Gack ID';

    }

    //Next 4 lines are tracking code
    var xhttp = new XMLHttpRequest();
    xhttp.open('GET', 'https://splunkwizard.secure.force.com/savequery/services/apexrest/savequery?skill=' + encodeURIComponent(skillId) + '&query=' + encodeURIComponent(splunk_url) + '&instance=' + encodeURIComponent(instance1Str) + '&orgid=' + encodeURIComponent(orgStr) + '&buttonname=' + encodeURIComponent(splunk_buttonName), true);
    xhttp.send();
    
    splunk_url = 'https://splunk-web.crz.salesforce.com/en-US/app/search/search?q=' + encodeURIComponent(splunk_url);
    
    setTimeout(function(){
        chrome.tabs.create({
            "url": splunk_url
        });
    },200);

}

// Performance Queries

function doPerfQuery(action) {

    $('#validationMessage').empty();
    clearMessagesBeforeNextCall();

    // Validate user input
    var instance1Str = $.trim($('#instance1').val());
    var instance2Str = $.trim($('#instance2').val());
    var orgStr = $.trim($('#org').val());
    var userStrChk = $.trim($('#user').val());
    var earliestStr = $.trim($('#earliest').val());
    var latestStr = $.trim($('#latest').val());
    var cutoffStr = $.trim($('#cutoff').val());
    var cutoffStr2 = $.trim($('#cutoff2').val());
    var customTime = $.trim($('#customSeconds').val()) + '000';
    var gackIdSearch = $.trim($('#gackIdSearch').val());
    var stacktraceIdSearch = $.trim($('#stacktraceIdSearch').val());
    var sparkline_span = $.trim($('#sparkline_span').val());
    var gackSearchStr = '';

    var validationPTag = '';


    if (orgStr.length == 0) {
        validationPTag += '<li> Organization ID </li>';
    }
    if (userStrChk.length == 0) {
        var userStr = '';
    } else {
        var userStr = ' ' + userStrChk;
    }
    if (instance1Str.length == 0) {
        validationPTag += '<li> Source Instance </li>';
    }
    if (action == 9 && customTime == '000') {
        validationPTag += '<li> Custom Duration</li>';
    }
    if (action == 2 && instance1Str.length == 0) {
        validationPTag += '<li> Target Instance </li>';
    }
    if (earliestStr.length == 0) {
        validationPTag += '<li> Earliest time </li>';
    }
    if (cutoffStr.length == 0) {
        validationPTag += '<li> Cutoff Interval </li>';
    } else {
        if (isNaN(cutoffStr)) validationPTag += '<li> Cutoff interval is not numeric </li>';
    }

    if (validationPTag.length > 0) {
        validationPTag = '<div style="display:list-item">Some input parameters are missing/invalid</div>' + '<ul>' + validationPTag + '</ul>';
        $('#validationMessage').append(validationPTag).show();
        //alert("Error");
        return;
    }

    var timeInterval = ' earliest=' + earliestStr;
    var cutoffTime = 'time()';

    if (latestStr.length > 0) {
        timeInterval += ' latest=' + latestStr;
        cutoffTime = 'strptime("' + latestStr + '", "%m/%d/%Y:%H:%M:%S")';
    }
    var cutoffInterval = parseInt(cutoffStr) * 60;

    var splunk_url;
    var splunk_buttonName;

    if (action == 1) { // Find Timeouts
        splunk_url = 'index=' + instance1Str + ' ' + orgStr + userStr + timeInterval +
            ' (runTime>100000 OR execTime>100000 OR cpuTime>100000) ' +
            '| table _time, sourcetype, runTime, execTime, cpuTime, threadId ' +
            '| sort - runTime';
        splunk_buttonName = 'Find Timeouts';

    } else if (action == 2) { // App Server Restarts
        splunk_url = 'index=' + instance1Str + ' ' + orgStr + userStr + timeInterval + ' sourcetype=CASE(applog*:X)' + '("Shutting down the world" OR "share and enjoy")';
        splunk_buttonName = 'App Server Restarts';
    } else if (action == 3) { // GACKS
        splunk_url = 'index=' + instance1Str + ' ' + orgStr + userStr + timeInterval + ' sourcetype=applog*:g* | stats values(stacktraceId), count by gackSummary';
        splunk_buttonName = 'Gacks';
    } else if (action == 4) { // Basic
        splunk_url = 'index=' + instance1Str + ' ' + orgStr + userStr + timeInterval;
        splunk_buttonName = 'Basic Query';
    } else if (action == 5) { // Find 15s events
        splunk_url = 'index=' + instance1Str + ' ' + orgStr + userStr + timeInterval +
            ' (runTime>10000 OR execTime>10000 OR cpuTime>10000) (sourcetype!=CASE(applog*:aocdl) AND sourcetype!=CASE(applog*:aordl)) ' +
            '| table _time, sourcetype, runTime, execTime, cpuTime, threadId ' +
            '| sort - runTime';
        splunk_buttonName = '15s Events';

    } else if (action == 6) { // Find 30s events
        splunk_url = 'index=' + instance1Str + ' ' + orgStr + userStr + timeInterval +
            ' (runTime>30000 OR execTime>30000 OR cpuTime>30000) (sourcetype!=CASE(applog*:aocdl) AND sourcetype!=CASE(applog*:aordl)) ' +
            '| table _time, sourcetype, runTime, execTime, cpuTime, threadId ' +
            '| sort - runTime';
        splunk_buttonName = '30s Events';

    } else if (action == 7) { // Find 60s events
        splunk_url = 'index=' + instance1Str + ' ' + orgStr + userStr + timeInterval +
            ' (runTime>60000 OR execTime>60000 OR cpuTime>60000) (sourcetype!=CASE(applog*:aocdl) AND sourcetype!=CASE(applog*:aordl)) ' +
            '| table _time, sourcetype, runTime, execTime, cpuTime, threadId ' +
            '| sort - runTime';
        splunk_buttonName = '60s Events';

    } else if (action == 8) { // Find 90s events
        splunk_url = 'index=' + instance1Str + ' ' + orgStr + userStr + timeInterval +
            ' (runTime>90000 OR execTime>90000 OR cpuTime>90000) (sourcetype!=CASE(applog*:aocdl) AND sourcetype!=CASE(applog*:aordl)) ' +
            '| table _time, sourcetype, runTime, execTime, cpuTime, threadId ' +
            '| sort - runTime';
        splunk_buttonName = '90s Events';

    } else if (action == 9) { // Find events for custom timeframes
        splunk_url = 'index=' + instance1Str + ' ' + orgStr + userStr + timeInterval +
            ' (runTime>' + customTime + ' OR execTime>' + customTime + ' OR cpuTime>' + customTime + ') (sourcetype!=CASE(applog*:aocdl) AND sourcetype!=CASE(applog*:aordl)) ' +
            '| table _time, sourcetype, runTime, execTime, cpuTime, threadId ' +
            '| sort - runTime';
        splunk_buttonName = 'Custom Timeframe Events';

    } else if (action == 10) { // Find Classic UI Gacks
        splunk_url = 'index=' + instance1Str + ' ' + orgStr + userStr + timeInterval + ' sourcetype=applog*:g* NOT logName=*aura* | stats values(stacktraceId), count by gackSummary';
        splunk_buttonName = 'Classic UI Gacks';

    } else if (action == 11) { // Find LEX Gacks
        splunk_url = 'index=' + instance1Str + ' ' + orgStr + userStr + timeInterval + ' sourcetype=applog*:g* logName=*aura* | stats values(stacktraceId), count by gackSummary';
        splunk_buttonName = 'LEX Gacks';

    } else if (action == 12) {
        var cutoffInterval2 = parseInt(cutoffStr2) * 60;
        var recentHeader = '_' + cutoffStr2 + 'min';
        var sparkl_name = 'sparkline_span_' + sparkline_span;

        splunk_url = 'index=' + instance1Str + timeInterval +
            ' (' + orgStr + ' sourcetype=CASE(applog*:bfora)) OR (' + orgStr + ' sourcetype=CASE(applog*:X) "BuffaloTableTransporter processing")' +
            '\n| transaction threadId,host startswith=X endswith=bfora keeporphans=true ' +
            '\n| fillnull value=0 numBytesShipped' +
            '\n| table _time, CONCURRENCY_KEY, numBytesShipped, sourcetype' +
            '\n| eval tn=mvindex(split(CONCURRENCY_KEY,"."),1)' +
            '\n| eval isRecent=IF(' + cutoffTime + ' - _time > ' + cutoffInterval2 + ', 0, 1)' +
            '\n| eval hasFailed=IF(isnull(mvfind(sourcetype, "bfora")), 1, 0)' +
            '\n| eval recentFailed = hasFailed * isRecent' +
            '\n| eval recentBytes= numBytesShipped * isRecent' +
            '\n| chart max(_time) as maxtime, min(_time) as mintime,' +
            ' sum(numBytesShipped) as sizeBytes, ' +
            ' sum(recentBytes) as recentBytes,' +
            ' sum(isRecent) as attempts' + recentHeader + ',' +
            ' sum(hasFailed) as failed,' +
            ' sum(recentFailed) as failed' + recentHeader + ',' +
            ' sparkline(sum(numBytesShipped), ' + sparkline_span + ') as ' + sparkl_name + ' by tn' +
            '\n| eval first=strftime(mintime, "%m/%d %H:%M")' +
            '\n| eval last=strftime(maxtime, "%m/%d %H:%M")' +
            '\n| eval totalBytes=tostring(sizeBytes,"commas")' +
            '\n| eval bytes' + recentHeader + '=tostring(recentBytes,"commas")' +
            '\n| sort -maxtime' +
            '\n| table tn, first, last, ' + sparkl_name + ', totalBytes, failed, bytes' + recentHeader + ',' +
            ' attempts' + recentHeader + ', failed' + recentHeader +
            '\n| search attempts' + recentHeader + ' > 0 AND totalBytes > 0';
        splunk_buttonName = 'Buffalo: View Tables';
    } else if (action == 13) {
        splunk_url = 'index=' + instance2Str + timeInterval + ' jobId=buffalo-' + orgStr +
            '* sourcetype=CASE(applog*:ksbse) operation=KEYSTONE_OPERATION ' +
            '\n| rex field=message "totalRecordsToMigrate: (?<estimate>\\d+)" ' +
            '\n| rex field=message "entity: (?<entity>[^\\s,]+)" ' +
            '\n| rex field=message "numBlobs: (?<copied>\\d+) " ' +
            '\n| chart max(_time) as maxtime, min(_time) as mintime, sum(estimate) as estimate, ' +
            'sparkline(sum(copied), ' + sparkline_span + ') as sparkl, sum(copied) as copied by entity ' +
            '\n| eval first=strftime(mintime, "%m/%d %H:%M")' +
            '\n| eval last=strftime(maxtime, "%m/%d %H:%M")' +
            '\n| search estimate>0' +
            '\n| eval copied=min(estimate,copied)' +
            '\n| table entity, first, last, sparkl, estimate, copied';
        splunk_buttonName = 'Buffalo: View FFX';
    } else if (action == 14) {
        splunk_url = 'index=' + instance1Str + timeInterval + ' sourcetype=CASE(applog*:X) "Buffalo:Thread"' + orgStr +
            '\n| eval isLast=IF(searchmatch("and is the last thread"), 1, 0) ' +
            '\n| rex field=message "Total completed so far = (?<completedBuckets>\\d+)"' +
            '\n| rex field=message "MAX_HASH_BUCKET=(?<totalBuckets>\\d+)"' +
            '\n| rex field=Payload "\\w+:\\w+:(?<tName>[^:]+:[^:]+):"' +
            '\n| stats max(totalBuckets) as totalBuckets, max(completedBuckets) as completedBuckets, max(isLast) as isLast by tName' +
            '\n| eval result=IF(isLast==1, "completed", completedBuckets + " / " + totalBuckets)' +
            '\n| table tName, result';
        splunk_buttonName = 'Buffalo: View Chunks';
    } else if (action == 15) { // Find progress on PD
        splunk_url = 'index=' + instance1Str + ' ' + orgStr + userStr + timeInterval + ' sourcetype=CASE(applog*:pdlog) | stats sum(deleted)';
        splunk_buttonName = 'PD Progress';

    } else if (action == 16) { // Recycle Bin Progress
        splunk_url = 'index=' + instance1Str + ' ' + orgStr + timeInterval + ' sourcetype=CASE(applog*:ldbin) | stats sum(count) by sourcetype';
        splunk_buttonName = 'Recycle Bin Progress';
        
    } else if (action == 17) { // Related List runTimes
        splunk_url = 'index=' + instance1Str + ' ' + orgStr + userStr + timeInterval + ' sourcetype=CASE(applog*:rxrll)' + 
        '\n| rex field=theRest "```````````(?<recordType>\\w*)"' +
        '\n| eval recordType=if(like(recordType,"01I%"),"custom entity",recordType)' +
        '\n| where NOT match(recordType,"unknown")' +
        '\n| rex field=theRest "```````````(\\w*).(?<recordId>\\w*)"' +
        '\n| rex max_match=25 field=theRest "dbTime(.):(?<rrDbTime>\\w*)"' +
        '\n| rex max_match=25 field=theRest "sObjectName(.):(.)(?<sObjectName>\\w*)"' + 
        '\n| rex max_match=25 field=theRest "runTime(.):(?<rrRunTime>\\w*)"' +
        '\n| table _time, recordType, recordId, rrDbTime, sObjectName, rrRunTime, threadId' +
        '\n| sort rrRunTime desc';
        splunk_buttonName = 'Related List runTimes';
    }
    
    //Next 4 lines are tracking code
    var xhttp = new XMLHttpRequest();
    xhttp.open('GET', 'https://splunkwizard.secure.force.com/savequery/services/apexrest/savequery?skill=' + encodeURIComponent(skillId) + '&query=' + encodeURIComponent(splunk_url) + '&instance=' + encodeURIComponent(instance1Str) + '&orgid=' + encodeURIComponent(orgStr) + '&buttonname=' + encodeURIComponent(splunk_buttonName), true);
    xhttp.send();
    
    splunk_url = 'https://splunk-web.crz.salesforce.com/en-US/app/search/search?q=' + encodeURIComponent(splunk_url);
    
    setTimeout(function(){
        chrome.tabs.create({
            "url": splunk_url
        });
    },200);
}

//Other Query is for Performance Splunk Dashboards

function doOtherQuery(action) {

    $('#validationMessage').empty();
    clearMessagesBeforeNextCall();

    // Validate user input
    var instance1Str = $.trim($('#instance1').val());
    var instance2Str = $.trim($('#instance2').val());
    var orgStr = $.trim($('#org').val());
    var userStrChk = $.trim($('#user').val());
    var earliestStr = $.trim($('#earliest').val());
    var latestStr = $.trim($('#latest').val());
    var cutoffStr = $.trim($('#cutoff').val());

    var validationPTag = '';
    if (orgStr.length == 0) {
        validationPTag += '<li> Organization ID </li>';
    }
    if (userStrChk.length == 0) {
        var userStr = '';
    } else {
        var userStr = ' ' + userStrChk;
    }
    if (instance1Str.length == 0) {
        validationPTag += '<li> Source Instance </li>';
    }
    if (action == 2 && instance1Str.length == 0) {
        validationPTag += '<li> Target Instance </li>';
    }
    if (earliestStr.length == 0) {
        validationPTag += '<li> Earliest time </li>';
    }
    if (latestStr.length == 0) {
        var latestStr = 'now';
    }

    if (validationPTag.length > 0) {
        validationPTag = '<div style="display:list-item">Some input parameters are missing/invalid</div>' + '<ul>' + validationPTag + '</ul>';
        $('#validationMessage').append(validationPTag).show();
        //alert("Error");
        return;
    }

    var timeInterval = 'earliest=' + earliestStr;
    var cutoffTime = 'time()';

    var splunk_url;
    var splunk_buttonName;

    if (action == 1) { // Org APT Breakdown
        splunk_url = 'Instance=' + instance1Str + '&form.DBnode=*&form.OrgRestrict=' + orgStr + '&form.span=' + cutoffStr + 'm&' + timeInterval + '&latest=' + latestStr;
        splunk_buttonName = 'Org APT Breakdown';
    }
    
    //Next 4 lines are tracking code
    var xhttp = new XMLHttpRequest();
    xhttp.open('GET', 'https://splunkwizard.secure.force.com/savequery/services/apexrest/savequery?skill=' + encodeURIComponent(skillId) + '&query=' + encodeURIComponent(splunk_url) + '&instance=' + encodeURIComponent(instance1Str) + '&orgid=' + encodeURIComponent(orgStr) + '&buttonname=' + encodeURIComponent(splunk_buttonName), true);
    xhttp.send();
    
    splunk_url = "https://splunk-web.crz.salesforce.com/en-US/app/publicSharing/org_apt_breakdown?form." + splunk_url;
        
    setTimeout(function(){
        chrome.tabs.create({
            "url": splunk_url
        });
    },200);
}

function doSecQuery(action) {

    $('#validationMessage').empty();
    clearMessagesBeforeNextCall();

    // Validate user input
    var instance1Str = $.trim($('#instance1').val());
    var instance2Str = $.trim($('#instance2').val());
    var orgStr = $.trim($('#org').val());
    var userStrChk = $.trim($('#user').val());
    var earliestStr = $.trim($('#earliest').val());
    var latestStr = $.trim($('#latest').val());
    var cutoffStr = $.trim($('#cutoff').val());
    var cutoffStr2 = $.trim($('#cutoff2').val());
    var email_address = $.trim($('#emailAddress').val());
    var customTime = $.trim($('#customSeconds').val()) + '000';
    var sparkline_span = $.trim($('#sparkline_span').val());

    var validationPTag = '';


    if (orgStr.length == 0) {
        validationPTag += '<li> Organization ID </li>';
    }
    if (userStrChk.length == 0) {
        var userStr = '';
    } else {
        var userStr = ' ' + userStrChk;
    }
    if (instance1Str.length == 0) {
        validationPTag += '<li> Source Instance </li>';
    }
    if (action == 9 && customTime == '000') {
        validationPTag += '<li> Custom Duration</li>';
    }
    if (action == 2 && instance1Str.length == 0) {
        validationPTag += '<li> Target Instance </li>';
    }
    if (earliestStr.length == 0) {
        validationPTag += '<li> Earliest time </li>';
    }
    if (cutoffStr.length == 0) {
        validationPTag += '<li> Cutoff Interval </li>';
    } else {
        if (isNaN(cutoffStr)) validationPTag += '<li> Cutoff interval is not numeric </li>';
    }

    if (validationPTag.length > 0) {
        validationPTag = '<div style="display:list-item">Some input parameters are missing/invalid</div>' + '<ul>' + validationPTag + '</ul>';
        $('#validationMessage').append(validationPTag).show();
        //alert("Error");
        return;
    }

    var timeInterval = ' earliest=' + earliestStr;
    var cutoffTime = 'time()';

    if (latestStr.length > 0) {
        timeInterval += ' latest=' + latestStr;
        cutoffTime = 'strptime("' + latestStr + '", "%m/%d/%Y:%H:%M:%S")';
    }
    var cutoffInterval = parseInt(cutoffStr) * 60;

    var splunk_url;
    var splunk_buttonName;

    if (action == 1) { // Check if verification event fired
        splunk_url = 'index=' + instance1Str + ' CASE(' + orgStr + ')'+ userStr + timeInterval + ' sourcetype=CASE(applog*:scver)' +
            '\n| convert timeformat="%D:%H:%M:%S" ctime(_time) AS DateTime' +
            '\n| table sourcetype, DateTime, organizationId, userId, page,  phase, details, method';
        splunk_buttonName = 'Verification Fired';
        
    } else if (action == 2) { // See if verification email was sent
        splunk_url = 'index=mtalog' + ' CASE(' + orgStr + ') '+ email_address + timeInterval +
            '\n| convert timeformat="%D:%H:%M:%S" ctime(_time) AS DateTime' +
            '\n| table DateTime, organizationId, SFDC_User, Remote_Host, Mail_Event, Sender, Message_ID_Header';
        splunk_buttonName = 'Verification Email Sent';
        
    } else if (action == 3) { // See if verification SMS was sent
        splunk_url = 'index=' + instance1Str + ' CASE(' + orgStr + ')'+ userStr + timeInterval + ' sourcetype=CASE(applog*:scchl) OR sourcetype=CASE(applog*:scmsg) OR validCookie=false'
            '\n| convert timeformat="%D:%H:%M:%S" ctime(_time) AS DateTime' +
            '\n| table sourcetype, DateTime, organizationId, userId, remoteAddr, stage, theRest';
        splunk_buttonName = 'Verification SMS Sent';
        
    } else if (action == 4) { // TLS Query
        splunk_url = 'index=' + instance1Str +  ' (sourcetype=CASE(applog*:L) OR sourcetype=CASE(applog*:N) OR sourcetype=CASE(applog*:O) OR sourcetype=CASE(applog*:apout) OR sourcetype=CASE(applog*:J) OR sourcetype=CASE(applog*:U) OR sourcetype=CASE(applog*:V) OR sourcetype=CASE(applog*:A))' + ' organizationId=' + orgStr + timeInterval + 
            '\n| rex field=cipherSuite "\\w+ (?<tlsProtocol>[\\w.\\n]+)"' +
            '\n| search tlsProtocol=TLSv1' +
            '\n| convert timeformat="%D:%H:%M:%S" ctime(_time) AS DateTime' +
            '\n| table DateTime userName httpReferer Referer remoteAddr tlsProtocol cipherSuite pageName';
        splunk_buttonName = 'TLS Query';
        
    } else if (action == 5) { // Log Analysis
        splunk_url = 'index=' + instance1Str + ' ' + orgStr + userStr + timeInterval + ' (sourcetype=CASE(applog*:U) OR sourcetype=CASE(applog*:A) OR sourcetype=CASE(applog*:R) OR sourcetype=CASE(applog*:V) OR sourcetype=CASE(applog*:v) OR sourcetype=CASE(applog*:5) OR sourcetype=CASE(applog*:3) OR sourcetype=CASE(applog*:L) OR sourcetype=CASE(applog*:m))' +
            '\n| convert timeformat="%D:%H:%M:%S" ctime(_time) AS DateTime' +
            '\n| table sourcetype, DateTime, organizationId, userId, remoteAddr, logName, clientName, queryString, feature, queryStart, delID, entities, browserType, requestMethod, methodName, delID, runningUser, msg, entityName, rowsProcessed, reportDescription| rename remoteAddr AS IP, logName AS URI, queryStart AS "Search Query", runningUser AS "Dashboard Running User", reportDescription AS "Exported Report Metadata"';
        splunk_buttonName = 'Log Analysis';
        
    } else if (action == 6) { // Sessions
        splunk_url = 'index=' + instance1Str + '* ' + orgStr + userStr + timeInterval + ' sourcetype=CASE(applog*:sclgh)';
        splunk_buttonName = 'Sessions';
    } 
    
    //Next 4 lines are tracking code
    var xhttp = new XMLHttpRequest();
    xhttp.open('GET', 'https://splunkwizard.secure.force.com/savequery/services/apexrest/savequery?skill=' + encodeURIComponent(skillId) + '&query=' + encodeURIComponent(splunk_url) + '&instance=' + encodeURIComponent(instance1Str) + '&orgid=' + encodeURIComponent(orgStr) + '&buttonname=' + encodeURIComponent(splunk_buttonName), true);
    xhttp.send();
    
    splunk_url = 'https://splunk-web.crz.salesforce.com/en-US/app/search/search?q=' + encodeURIComponent(splunk_url);
    
    setTimeout(function(){
        chrome.tabs.create({
            "url": splunk_url
        });
    },200);
}

function doAnalyticQuery(action) {

    $('#validationMessage').empty();
    clearMessagesBeforeNextCall();

    // Validate user input
    var instance1Str = $.trim($('#instance1').val());
    var instance2Str = $.trim($('#instance2').val());
    var orgStr = $.trim($('#org').val());
    var reportStr = $.trim($('#reportId').val());
    var userStrChk = $.trim($('#user').val());
    var earliestStr = $.trim($('#earliest').val());
    var latestStr = $.trim($('#latest').val());
    var cutoffStr = $.trim($('#cutoff').val());
    var cutoffStr2 = $.trim($('#cutoff2').val());
    var email_address = $.trim($('#emailAddress').val());
    var customRepTime = $.trim($('#customRepSeconds').val()) + '000';
    var sparkline_span = $.trim($('#sparkline_span').val());

    var validationPTag = '';


    if (orgStr.length == 0) {
        validationPTag += '<li> Organization ID </li>';
    }
    if (userStrChk.length == 0) {
        var userStr = '';
    } else {
        var userStr = ' ' + userStrChk;
    }
    if (instance1Str.length == 0) {
        validationPTag += '<li> Source Instance </li>';
    }
    if (action == 11 && customRepTime == '000') {
        validationPTag += '<li> Custom Duration</li>';
    }
    if (action == 2 && instance1Str.length == 0) {
        validationPTag += '<li> Target Instance </li>';
    }
    if (earliestStr.length == 0) {
        validationPTag += '<li> Earliest time </li>';
    }
    if (cutoffStr.length == 0) {
        validationPTag += '<li> Cutoff Interval </li>';
    } else {
        if (isNaN(cutoffStr)) validationPTag += '<li> Cutoff interval is not numeric </li>';
    }

    if (validationPTag.length > 0) {
        validationPTag = '<div style="display:list-item">Some input parameters are missing/invalid</div>' + '<ul>' + validationPTag + '</ul>';
        $('#validationMessage').append(validationPTag).show();
        //alert("Error");
        return;
    }

    var timeInterval = ' earliest=' + earliestStr;
    var cutoffTime = 'time()';

    if (latestStr.length > 0) {
        timeInterval += ' latest=' + latestStr;
        cutoffTime = 'strptime("' + latestStr + '", "%m/%d/%Y:%H:%M:%S")';
    }
    var cutoffInterval = parseInt(cutoffStr) * 60;

    var splunk_url;
    var splunk_buttonName;

    if (action == 1) { // Check for emails sent
        splunk_url = 'index=mtalog ' + orgStr + userStr + ' ' + email_address + timeInterval;
        splunk_buttonName = 'Email Sent';
        
    } else if (action == 2) { // Check emails for scheduled reports
        splunk_url = 'index=' + instance1Str + ' ' + orgStr + userStr + ' ' + reportStr + timeInterval + ' sourcetype=CASE(applog*:rrlog) origin=schd';
        splunk_buttonName = 'Email Scheduled Reports';
        
    } else if (action == 3) { // Check for deleted list views
        splunk_url = 'index=' + instance1Str + ' organizationId=' + orgStr + userStr + ' 00B* deleteredirect.jsp' + timeInterval;
        splunk_buttonName = 'Deleted List Views';
        
    } else if (action == 4) { // Check for report timeouts
        splunk_url = 'index=' + instance1Str + ' ' + orgStr + userStr + ' ' + reportStr + ' racNode=* (sourcetype=CASE(applog*:R) OR sourcetype=CASE(applog*:rrlog))' + timeInterval +
        '\n| stats count max(runTime) by reportId | sort -count runTime >600000';
        splunk_buttonName = 'Report Timeouts';
        
    } else if (action == 5) { // Wave dataflow logs
        splunk_url = 'index=' + instance1Str + ' ' + orgStr + userStr + ' (sourcetype=CASE(applog*:iedfc) OR sourcetype=CASE(applog*:iedfs) OR sourcetype=CASE(applog*:iedfb))' + timeInterval;
        splunk_buttonName = 'Wave Dataflow Logs';

    } else if (action == 6) { // Wave enablement check
        splunk_url = 'index=' + instance1Str + ' ' + orgStr + userStr + ' sourcetype=CASE(applog*:X) logNameSource=/analytics/wave/web/waveGettingStarted.apexp' + timeInterval;
        splunk_buttonName = 'Wave Enablement Check';

    } else if (action == 7) { // Find 15s events
        splunk_url = 'index=' + instance1Str + ' ' + orgStr + userStr + ' ' + reportStr + ' racNode=* (sourcetype=CASE(applog*:R) OR sourcetype=CASE(applog*:rrlog)) runTime >15000' + timeInterval +
        '\n| stats count max(runTime) by reportId | sort -count';
        splunk_buttonName = '15s Events';

    } else if (action == 8) { // Find 30s events
        splunk_url = 'index=' + instance1Str + ' ' + orgStr + userStr + ' ' + reportStr + ' racNode=* (sourcetype=CASE(applog*:R) OR sourcetype=CASE(applog*:rrlog)) runTime >30000' + timeInterval +
        '\n| stats count max(runTime) by reportId | sort -count';
        splunk_buttonName = '30s Events';

    } else if (action == 9) { // Find 60s events
        splunk_url = 'index=' + instance1Str + ' ' + orgStr + userStr + ' ' + reportStr + ' racNode=* (sourcetype=CASE(applog*:R) OR sourcetype=CASE(applog*:rrlog)) runTime >60000' + timeInterval +
        '\n| stats count max(runTime) by reportId | sort -count';
        splunk_buttonName = '60s Events';

    } else if (action == 10) { // Find 90s events
        splunk_url = 'index=' + instance1Str + ' ' + orgStr + userStr + ' ' + reportStr + ' racNode=* (sourcetype=CASE(applog*:R) OR sourcetype=CASE(applog*:rrlog)) runTime >90000' + timeInterval +
        '\n| stats count max(runTime) by reportId | sort -count';
        splunk_buttonName = '90s Events';

    } else if (action == 11) { // Find events for custom timeframes
        splunk_url = 'index=' + instance1Str + ' ' + orgStr + userStr + ' ' + reportStr + ' racNode=* (sourcetype=CASE(applog*:R) OR sourcetype=CASE(applog*:rrlog)) runTime >' + customRepTime + timeInterval +
        '\n| stats count max(runTime) by reportId | sort -count';
        splunk_buttonName = 'Custom Timeframe Events';
    
    }
        
    //Next 4 lines are tracking code
    var xhttp = new XMLHttpRequest();
    xhttp.open('GET', 'https://splunkwizard.secure.force.com/savequery/services/apexrest/savequery?skill=' + encodeURIComponent(skillId) + '&query=' + encodeURIComponent(splunk_url) + '&instance=' + encodeURIComponent(instance1Str) + '&orgid=' + encodeURIComponent(orgStr) + '&buttonname=' + encodeURIComponent(splunk_buttonName), true);
    xhttp.send();
    
    splunk_url = 'https://splunk-web.crz.salesforce.com/en-US/app/search/search?q=' + encodeURIComponent(splunk_url);
    
    setTimeout(function(){
        chrome.tabs.create({
            "url": splunk_url
        });
    },200);
}

function getWrapperRow(initialNode) {
    var node = initialNode;
    while (true) {
        console.log('node: ' + node);
        if (node == null) break;
        if (node.nodeType === Node.ELEMENT_NODE && node.tagName.toLowerCase() == "tr") break;
        node = node.parentNode;
    }
    return node;
}

$(document).ready(function () {
    $('#view_timeouts').on('click', function () {
        doPerfQuery(1);
    });
    $('#view_restarts').on('click', function () {
        doPerfQuery(2);
    });
    $('#view_gacks').on('click', function () {
        doPerfQuery(3);
    });
    $('#view_basic').on('click', function () {
        doPerfQuery(4);
    });
    $('#view_10s').on('click', function () {
        doPerfQuery(5);
    });
    $('#view_30s').on('click', function () {
        doPerfQuery(6);
    });
    $('#view_60s').on('click', function () {
        doPerfQuery(7);
    });
    $('#view_90s').on('click', function () {
        doPerfQuery(8);
    });
    $('#view_customTime').on('click', function () {
        doPerfQuery(9);
    });
    $('#view_classicUiGacks').on('click', function () {
        doPerfQuery(10);
    });
    $('#view_LEXGacks').on('click', function () {
        doPerfQuery(11);
    });
    $('#view_tables').on('click', function () {
        doPerfQuery(12);
    });
    $('#view_ffx').on('click', function () {
        doPerfQuery(13);
    });
    $('#view_chunks').on('click', function () {
        doPerfQuery(14);
    });
    $('#view_PD').on('click', function () {
        doPerfQuery(15);
    });
    $('#view_RB').on('click', function () {
        doPerfQuery(16);
    });
    $('#view_relatedList').on('click', function () {
        doPerfQuery(17);
    });
    $('#view_verificationFired').on('click', function () {
        doSecQuery(1);
    });
    $('#view_verfEmail').on('click', function () {
        doSecQuery(2);
    });
    $('#view_verfSMS').on('click', function () {
        doSecQuery(3);
    });
    $('#view_TLS').on('click', function () {
        doSecQuery(4);
    });
    $('#view_logAnalysis').on('click', function () {
        doSecQuery(5);
    });
    $('#view_sessions').on('click', function () {
        doSecQuery(6);
    });
    $('#view_sentEmail').on('click', function () {
        doAnalyticQuery(1);
    });
    $('#view_schedReport').on('click', function () {
        doAnalyticQuery(2);
    });
    $('#view_delViews').on('click', function () {
        doAnalyticQuery(3);
    });
    $('#view_reportTimeouts').on('click', function () {
        doAnalyticQuery(4);
    });
    $('#view_dataflowLogs').on('click', function () {
        doAnalyticQuery(5);
    });
    $('#view_enablement').on('click', function () {
        doAnalyticQuery(6);
    });
    $('#view_rep10s').on('click', function () {
        doAnalyticQuery(7);
    });
    $('#view_rep30s').on('click', function () {
        doAnalyticQuery(8);
    });
    $('#view_rep60s').on('click', function () {
        doAnalyticQuery(9);
    });
    $('#view_rep90s').on('click', function () {
        doAnalyticQuery(10);
    });
    $('#view_customRepTime').on('click', function () {
        doAnalyticQuery(11);
    });
    $('#view_customGackSearch').on('click', function () {
        doGackQuery(1);
    });
    $('#view_aptdash').on('click', function () {
        doOtherQuery(1);
    });

    chrome.tabs.query({
            "active": true
        },
        function (tabs) {
            $('#populate').attr('disabled', true);
            tabs.forEach(function (tab) {
                console.log(tab.url);
                if (tab.url.indexOf('splunk-web.crz.salesforce.com') >= 0) $('#populate').attr('disabled', false);
            });
        });

    chrome.storage.local.get({
        last_instance1: '',
        last_instance2: '',
        last_org: '',
        last_user: '',
        last_earliest: '',
        last_latest: '',
        last_cutoff: '15',
        sparkline_span: '30m'
    }, function (items) {
        $('#instance1').val(items.last_instance1);
        $('#instance2').val(items.last_instance2);
        $('#org').val(items.last_org);
        $('#user').val(items.last_user);
        $('#earliest').val(items.last_earliest);
        $('#latest').val(items.last_latest);
        $('#cutoff').val(items.last_cutoff);
        $('#sparkline_span').val(items.sparkline_span);
    });

    $('#instance1').on('input', setValToLocalStorage);
    $('#instance2').on('input', setValToLocalStorage);
    $('#org').on('input', setValToLocalStorage);
    $('#user').on('input', setValToLocalStorage);
    $('#earliest').on('input', setValToLocalStorage);
    $('#latest').on('input', setValToLocalStorage);
    $('#cutoff').on('input', setValToLocalStorage);
    $('#cutoff2').on('input', setValToLocalStorage);
});

function setValToLocalStorage() {
    chrome.storage.local.set({
        last_instance1: $('#instance1').val()
    });
    chrome.storage.local.set({
        last_instance2: $('#instance2').val()
    });
    chrome.storage.local.set({
        last_org: $('#org').val()
    });
    chrome.storage.local.set({
        last_user: $('#user').val()
    });
    chrome.storage.local.set({
        last_earliest: $('#earliest').val()
    });
    chrome.storage.local.set({
        last_latest: $('#latest').val()
    });
    chrome.storage.local.set({
        last_cutoff: $('#cutoff').val()
    });
}

function clearMessagesBeforeNextCall() {

    $('#errorMessage').empty();
    $('#validationMessage').empty();
    $('#validationMessage').hide();
    $('#errorMessage').html('<p><u>Work creation failed</u></p>').hide();


}
