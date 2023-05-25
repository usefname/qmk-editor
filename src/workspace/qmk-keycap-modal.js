import {QMKElement} from "@/qmk-element.ts";
import {BASIC_ARG, LAYER_ARG, parseCaption, replaceArgInMultiCaption} from "@/lib/key-info.ts";
import {QmkExplodedKey} from "@/workspace/keycap/qmk-exploded-key.ts";
import {QMKKeycap} from "@/workspace/keycap/qmk-keycap.ts";

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
            
            .exploded-key {
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
    constructor(index, layerCount, currentLayer) {
        super('qmk-keycap-modal');

        this.caption = 'LT(0, KC_A)';
        this.parsedCaption = parseCaption(this.caption);
        this.layerCount = layerCount;
        this.layer = currentLayer;
        this.index = index;

        this.explodedKey = this.replace('exploded-key', new QmkExplodedKey(this.parsedCaption.captionFn, this.layerCount, this.layer));

        this.keycap = new QMKKeycap(index, this.caption);
        this.template.querySelector('#keycap').replaceWith(this.keycap);

        this.addEventsToElement(this.template, [
            ['#closeButton', 'click', this.onClickClose],
            ['#saveButton', 'click', this.onClickSave],
            ['#keycap-modal', 'changeKeyOption', this.onUpdateKeyOption],
        ]);

        this.addEvents([
            ['click', this.stopProp],
            ['selectedKey', this.stopProp],
            ['editMultiKey', this.stopProp]
        ]);

        this.shadow.appendChild(this.template);
    }

    update(caption, index, layer, layerCount) {
        this.caption = caption;
        this.parsedCaption = parseCaption(caption);
        this.index = index;
        this.layer = layer;
        this.layerCount = layerCount;
        this.keycap.updateCaption(this.caption);
        this.explodedKey.update(this.parsedCaption.captionFn, layerCount, layer);
    }

    stopProp(ev) {
       ev.stopPropagation();
    }

    onUpdateKeyOption(ev) {
        let newCaption = replaceArgInMultiCaption(this.parsedCaption.captionFn, ev.detail.value, ev.detail.type);
        this.caption = newCaption;
        this.keycap.updateCaption(newCaption);
    }

    onClickClose(ev) {
        this.emitEvent("closeKeycapModal");
    }

    onClickSave() {
        this.emitEvent("updateCaption", {key: this.index, caption: this.caption});
        this.emitEvent("closeKeycapModal");
    }
}

customElements.define('qmk-keycap-modal', QMKKeycapModal);
