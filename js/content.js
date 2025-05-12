let lastClickedElement = null;

document.addEventListener("contextmenu", e => {
    lastClickedElement = e.target;
}, true);

document.addEventListener('keydown', function (event) {
    console.log("key " + event.key);
    if (event.keyCode === 39) {
        event.preventDefault();
        goNextPage()
    }
});

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

function getElementInfo(element) {
    const keepedTags = ['tagName', 'id', 'className', 'textContent']
    const result = {}

    keepedTags.map(key => {
        if (element[key])
            result[key] = element[key]
    })

    return result
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "clickElement") {
        goNextPage()
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
        console.log(detail)
        console.log('-------------------------');

        chrome.runtime.sendMessage({
            action: "keepShortcut",
            hostname: location.hostname,
            shortcutAction: "nextPage",
            detail: detail,
        });
    }
});

function parseToXpath(detail) {
    let condition = ""

    if(detail.textContent) {
        if(condition.length > 0) {
            condition += " and "
        }
        condition += `text() ='${detail.textContent}'`
    }

    if(detail.className){
        const classNames = detail.className.trim().split(/\s+/)
        console.log(classNames)
        classNames.map(className => {
            if(condition.length > 0) {
                condition += " and "
            }
            condition += `contains(@class, '${className}')`
        })
    }

    return `//${detail.tagName} [${condition}]`
}

function goNextPage() {
    chrome.runtime.sendMessage({
        action: "getShortcut",
        hostname: location.hostname,
    }, (response) => {
        console.log('background 回來的資料：', response)
        const detail = response.detail
        if (detail === null) {
            console.log('no shortcut QQQ')
            return
        }
        console.log(`detail:  `);
        for (const [key, value] of Object.entries(detail)) {
            console.log(`${key}: ${value}`);
        }
        const xpath = parseToXpath(detail)
        const target = getElementByXPath(xpath);
        console.log(`${xpath} `);
        console.log(target);
        target.click()
    })
}