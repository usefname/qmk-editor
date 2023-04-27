import {QMKElement} from "@/qmk-element.js";

// language=HTML
document.body.insertAdjacentHTML('afterbegin',
    `<template>
        <style>
            .keycap-modal {
                width: fit-content;
                position: fixed;
                left: 0;
                right: 0;
                margin: 4rem auto;
                z-index: 200;
            }
        </style>
        <div
                class="kc-modal-hidden keycap-modal box has-background-white-ter notification"
                style="--key_w:1; --key_h:1;"
        >
            <button class="delete" on:click={closeModal}></button>
            <h1 class="title">Edit multi action key</h1>
            <h2 class="subtitle">
                This key have multiple actions.
            </h2>
            {#if modalKeyDesc.args.length > 0}
            <ExplodedKey keyDesc={modalKeyDesc} currentLayerIndex={currentLayerIndex}
                         layerCount={keymap.length}/>
                {/if}
                <div class="is-flex is-justify-content-space-evenly">
                    {#if modalKey}
                    <Keycap caption={replaceArgsInMultiCaption(modalKey, modalKeyDesc.args)}/>
                    {/if}
                    <button class="button is-primary" on:click={saveModalKey}>Save</button>
                </div>
        </div> 
</template>`);

export class QMKKeycapModal extends QMKElement {
    constructor() {
        super();
    }
}

customElements.define('qmk-keycap-modal', QMKKeycapModal);
