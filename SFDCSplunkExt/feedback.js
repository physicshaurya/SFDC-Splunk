function sendFeedback() {
    var username = $.trim($('#username').val());
    var feedback = $.trim($('#feedback').val());
    var xhttp = new XMLHttpRequest();
    xhttp.open('GET', 'https://splunkwizard.secure.force.com/savequery/services/apexrest/feedback?user=' + encodeURIComponent(username) + '&feedback=' + encodeURIComponent(feedback), true);
    xhttp.send();

}
$(document).ready(function () {
    $('#submit').on('click', function () {
        sendFeedback();
        setTimeout(function(){
        self.close();
        },500);
    });
})