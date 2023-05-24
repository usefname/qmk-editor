// @ts-ignore
import * as bulma_css from './css/bulma-custom.css';

export class QMKElement extends HTMLElement {
    static bulma_css = new CSSStyleSheet();
    static {
        this.bulma_css.replaceSync(bulma_css.default as string);
    }

    shadow: ShadowRoot;
    template: DocumentFragment;

    protected constructor(templateName: string) {
        super();
        this.shadow = this.attachShadow({mode: "open"});
        this.shadow.adoptedStyleSheets = [QMKElement.bulma_css];
        this.template = this.cloneTemplate(templateName);
    }

    cloneTemplate(templateId: string): DocumentFragment {
        const templateElement = document.getElementById(templateId) as HTMLTemplateElement;
        return <DocumentFragment>templateElement.content.cloneNode(true);
    }

    replace(id: string, element: HTMLElement) {
        this.template.getElementById(id)?.replaceWith(element);
        element.id = id;
        return element;
    }

    addEventsToElement(rootElement: HTMLElement, events: any[]) {
        for (let e of events) {
            const elements = rootElement.querySelectorAll(e[0]);
            for (const element of elements) {
                element.addEventListener(e[1], e[2].bind(this));
            }
        }
    }

    addEvents(events: any[]) {
        for (let e of events) {
            this.addEventListener(e[0], e[1].bind(this));
        }
    }

    emitEvent(name: string, detail: any) {
        this.dispatchEvent(new CustomEvent(name, {bubbles: true, composed:true, detail: detail}));
    }

    setOrRemoveClass(element: HTMLElement, className: string, state: boolean) {
        if (state) {
            element.classList.add(className);
        } else {
            element.classList.remove(className);
        }
    }

    removeChildren(element: HTMLElement) {
        while(element.firstChild) {
            element.removeChild(element.firstChild)
        }
    }

    idElement(elementId: HTMLElement) {
        return this.shadow.querySelector("#" + elementId);
    }
}
