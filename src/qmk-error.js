import {QMKElement} from "./qmk-element.js";

// language=HTML
document.body.insertAdjacentHTML('afterbegin', `
            <template id="qmk-error"> 
                <div class="modal is-active">
                    <div class="modal-background"></div>
                    <div class="modal-card">
                        <header class="modal-card-head">
                            <p class="modal-card-title">Unexpected Error</p>
                            <button class="delete" aria-label="close"></button>
                        </header>
                        <section class="modal-card-body">
                        </section>
                        <footer class="modal-card-foot">
                            <button class="button">Cancel
                            </button>
                        </footer>
                    </div>
                </div>
            </template>`
);

export class QMKError extends QMKElement {
    constructor(title, error) {
        super('qmk-error');
        this.template.querySelector(".modal-card-title").textContent = title;
        this.template.querySelector(".modal-card-body").textContent = error;
        this.template.querySelectorAll("button").forEach(el => {
            el.addEventListener('click', this.onClick.bind(this));
        });
        this.shadow.appendChild(this.template);
    }

    onClick() {
        this.dispatchEvent(new Event('close-error'));
    }
}

customElements.define('qmk-error', QMKError);
