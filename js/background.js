chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "next-page-shortcut",
        title: "keep this key",
        contexts: ["all"]
    });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "next-page-shortcut") {
        console.log("you clicked")
    }
});
