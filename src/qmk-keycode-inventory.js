import {QMKElement} from "@/qmk-element.js";
import keycodes from "@/lib/keycodes/keycodes.json";
import {
    appendDefaultArgs, BASIC_ARG,
    getKeyArgumentDesc,
    LAYER_ARG,
    parseCaption, replaceArgInMultiCaption
} from "@/lib/key-info.js";
import {layout_largest_x, layout_largest_y} from "@/lib/layout.js";
import {QMKPositionalKey} from "@/qmk-positional-key.js";
import daskeyboard from "@/lib/daskeyboard4-info.json";
import {QMKKeycap} from "@/qmk-keycap.js";
import {QmkExplodedKey} from "@/qmk-exploded-key.js";
import {keyEditInteractive} from "../src-svelte/editable-keyboard/keymapWorkspace.js";

// language=HTML
document.body.insertAdjacentHTML('afterbegin',
    `<template id='qmk-keycode-inventory'>
        <style>
            #keyboard {
                height: calc((var(--sample-kb-largest_y) + 0.2) * var(--key_y_spacing) * 1px);
                width: calc((var(--sample-kb-largest_x) + 0.2) * var(--key_x_spacing) * 1px);

                background: #fff;
                border-color: #fff;
                position: relative;
            }

            td {
                max-width: 40em;
            }
        </style>

        <div style="--key_w:1; --key_h:1;">
            <div class="tabs is-centered is-boxed is-toggle">
                <ul id='tab-list'></ul>
            </div>
            <div id='section' class="is-flex is-justify-content-center"></div>
        </div>
    </template>
    <template id='qmk-keycode-inventory-warning'>
        <div class="layer-warning notification is-warning">
            <h2 class="subtitle">Need more than one layer</h2>
        </div>
    </template> 
    <template id='qmk-keycode-inventory-table'>
        <table class="table is-bordered is-striped is-widescreen is-hoverable">
            <thead>
            <tr>
                <th>Key</th>
                <th>Description</th>
            </tr>
            </thead>
        </table> 
    </template>
    `);

export class QMKKeycodeInventory extends QMKElement {
    updateLayer(selectedLayer, layerCount) {
        this.selectedLayer = selectedLayer;
        this.layerCount = layerCount;

        if (layerCount <= 1) {
            this.showLayerWarning();
        } else {
            this.hideLayerWarning();
        }

        const rootElement = this.shadowRoot.childNodes.length > 0 ? this.shadowRoot : this.template;
        rootElement.querySelectorAll('.keycap-layer').forEach(el => {
            el.updateLayerOptions(layerCount, selectedLayer);
        });
    }

    showLayerWarning() {
        let rootElement = this.shadowRoot.childNodes.length > 0 ? this.shadowRoot : this.template;
        rootElement.querySelectorAll('.layer-warning').forEach(el => {
            el.style.display = 'Block';
        });
        rootElement.querySelectorAll('.require-layer').forEach(el => {
            el.style.display = 'None';
        });
    }

    hideLayerWarning() {
        let rootElement = this.shadowRoot ? this.shadowRoot : this.template;
        rootElement.querySelectorAll('.layer-warning').forEach(el => {
            el.style.display = 'None';
        });
        rootElement.querySelectorAll('.require-layer').forEach(el => {
            el.style.display = 'Block';
        });
    }

