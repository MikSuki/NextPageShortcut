import {pipe} from "fp-ts/function";
import * as Record from 'fp-ts/Record'
import * as O from 'fp-ts/Option'
import {toast} from "./toast.ts";
// import * as E from 'fp-ts/Either'

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

    if (element.textContent)
        result.textContent = element.textContent;

    if (element.tagName)
        result.tagName = element.tagName;

    if (element.className)
        result.className = element.className;


    return result
}

const messageHandler: Record<string, () => void> = {
    clickElement: () => {
        goNextPage()
    },

    logElement: () => {
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
}

interface ChromeMessage {
    action: string;
}

chrome.runtime.onMessage.addListener((message: ChromeMessage) => {

    pipe(
        message.action,
        O.fromNullable,
        O.match(
            () => console.log(`action not found`),
            action => messageHandler[action](),
        )
    )
});

function parseToXpath(detail: ElementDetail): string {
    let condition = ""

    if (detail.textContent) {
        if (condition.length > 0) {
            condition += " and "
        }
        condition += `text() ='${detail.textContent}'`
    }

    if (detail.className) {
        const classNames = detail.className.trim().split(/\s+/)
        console.log(classNames)
        classNames.map(className => {
            if (condition.length > 0) {
                condition += " and "
            }
            condition += `contains(@class, '${className}')`
        })
    }

    return `//${detail.tagName} [${condition}]`
}


function getElementByDetail(detail: ElementDetail) {
    const xpath = parseToXpath(detail)
    const target = getElementByXPath(xpath) as HTMLElement;
    return target
}

function goNextPage() {
    chrome.runtime.sendMessage({
        action: "getShortcut",
        hostname: location.hostname,
    }, (response) => {
        console.log('background 回來的資料：', response)

        pipe(
            response.detail,
            O.fromNullable,
            O.chain(detail =>
                O.fromNullable(getElementByDetail(detail as ElementDetail))
            ),
            O.match(
                () => console.log(`target not found`),
                target => {
                    target.click()
                    toast("next page")
                }
            )
        )
    })
}

