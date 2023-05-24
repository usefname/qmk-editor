import {QMKElement} from "../../qmk-element.ts";
import {CaptionInfo, parseCaption} from "../..//lib/key-info.ts";

// language=HTML
document.body.insertAdjacentHTML('afterbegin',
    `<template id="qmk-raw-keycap">
        <style>
            #key {
                font-size: x-small;
                line-break: anywhere;

                width: calc(var(--key_w) * var(--key_width) * 1px);
                height: calc(var(--key_h) * var(--key_height) * 1px);
                position: relative;
                background-color: var(--key-noop-background-color);

                display: inline-block;
                box-sizing: border-box;
                cursor: pointer;
                padding: 1px 1px 3px;
                line-height: 1.3rem;

                font-family: 'Montserrat', sans-serif;
                box-shadow: 0px -1px 0px 3px inset rgba(0, 0, 0, 0.1),
                0px 0px 0px 1px rgba(0, 0, 0, 0.3);
                text-align: center;
            }

            .key-selected {
                border-radius: 6px;
                border-style: solid;

                border-color: var(--color5);
            }

            #key:not(.key-selected) {
                border-radius: 6px;
                border-left: 1px solid rgba(0, 0, 0, 0.1);
                border-right: 1px solid rgba(0, 0, 0, 0.1);
            }
            
            .key-input {
                /*width: 30px;*/
                /*height: 25px;*/
                /*background-color: white;*/
                border-radius: 2px;
                border: 1px solid;
                margin: 0 auto;
                padding: 1px;
                text-align: center;
                z-index: 1000;
            } 
        </style>
        <div id="key">
            <div id='modal' class="modal">
                <div class="modal-card">
                    <header class="modal-card-head">
                        <p class="modal-card-title">Edit key</p>
                        <button class="exit-button delete" aria-label="close"></button>
                    </header>
                    <section class="modal-card-body">
                        <input class="key-input" type="text" autofocus/>
                    </section>
                    <footer class="modal-card-foot">
                        <button id='saveButton' class="button is-success">Save</button>
                        <button class="exit-button button">Cancel</button>
                    </footer>
                </div>
            </div> 
        </div>
    </template>`);

export class QMKRawKeycap extends QMKElement {
    private keyIndex: number;
    private keyElement: HTMLDivElement;
    private modalElement: HTMLDivElement;
    private inputElement: HTMLInputElement;
    private captionInfo: CaptionInfo;

    constructor(index: number, caption: string) {
        super('qmk-raw-keycap');
        this.keyIndex = index;
        this.keyElement = this.template.querySelector('#key') as HTMLDivElement;
        this.modalElement = this.template.querySelector('#modal') as HTMLDivElement;
        this.inputElement = this.template.querySelector('input') as HTMLInputElement;
        this.captionInfo = parseCaption(caption);

        this.updateCaptionElement(caption);

        this.addEvents([
            ['click', this.onKeycapClick],
            ['keyup', this.stopProp],
            ['keydown', this.stopProp],
            ['keypress', this.stopProp]
        ]);

        this.addEventsToElement(this.template, [
            ['#modal', 'click', this.onExitModalClick],
            ['.modal-card', 'click', this.stopProp],
            ['.exit-button', 'click', this.onExitModalClick],
            ['#saveButton', 'click', this.onSaveButton],
            ['input', 'keyup', this.onKeyUp],
        ]);

        this.shadow.appendChild(this.template);
    }

    stopProp(ev: Event) {
        ev.stopPropagation();
    }


    onKeyUp(ev: KeyboardEvent) {
        if (ev.key === "Enter") {
            ev.stopPropagation();
            ev.preventDefault();
            this.saveCaption(this.inputElement.value);
        }
    }

    onSaveButton(e: MouseEvent) {
        e.stopImmediatePropagation();
        this.saveCaption(this.inputElement.value);
    }

    onExitModalClick(e: Event) {
        e.stopImmediatePropagation();
        this.emitEvent('selectedKey', {key: null});
    }

    onKeycapClick(e: Event) {
        e.stopImmediatePropagation();
        this.emitEvent('selectedKey', {key: this.keyIndex});
    }

    getParsedCaption() {
        return this.captionInfo;
    }

    saveCaption(caption: string) {
        this.emitEvent('selectedKey', {key: null});
        this.emitEvent("updateCaption", {key: this.keyIndex, caption: caption});
    }

    setSelected(value: boolean) {
        if (value) {
            this.keyElement.classList.add('key-selected');
            this.modalElement.classList.add('is-active');
            this.inputElement.select();
        } else {
            this.keyElement.classList.remove('key-selected');
            this.modalElement.classList.remove('is-active');
        }
    }

    updateCaption(caption: string) {
        this.captionInfo = parseCaption(caption);
        this.updateCaptionElement(caption);
    }

    private updateCaptionElement(caption: string) {
        const textNode = [...this.keyElement.childNodes].find(child => child.nodeType === Node.TEXT_NODE);
        if (textNode) {
            textNode.textContent = caption;
        }

        this.inputElement.value = caption;
    }
}

customElements.define('qmk-raw-keycap', QMKRawKeycap);
