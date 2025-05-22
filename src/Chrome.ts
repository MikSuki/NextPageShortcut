import * as TE from 'fp-ts/TaskEither';
import {ChromeMessage} from "./interface/ChromeMessage.ts";

function sendMessage(message: ChromeMessage) {
    console.log('send message', message.action, message.shortcutAction);
    return TE.tryCatch(
        () =>
            new Promise<any>((resolve, reject) => {
                chrome.runtime.sendMessage(message, (response) => {
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