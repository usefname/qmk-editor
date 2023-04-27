import {QMKElement} from "@/qmk-element.js";
import {parseCaption, unicodeRegex} from "@/lib/key-info.js";

// language=HTML
document.body.insertAdjacentHTML('afterbegin',
    `<template id="qmk-keycap">
        <style>
            .description {
                width: 20em;
            }

            .key-info-popup {
                display: none;
                position: relative;
                padding: 5px;
                left: calc(var(--key_w) * var(--key_width) * 1px + 30px);
                top: calc(-1 * (var(--key_y_spacing)) * 1px);
                z-index: 2000;
            }

            .key-info-message {
                padding: 1em 1.25em;
                margin: 0 0;
            }

            @keyframes fadeTooltip {
                0% {
                    opacity: 0;
                }
                30% {
                    opacity: 0;
                }
                100% {
                    opacity: 1;
                }
            }

            .key-nowrap {
                white-space: nowrap;
            }

            .key-small-caption {
                font-size: small;
            }

            #key:not(.key-small-caption) {
                font-size: larger;
            }

            #key:not(.key-with-caption) {
                color: var(--key-noop-color);
                background-color: var(--key-noop-background-color);
            }
            
            #key.key-with-caption {
                color: var(--key-color);
                background-color: var(--key-background-color);
            }

            .key-drop-hover {
                border-radius: 6px;
                border-style: solid;

                border-color: var(--color4);
            }

            .key-selected {
                border-radius: 6px;
                border-style: solid;

                border-color: var(--color5);
            }

            #key:not(.key-selected):not(.key-drop-hover) {
                border-radius: 6px;
                border-left: 1px solid rgba(0, 0, 0, 0.1);
                border-right: 1px solid rgba(0, 0, 0, 0.1);
            }

            #key:not(.key-selected):hover {
                border-style: solid;
                border-width: thin;
                border-color: var(--color3);
            }

            #key {
                width: calc(var(--key_w) * var(--key_width) * 1px);
                height: calc(var(--key_h) * var(--key_height) * 1px);
                position: relative;

                display: inline-block;
                box-sizing: border-box;
                white-space: pre-line;
                cursor: pointer;
                padding: 1px 1px 3px;
                line-height: 1.3rem;

                font-family: 'Montserrat', sans-serif;
                box-shadow: 0px -1px 0px 3px inset rgba(0, 0, 0, 0.1),
                0px 0px 0px 1px rgba(0, 0, 0, 0.3);
                text-align: center;
            }

            @font-face {
                font-family: 'notoemoji';
                src: url('/notoemoji.ttf');
            }

            .key-caption-single-letter {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
            }

            #key-caption {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-60%, -50%);
            }

            .inner-key {
                text-align: center;
                width: 30px;
            }

            .inner-key-emoji {
                font-family: notoemoji;
            }

            .outer-key {
                width: 30px;
                height: 25px;

                border-radius: 1px;
                border: 1px solid;
                border-top: 0px;
                border-right: 0px;
                border-left: 0px;
                margin: 0 auto;
                padding: 1px;
                text-align: center;
                font-size: small;
                /*text-shadow: 1px 1px gray;*/
                /*text-shadow: 0px 0px 9px white;*/
                /*box-shadow: 0px 0px 0px 1px inset rgba(0, 0, 0, 0.1),*/
                /*0px 0px 0px 0px rgba(0, 0, 0, 0.3);*/

                /*text-shadow: 2px 2px 3px rgba(255,255,255,0.1);*/
            }
        </style>
        <div id="key" draggable="true">
            <div id="key-caption"></div>
        </div>
    </template>`);

export class QMKKeycap extends QMKElement {
    static get observedAttributes() {
        return ['selected', 'caption'];
    }

    constructor(key, index, caption) {
        super('qmk-keycap');
        this.keyIndex = index;
        this.keyElement = this.template.querySelector('#key');
        this.keyCaptionElement = this.template.querySelector('#key-caption');

        this.setAttribute('caption', caption);
        this.addEvents([
            ['click', this.onClick],
            ['dragstart', this.onDragStart],
            ['drop', this.onDrop],
            ['dragenter', this.onDragEnter],
            ['dragover', this.onDragOver],
            ['dragleave', this.onDragLeave],
        ]);

        this.shadowRoot.appendChild(this.template);
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (newValue && newValue !== oldValue) {
            switch (name) {
                case 'selected':
                    this.keyElement.classList.add('key-selected');
                    break;
                case 'caption':
                    this.updateCaption(newValue);
            }
        } else {
            switch (name) {
                case 'selected':
                    this.keyElement.classList.remove('key-selected');
                    break;
            }
        }
    }

