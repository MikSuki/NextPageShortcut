import {annotate} from 'rough-notation';


function showElement(element: HTMLElement) {
    const annotation = annotate(element, {
        type: 'circle',
        color: 'red',
        animationDuration: 800,
        padding: 10
    });
    element.scrollIntoView({behavior: "smooth", block: "center"});
    annotation.show();

    setTimeout(() => {
        annotation.hide();
    }, 5000);
}


export const Highlighter = {
    showElement
}