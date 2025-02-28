var skillGroup;
chrome.storage.sync.get('assignedSkill', function (result) {
    var skillGroup = result.assignedSkill;
    if (!skillGroup) {
        $.get("Unassigned.html", function (data) {
                    $("body").append(data);
                });
        };
    if (skillGroup == "Performance") {
        var skillId = "a0446000001eRuj";
        $.get("Performance.html", function (data) {
                    $("body").append(data);
                });
        };
    if (skillGroup == "Security") {
        $.get("Security.html", function (data) {
                    $("body").append(data);
                });
        };
    if (skillGroup == "Analytics") {
        $.get("Analytics.html", function (data) {
                    $("body").append(data);
                });
        };
});
