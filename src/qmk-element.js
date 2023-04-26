import bulma_css from './css/bulma-custom.css?raw';

export class QMKElement extends HTMLElement {
    static bulma_css = new CSSStyleSheet();
    static {
        this.bulma_css.replaceSync(bulma_css);
    }

    constructor() {
        super();
        this.shadow = this.attachShadow({mode: "open"});
        this.shadow.adoptedStyleSheets = [QMKElement.bulma_css];
    }

    addTemplate(templateName) {
        const template = document.getElementById(templateName).content.cloneNode(true);
        this.shadow.appendChild(template);
    }
}
