import {QMKElement} from "../..//qmk-element.ts";

// language=HTML
document.body.insertAdjacentHTML('afterbegin',
    `
        <template id="qmk-layer-picker">
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
        <template id="qmk-layer-picker-li">
            <li><a class="pagination-link" target="_blank"></a></li>
        </template>
    `);

export class QmkLayerPicker extends QMKElement {
    private maxLayers: number;
    private layerCount: number;
    private currentLayer: number;
    private deleteButtonElement: HTMLButtonElement;
    private addButtonElement: HTMLButtonElement;
    private layerListElement: HTMLUListElement;

    constructor(layerCount: number, maxLayers: number) {
        super('qmk-layer-picker');
        this.layerCount = layerCount;
        this.currentLayer = 0;
        this.maxLayers = maxLayers;

        this.deleteButtonElement = this.template.querySelector('#deleteButton') as HTMLButtonElement;
        this.addButtonElement = this.template.querySelector('#addButton') as HTMLButtonElement;
        this.layerListElement = this.template.querySelector('#layer-list') as HTMLUListElement;

        this.addEventsToElement(this.template, [
            ['#addButton', 'click', this.onAddLayer],
            ['#deleteButton', 'click', this.onDeleteLayer]
        ]);

        this.updateButtonState();

        for (let i = 0; i < layerCount; i++) {
            this._addLayer(this.template);
        }

        this.updateLayerNumbers(this.template);
        this.shadow.appendChild(this.template);
    }

    onAddLayer() {
        this.emitEvent('addLayer', null);
    }

    onDeleteLayer() {
        this.emitEvent('deleteLayer', null);
    }

    onLayerClick(ev: MouseEvent) {
        if (ev.target && ev.target instanceof Element) {
            const layer = Number(ev.target.getAttribute('layer'));
            if (!isNaN(layer)) {
                this.currentLayer = layer;
                this.updateLayerNumbers(this.shadow);
                this.emitEvent('changeLayer', {layer: layer});
            }
        }
    }

    private updateButtonState() {
        if (this.layerCount <= 1) {
            this.deleteButtonElement.setAttribute('disabled', '');
            this.addButtonElement.removeAttribute('disabled');
        } else if (this.layerCount >= this.maxLayers) {
            this.addButtonElement.setAttribute('disabled', '');
            this.deleteButtonElement.removeAttribute('disabled');
        } else {
            this.deleteButtonElement.removeAttribute('disabled');
            this.addButtonElement.removeAttribute('disabled');
        }
    }

    addLayer(layerCount: number, currentLayer: number) {
        this.layerCount = layerCount;
        this.currentLayer = currentLayer;
        this._addLayer(this.shadow);
    }

    _addLayer(rootElement: ShadowRoot | DocumentFragment) {
        const layerNumber = this.layerCount;
        this.layerCount++;
        const liTemplate = document.getElementById('qmk-layer-picker-li') as HTMLTemplateElement;
        if (liTemplate) {
            const li = liTemplate.content.cloneNode(true) as DocumentFragment;
            const a = li.querySelector('a');
            if (!a) {
                return;
            }
            a.textContent = String(layerNumber);
            a.addEventListener('click', this.onLayerClick.bind(this));
            a.setAttribute('layer', String(layerNumber));

            this.layerListElement.appendChild(li);

            this.updateButtonState();
            this.updateLayerNumbers(rootElement);
        }
    }

    deleteLayer(layerCount: number, currentLayer: number) {
        this.layerCount = layerCount;
        if (this.layerListElement.children[0]) {
            this.layerListElement.children[0].remove();
            this.currentLayer = currentLayer;
            this.updateButtonState();
            this.updateLayerNumbers(this.shadow);
        }
    }

    updateLayerNumbers(parentNode: DocumentFragment | ShadowRoot) {
        const listElement = parentNode.querySelector('ul');
        if (!listElement) {
            return;
        }
        const lis = listElement.children;
        for (let i = 0; i < lis.length; i++) {
            const li = lis[i] as HTMLLIElement;
            if (li.firstChild && li.firstChild instanceof HTMLAnchorElement) {
                if (i === this.currentLayer) {
                    li.firstChild.classList.add('is-current');
                } else {
                    li.firstChild.classList.remove('is-current');
                }
                li.firstChild.setAttribute('layer', String(i));
                li.firstChild.textContent = String(i);
            }
        }
    }
}

customElements.define('qmk-layer-picker', QmkLayerPicker);
