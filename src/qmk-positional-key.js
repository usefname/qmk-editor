import {QMKElement} from "@/qmk-element.js";
import {QMKKeycap} from "@/qmk-keycap.js";

// language=HTML
document.body.insertAdjacentHTML('afterbegin',
    `<template id="qmk-positional-key">
        <style>
            #key-position {
                top: calc(var(--key_y)*var(--key_y_spacing)*1px);
                left: calc(var(--key_x)*var(--key_x_spacing)*1px);
                width: calc(var(--key_w)*var(--key_width)*1px);
                height: calc(var(--key_h)*var(--key_height)*1px);
                position: absolute;
            }
        </style>
        <div id="key-position"></div>
    </template>`);

export class QMKPositionalKey extends QMKElement {
    static get observedAttributes() {
       return ['selected', 'caption'];
    }

    constructor(key, index, caption) {
        super('qmk-positional-key');
        this.template.querySelector("#key-position").style.setProperty("--key_y", key.y);
        this.template.querySelector("#key-position").style.setProperty("--key_x", key.x);
        this.template.querySelector("#key-position").style.setProperty("--key_w", key.w ? key.w : 1);
        this.template.querySelector("#key-position").style.setProperty("--key_h", key.h ? key.h : 1);
        this.setAttribute('caption', caption);
        this.keycap = new QMKKeycap(index, caption);
        this.template.querySelector("#key-position").appendChild(this.keycap);
        this.shadowRoot.appendChild(this.template);
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (this.keycap) {
            if (newValue) {
                this.keycap.setAttribute(name, newValue);
            } else {
                this.keycap.removeAttribute(name);
            }
        }
    }
}

customElements.define('qmk-positional-key', QMKPositionalKey);
