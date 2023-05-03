import {QMKElement} from "@/qmk-element.js";
import {QMKKeycodeInventory} from "@/qmk-keycode-inventory.js";
import {QMKKeycapModal} from "@/qmk-keycap-modal.js";
import {QMKEditMode} from "@/qmk-edit-mode.js";
import {QmkLayerPicker} from "@/qmk-layer-picker.js";
import {QMKPositionalKey} from "@/qmk-positional-key.js";
import {calcLayoutWidth, layout_largest_x, layout_largest_y} from "@/lib/layout.js";
import {keyEditInteractive} from "../src-svelte/editable-keyboard/keymapWorkspace.js";
import jsKeyCodes from "@/lib/keycodes/jsKeyCodes.json";
import {insertEmptyLayer, removeLayer} from "@/lib/layers.js";

// language=HTML
document.body.insertAdjacentHTML('afterbegin',
    `<template id="qmk-workspace">
        <style>
            .kc-modal-visible {
                display: block;
            }

            .kc-modal-hidden {
                display: none;
            }

            #edit-workspace {
                display: flex;
                justify-content: center;
                flex-wrap: wrap;
                position: sticky;
                top: 0;
                z-index: 100;
                background-color: #fff;
                padding-bottom: 1rem;
                margin-bottom: 1rem;
            }

            .inactive {
                opacity: 0.4;
            }

            #keyboard-container {
                padding-left: 5px;
                padding-top: 5px;
                height: calc((var(--kb_largest_y) + 0.0) * (var(--key_y_spacing) * 1px));
                width: calc((var(--kb_largest_x) + 0.0) * (var(--key_x_spacing) * 1px));
            }

            #keymap-layout {
                position: absolute;
                border-style: none;
            }
            
            .workspace {
                --key_x_spacing: 55; 
                --key_y_spacing: 55; 
                --key_width: 50; 
                --key_height: 50;
            }
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

        <div id="workspace">
            <qmk-keycap-modal class="kc-modal-hidden"></qmk-keycap-modal>
            <div id="edit-workspace" class="box" tabindex="0">
                <div id="keyboard-container" class="is-narrow" class:inactive={showKeyModal}>
                    <div id="keymap-layout"></div>
                </div>
                <div id='workspace-sidepanel' class="is-flex is-flex-direction-column is-justify-content-space-between ml-5" class:inactive={showKeyModal}></div>
            </div>
        </div>
    </template>`
);

export class QMKWorkspace extends QMKElement {
    constructor(keyboard) {
        super('qmk-workspace');

        this.keyboard = keyboard;
        this.keymapElements = [];

        this.largest_y = layout_largest_y(this.keyboard.layout);
        this.largest_x = layout_largest_x(this.keyboard.layout);
        this.key_x_spacing = 55;
        this.key_y_spacing = 55;
        this.key_width = 50;
        this.key_height = 50;

        this.selectedKeyElement = null;
        this.selectedLayer = 0;
        this.maxLayers = 16;

        this.keycapMode = keyEditInteractive;
        this.showKeyModal = false;

        this.template.querySelector("#keyboardTitle").textContent = this.createTitle(keyboard.keyboardName, keyboard.editorState.filename);

        this.setWorkspaceSize(this.template.querySelector("#workspace"));
        this.createLayout(this.template.querySelector("#keymap-layout"));
        this.layerPickerElement = new QmkLayerPicker(this.maxLayers);
        this.template.querySelector('#workspace-sidepanel').appendChild(this.layerPickerElement);
        this.editModeElement = new QMKEditMode(this.keycapMode);
        this.template.querySelector('#workspace-sidepanel').appendChild(this.editModeElement);
        this.keycodeInventory = new QMKKeycodeInventory(this.keyboard.keymap.length);
        this.template.querySelector('#workspace').appendChild(this.keycodeInventory);

        this.addEventsToElement(this.template, [
            ['#saveAsButton', 'click', this.emitCustomEvent('saveAs')],
            ['#loadButton', 'click', this.emitCustomEvent('load')],
            ['#saveButton', 'click', this.emitCustomEvent('save')],
            ['#importButton', 'click', this.emitCustomEvent('import')],
            ['#buildButton', 'click', this.emitCustomEvent('build')],
            ['#configButton', 'click', this.emitCustomEvent('config')],
            ['#edit-workspace', 'keydown', this.onWorkspaceKeyDown],
            ['#edit-workspace', 'click', this.deSelectKey],
            ['#edit-workspace', 'dragstart', this.deSelectKey],
            ['#edit-workspace', 'drop', this.onDrop],
            ['#edit-workspace', 'dragenter', this.onDragEnter],
            ['#edit-workspace', 'dragover', this.onDragOver],
        ]);

        this.addEvents([
            ['updateCaption', this.onUpdateCaption],
            ['updateCaptionMultiKey', this.onUpdateCaptionMultikey],
            ['selectedKey', this.onSelectKey],
            ['editMultiKey', this.onEditMultiKey],
            ['addLayer', this.onAddLayer],
            ['deleteLayer', this.onDeleteLayer],
            ['changeLayer', this.onChangeLayer],
            ['changeEditMode', this.onChangeEditMode]
        ]);

        this.shadowRoot.appendChild(this.template);
    }

    onChangeEditMode(ev) {
        this.keycapMode = ev.detail;
    }

