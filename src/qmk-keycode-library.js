import {QMKElement} from "@/qmk-element.js";

// language=HTML
document.body.insertAdjacentHTML('afterbegin',
    `<template>
</template>`);

export class QMKKeycapLibrary extends QMKElement {
    constructor() {
        super();
    }
}

customElements.define('qmk-keycap-library', QMKKeycapLibrary);
