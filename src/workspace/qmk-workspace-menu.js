import {QMKElement} from "@/qmk-element.js";

// language=HTML
document.body.insertAdjacentHTML('afterbegin',
    `<template id="qmk-workspace-menu">
        <style>
        </style> 
        
        <div class="container is-widescreen is-justify-content-space-between is-flex is-align-items-center">
            <div id="keyboardTitle" class="is-size-3"></div>
            <div class="is-flex is-align-items-center">
                <button id="saveAsButton" class="button">Save as</button>
                <button id="saveButton" class="button ml-4" disabled>Save</button>
                <button id="loadButton" class="button ml-4">Load</button>
                <button id="importButton" class="ml-4 button">Import</button>
                <button id="buildButton" class="ml-4 button">Build</button>
                <button id="configButton" class="ml-4 button">Settings</button>
            </div>
        </div>
    </template>`
);

export class QMKWorkspaceMenu extends QMKElement {
    constructor(keyboardName, fileName) {
        super('qmk-workspace-menu');

        this.keyboardName = keyboardName;
        this.filename = fileName;
        this.template.querySelector("#keyboardTitle").textContent = this.createTitle(keyboardName, fileName);

        this.addEventsToElement(this.template, [
            ['#saveAsButton', 'click', this.emitCustomEvent('saveAs')],
            ['#loadButton', 'click', this.emitCustomEvent('load')],
            ['#saveButton', 'click', this.emitCustomEvent('save')],
            ['#importButton', 'click', this.emitCustomEvent('import')],
            ['#buildButton', 'click', this.emitCustomEvent('build')],
            ['#configButton', 'click', this.emitCustomEvent('config')],
        ]);

        this.shadowRoot.appendChild(this.template);
    }

    createTitle(keyboardName, filename) {
        return keyboardName + (filename ? " - " + filename : "");
    }

    setKeyboardTitle() {
        this.idElement("keyboardTitle").textContent = this.createTitle(this.keyboardName, this.filename);
    }

    updateFileName(filename) {
        this.filename = filename;
        this.setKeyboardTitle();
    }

    emitCustomEvent(eventName) {
        return () => {
            this.emitEvent(eventName, null);
        }
    }

    markAsDirty() {
        this.idElement("saveButton").disabled = false;
    }

    markAsClean() {
        this.idElement("saveButton").disabled = true;
    }

}

customElements.define('qmk-workspace-menu', QMKWorkspaceMenu);
