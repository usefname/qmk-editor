import {QMKElement} from "@/qmk-element.ts";
import {QMKKeycap} from "@/workspace/keycap/qmk-keycap.ts";
import {QMKRawKeycap} from "@/workspace/keycap/qmk-raw-keycap.js";
import {EditMode} from "@/lib/keymap.ts";

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
    constructor(key, index, caption, editMode) {
        super('qmk-positional-key');
        this.template.querySelector("#key-position").style.setProperty("--key_y", key.y);
        this.template.querySelector("#key-position").style.setProperty("--key_x", key.x);
        this.template.querySelector("#key-position").style.setProperty("--key_w", key.w ? key.w : 1);
        this.template.querySelector("#key-position").style.setProperty("--key_h", key.h ? key.h : 1);


        this.keypositionElement = this.template.querySelector('#key-position');
        this.keycap = new QMKKeycap(index, caption);
        this.template.querySelector("#key-position").appendChild(this.keycap);
        this.rawKeycap = new QMKRawKeycap(index, caption);
        this.template.querySelector("#key-position").appendChild(this.rawKeycap);

        this.editMode = null;
        this.caption = caption;
        this.selected = false;

        this.currentKeyElement = this.keycap;
        this.keycap.style.display = 'block';
        this.rawKeycap.style.display = 'none';
        this.setEditMode(editMode);
        this.shadowRoot.appendChild(this.template);
    }

    setEditMode(editMode) {
        if (editMode === this.editMode) {
            return;
        }
        this.editMode = editMode;

        this.currentKeyElement.style.display = 'none';
        if (editMode === EditMode.KEY_EDIT_INTERACTIVE) {
            this.currentKeyElement = this.keycap;
        } else if (editMode === EditMode.KEY_EDIT_TEXT){
            this.currentKeyElement = this.rawKeycap;
        }

        this.currentKeyElement.updateCaption(this.caption);
        this.currentKeyElement.setSelected(this.selected);
        this.currentKeyElement.style.display = 'block';
    }

    updateCaption(caption) {
        this.caption = caption;
        this.currentKeyElement.updateCaption(caption);
    }

    setSelected(value) {
        this.selected = value;
        this.currentKeyElement.setSelected(value);
    }
}

customElements.define('qmk-positional-key', QMKPositionalKey);
