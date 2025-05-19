import {pipe} from "fp-ts/function";
import * as Record from 'fp-ts/Record'
import * as O from 'fp-ts/Option'
import {toast} from "./toast.ts";
import {ElementDetail} from "./interface.ts";
import {Uills} from "./utils.ts";
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

    if (event.keyCode === 37) {
        event.preventDefault();
        goLastPage()
    }
});


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

const messageHandler: Record<string, (shortcutAction: string) => void> = {
    clickElement: () => {
        goNextPage()
    },

    keepShortcut: (shortcutAction: string) => {
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
            action: "store",
            hostname: location.hostname,
            shortcutAction: shortcutAction,
            detail: detail,
        });
    }
}

interface ChromeMessage {
    action: string;
    shortcutAction: string;
}

chrome.runtime.onMessage.addListener((message: ChromeMessage) => {

    pipe(
        message.action,
        O.fromNullable,
        O.match(
            () => console.log(`action not found`),
            action => messageHandler[action](message.shortcutAction),
        )
    )
});

function clickShortcutElement(shortcutAction: string) {
    chrome.runtime.sendMessage({
        action: "getShortcut",
        shortcutAction: shortcutAction,
        hostname: location.hostname,
    }, (response) => {
        console.log('backgrounds 回來的資料：', response)

        pipe(
            response.detail,
            O.fromNullable,
            O.chain(detail =>
                O.fromNullable(Uills.getElementByDetail(detail as ElementDetail))
            ),
            O.match(
                () => console.log(`target not found`),
                target => {
                    target.click()
                    toast(shortcutAction)
                }
            )
        )
    })
}

function goNextPage() {
    clickShortcutElement("nextPage")
}

function goLastPage() {
    clickShortcutElement("lastPage")
}
