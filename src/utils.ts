import {ElementDetail} from "./interface.ts";

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


function parseToXpath(detail: ElementDetail): string {
    let textCondition = ""
    let classNameCondition = ""

    if (detail.textContent) {
        textCondition = `[text()[contains(.,'${detail.textContent.trim()}')]]`
    }

    if (detail.className) {
        const classNames = detail.className.trim().split(/\s+/)
        console.log(classNames)
        classNames.map(className => {
            if (classNameCondition.length > 0) {
                classNameCondition += " and "
            }
            classNameCondition += `contains(@class, '${className}')`
        })
        classNameCondition = `[${classNameCondition}]`
    }

    // let t = "//a [contains(@class, 'next')] [text()[contains(.,'下一頁')]]"
    return `//${detail.tagName} ${textCondition} ${classNameCondition}`
}


function getElementByDetail(detail: ElementDetail) {
    const xpath = parseToXpath(detail)
    const target = getElementByXPath(xpath) as HTMLElement;
    return target
}

function stringToEnum<T extends { [key: string]: string }>(
    enm: T,
    value: string
): T[keyof T] | undefined {
    const entries = Object.entries(enm) as [keyof T, string][];
    for (const [key, val] of entries) {
        if (val === value) {
            return enm[key];
        }
    }
    return undefined;
}

export const Uills = {
    getElementByDetail,
    stringToEnum
}

