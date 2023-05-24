import {QMKElement} from "../..//qmk-element.ts";
import {QMKKeycap} from "../../workspace/keycap/qmk-keycap.ts";
import {QMKRawKeycap} from "./qmk-raw-keycap.js";
import {EditMode} from "../../lib/keymap.ts";
import {LayoutKey} from "../../lib/layout.ts";

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
    private keyPositionElement: HTMLDivElement;
    private keycap: QMKKeycap;
    private rawKeycap: QMKRawKeycap;
    private editMode: EditMode;
    private caption: string;
    private selected: boolean;
    private currentKeyElement: QMKKeycap | QMKRawKeycap;

    constructor(key: LayoutKey, index: number, caption: string, editMode: EditMode) {
        super('qmk-positional-key');

        this.keyPositionElement = this.template.querySelector('#key-position') as HTMLDivElement;

        this.keyPositionElement.style.setProperty("--key_y", String(key.y));
        this.keyPositionElement.style.setProperty("--key_x", String(key.x));
        this.keyPositionElement.style.setProperty("--key_w", String(key.w ? key.w : 1));
        this.keyPositionElement.style.setProperty("--key_h", String(key.h ? key.h : 1));


        this.keycap = new QMKKeycap(index, caption);
        this.keyPositionElement.appendChild(this.keycap);
        this.rawKeycap = new QMKRawKeycap(index, caption);
        this.keyPositionElement.appendChild(this.rawKeycap);

        this.editMode = editMode;
        this.caption = caption;
        this.selected = false;

        this.currentKeyElement = this.keycap;
        this.keycap.style.display = 'block';
        this.rawKeycap.style.display = 'none';
        this.setEditMode(editMode);
        this.shadow.appendChild(this.template);
    }

    setEditMode(editMode: EditMode) {
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

    updateCaption(caption: string) {
        this.caption = caption;
        this.currentKeyElement.updateCaption(caption);
    }

    setSelected(value: boolean) {
        this.selected = value;
        this.currentKeyElement.setSelected(value);
    }
}

customElements.define('qmk-positional-key', QMKPositionalKey);
