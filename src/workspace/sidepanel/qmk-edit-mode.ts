import {QMKElement} from "../..//qmk-element.ts";
import {EditMode} from "../..//lib/keymap.ts";

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
    private radioContainer: HTMLDivElement;
    private interactiveOption: HTMLLabelElement;
    private textOption: HTMLLabelElement;

    constructor(defaultEditMode: EditMode) {
        super('qmk-edit-mode');
        this.radioContainer = this.template.querySelector('#radio-container') as HTMLDivElement;

        this.interactiveOption = this.createRadioButton(EditMode.KEY_EDIT_INTERACTIVE);
        this.radioContainer.appendChild(this.interactiveOption);

        this.textOption = this.createRadioButton(EditMode.KEY_EDIT_TEXT);
        this.radioContainer.appendChild(this.textOption);

        const inputElement = this.template.querySelector('input[value=' +  defaultEditMode + ']') as HTMLInputElement;
        if (inputElement) {
            inputElement.checked = true;
        }

        this.shadow.addEventListener('change', this.onChange.bind(this));
        this.shadow.appendChild(this.template);
    }

    onChange(ev: Event) {
        if (ev.target && 'value' in ev.target) {
            this.emitEvent('changeEditMode', ev.target.value);
        }
    }

    createRadioButton(value: EditMode): HTMLLabelElement {
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
