import {QMKElement} from "@/qmk-element.js";

// language=HTML
document.body.insertAdjacentHTML('afterbegin',
    `<template>
</template>`);

export class QMKEditMode extends QMKElement {
    constructor() {
        super();
    }
}

customElements.define('qmk-edit-mode', QMKEditMode);
