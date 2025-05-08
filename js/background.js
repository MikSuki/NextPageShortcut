let detail = null

chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "next-page-shortcut",
        title: "keep this key",
        contexts: ["all"]
    });

    chrome.contextMenus.create({
        id: "click",
        title: "click",
        contexts: ["all"]
    });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "next-page-shortcut") {
        chrome.tabs.sendMessage(tab.id, {action: "logElement"});
    }

    if (info.menuItemId === "click") {
        chrome.tabs.sendMessage(tab.id, {action: "clickElement", detail});
    }
});


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "keepShortcut") {

        detail = message.detail;
        const hostname = message.hostname;

        chrome.storage.local.get([hostname], function (result) {
            const data = result[hostname] || {};
            data[message.action] = detail;

            chrome.storage.local.set({
                [hostname]: data
            }, () => {
                console.log(`儲存 ${hostname} 的資料：`, info);
            });
        });
    } else if (message.action === "getShortcut") {
        console.log("getShortcut");
        sendResponse({
            detail
        })
    }

});


