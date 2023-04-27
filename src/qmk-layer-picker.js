import {QMKElement} from "@/qmk-element.js";

// language=HTML
document.body.insertAdjacentHTML('afterbegin',
    `<template>
</template>`);

export class QmkLayerPicker extends QMKElement {
    constructor() {
        super();
    }
}

customElements.define('qmk-layer-picker', QmkLayerPicker);
