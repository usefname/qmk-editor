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
            console.log("adding template");
            this.template = document.getElementById(templateName).content.cloneNode(true);
            this.template.addEvents = (events) => {
                for (let e of events) {
                    console.log(e);
                    this.template.querySelector(e[0]).addEventListener(e[1], e[2]);
                }
            }
        }
    }
}