    onAddLayer(ev) {
        if (this.keyboard.keymap.length < this.maxLayers) {
            this.keyboard.keymap = insertEmptyLayer(this.keyboard.keymap, this.keyboard.layout.length);
            this.selectedLayer++;
            this.layerPickerElement.addLayer();
            this.layerPickerElement.setAttribute("layer", this.selectedLayer);
            this.updateLayout();
            this.keycodeInventory.setAttribute('layercount', this.keyboard.keymap.length);
        }
    }

    onDeleteLayer(ev) {
        if (this.keyboard.keymap.length > 1) {
            removeLayer(this.keyboard.keymap, this.selectedLayer);
            if (this.selectedLayer >= this.keyboard.keymap.length) {
                this.selectedLayer = this.selectedLayer - 1;
            }
            this.layerPickerElement.deleteLayer();
            this.layerPickerElement.setAttribute("layer", this.selectedLayer);
            this.updateLayout();
            this.keycodeInventory.setAttribute('layercount', this.keyboard.keymap.length);
        }
    }

    onChangeLayer(ev) {
        this.selectedLayer = ev.detail.layer;
        this.layerPickerElement.setAttribute("layer", this.selectedLayer);
        this.updateLayout();
    }

    onWorkspaceKeyDown(ev) {
        if (!this.showKeyModal
            && this.selectedKey
            && this.keycapMode === keyEditInteractive
            && ev.key
            && jsKeyCodes[ev.code]) {
            ev.preventDefault();
            let caption = jsKeyCodes[ev.code];
            this.setKeyCaption(this.selectedKey, caption);
            this.deSelectKey();
        }
    }

    onUpdateCaption(ev) {
        this.setKeyCaption(ev.detail.key, ev.detail.caption);
    }

    onUpdateCaptionMultikey(ev) {
        alert('Not implemented: onUpdateCaptionMultikey')
    }

    onSelectKey(ev) {
        this.deSelectKey();
        this.selectedKey = ev.detail.key;
        if (ev.detail.key !== null) {
            this.selectedKeyElement = this.keymapElements[ev.detail.key];
            this.selectedKeyElement.setAttribute('selected', true);
        }
    }

    onEditMultiKey(ev) {

    }

    onDrop(ev) {
        ev.preventDefault();
        let data = ev.dataTransfer.getData("text/plain");
        if (data.length > 0 && data.length < 1024) {
            let sourceKeyIndex = ev.dataTransfer.getData("_qmk/sourceIndex");
            this.setKeyCaption(sourceKeyIndex, "KC_NO");
        }
    }

    onDragEnter(ev) {
        ev.preventDefault();
    }

    onDragOver(ev) {
        ev.preventDefault();
    }


    deSelectKey() {
        if (this.selectedKeyElement) {
            this.selectedKeyElement.removeAttribute('selected');
            this.selectedKeyElement = null;
        }
        this.selectedKey = null;
    }

    setKeyCaption(key, caption) {
        this.keyboard.keymap[this.selectedLayer][key] = caption;
        // let el = this.keymapElements[key];
        // el.setAttribute('caption', caption);
        this.keymapElements[key].setAttribute('caption', caption);
        this.markAsDirty();
    }

    setWorkspaceSize(element) {
        const calculatedAppWidth = "calc(((" + calcLayoutWidth(this.keyboard.layout, this.key_x_spacing) + "*1px)) + 20rem)";
        const calculatedLayoutWidth = "calc((" + calcLayoutWidth(this.keyboard.layout, this.key_x_spacing) + "*1px))";

        element.style.setProperty("--app-width", calculatedAppWidth);
        element.style.setProperty("--layout-width", calculatedLayoutWidth);
        element.style.setProperty("--kb_largest_x", this.largest_x);
        element.style.setProperty("--kb_largest_y", this.largest_y);
        element.style.setProperty("--key_x_spacing", this.key_x_spacing);
        element.style.setProperty("--key_y_spacing", this.key_y_spacing);
        element.style.setProperty("--key_width", this.key_width);
        element.style.setProperty("--key_height", this.key_height);
    }

    createLayout(parentElement) {
        for (let i = 0; i < this.keyboard.layout.length; i++) {
            const key = this.keyboard.layout[i];
            const positionalKey = new QMKPositionalKey(key, i, this.keyboard.keymap[this.selectedLayer][i]);
            parentElement.appendChild(positionalKey);
            this.keymapElements.push(positionalKey);
        }
    }

    updateLayout() {
        for (let i = 0; i < this.keyboard.layout.length; i++) {
            const el = this.keymapElements[i];
            const caption = this.keyboard.keymap[this.selectedLayer][i];
            el.setAttribute('caption', caption);
        }
    }

    emitCustomEvent(eventName) {
        return function () {
            this.dispatchEvent(new Event(eventName));
        }
    }

    markAsDirty() {
        this.keyboard.dirty = true;
        this.idElement("saveButton").disabled = true;
    }

    markAsClean() {
        this.keyboard.dirty = false;
        this.idElement("saveButton").disabled = false;
    }

    createTitle(keyboardName, filename) {
       return keyboardName + (filename ? " - " + filename : "");
    }

    setKeyboardTitle(title) {
        this.idElement("keyboardTitle").textContent = this.createTitle(this.keyboardName, this.filename);
    }
}

customElements.define('qmk-workspace', QMKWorkspace);
