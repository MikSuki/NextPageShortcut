import Toastify from "toastify-js"

let lastClickedElement: HTMLElement | null

document.addEventListener("contextmenu", e => {
    lastClickedElement = e.target as HTMLElement;
}, true);

document.addEventListener('keydown', function (event) {
    console.log("key " + event.key);
    if (event.keyCode === 39) {
        event.preventDefault();
        goNextPage()
    }
});

function getElementByXPath(xpath: string) {
    const result = document.evaluate(
        xpath,
        document,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null
    );
    return result.singleNodeValue;
}

interface ElementDetail {
    tagName: string | undefined;
    id: string | undefined;
    className: string | undefined;
    textContent: string | undefined;
}

function getElementInfo(element: HTMLElement) {
    // const keepedTags = ['tagName', 'id', 'className', 'textContent']
    const result: ElementDetail = {
        tagName: undefined,
        id: undefined,
        className: undefined,
        textContent: undefined,
    }

    if(element.textContent)
        result.textContent = element.textContent;

    if(element.tagName)
        result.tagName = element.tagName;

    if(element.className)
        result.className = element.className;



    return result
}

chrome.runtime.onMessage.addListener((message) => {
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

function parseToXpath(detail: ElementDetail) {
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
        const target = getElementByXPath(xpath) as HTMLElement;
        console.log(`${xpath} `);
        console.log(target);
        target.click()

        Toastify({
            text: "next page",
            duration: 600,
            gravity: "top",
            position: "left",
            style: {
                position: "fixed",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                background: "#333",
                color: "#fff",
                padding: "1em 2em",
                borderRadius: "8px",
                boxShadow: "0 4px 10px rgba(0, 0, 0, 0.3)",
                zIndex: "9999",
                textAlign: "center",
                whiteSpace: "nowrap"
            },
            stopOnFocus: false
        }).showToast()
    })
}