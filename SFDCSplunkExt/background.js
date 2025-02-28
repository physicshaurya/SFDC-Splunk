// ID to manage the context menu entry
var cmid = "sfdcglossaryItem",
    csvUrl = "https://docs.google.com/a/salesforce.com/spreadsheets/d/1IWH3Am6qf3HwIs2AmilE6_DjM71mGc7e5rUo-dXY6Z8/export?format=csv",
    glossary,
    googleLoginUrl = "https://accounts.google.com/ServiceLogin";

// Tracking Code
var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-59825827-1']);

document.addEventListener("DOMContentLoaded", function(event) {
    (function() {
        var ga = document.createElement('script');
        ga.type = 'text/javascript';
        ga.async = true;
        ga.src = 'https://ssl.google-analytics.com/ga.js';
        var s = document.getElementsByTagName('script')[0];
        s.parentNode.insertBefore(ga, s);
    })();
});

function sendRenderBubbleMsg(safeSelectionText, value, frameUrl) {
    var data = {selection: safeSelectionText, value: value, frameUrl: frameUrl};

    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {request: "renderBubble", data: data}, function (response) {
            console.log("Renderbubble response:" + response);
        });
    });
}
var cm_clickHandler = function(clickData, tab) {
    var encodedSelectionText = encodeHtmlTags(clickData.selectionText);
    console.log("Renderbubble request for:" + encodedSelectionText);

//    processUnFormattedSpreadsheet();
    var frameUrl = clickData.frameUrl;

    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id,  {request:"renderBubbleWithLoader", data:{selection:encodedSelectionText, frameUrl:frameUrl}}, function(response) {
            console.log("RenderBubbleWithLoader response:" + response);
        });
    });

    getResult(encodedSelectionText, function(value) {
        var sDesc = value["Short Description"], isParsed = value["_parsed"];

        if (isParsed === undefined || !isParsed) {
            // Replace HTML entities
            sDesc = encodeHtmlTags(sDesc);
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                chrome.tabs.sendMessage(tabs[0].id,  {request:"escapeHtml", data:{unsafeStr:sDesc}}, function(response) {
                    sDesc = response;
                    // Process Links
                    sDesc = Autolinker.link(sDesc, {stripPrefix: false});

                    // Process new lines
                    sDesc = sDesc.replace(/(?:\r\n|\r|\n)/g, '<br />');
                    value["Short Description"] = sDesc;
                    value["_parsed"] = true;

                    sendRenderBubbleMsg(encodedSelectionText, value, frameUrl);
                });
            });
        } else {
            sendRenderBubbleMsg(encodedSelectionText, value, frameUrl);
        }

        // Tracking Code
        var label = value["label"] ? value["label"] : "Success";
        _gaq.push(['_trackEvent', clickData.selectionText.toLowerCase(), "ChromeLookup", label]);

    });
};

var options = {
    id: cmid,
    title: "Search Salesforce Glossary for \'%s\'",
    contexts: ['selection'],
    onclick: cm_clickHandler
};
chrome.contextMenus.create(options);

function getResult(selection, callback) {
    var result,
        toL = selection.toLowerCase();

    if (!glossary) {
        var resp, xhr = new XMLHttpRequest();
        xhr.open("GET", csvUrl);
        xhr.onreadystatechange = function () {

            if (xhr.status > 200 || "text/csv" !== xhr.getResponseHeader("content-type")) {
                glossary = null;
                result = {"Name":selection, "error":true, label:"NotAuthd", "Short Description": "Please login to Google Docs/Drive using Salesforce Network Login to get the definition for this."};
                callback(result);
            } else if (xhr.readyState === 4 && xhr.status === 200) {
                if (!(xhr.responseURL.indexOf(googleLoginUrl) > -1)) {
                    try {
                        resp = xhr.responseText;
                        glossary = csvToJson(resp);
                        result = getValue(toL, selection);
                    } catch (e) {
                        console.log("Error during authentication [" + e + "]");
                        result = {"Name":selection, label:"ErrorWhileLookup", "error":true, "Short Description": "Error during authentication [" + e + "]"};
                    }
                }
                callback(result);
            }
        };
        xhr.send(null);
    } else {
        result = getValue(toL, selection);
        callback(result);
    }
}

function getValue(key, actualSelection) {
    var result = {"Name":actualSelection, label:"NotFound", "Short Description": "Not found in the Salesforce Glossary"},
        ref, tmp;
    if (glossary && key in glossary) {
        tmp = glossary[key];
        if (tmp) {
            ref = tmp["Reference"];
            if (ref) {
                ref = ref.trim();
                if (ref.length > 0) {
                    key = ref;
                    tmp = glossary[key];
                }
            }
        }
    }

    if (tmp) {
        result = tmp;
    }
    return result;
}

function csvToJson(csv){

    var parsedResult = Papa.parse(csv),
        data = parsedResult.data,
        result = {}, key,
        headers=data[0],
        i, j, obj, currentRow;

    for(i = 1; i < data.length; i++){

        obj = {};
        currentRow = data[i];

        for(j = 0; j < headers.length; j++) {
            if (headers[j] === "Key") {
                key = currentRow[j];
            }
            obj[headers[j]] = currentRow[j];
        }

        result[key] = obj;
    }

    return result;
}

function processUnFormattedSpreadsheet() {
    var docUrl = "https://docs.google.com/a/salesforce.com/spreadsheets/d/1Nka_Wn_gphH2ldsk7dBsn0WV-sN3rRNQbGHn5Sx1AN8/export?format=csv",
        xhr = new XMLHttpRequest();
    xhr.open("GET", docUrl);
    xhr.onreadystatechange = function () {

        if (xhr.readyState === 4 && xhr.status === 200) {
            formatCsv(xhr.responseText);
        }
    };
    xhr.send(null);
}

function formatCsv(csv) {
    var parsedResult = Papa.parse(csv),
        data = parsedResult.data,
        i, row, currentRow;

    var formatted = [["Key", "Name", "Reference", "Full Name", "Short Description"]];


    for(i = 1; i < data.length; i++){
        row = [];
        currentRow = data[i];

        row.push(currentRow[0].toLowerCase());
        row.push(currentRow[0]);
        row.push("");
        row.push("");
        row.push(currentRow[1]);
        formatted.push(row);
    }

    console.log(Papa.unparse(formatted));
}

var tagsToReplace = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '?' : '&#63;',
    '"' : '&quot;',
    '/' : '&#x2F;'
};

function replaceTag(tag) {
    return tagsToReplace[tag] || tag;
}

function encodeHtmlTags(str) {
    return str.replace(/[&<>]/g, replaceTag);
}

