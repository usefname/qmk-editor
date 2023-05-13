import {QMKElement} from "@/qmk-element.js";
import {QMKKeycodeInventory} from "@/workspace/qmk-keycode-inventory.js";
import {QMKKeycapModal} from "@/workspace/qmk-keycap-modal.js";
import {QMKEditMode} from "@/workspace/sidepanel/qmk-edit-mode.js";
import {QmkLayerPicker} from "@/workspace/sidepanel/qmk-layer-picker.js";
import {QMKPositionalKey} from "@/workspace/keycap/qmk-positional-key.js";
import {calcLayoutWidth, layout_largest_x, layout_largest_y} from "@/lib/layout.js";
import {keyEditInteractive} from "../../src-svelte/editable-keyboard/keymapWorkspace.js";
import jsKeyCodes from "@/lib/keycodes/jsKeyCodes.json";
import {insertEmptyLayer, removeLayer} from "@/lib/layers.js";
import {BASIC_ARG, parseCaption, replaceArgInMultiCaption, replaceArgsInMultiCaption} from "@/lib/key-info.js";
import {QMKWorkspaceMenu} from "@/workspace/qmk-workspace-menu.js";

// language=HTML
document.body.insertAdjacentHTML('afterbegin',
    `<template id="qmk-workspace">
        <style>
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
       
        <div id='workspace-menu'></div>
        <div id="workspace">
            <div id='keycap-modal'></div>
            <div id="edit-workspace" class="box" tabindex="0">
                <div id="keyboard-container" class="is-narrow">
                    <div id="keymap-layout"></div>
                </div>
                <div id='workspace-sidepanel' class="is-flex is-flex-direction-column is-justify-content-space-between ml-5"></div>
            </div>
        </div>
    </template>`
);

export class QMKWorkspace extends QMKElement {
    constructor(keyboard) {
        super('qmk-workspace');

        this.keyboard = keyboard;
        this.keymapElements = [];
        this.selectedKeyElement = null;
        this.selectedLayer = 0;
        this.maxLayers = 16;
        this.keycapMode = keyEditInteractive;
        this.showKeyModal = false;

        this.largest_y = layout_largest_y(this.keyboard.layout);
        this.largest_x = layout_largest_x(this.keyboard.layout);
        this.key_x_spacing = 55;
        this.key_y_spacing = 55;
        this.key_width = 50;
        this.key_height = 50;

        this.workspaceMenu = new QMKWorkspaceMenu(this.keyboard.keyboardName, this.keyboard.editorState.filename);
        this.template.querySelector('#workspace-menu').replaceWith(this.workspaceMenu);

        let workspaceElement = this.template.querySelector('#workspace');
        this.setWorkspaceSize(workspaceElement);

        this.createKeymapElements(this.template.querySelector("#keymap-layout"));

        this.layerPickerElement = new QmkLayerPicker(this.keyboard.keymap.length, this.maxLayers);
        this.template.querySelector('#workspace-sidepanel').appendChild(this.layerPickerElement);

        this.editModeElement = new QMKEditMode(this.keycapMode);
        this.template.querySelector('#workspace-sidepanel').appendChild(this.editModeElement);

        this.keycodeInventory = new QMKKeycodeInventory(this.selectedLayer, this.keyboard.keymap.length);
        workspaceElement.appendChild(this.keycodeInventory);

        this.keycapModal = new QMKKeycapModal(0, this.keyboard.keymap.length, this.selectedLayer, 'LT(0, KC_A)');
        this.keycapModal.style.display = 'none';
        this.template.querySelector('#keycap-modal').replaceWith(this.keycapModal);

        this.addEventsToElement(this.template, [
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
            ['changeEditMode', this.onChangeEditMode],
            ['closeKeycapModal', this.onCloseKeycapModal],
            ['click', this.deSelectKey],
        ]);

        this.shadowRoot.appendChild(this.template);
    }


    onChangeEditMode(ev) {
        this.keycapMode = ev.detail;
        for (const key of this.keymapElements) {
            key.setEditMode(this.keycapMode);
        }
    }

    onCloseKeycapModal() {
        this.hideKeycapModal();
    }

