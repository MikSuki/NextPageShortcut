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
import {Log} from "./Log.ts";

let lastClickedElement: HTMLElement | null

document.addEventListener("contextmenu", e => {
    Log.show(e)
    Log.show(`can el click? ${'click' in e}`)
    let target = e.target as HTMLElement
    while (!('click' in target) || target.parentNode == null) {
        Log.show('go parent')
        target = target?.parentNode as HTMLElement ?? null
    }
    lastClickedElement = target
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
    const keepedTags = ['tagName', 'id', 'className', 'textContent']
    const result: ElementDetail = {
        tagName: undefined,
        id: undefined,
        className: undefined,
        textContent: undefined,
    }

    // TODO: fix type error
    keepedTags.forEach(tag => {
        // @ts-ignore
        if (element[tag]) { // @ts-ignore
            result[tag] = element[tag];
        }
    })

    return result
}

const messageHandler: Record<string, (shortcutAction: string) => void> = {
    keepShortcut: async (shortcut: string) => {
        if (!lastClickedElement) {
            Log.show("❗No element recorded.");
            return;
        }

        const shortcutAction = Uills.stringToEnum(ShortcutAction, shortcut)
        if (!shortcutAction) return

        const el = lastClickedElement
        const detail = getElementInfo(el)

        Log.show('-------------------------');
        Log.show(`detail:  `);
        Log.show(detail)
        Log.show('-------------------------');

        await Chrome.sendMessage(
            new ChromeMessage(
                location.hostname,
                MessageAction.storeShortcut,
                shortcutAction,
                detail
            )
        )()
    },
    async showShortcut(shortcut: string) {
        Log.show(`showShortcut: ${shortcut}`);
        const shortcutAction = Uills.stringToEnum(ShortcutAction, shortcut)
        if (!shortcutAction) return E.left(new Error("key of shortcut not found"))

        const target = await getShortcutElement(shortcutAction);

        pipe(
            target,
            E.match(
                () => toast(`❗you don't keep the shortcut "${shortcut}"`, true),
                target => Highlighter.showElement(target)
            )
        )
        Log.show(`showShortcut end: ${shortcut}`);
    }
}

chrome.runtime.onMessage.addListener((message: ChromeMessage) => {

    pipe(
        message.action,
        O.fromNullable,
        O.match(
            () => Log.show(`action not found`),
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
            () => toast(`❗you don't keep the shortcut "${shortcutAction}"`, true),
            target => {
                try {
                    target.click()
                    toast(shortcutAction)
                }
                catch (_) {
                   toast(`❗click shortcut error QQ`, true)
                }
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