    constructor(selectedLayer, layerCount) {
        super('qmk-keycode-inventory');
        this.selectedLayer = selectedLayer;
        this.layerCount = layerCount;
        this.layout = daskeyboard.layouts.LAYOUT_fullsize_iso.layout;
        this.keymap = ["KC_ESCAPE", "KC_F1", "KC_F2", "KC_F3", "KC_F4", "KC_F5", "KC_F6", "KC_F7", "KC_F8", "KC_F9", "KC_F10", "KC_F11", "KC_F12", "KC_PRINT_SCREEN", "KC_SCROLL_LOCK", "KC_PAUSE", "KC_NO", "KC_GRAVE", "KC_1", "KC_2", "KC_3", "KC_4", "KC_5", "KC_6", "KC_7", "KC_8", "KC_9", "KC_0", "KC_MINUS", "KC_EQUAL", "KC_BACKSPACE", "KC_INSERT", "KC_HOME", "KC_PAGE_UP", "KC_NUM_LOCK", "KC_KP_SLASH", "KC_KP_ASTERISK", "KC_KP_MINUS", "KC_TAB", "KC_Q", "KC_W", "KC_E", "KC_R", "KC_T", "KC_Y", "KC_U", "KC_I", "KC_O", "KC_P", "KC_LEFT_BRACKET", "KC_RIGHT_BRACKET", "KC_DELETE", "KC_END", "KC_PAGE_DOWN", "KC_KP_7", "KC_KP_8", "KC_KP_9", "KC_KP_PLUS", "KC_CAPS_LOCK", "KC_A", "KC_S", "KC_D", "KC_F", "KC_G", "KC_H", "KC_J", "KC_K", "KC_L", "KC_SEMICOLON", "KC_QUOTE", "KC_BACKSLASH", "KC_ENTER", "KC_KP_4", "KC_KP_5", "KC_KP_6", "KC_LEFT_SHIFT", "KC_LT", "KC_Z", "KC_X", "KC_C", "KC_V", "KC_B", "KC_N", "KC_M", "KC_COMMA", "KC_DOT", "KC_SLASH", "KC_RIGHT_SHIFT", "KC_UP", "KC_KP_1", "KC_KP_2", "KC_KP_3", "KC_KP_ENTER", "KC_LEFT_CTRL", "KC_LEFT_GUI", "KC_LEFT_ALT", "KC_SPACE", "KC_RIGHT_ALT", "KC_RIGHT_GUI", "KC_APPLICATION", "KC_RIGHT_CTRL", "KC_LEFT", "KC_DOWN", "KC_RIGHT", "KC_KP_0", "KC_KP_DOT",]
        this.largest_y = layout_largest_y(this.layout);
        this.largest_x = layout_largest_x(this.layout);
        this.key_x_spacing = 55;
        this.key_y_spacing = 55;

        const basicKeycodeMap = this.createKcSection([
            ["Function keys", keycodes.functionKeys],
            ["Punctuation", keycodes.punctuation],
            ["Lock keys", keycodes.lockKeys],
            ["Modifiers", keycodes.modifiers],
            ["Number pad", keycodes.numpad],
            ["SpecialKeys", keycodes.special],
        ]);

        const mediaKeycodeMap = this.createKcSection([
            ["Media keys", keycodes.media],
            ["Mouse keys", keycodes.mouse],
        ]);

        const commandsKeycodeMap = this.createKcSection([
            ["Navigation", keycodes.navigation],
            ["Commands", keycodes.commands],
            ["Linux", keycodes.linux],
        ])

        const layerKeycodeMap = this.createKcSection([
            ["Layer", keycodes.layers],
        ])

        const multiActionKeycodeMap = this.createKcSection([
            ["Mod Tap", keycodes.modTap],
            ["Layer Tap", keycodes.layerTap],
            ["Layer With Modifier", keycodes.layerMod]
        ]);

        const sections = new Map([
            ["Basic", basicKeycodeMap],
            ["Commands", commandsKeycodeMap],
            ["Media", mediaKeycodeMap],
            ["Layers", layerKeycodeMap],
            ["Multi action", multiActionKeycodeMap]
        ])


        this.sectionElement = this.template.querySelector('#section');

        const keyboardTab = this.createTab('Keyboard');
        keyboardTab.classList.add('is-active');
        this.template.querySelector('#tab-list').appendChild(keyboardTab);

        const keyboardElement = this.createKeyboard();
        this.sectionElement.appendChild(keyboardElement);
        this.sectionElements = new Map([
            ['Keyboard', keyboardElement]
        ]);

        for (const [key, sectionMap] of sections.entries()) {
            let el = this.createTab(key);
            this.template.querySelector('#tab-list').appendChild(el);

            let section = this.createSection(key, sectionMap);
            this.hideSection(section);
            this.sectionElement.appendChild(section);
            this.sectionElements.set(key, section);
        }

        this.currentTab = 'Keyboard';
        this.currentTabElement = keyboardTab;

        this.addEvents([
            ['selectedKey', this.stopKeyEventPropagation],
            ['updateCaption', this.stopKeyEventPropagation],
            ['updateCaptionMultiKey', this.stopKeyEventPropagation],
        ]);

        this.shadowRoot.appendChild(this.template);
    }

    stopKeyEventPropagation(ev) {
        ev.stopPropagation();
    }

    onClickTab(ev) {
        this.hideSection(this.sectionElements.get(this.currentTab));
        this.currentTabElement.classList.remove('is-active');
        this.currentTab = ev.currentTarget.getAttribute('data-tab');
        this.currentTabElement = ev.currentTarget;
        this.currentTabElement.classList.add('is-active');

        this.showSection(this.sectionElements.get(this.currentTab));
    }

