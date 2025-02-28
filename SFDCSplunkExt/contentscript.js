 chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
            switch (request.type){
                case "openModal":
                    $('#myModal').modal({
                       backdrop: 'static',
                       keyboard: false
                    });
                    break;  
});