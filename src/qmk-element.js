import bulma_css from './css/bulma-custom.css?raw';

export class QMKElement extends HTMLElement {
    static bulma_css = new CSSStyleSheet();
    static {
        this.bulma_css.replaceSync(bulma_css);
    }

    constructor(templateName) {
        super();
        this.shadow = this.attachShadow({mode: "open"});
        this.shadow.adoptedStyleSheets = [QMKElement.bulma_css];
        if (templateName) {
            this.template = document.getElementById(templateName).content.cloneNode(true);

        }
    }

    replace(id, element) {
        this.template.getElementById(id).replaceWith(element);
        element.id = id;
        return element;
    }

    addEventsToElement(rootElement, events) {
        for (let e of events) {
            rootElement.querySelector(e[0]).addEventListener(e[1], e[2].bind(this));
        }
    }

    addEvents(events) {
        for (let e of events) {
            this.addEventListener(e[0], e[1].bind(this));
        }
    }

    emitEvent(name, detail) {
        this.dispatchEvent(new CustomEvent(name, {bubbles: true, composed:true, detail: detail}));
    }

    setOrRemoveClass(element, className, state) {
        if (state) {
            element.classList.add(className);
        } else {
            element.classList.remove(className);
        }
    }

    removeChildren(element) {
        while(element.firstChild) {
            element.removeChild(element.firstChild)
        }
    }

    idElement(elementId) {
        return this.shadowRoot.querySelector("#" + elementId);
    }
}
