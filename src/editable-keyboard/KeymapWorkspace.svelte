<script>
    import {padLayerSize} from "../lib/layers";
    import {onMount} from "svelte";
    import jsKeyCodes from '../lib/keycodes/jsKeyCodes.json';
    import keycodes from '../lib/keycodes/keycodes.json';
    import RawKey from "./RawKey.svelte";
    import KeycodeLibrary from "./KeycodeInventory.svelte";
    import LayerPicker from "./LayerPicker.svelte";
    import {keyEditRaw, keyEditStandard} from "./keymapWorkspace";
    import KeyEditMode from "./KeyEditMode.svelte";
    import PositionalKey from "./PositionalKey.svelte";
    import Keycap from "./Keycap.svelte";
    import ExplodedKey from "@/editable-keyboard/ExplodedKey.svelte";
    import {BASIC_ARG, parseCaption, replaceArgsInMultiCaption} from "@/lib/key-info.js";

    const maxLayers = 16;

    export let keyboard_name = "Unnamed keyboard";
    export let layout;
    export let layout_name;
    export let keymap;

    onMount(async () => {
        try {
            // load_keyboard(keyboardName, keyboardLayout);
        } catch (err) {
            // eventDispatcher('QMKError', {output: err});
        }
    });

    $: currentLayerIndex = 1;
    $: currentLayer = keymap[currentLayerIndex];
    $: showKeyModal = false;
    $: selectedKey = null;
    $: selectedModalKey = null;
    $: compositeCaption1 = "MO";
    $: compositeCaption2 = "KC_A";

    let keycapMode = keyEditStandard;
    let modalKey = null;
    let modalKeyDesc = {args: []};

    let generatedLayer = [];
    for (let i = 0; i < layout.length; i++) {
        generatedLayer.push("LALT_T(KC_" + i % 10 + ")");
    }
    generatedLayer[69] = "MO(1)";
    generatedLayer[70] = "KC_A";
    generatedLayer[71] = "KC_ENTER";
    if (keymap.length === 1) {
        keymap.push(generatedLayer);
    }
    keymap = padLayerSize(keymap, layout.length);

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

<div class="workspace">
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
