import Tab = chrome.tabs.Tab;
import OnClickData = chrome.contextMenus.OnClickData;
import MessageSender = chrome.runtime.MessageSender;
import {pipe} from "fp-ts/function";
import * as Record from 'fp-ts/Record'
import * as E from 'fp-ts/Either'
import {Log} from "./Log.ts";

chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "next-page-shortcut",
        title: 'keep this key for "next page"',
        contexts: ["all"]
    });

    chrome.contextMenus.create({
        id: "last-page-shortcut",
        title: 'keep this key for "last page"',
        contexts: ["all"]
    });

    chrome.contextMenus.create({
        id: "show-next-page-shortcut",
        title: 'show the remembered "next page"',
        contexts: ["all"]
    });

    chrome.contextMenus.create({
        id: "show-last-page-shortcut",
        title: 'show the remembered "last page"',
        contexts: ["all"]
    });
});


chrome.contextMenus.onClicked.addListener((info: OnClickData, tab: Tab | undefined) => {
    interface Context {
        tabId: number,
        menuItemId: number | string
    }

    const isValidContext = (ctx: typeof context): ctx is Context => ctx.tabId != undefined

    const context = {
        tabId: tab?.id,
        menuItemId: info.menuItemId
    }

    pipe(
        context,
        E.fromPredicate(
            isValidContext,
            () => `error tab input`
        ),
        E.map(context => {
            switch (context.menuItemId) {
                case "next-page-shortcut":
                    chrome.tabs.sendMessage(context.tabId, {action: "keepShortcut", shortcutAction: "nextPage"});
                    break
                case "last-page-shortcut":
                    chrome.tabs.sendMessage(context.tabId, {action: "keepShortcut", shortcutAction: "lastPage"});
                    break
                case  "show-next-page-shortcut":
                    chrome.tabs.sendMessage(context.tabId, {action: "showShortcut", shortcutAction: 'nextPage'});
                    break
                case  "show-last-page-shortcut":
                    chrome.tabs.sendMessage(context.tabId, {action: "showShortcut", shortcutAction: 'lastPage'});
                    break
            }
        })
    )
});


const actionHandler: Record<string, (message: any, sendResponse: (response?: any) => void) => void> = {
    storeShortcut: (message: any) => {
        const detail = message.detail;
        const hostname = message.hostname;
        const shortcutAction = message.shortcutAction;


        chrome.storage.local.get([hostname], function (result) {
            const origin = result[hostname] || {};
            origin[shortcutAction] = detail;

            Log.show(`store event: ${hostname}` )
            chrome.storage.local.set({
                [hostname]: origin
            }, () => {
                console.log(`儲存 ${hostname} 的資料：`, detail);
                Log.show(`儲存 ${hostname} 的資料：`)
            });
        });
    },

    getShortcut: (message: any, sendResponse: (response?: any) => void) => {
        const hostname = message.hostname;
        chrome.storage.local.get([hostname], function (result) {
            console.log(hostname);
            console.log(result[hostname]);
            const shortcutAction = message.shortcutAction;
            const origin = result[hostname];
            const send = {
                detail: origin[shortcutAction]
            }
            console.log(' send:' + send)
            sendResponse(send);
        })

    },
}


chrome.runtime.onMessage.addListener((message, _: MessageSender, sendResponse) => {
    const isValidAction = (action: string) => action in actionHandler;


    Log.show(`receive action: ${message.action}`)
    console.log(`receive action: ${message.action}`)

    pipe(
        message.action,
        E.fromPredicate(
            isValidAction,
            action => `receive unknown action: ${action}`
        ),
        E.map(action => actionHandler[action](message, sendResponse)),
        E.match(
            err => console.warn(err),
            action => console.log(`action ${action} success`)
        )
    )

    return true;
});


