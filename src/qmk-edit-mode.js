import {QMKElement} from "@/qmk-element.js";
import {keyEditInteractive, keyEditText} from "../src-svelte/editable-keyboard/keymapWorkspace.js";

// language=HTML
document.body.insertAdjacentHTML('afterbegin',
    `<template id="qmk-edit-mode">
        <style>
            input[type="radio"] {
                margin-right: 0.2rem;
            }
        </style>
        <div class="mt-5">
            <h4 class="is-size-3">Edit mode</h4>
            <div id='radio-container' class="column"></div>
        </div>
    </template>`);

export class QMKEditMode extends QMKElement {
    constructor(defaultEditMode) {
        super('qmk-edit-mode');
        this.radioContainer = this.template.querySelector('#radio-container');

        this.interactiveOption = this.createRadioButton(keyEditInteractive);
        this.radioContainer.appendChild(this.interactiveOption);

        this.textOption = this.createRadioButton(keyEditText);
        this.radioContainer.appendChild(this.textOption);

        this.setValueChecked(this.template, defaultEditMode);

        this.shadowRoot.addEventListener('change', this.onChange.bind(this));
        this.shadowRoot.appendChild(this.template);
    }

    onChange(ev) {
        this.emitEvent('changeEditMode', ev.target.value);
    }

    setValueChecked(rootElement, value) {
        let el = rootElement.querySelector('input[value=' +  value + ']');
        if (el) {
            el.checked = true;
        }
    }

    createRadioButton(value) {
        const label = document.createElement('label');
        label.classList.add('is-size-5');
        label.classList.add('radio');
        const input = document.createElement('input');
        input.setAttribute('type', 'radio');
        input.setAttribute('name', 'editMode');
        input.setAttribute('group', 'keycapMode');
        input.setAttribute('value', value);
        const text = document.createTextNode(value);
        label.appendChild(input);
        label.appendChild(text);
        return label;
    }
}

customElements.define('qmk-edit-mode', QMKEditMode);
