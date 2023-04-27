import {QMKElement} from './qmk-element.js';
import {QMKError} from './qmk-error.js';
import {invoke} from "@tauri-apps/api/tauri";

document.body.insertAdjacentHTML('afterbegin',
// language=HTML
    `<template id="qmk-app">
        <div class="container is-widescreen is-justify-content-space-between is-flex is-align-items-center">
            <div id="keyboardTitle" class="is-size-3"></div>
            <div class="is-flex is-align-items-center">
                <button id="saveAsButton" class="button class:is-invisible={!keyboardName}">Save as</button>
                <button id="saveButton" class="button ml-4 class:is-invisible={!keyboardName}" disabled>Save</button>
                <button id="loadButton" class="button ml-4">Load</button>
                <button id="importButton" class="ml-4 button">Import</button>
                <button id="buildButton" class="ml-4 button">Build</button>
                <button id="configButton" class="ml-4 button">Settings</button>
            </div>
        </div>
        <KeymapWorkspace bind:dirty bind:keymap={keymap} keyboardName={keyboardName} layoutName={layoutName} layout={layout}/>
    </template>`
);

class QMKApp extends QMKElement {
    constructor() {
        super('qmk-app');

        this.needConfigUpdate = false;
        this.dirty = false;
        this.keyboardName = "ergodoxEz";
        this.editorState = {
           filename: null
        }

        this.loadEditorState().then(_ => {
            this.template.querySelector("#keyboardTitle").textContent = this.keyboardName;
            this.template.addEvents([
                ['#saveAsButton', 'click', this.onSaveAs],
                ['#saveButton', 'click', this.onSave],
                ['#loadButton', 'click', this.onLoad],
                ['#importButton', 'click', this.onImport],
                ['#buildButton', 'click', this.onBuild],
                ['#configButton', 'click', this.onConfig],
            ]);
            this.shadowRoot.appendChild(this.template);
        });
    }

    async loadEditorState() {
       if (stubTauri) {
           console.log("stubbed");
           this.keyboardName = "stubbed";
           this.editorState.filename = "/home/joe/km/stubbed.json"
           this.needConfigUpdate = false;
           this.page = 'workspace';
       } else {
           try {
               this.needConfigUpdate = await invoke('need_config_update');
               if (this.needConfigUpdate) {
                   this.editorState.filename = null;
                   this.page = 'config';
               } else {
                   this.editorState = await invoke('get_state');
                   if (editorState !== null && editorState.filename !== null) {
                       await loadKeymap(editorState.filename);
                       this.page = 'workspace';
                   } else {
                       this.page = 'import';
                   }
               }
           } catch (err) {
               this.qmkError = true;
               this.qmkErrorOutput = err;
               this.page = 'import';
           }
       }
    }

    markAsDirty() {
        this.dirty = true;
        this.idElement("saveButton").disabled = true;
    }

    markAsClean() {
        this.dirty = false;
        this.idElement("saveButton").disabled = false;
    }

    setKeyboardTitle(title) {
        this.idElement("keyboardTitle").textContent = this.keyboardName + (this.editorState.filename ? " - " + this.editorState.filename : "");
    }

    onSaveAs() {
        console.log("onSaveAs");
        this.setKeyboardTitle();
        this.markAsClean();
    }

    onSave() {
        console.log("onSave");
    }

    onLoad() {
       console.log("onLoad");
    }

    onImport() {
        console.log("onImport");
    }

    onBuild() {
        console.log("onBuild");
        this.markAsDirty();
    }

    onConfig() {
        console.log("onConfig");
        this.showError();
    }

    showError(error) {
        const qmkError = new QMKError("Test title", error);
        const shadowRoot = this.shadowRoot;
        qmkError.addEventListener('click', () => {
           shadowRoot.removeChild(qmkError);
        });
        this.shadowRoot.appendChild(qmkError);
    }
}

customElements.define('qmk-app', QMKApp);
