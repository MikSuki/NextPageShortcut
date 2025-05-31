import {ElementDetail} from "../interface.ts";
import {MessageAction} from "../enum/MessageAction.ts";
import {ShortcutAction} from "../enum/ShortcutAction.ts";

export class ChromeMessage {
    hostname: string
    action: MessageAction
    shortcutAction: ShortcutAction
    detail: ElementDetail | null

    constructor(hostname: string, messageAction: MessageAction, shortcutAction: ShortcutAction, detail: ElementDetail | null = null) {
        this.hostname = hostname
        this.action = messageAction
        this.shortcutAction = shortcutAction
        this.detail = detail
    }
}
