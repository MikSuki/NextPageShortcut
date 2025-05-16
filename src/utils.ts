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


export const Uills = {
    getElementByDetail
}
