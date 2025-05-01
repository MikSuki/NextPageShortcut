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
        console.log("you clicked")
        console.log( info )
        chrome.tabs.sendMessage(tab.id, { action: "logElement" });
    }

    if (info.menuItemId === "click") {
        console.log( detail )
        chrome.tabs.sendMessage(tab.id, { action: "clickElement", detail });
    }
});



chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "xpathFromContent") {
        console.log("📥 收到來自 content script 的 XPath:", message.detail);
        detail = message.detail;
    }
});