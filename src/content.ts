import {pipe} from "fp-ts/function";
import * as Record from 'fp-ts/Record'
import * as O from 'fp-ts/Option'
import {toast} from "./toast.ts";
import {ElementDetail} from "./interface.ts";
import {Uills} from "./utils.ts";
import {annotate} from 'rough-notation';
import * as TE from 'fp-ts/TaskEither';
import * as E from 'fp-ts/Either'

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
    },
    async showShortcut(shortcutAction: string) {
        console.log(`showShortcut: ${shortcutAction}`);
        const target = await getShortcutElement(shortcutAction);

        pipe(
            target,
            E.match(
                (err) => console.error(err),
                target => {
                    const annotation = annotate(target, {
                        type: 'circle',
                        color: 'red',
                        animationDuration: 800,
                        padding: 10
                    });
                    target.scrollIntoView({behavior: "smooth", block: "center"});
                    annotation.show();

                    setTimeout(() => {
                        annotation.hide();
                    }, 5000);
                }
            )
        )
        console.log(`showShortcut end: ${shortcutAction}`);
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


function sendMessage(action: string, shortcutAction: string) {
    return TE.tryCatch(
        () =>
            new Promise<Response>((resolve, reject) => {
                chrome.runtime.sendMessage({
                    action,
                    shortcutAction,
                    hostname: location.hostname,
                }, (response) => {
                    if (chrome.runtime.lastError) {
                        reject(new Error(chrome.runtime.lastError.message));
                    } else {
                        console.log('get the response in TE')
                        resolve(response);
                    }
                });
            }),
        (reason) => (reason instanceof Error ? reason : new Error(String(reason)))
    )
}

async function getShortcutElement(shortcutAction: string) {
    const response = await sendMessage('getShortcut', shortcutAction)()

    const getDetail = (response: Response) => {
        // TODO: add type to fix this
        // @ts-ignore
        const {detail} = response
        console.log(detail)
        return detail as ElementDetail
    }

    return pipe(
        response,
        E.map(getDetail),
        E.map(Uills.getElementByDetail),
    )
}


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