    onAddLayer(ev) {
        if (this.keyboard.keymap.length < this.maxLayers) {
            this.keyboard.keymap = insertEmptyLayer(this.keyboard.keymap, this.keyboard.layout.length);
            this.selectedLayer++;
            const layerCount = this.keyboard.keymap.length;
            this.layerPickerElement.addLayer(this.selectedLayer);
            this.keycodeInventory.updateLayer(this.selectedLayer, layerCount);
            this.updateLayout();
        }
    }

    onDeleteLayer(ev) {
        if (this.keyboard.keymap.length > 1) {
            removeLayer(this.keyboard.keymap, this.selectedLayer);
            if (this.selectedLayer >= this.keyboard.keymap.length) {
                this.selectedLayer = this.selectedLayer - 1;
            }
            this.layerPickerElement.deleteLayer(this.selectedLayer);
            const layerCount = this.keyboard.keymap.length;
            this.keycodeInventory.updateLayer(this.selectedLayer, layerCount);
            this.updateLayout();
        }
    }

    onChangeLayer(ev) {
        this.selectedLayer = ev.detail.layer;
        const layerCount = this.keyboard.keymap.length;
        this.keycodeInventory.updateLayer(this.selectedLayer, layerCount);
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
        const key = ev.detail.key;
        const oldCaption = this.keyboard.keymap[this.selectedLayer][key];
        const parsedKey = parseCaption(oldCaption);
        const newCaption = replaceArgInMultiCaption(parsedKey, ev.detail.caption, BASIC_ARG);
        this.setKeyCaption(key, newCaption);
    }

    onSelectKey(ev) {
        this.deSelectKey();
        this.selectedKey = ev.detail.key;
        if (ev.detail.key !== null) {
            this.selectedKeyElement = this.keymapElements[ev.detail.key];
            this.selectedKeyElement.setSelected(true);
        }
    }

    onEditMultiKey(ev) {
        const index = ev.detail.key;
        const caption = this.keyboard.keymap[this.selectedLayer][index];
        this.keycapModal.update(caption, index, this.selectedLayer, this.keyboard.keymap.length);
        this.showKeycapModal();
        this.shadowRoot.querySelector('#keyboard-container').classList.add('inactive');
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
        if (this.keycapModal.style.display === 'none') {
            if (this.selectedKeyElement) {
                this.selectedKeyElement.setSelected(false);
                this.selectedKeyElement = null;
            }
            this.selectedKey = null;
        } else {
            this.hideKeycapModal();
        }
    }

    setKeyCaption(key, caption) {
        this.keyboard.keymap[this.selectedLayer][key] = caption;
        this.keymapElements[key].updateCaption(caption);
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

    createKeymapElements(parentElement) {
        for (let i = 0; i < this.keyboard.layout.length; i++) {
            const key = this.keyboard.layout[i];
            const positionalKey = new QMKPositionalKey(key, i, this.keyboard.keymap[this.selectedLayer][i], this.keycapMode);
            parentElement.appendChild(positionalKey);
            this.keymapElements.push(positionalKey);
        }
    }

    updateLayout() {
        for (let i = 0; i < this.keyboard.layout.length; i++) {
            const el = this.keymapElements[i];
            const caption = this.keyboard.keymap[this.selectedLayer][i];
            el.updateCaption(caption);
        }
    }

    markAsDirty() {
        if (!this.keyboard.dirty) {
            this.keyboard.dirty = true;
            this.workspaceMenu.markAsDirty();
        }
    }

    markAsClean() {
        this.keyboard.dirty = false;
        this.workspaceMenu.markAsClean();
    }

    updateFileName() {
        this.workspaceMenu.updateFileName(this.keyboard.editorState.filename);
    }

    hideKeycapModal() {
        this.keycapModal.style.display = 'none';
        let queries = ['#keyboard-container', '#workspace-sidepanel','qmk-keycode-inventory'];
        for (const query of queries) {
            this.shadowRoot.querySelector(query).classList.remove('inactive');
        }
    }

    showKeycapModal(caption, index, layer, layerCount) {
        this.keycapModal.style.display = 'block';
        let queries = ['#keyboard-container', '#workspace-sidepanel','qmk-keycode-inventory'];
        for (const query of queries) {
            this.shadowRoot.querySelector(query).classList.remove('inactive');
        }
    }
}

customElements.define('qmk-workspace', QMKWorkspace);
