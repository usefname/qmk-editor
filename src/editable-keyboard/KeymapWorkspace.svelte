<script>
    import {padLayerSize} from "../lib/layers";
    import {onMount} from "svelte";
    import jsKeyCodes from '../lib/keycodes/jsKeyCodes.json';
    import RawKey from "./RawKey.svelte";
    import KeycodeLibrary from "./KeycodeInventory.svelte";
    import LayerPicker from "./LayerPicker.svelte";
    import {keyEditRaw, keyEditStandard} from "./keymapWorkspace";
    import KeyEditMode from "./KeyEditMode.svelte";
    import PositionalKey from "./PositionalKey.svelte";
    import Keycap from "./Keycap.svelte";
    import ExplodedKey from "@/editable-keyboard/ExplodedKey.svelte";
    import {BASIC_ARG, parseCaption, replaceArgsInMultiCaption} from "@/lib/key-info.js";
    import {calcLayoutWidth, layout_largest_x, layout_largest_y} from "@/lib/layout.js";

    const maxLayers = 16;

    export let keyboard_name;
    export let layout;
    export let layout_name;
    export let keymap;

    $: calculatedAppWidth = "calc(((" + calcLayoutWidth(layout, key_x_spacing) + "*1px)) + 20rem)";
    $: calculatedLayoutWidth = "calc((" + calcLayoutWidth(layout, key_x_spacing) + "*1px))";
    $: largest_y = layout_largest_y(layout);
    $: largest_x = layout_largest_x(layout);
    let key_x_spacing = 55;
    let key_y_spacing = 55;
    let key_width = 50;
    let key_height = 50;


    $: currentLayerIndex = 0;
    $: currentLayer = keymap[currentLayerIndex];
    $: showKeyModal = false;
    $: selectedKey = null;
    $: selectedModalKey = null;
    $: compositeCaption1 = "MO";
    $: compositeCaption2 = "KC_A";

    let keycapMode = keyEditStandard;
    let modalKey = null;
    let modalKeyDesc = {args: []};

    const iskeyselected = (keynum) => selectedKey === keynum;
    const isModalKeyselected = (keynum) => selectedModalKey === keynum;

    const deselectKeyboard = () => {
        showKeyModal = false;
        selectedKey = null;
    };

    const deselectModalKey = () => {
        selectedModalKey = null;
    };

    const closeModal = () => {
        selectedKey = null;
        showKeyModal = false;
    }

    const saveModalKey = () => {
        currentLayer[selectedKey] = replaceArgsInMultiCaption(modalKey, modalKeyDesc.args);
        selectedKey = null;
        showKeyModal = false;
    }

    const setCaption = (event) => {
        if (!showKeyModal
            && keycapMode === keyEditStandard
            && event.key
            && jsKeyCodes[event.code]) {
            currentLayer[selectedKey] = jsKeyCodes[event.code];
            event.preventDefault();
            deselectKeyboard();
        }
    };


    function handleEditCompositeKey(event) {
        if (showKeyModal) {
            showKeyModal = false;
        } else {
            selectedKey = event.detail.key;
            let parsedCaption = parseCaption(currentLayer[selectedKey]);
            if (parsedCaption.multiKey) {
                modalKey = parsedCaption;
                modalKeyDesc = parsedCaption.captionFn;
                showKeyModal = true;
            }
        }
    }

    function handleSelectedKey(event) {
        if (!showKeyModal) {
            selectedKey = event.detail.key;
        }
    }

    function handleUpdateCaption(event) {
        keymap[currentLayerIndex][event.detail.key] = event.detail.caption;
    }

    function handleUpdateModalKeyCaption(event) {
        if (showKeyModal) {
            if (event.detail.key === 1) {
                compositeCaption1 = event.detail.caption;
            } else if (event.detail.key === 2) {
                compositeCaption2 = event.detail.caption;
            }
        }
    }

</script>

<div class="workspace"
     style="--app-width:{calculatedAppWidth};--layout-width:{calculatedLayoutWidth};--kb_largest_x: {largest_x};--kb_largest_y: {largest_y}; --key_x_spacing: {key_x_spacing}; --key_y_spacing: {key_y_spacing}; --key_width: {key_width}; --key_height: {key_height};">
    <div
            class="keycap-modal box has-background-white-ter notification"
            style="--key_w:1; --key_h:1;"
            class:kc-modal-visible={showKeyModal}
            class:kc-modal-hidden={showKeyModal === false}
    >
        <button class="delete"
                on:click={closeModal}
        ></button>
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
    <div class="edit-workspace box"
         on:keydown={setCaption}
         on:click={deselectKeyboard}
         on:dragstart={deselectKeyboard}
         tabindex="0">

        <div class="keyboard-container is-narrow"
             class:inactive={showKeyModal}
        >
            <div class="keymap-layout">
                {#each layout as key, i}
                    {#if keyEditStandard === keycapMode}
                        <PositionalKey {key} caption={currentLayer[i]} keyIndex={i} selected={i===selectedKey}
                                       on:selectedKey={handleSelectedKey} on:updateCaption={handleUpdateCaption}
                                       on:editCompositeKey={handleEditCompositeKey}/>
                    {:else if keyEditRaw === keycapMode }
                        <RawKey {key} caption={currentLayer[i]} keyIndex={i} selected={i===selectedKey}
                                on:selectedKey={handleSelectedKey} on:updateCaption={handleUpdateCaption}/>
                    {/if}
                {/each}
            </div>
        </div>
        <div class="is-flex is-flex-direction-column is-justify-content-space-between ml-5"
             class:inactive={showKeyModal}
        >
            <LayerPicker bind:keymap bind:currentLayerIndex {maxLayers} layoutKeyCount={layout.length}/>
            <KeyEditMode {keycapMode}/>
        </div>
    </div>
    <KeycodeLibrary {currentLayerIndex} layerCount={keymap.length}/>
</div>

<style>
    .kc-modal-visible {
        display: block;
    }

    .kc-modal-hidden {
        display: none;
    }

    .keycap-modal {
        width: fit-content;
        position: fixed;
        left: 0;
        right: 0;
        margin: 4rem auto;
        z-index: 200;
    }

    .edit-workspace {
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

    .keyboard-container {
        padding-left: 5px;
        padding-top: 5px;
        height: calc((var(--kb_largest_y) + 0.0) * (var(--key_y_spacing) * 1px));
        width: calc((var(--kb_largest_x) + 0.0) * (var(--key_x_spacing) * 1px));
    }

    .keymap-layout {
        position: absolute;
        border-style: none;
    }

</style>
