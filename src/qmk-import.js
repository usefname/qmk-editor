import {QMKElement} from "@/qmk-element.ts";
import {invoke} from "@tauri-apps/api/tauri";
import {open} from "@tauri-apps/api/dialog";

// language=HTML
document.body.insertAdjacentHTML('afterbegin',
    `<template id="qmk-import">
        <style>
            #title {
                margin-top: 2rem;
            }
            #keyboard-choice {
                width: 40rem;
            }
            #layout-select {
                width: 40rem;
            }
        </style>
        <div class="is-flex is-justify-content-center mt-4">
            <p id='title' class="title is-4"></p>
        </div>
        <div class="is-flex is-flex-direction-column is-align-items-center is-justify-content-center">
            <div class="mt-4">
                <label class="title is-size-6" for="keyboard-choice">Keyboard</label><br>
                <input class="input" type="search" list="keyboard-list" id="keyboard-choice" name="keyboard-choice"/>
                <datalist id="keyboard-list"></datalist>
            </div>
            <div class="mt-4">
                <label class="title is-size-6" for="layout-choice">Layout</label><br>
                <div class="select" id="layout-choice">
                    <select id='layout-select' disabled></select>
                </div>
            </div>
        </div>
        <div class="is-flex is-justify-content-center mt-4">
            <button id="load-button" class="button is-primary mr-4" disabled>Load</button>
            <button id='back-button' class="button is-primary ml-4">Back</button>
        </div> 
    </template>`
);

export class QMKImport extends QMKElement {
    constructor(requireSelection, qmkDir) {
        super('qmk-import');
        this.requireSelection = requireSelection;
        this.keyboardInput = this.template.getElementById('keyboard-choice');
        this.keyboardDataList = this.template.getElementById('keyboard-list');
        this.layoutSelect = this.template.getElementById('layout-select');
        this.loadButton = this.template.getElementById('load-button');
        this.backButton = this.template.getElementById('back-button');
        this.titleParagraph = this.template.getElementById('title');

        this.keyboards = [];
        this.selectedKeyboard = null;

        this.addEventsToElement(this.template, [
            ['#keyboard-choice', 'change', this.onSelectKeyboard],
            ['#keyboard-choice', 'select', this.onSelectKeyboard],
            ['#keyboard-choice', 'keyup', this.onSelectKeyboard],
            ['#back-button', 'click', this.onBackClick],
            ['#load-button', 'click', this.onLoadClick]
        ]);

        if (this.requireSelection) {
            this.backButton.style.display = 'none';
        }

        this.refreshKeyboardData();
        this.shadowRoot.appendChild(this.template);
    }

    refreshKeyboardData() {
        this.keyboardInput.value = '';
        this.layoutSelect.value = '';
        this.loadButton.disabled = true;
        invoke('get_config').then(config => {
            this.titleParagraph.textContent = 'Importing keyboard from: ' + config.qmk_path;
            return invoke('list_keyboards').then(keyboardList => {
                this.keyboards = keyboardList;
                this.populateKeyboardSelect(keyboardList);
            });
        }).catch(err => {
            this.emitEvent('qmk-error', err);
        });
    }

    populateKeyboardSelect(keyboardList) {
        this.removeChildren(this.keyboardDataList);
        for (const keyboard of keyboardList) {
            const option = document.createElement('option');
            option.value = keyboard;
            this.keyboardDataList.appendChild(option);
        }
        this.keyboardInput.placeholder = 'Keyboard name';
    }

    loadKeyboard(keyboardName) {
        invoke('import_keyboard', {keyboard: keyboardName}).then(loadedKeyboard => {
            let layouts = Object.keys(loadedKeyboard.layouts);
            if (layouts.length <= 0) {
                this.emitEvent('qmk-error', 'Keyboard ' + keyboardName + ' is missing layouts');
            } else {
                this.populateLayoutSelect(layouts);
            }
        }).catch(err => {
            this.emitEvent('qmk-error', err);
        });
    }

    populateLayoutSelect(layouts) {
        this.loadButton.disabled = false;
        this.layoutSelect.disabled = false;
        this.removeChildren(this.layoutSelect);
        for (const layout of layouts) {
            const option = document.createElement('option');
            option.value = layout;
            option.textContent = layout;
            this.layoutSelect.appendChild(option);
        }
        this.layoutSelect.firstChild.selected = true;
    }

    onSelectKeyboard() {
        const kb = this.keyboardInput.value;
        if (this.keyboards.indexOf(kb) !== -1) {
            this.loadButton.disabled = false;
            this.loadKeyboard(kb);
        } else {
            this.layoutSelect.disabled = true;
            this.loadButton.disabled = true;
            this.removeChildren(this.layoutSelect);
        }
    }

    onLoadClick() {
        this.emitEvent('import-keyboard', {keyboardName: this.keyboardInput.value, layoutName: this.layoutSelect.value});
    }

    onBackClick() {
        this.emitEvent('exit-import');
    }
}

customElements.define('qmk-import', QMKImport);
