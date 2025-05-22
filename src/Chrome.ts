import * as TE from 'fp-ts/TaskEither';
import {ShortcutAction} from "./enum/ShortcutAction.ts";
import {MessageAction} from "./enum/MessageAction.ts";

function sendMessage(action: MessageAction, shortcutAction: ShortcutAction) {
    console.log('send message', action, shortcutAction);
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


export const Chrome = {
    sendMessage
}