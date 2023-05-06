import {QMKElement} from "@/qmk-element.js";
import {BASIC_ARG, LAYER_ARG, parseCaption, replaceArgInMultiCaption} from "@/lib/key-info.js";
import {QmkExplodedKey} from "@/qmk-exploded-key.js";
import {QMKKeycap} from "@/qmk-keycap.js";

// language=HTML
document.body.insertAdjacentHTML('afterbegin',
    `<template id='qmk-keycap-modal'>
        <style>
            #keycap-modal {
                width: fit-content;
                position: fixed;
                left: 0;
                right: 0;
                margin: 4rem auto;
                z-index: 200;
            }
            
            #exploded-key {
                padding: 1.25rem;
            }
        </style>
        <div id='keycap-modal' class="kc-modal-hidden box has-background-white-ter notification" style="--key_w:1; --key_h:1;">
            <button id='closeButton' class="delete"></button>
            <h1 class="title">Edit multi action key</h1>
            <h2 class="subtitle">
                This key have multiple actions.
            </h2>
            <div id='exploded-key'></div>
            <div id='keycap-container' class="is-flex is-justify-content-space-evenly">
                <div id='keycap'></div>
                <button id='saveButton' class="button is-primary">Save</button>
            </div>
        </div>
    </template>`);

export class QMKKeycapModal extends QMKElement {
    static get observedAttributes() {
        return ['layercount', 'layer', 'caption'];
    }

    constructor(index, layerCount, currentLayer) {
        super('qmk-keycap-modal');

        this.caption = 'LT(0, KC_A)';
        this.parsedCaption = parseCaption(this.caption);
        this.layerCount = layerCount;
        this.layer = currentLayer;
        this.index = index;

        this.explodedKey = new QmkExplodedKey(this.parsedCaption.captionFn, this.layerCount, this.layer);
        this.explodedKey.id = 'exploded-key';

        let explodedKeyElement = this.template.querySelector('#exploded-key');
        this.template.querySelector('#keycap-modal').replaceChild(this.explodedKey, explodedKeyElement);

        this.keycap = new QMKKeycap(index, this.caption);
        let keycapElement = this.template.querySelector('#keycap');
        this.template.querySelector('#keycap-container').replaceChild(this.keycap, keycapElement);

        this.addEventsToElement(this.template, [
            ['#closeButton', 'click', this.onClickClose],
            ['#saveButton', 'click', this.onClickSave],
            ['#keycap-modal', 'changeKeyOption', this.onUpdateKeyOption],
        ]);
        this.hide();
        this.shadowRoot.appendChild(this.template);
    }

    attributeChangedCallback(name, oldValue, newValue) {

        let rootElement = this.shadowRoot.childNodes.length > 0 ? this.shadowRoot : this.template;
        if (name === 'layercount') {
            let value = Number(newValue);
            if (isNaN(value)) {
                return;
            }
            rootElement.querySelectorAll('.keycap-layer').forEach(el => {
                el.setAttribute('layercount', value);
            });
        } else if (name === 'layer') {
            let value = Number(newValue);
            if (isNaN(value)) {
                return;
            }
            rootElement.querySelectorAll('.keycap-layer').forEach(el => {
                el.setAttribute('layer', value);
            });
        } else if (name === 'caption') {
            this.caption = newValue;
        }
    }

    hidden() {
        return this.shadowRoot.host.style.display === 'none';
    }

    hide() {
        this.shadowRoot.host.style.display = 'none';
    }

    show() {
        this.shadowRoot.host.style.display = 'block';
    }

    onUpdateKeyOption(ev) {
        let newCaption = replaceArgInMultiCaption(this.parsedCaption, ev.detail.value, ev.detail.type);
        this.caption = newCaption;
        this.keycap.setAttribute('caption', newCaption);
    }

    onClickClose() {
        this.emitEvent("closeKeycapModal");
    }

    onClickSave() {
        this.emitEvent("updateCaption", {key: this.index, caption: this.caption});
        this.emitEvent("closeKeycapModal");
    }
}

customElements.define('qmk-keycap-modal', QMKKeycapModal);
