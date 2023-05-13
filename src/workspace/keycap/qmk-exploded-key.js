import {QMKElement} from "@/qmk-element.js";
import {allBasicCaptions, BASIC_ARG, LAYER_ARG} from "@/lib/key-info.js";

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
    constructor(keyDesc, layerCount, selectedLayer) {
        super('qmk-exploded-key');
        this.classList.add('exploded-key');

        this.layerCount = layerCount;
        this.selectedLayer = selectedLayer;

        this.update(keyDesc, layerCount, selectedLayer);

        this.shadowRoot.appendChild(this.template);
    }

    update(keyDesc, layerCount, selectedLayer) {
        let rootElement = this.shadowRoot.childNodes.length > 0 ? this.shadowRoot : this.template;

        this.layerCount = layerCount;
        this.selectedLayer = selectedLayer;
        this.explodedKey = rootElement.querySelector('#exploded-key');
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

    updateLayerOptions(layerCount, currentLayer) {
        let rootElement = this.shadowRoot.childNodes.length > 0 ? this.shadowRoot : this.template;
        const select = rootElement.getElementById('layerselect');
        const previousSelected = rootElement.querySelector('#layerselect > Option:checked');
        let lastId = previousSelected ? Number(previousSelected.value) : 0;
        this.removeChildren(select);

        for (let i = 0; i < layerCount; i++) {
            if (currentLayer === i) {
                continue;
            }

            const option = document.createElement('option');
            option.value = i;
            option.textContent = i;
            if (lastId === i) {
                option.selected = true;
            }

            select.appendChild(option);
        }
    }

    createBasicOption() {
        const basicOption = document.getElementById('qmk-exploded-key-basic').content.cloneNode(true);
        const select = basicOption.querySelector('select');
        for (const [label, keycode] of Object.entries(allBasicCaptions())) {
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

    createLayerOption(layerCount, currentLayer) {
        const layerOption = document.getElementById('qmk-exploded-key-layer').content.cloneNode(true);
        const select = layerOption.querySelector('select');
        select.id = 'layerselect'
        for (let i = 0; i < layerCount; i++) {
            if (currentLayer === i) {
                continue;
            }

            const option = document.createElement('option');
            option.value = i;
            option.textContent = i;
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