    showSection(sectionElement) {
        sectionElement.classList.add('is-flex');
        sectionElement.style.display = 'Block';
    }

    hideSection(sectionElement) {
        sectionElement.classList.remove('is-flex');
        sectionElement.style.display = 'None';
    }

    createSection(sectionName, sectionMap) {
        const section = document.createElement('div');
        section.classList.add('is-flex');
        section.classList.add('is-justify-content-center');
        section.id = sectionName;

        for (const [topic, keyDesc] of sectionMap) {
            const requiresLayer = keyDesc.args.length > 0 && keyDesc.args[0].type === LAYER_ARG;
            const topicParent = document.createElement('div');
            topicParent.classList.add('m-2');

            const title = document.createElement('h1');
            title.classList.add('title');
            title.classList.add('is-4');
            title.textContent = topic;
            topicParent.appendChild(title);

            if (requiresLayer) {
                const layerWarning = document.getElementById('qmk-keycode-inventory-warning').content.cloneNode(true);
                topicParent.appendChild(layerWarning);
            }

            if (keyDesc.args) {
               const explodedKey = new QmkExplodedKey(keyDesc, 0, 1);

               if (requiresLayer) {
                   explodedKey.classList.add('require-layer');
                   explodedKey.classList.add('keycap-layer');
               }

                explodedKey.addEventListener('changeKeyOption', (ev) => {
                    const value = ev.detail.value;
                    const type = ev.detail.type;
                    let selector;
                    if (type === BASIC_ARG) {
                        selector = '.keycap-arg-basic';
                    } else if (type === LAYER_ARG) {
                        selector = '.keycap-arg-layer';
                    }
                    topicParent.querySelectorAll(selector).forEach(keycap => {
                        let captionInfo = keycap.getParsedCaption();
                        let newCaption = replaceArgInMultiCaption(captionInfo, value, type);
                        keycap.updateCaption(newCaption);
                    });
                });
                topicParent.appendChild(explodedKey);
            }

            const tableTemplate = document.getElementById('qmk-keycode-inventory-table').content.cloneNode(true);
            const table = tableTemplate.querySelector('table');
            if (requiresLayer) {
                table.classList.add('require-layer');
            }
            for (const key of keyDesc.keyList) {
                const tr = document.createElement('tr');
                const keyTd = document.createElement('td');
                const keycap = new QMKKeycap(-1, key.caption);
                if (key.captionFn) {
                    for (const arg of key.captionFn.args) {
                        if (arg.type === BASIC_ARG) {
                            keycap.classList.add('keycap-arg-basic');
                        } else  if (arg.type === LAYER_ARG) {
                            keycap.classList.add('keycap-arg-layer');
                        }
                    }
                }

                keyTd.appendChild(keycap);
                tr.appendChild(keyTd);
                const keyDescriptionTd = document.createElement('td');
                keyDescriptionTd.textContent = key.label.description;
                tr.appendChild(keyDescriptionTd);
                table.appendChild(tr);
            }

            topicParent.appendChild(tableTemplate);

            section.appendChild(topicParent);
        }
        return section;
    }

    createKeyboard() {
        const div = document.createElement('div');
        div.id = 'keyboard';
        div.classList.add('column');
        div.classList.add('is-narrow');
        div.classList.add('box');
        div.style.setProperty('--sample-kb-largest_y', this.largest_y.toString());
        div.style.setProperty('--sample-kb-largest_x', this.largest_x.toString());
        for (let i = 0; i < this.layout.length; i++) {
            const key = this.layout[i];
            const positionalKey = new QMKPositionalKey(key, -1, this.keymap[i], keyEditInteractive);
            div.appendChild(positionalKey);
        }
        return div;
    }

    createTab(value) {
        const li = document.createElement('li');
        li.setAttribute('data-tab', value);
        const a = document.createElement('a');
        a.textContent = value;
        li.appendChild(a);
        li.addEventListener('click', this.onClickTab.bind(this));
        return li;
    }

    createKcSection(entries) {
        let map = new Map();
        for (let entry of entries) {
            const sectionName = entry[0];
            let sectionKeyList = entry[1];
            let argList = getKeyArgumentDesc(sectionKeyList[0]);
            if (argList.length > 0) {
                sectionKeyList = sectionKeyList.map(x => appendDefaultArgs(x, argList));
            }
            map.set(sectionName, {keyList: sectionKeyList.map(parseCaption), args: argList});
        }
        return map;
    }
}

customElements.define('qmk-keycode-inventory', QMKKeycodeInventory);
