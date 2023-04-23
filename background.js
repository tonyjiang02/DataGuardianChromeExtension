// chrome.runtime.onInstalled.addListener(({ reason }) => {
//     if (reason === 'install') {
//         chrome.tabs.create({
//             url: "hello.html"
//         });

//         var d = new Date();
//         d.setHours(0, 0, 0, 0);
//         chrome.storage.local.set({ "refreshDate": d });

//         //on first open send the entire history, and then afterwards only send every 24 hours
//         chrome.history.search({ text: '', maxResults: 100000, startTime: 0 }, function (data) {
//             var jsonData = {};
//             var urlArray = [];

//             data.forEach(function (page) {
//                 // console.log(page.url);
//                 urlArray.push(page.url);
//             });

//             jsonData["history"] = urlArray;
//             console.log(jsonData);
//         });
//     }
// });
// chrome.tabs.onCreated.addListener(function (activeInfo) {
//     console.log("TESTING");
//     dayChange();
// });

var hasAuthenticated = false;
function runEvery() {
    console.log("repeat");
    console.log(hasAuthenticated);
    dayChange();
}

chrome.runtime.onInstalled.addListener(({ reason }) => {
    chrome.storage.local.clear();
    setInterval(runEvery, 1000);
});
chrome.tabs.onActivated.addListener(() => {
    console.log("Tab Activated");
});
//send a request every new day to get all the last info
async function dayChange() {
    if (!hasAuthenticated) {
        chrome.storage.local.get("email", function (result) {
            if (result["email"] != null) {
                console.log("email");
                console.log(result);
                hasAuthenticated = true;
                chrome.history.search({ text: '', maxResults: 10000 }, function (data) {
                    var jsonData = {};
                    var urlArray = [];

                    data.forEach(function (page) {
                        // console.log(page.url);
                        urlArray.push(page.url);
                    });

                    jsonData["history"] = urlArray;
                    jsonData["user_email"] = result;
                    console.log(jsonData);
                    fetch("http://localhost:5001/update_history", {
                        method: "POST",
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(jsonData)
                    }
                    );
                });
            }
        });
    }
}