    onClick(e) {
        e.stopImmediatePropagation();
        e.preventDefault();
        if (this.getAttribute("selected") !== null) {
            this.emitEvent('selectedKey', {key: null});
        } else {
            if (this.captionInfo.multiKey) {
                this.emitEvent('editMultiKey', {key: this.keyIndex});
            } else {
                this.emitEvent('selectedKey', {key: this.keyIndex});
            }
        }
    }

    onDragStart(ev) {
        ev.dataTransfer.setData("text/plain", this.captionInfo.caption);
        ev.dataTransfer.setData("_qmk/source", "keycap");
        ev.dataTransfer.setData("_qmk/sourceIndex", this.keyIndex);
        if (ev.ctrlKey) {
            ev.dataTransfer.setData("_qmk/effect", "copy");
            ev.dataTransfer.dropEffect = "copy";
        } else {
            ev.dataTransfer.setData("_qmk/effect", "swap");
        }
    }

    dndUpdateCaption(ev) {
        let data = ev.dataTransfer.getData("text/plain");
        if (data.length > 0 && data.length < 1024) {
            let type = ev.dataTransfer.getData("_qmk/effect");
            let sourceKeyIndex = Number(ev.dataTransfer.getData("_qmk/sourceIndex"));
            if (type === "swap" && !isNaN(sourceKeyIndex)) {
                this.emitEvent("updateCaption", {key: sourceKeyIndex, caption: this.captionInfo.caption});
                this.emitEvent("updateCaption", {key: this.keyIndex, caption: data});
            } else {
                if (capInfo.multiKey) {
                    this.emitEvent("updateCaptionMultiKey", {key: this.keyIndex, caption: data});
                } else {
                    this.emitEvent("updateCaption", {key: this.keyIndex, caption: data});
                }
            }
        }

        this.keyElement.classList.remove('key-drop-hover');
        this.emitEvent('selectedKey', {key: null});
    }

    onDrop = (event) => {
        event.stopPropagation();
        event.preventDefault();
        this.dndUpdateCaption(event);
    };

    onDragEnter = (event) => {
        event.stopPropagation();
        event.preventDefault();
        this.keyElement.classList.add('key-drop-hover');
    };

    onDragOver = (event) => {
        event.stopPropagation();
        event.preventDefault();
    };

    onDragLeave = (event) => {
        event.preventDefault();
        this.keyElement.classList.remove('key-drop-hover');
    };

    updateCaption(caption) {
        this.captionInfo = parseCaption(caption);
        this.removeChildren(this.keyCaptionElement);

        if (this.captionInfo.label.split) {
            this.keyCaptionElement.appendChild(this.createOuterKey(this.captionInfo.label.base));
            this.keyCaptionElement.appendChild(this.createInnerKey(this.captionInfo.label.inner));
        } else {
            this.keyCaptionElement.appendChild(this.createInnerKey(this.captionInfo.label.base));
        }

        this.setOrRemoveClass(this.keyElement, 'key-with-caption', !this.captionInfo.emptyKey);
        this.setOrRemoveClass(this.keyElement, 'key-small-caption', this.captionInfo.label.base.length > 3 || this.captionInfo.split);
    }

    createOuterKey(label) {
        const div = document.createElement("div");
        div.textContent = label;
        div.classList.add("outer-key");
        if (label.length < 6) {
            div.classList.add("key-nowrap");
        }
        return div;
    }

    createInnerKey(label) {
        const div = document.createElement("div");
        div.textContent = label;
        div.classList.add("inner-key");
        if (label.length < 6) {
            div.classList.add("key-nowrap");
        }
        if (unicodeRegex.test(label)) {
            div.classList.add("inner-key-emoji");
        }
        return div;
    }

}

customElements.define('qmk-keycap', QMKKeycap);
