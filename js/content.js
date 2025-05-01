let lastClickedElement = null;

document.addEventListener("contextmenu", e => {
    lastClickedElement = e.target;
}, true);

function getElementByXPath(xpath) {
    const result = document.evaluate(
        xpath,
        document,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null
    );
    return result.singleNodeValue;
}

function getElementInfo(element){
    const result = {}

    if(element.id)
        result.id = element.id;
    if(element.className)
        result.className = element.className;
    if(element.textContent !== null)
        result.textContent = element.textContent;

    return result
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "clickElement") {
        if (message.detail === null ) {
            return
        }

        const detail = message.detail
        console.log(`detail:  `);
        for (const [key, value] of Object.entries( detail )) {
            console.log(`${ key }: ${value}`);
        }
        const xpath = `//a[text() ='${detail.textContent}']`
        const target = getElementByXPath(xpath);
        console.log(`${xpath} `);
        console.log(target);
        target.click()
    }

    if (message.action === "logElement") {
        if (!lastClickedElement) {
            console.warn("❗No element recorded.");
            return;
        }

        const el = lastClickedElement
        const detail = getElementInfo(el)
        console.log('-------------------------');
        console.log(`detail:  `);
        for (const [key, value] of Object.entries( detail )) {
            console.log(`${ key }: ${value}`);
        }

        console.log('-------------------------');

        chrome.runtime.sendMessage({
            action: "xpathFromContent",
            detail: detail,
        });
    }
});
