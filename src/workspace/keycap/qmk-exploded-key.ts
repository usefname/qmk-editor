// import {QMKElement} from '../../qmk-element';
import {allBasicCaptions, BASIC_ARG, LAYER_ARG} from "../../lib/key-info.ts";
import {MultiFunctionKey} from "../../lib/key-info.ts";
import {QMKElement} from "../../qmk-element.ts";

// language=HTML
document.body.insertAdjacentHTML('afterbegin',
    `<template id="qmk-exploded-key">
        <div id='exploded-key' class="box is-flex is-flex-direction-column"></div>
    </template>
    <template id='qmk-exploded-key-basic'>
        <div class="is-flex">
            <h2 class="mr-3 subtitle is-justify-content-center is-align-items-center">Keycode</h2>
            <div class="ml-3 select is-small">
                <select></select>
            </div>
        </div>        
    </template>
    <template id='qmk-exploded-key-layer'>
        <div class="is-flex">
            <h2 class="mr-3 subtitle is-justify-content-center is-align-items-center">Layer</h2>
            <div class="ml-3 select is-small">
                <select></select>
            </div>
        </div>
    </template>
    `);

export class QmkExplodedKey extends QMKElement {
    // private layerCount: number;
    // private selectedLayer: number;
    private readonly explodedKey: HTMLDivElement;

    constructor(keyDesc: MultiFunctionKey, layerCount: number, selectedLayer: number) {
        super('qmk-exploded-key');

        // this.layerCount = layerCount;
        // this.selectedLayer = selectedLayer;

        this.classList.add('exploded-key');
        this.explodedKey = this.template.querySelector('#exploded-key') as HTMLDivElement;

        this.update(keyDesc, layerCount, selectedLayer);

        this.shadow.appendChild(this.template);
    }

    update(keyDesc: MultiFunctionKey, layerCount: number, selectedLayer: number) {
        // let rootElement = this.shadow.childNodes.length > 0 ? this.shadowRoot : this.template;

        // this.layerCount = layerCount;
        // this.selectedLayer = selectedLayer;
        this.removeChildren(this.explodedKey);
        for (const arg of keyDesc.args) {
            if (arg.type === BASIC_ARG) {
                const el = this.createBasicOption();
                this.explodedKey.appendChild(el);
            } else if (arg.type === LAYER_ARG) {
                const el = this.createLayerOption(layerCount, selectedLayer);
                this.explodedKey.appendChild(el);
            }
        }

    }

    updateLayerOptions(layerCount: number, currentLayer: number) {
        let rootElement = this.shadow.childNodes.length > 0 ? this.shadowRoot : this.template;
        const select = rootElement?.getElementById('layerselect') as HTMLSelectElement;
        const previousSelected = rootElement?.querySelector('#layerselect > Option:checked') as HTMLOptionElement;
        let lastId = previousSelected ? Number(previousSelected.value) : 0;
        this.removeChildren(select);

        for (let i = 0; i < layerCount; i++) {
            if (currentLayer === i) {
                continue;
            }

            const option = document.createElement('option');
            option.value = String(i);
            option.textContent = String(i);
            if (lastId === i) {
                option.selected = true;
            }

            select.appendChild(option);
        }
    }

    createBasicOption() {
        const basicOption = this.cloneTemplate('qmk-exploded-key-basic');
        const select = basicOption.querySelector('select');
        if (!select) {
            throw "Invalid template";
        }
        for (const [label, keycode] of allBasicCaptions().entries()) {
           const option = document.createElement('option');
           option.value = keycode;
           option.textContent = label + ' (' + keycode + ')';
           select.appendChild(option);
        }

        let self = this;
        select.addEventListener('change', (ev) => {
            self.emitEvent('changeKeyBasicOption', ev.currentTarget.value);
            self.emitEvent('changeKeyOption', {value: ev.currentTarget.value, type: BASIC_ARG});
        });
        return basicOption;
    }

    createLayerOption(layerCount: number, currentLayer: number) {
        const layerOption = this.cloneTemplate('qmk-exploded-key-layer');
        const select = layerOption.querySelector('select');
        if (!select) {
            throw "Invalid template";
        }
        select.id = 'layerselect'
        for (let i = 0; i < layerCount; i++) {
            if (currentLayer === i) {
                continue;
            }

            const option = document.createElement('option');
            option.value = String(i);
            option.textContent = String(i);
            select.appendChild(option);
        }
        let self = this;
        select.addEventListener('change', (ev) => {
            self.emitEvent('changeKeyLayerOption', ev.currentTarget.value);
            self.emitEvent('changeKeyOption', {value: ev.currentTarget.value, type: LAYER_ARG});
        });
        return layerOption;
    }
}

customElements.define('qmk-exploded-key', QmkExplodedKey);
