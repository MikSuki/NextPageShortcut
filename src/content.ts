import {pipe} from "fp-ts/function";
import * as Record from 'fp-ts/Record'
import * as O from 'fp-ts/Option'
import {toast} from "./toast.ts";
import {ElementDetail} from "./interface.ts";
import {Uills} from "./utils.ts";
import * as E from 'fp-ts/Either'
import {ShortcutAction} from "./enum/ShortcutAction.ts";
import {MessageAction} from "./enum/MessageAction.ts";
import {Highlighter} from "./Highlighter.ts";
import {Chrome} from "./Chrome.ts";
import {KeyCode} from "./enum/KeyCode.ts";
import {ChromeMessage} from "./interface/ChromeMessage.ts";

let lastClickedElement: HTMLElement | null

document.addEventListener("contextmenu", e => {
    lastClickedElement = e.target as HTMLElement;
}, true);

document.addEventListener('keydown', function (event) {
    if (event.code === KeyCode.ArrowRight) {
        event.preventDefault();
        goNextPage()
    }

    if (event.code === KeyCode.ArrowLeft) {
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

    keepShortcut: (shortcut: string) => {
        if (!lastClickedElement) {
            console.warn("❗No element recorded.");
            return;
        }

        const shortcutAction = Uills.stringToEnum(ShortcutAction, shortcut)
        if (!shortcutAction) return

        const el = lastClickedElement
        const detail = getElementInfo(el)

        console.log('-------------------------');
        console.log(`detail:  `);
        console.log(detail)
        console.log('-------------------------');

        Chrome.sendMessage(
            new ChromeMessage(
                location.hostname,
                MessageAction.storeShortcut,
                shortcutAction,
                detail
            )
        )
    },
    async showShortcut(shortcut: string) {
        console.log(`showShortcut: ${shortcut}`);
        const shortcutAction = Uills.stringToEnum(ShortcutAction, shortcut)
        if (!shortcutAction) return E.left(new Error("key of shortcut not found"))

        const target = await getShortcutElement(shortcutAction);

        pipe(
            target,
            E.match(
                // TODO: show you don't have that shortcut
                (err) => console.error(err),
                target => Highlighter.showElement(target)
            )
        )
        console.log(`showShortcut end: ${shortcut}`);
    }
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


async function getShortcutElement(shortcutAction: ShortcutAction) {
    const response = await Chrome.sendMessage(
        new ChromeMessage(location.hostname, MessageAction.getShortcut, shortcutAction)
    )()

    return pipe(
        response,
        E.map((resp) => resp.detail as ElementDetail),
        E.chain(E.fromNullable(new Error("message didn't has element information."))),
        E.map(Uills.getElementByDetail)
    )
}


async function clickShortcutElement(shortcutAction: ShortcutAction) {
    const target = await getShortcutElement(shortcutAction);

    pipe(
        target,
        E.match(
            // TODO: show to user
            () => console.log(`shortcut not found`),
            target => {
                target.click()
                toast(shortcutAction)
            }
        )
    )
}

function goNextPage() {
    void clickShortcutElement(ShortcutAction.nextPage)
}

function goLastPage() {
    void clickShortcutElement(ShortcutAction.lastPage)
}
