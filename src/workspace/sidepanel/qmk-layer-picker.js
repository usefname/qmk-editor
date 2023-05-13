import {QMKElement} from "@/qmk-element.js";

// language=HTML
document.body.insertAdjacentHTML('afterbegin',
    `<template id="qmk-layer-picker">
        <style>
            .layers {
                width: 220px;
            }
        </style>
        <div class="is-flex is-flex-direction-column layers">
            <div class="is-size-3"> Layer</div>
            <div class="mt-1">
                <button id='addButton' class="button is-primary is-light is-size-7">Add</button>
                <button id='deleteButton' class="button is-primary is-light is-size-7">Delete</button>
            </div>
            <div class="mt-4">
                <nav class="pagination is-small is-flex-direction-row" role="navigation" aria-label="pagination">
                    <ul id='layer-list' class="pagination-list"></ul>
                </nav>
            </div>
        </div> 
    </template>
    <template id="qmk-layer-picker-li"><li><a class="pagination-link" target="_blank"></a></li></template> 
    `);

export class QmkLayerPicker extends QMKElement {
    constructor(layerCount, maxLayers) {
        super('qmk-layer-picker');
        this.maxLayers = maxLayers;

        this.layerCount = layerCount;
        this.currentLayer = 0;
        this.maxLayers = maxLayers;

        this.addEventsToElement(this.template, [
            ['#addButton', 'click', this.onAddLayer],
            ['#deleteButton', 'click', this.onDeleteLayer]
        ]);

        if (this.layerCount <= 1) {
            this.template.querySelector('#deleteButton').setAttribute('disabled', '');
        } else if (this.layerCount >= maxLayers) {
            this.template.querySelector('#addButton').setAttribute('disabled', '');
        }

        for (let i = 0; i < layerCount; i++)  {
            this._addLayer(this.template);
        }

        this.updateLayerNumbers(this.template);
        this.shadowRoot.appendChild(this.template);
    }

    onAddLayer() {
        this.emitEvent('addLayer', null);
    }

    onDeleteLayer() {
        this.emitEvent('deleteLayer', null);
    }

    onLayerClick(ev) {
        const layer = Number(ev.target.getAttribute('layer'));
        if (!isNaN(layer)) {
            this.currentLayer = layer;
            this.updateLayerNumbers(this.shadowRoot);
            this.emitEvent('changeLayer', {layer: layer});
        }
    }

    addLayer(currentLayer) {
        this.currentLayer = currentLayer;
        this._addLayer(this.shadowRoot);
    }

    _addLayer(rootElement) {
        const layerNumber = this.layerCount;
        this.layerCount++;
        const li = document.getElementById('qmk-layer-picker-li').content.cloneNode(true);
        const a = li.querySelector('a');
        a.textContent = layerNumber;
        a.addEventListener('click', this.onLayerClick.bind(this));
        a.setAttribute('layer', layerNumber);
        rootElement.querySelector('#layer-list').appendChild(li);

        rootElement.querySelector('#deleteButton').removeAttribute('disabled');
        this.updateLayerNumbers(rootElement);
    }

    deleteLayer(currentLayer) {
        this.shadowRoot.querySelector('#layer-list').firstChild.remove();
        this.currentLayer = currentLayer;
        this.updateLayerNumbers(this.shadowRoot);
    }

    updateLayerNumbers(rootElement) {
        const lis = rootElement.querySelector('ul').children;
        for (let i = 0; i < lis.length; i++) {
            if (i === this.currentLayer) {
                lis[i].firstChild.classList.add('is-current');
            } else {
                lis[i].firstChild.classList.remove('is-current');
            }
            lis[i].firstChild.setAttribute('layer', i);
            lis[i].firstChild.textContent = i;
        }
    }
}

customElements.define('qmk-layer-picker', QmkLayerPicker);
