<script>
    import {padLayerSize} from "../lib/layers";
    import {onMount} from "svelte";
    import jsKeyCodes from '../lib/keycodes/jsKeyCodes.json'
    import RawKey from "./RawKey.svelte";
    import KeycodeLibrary from "./KeycodeInventory.svelte";
    import LayerPicker from "./LayerPicker.svelte";
    import {keyEditRaw, keyEditStandard} from "./keymapWorkspace";
    import KeyEditMode from "./KeyEditMode.svelte";
    import PositionalKey from "./PositionalKey.svelte";
    import Keycap from "./Keycap.svelte";

    const maxLayers = 16;

    export let name = "Unnamed keyboard";
    export let layout;
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

    let generatedLayer = [];
    for (let i = 0; i < layout.length; i++) {
        generatedLayer.push("LALT_T(KC_" + i%10 + ")");
    }
    generatedLayer[69] = "MO(1)";
    generatedLayer[70] = "KC_A";
    generatedLayer[71] = "KC_ENTER";
    keymap.push(generatedLayer);
    keymap = padLayerSize(keymap, layout.length);

    const iskeyselected = (keynum) => selectedKey === keynum;
    const isModalKeyselected = (keynum) => selectedModalKey === keynum;

    const deselectKeyboard = () => {
        showKeyModal = false;
        selectedKey = null;
    };

    const deselectModal = () => {
        selectedModalKey = null;
        showKeyModal = false;
    };

    const deselectModalKey = () => {
        selectedModalKey = null;
    };

    const setCaption = (event) => {
        if (keycapMode === keyEditStandard
            && event.key
            && jsKeyCodes[event.code]) {
        // && eventKeyCodeToQMKKeyCode.has(event.code)) {
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
            showKeyModal = true;
        }
    }

    function handleSelectedKey(event) {
        if (!showKeyModal) {
            selectedKey = event.detail.key;
        }
    }

    function handleUpdateCaption(event) {
        if (!showKeyModal) {
            keymap[currentLayerIndex][event.detail.key] = event.detail.caption;
        }
    }

    function handleSelectedModalKey(event) {
        if (showKeyModal) {
            selectedKey = event.detail.key;
        }
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
    <div class="edit-workspace box"
            on:keydown={setCaption}
            on:mouseup={deselectKeyboard}
            on:dragstart={deselectKeyboard}
            tabindex="0">
        <div
                class="keycap-modal box has-background-white-ter"
                class:kc-modal-visible={showKeyModal}
                class:kc-modal-hidden={showKeyModal === false}
                style="--key_w:1; --key_h:1;"
        >
            <section>
                <h1 class="title">Edit multi action key</h1>
                <h2 class="subtitle">
                    This key have multiple actions. The inner key must be a <a href="https://qmk.github.io/qmk_mkdocs/master/en/keycodes_basic/" target="_blank">basic keycode</a>
                </h2>
                <Keycap caption={compositeCaption1} keyIndex={1} selected={isModalKeyselected(1)} on:selectedKey={handleSelectedModalKey} on:updateCaption={handleUpdateModalKeyCaption}/>
                <Keycap caption={compositeCaption2} keyIndex={2} selected={isModalKeyselected(2)} on:selectedKey={handleSelectedModalKey} on:updateCaption={handleUpdateModalKeyCaption}/>
            </section>
        </div>
        <div class="keyboard-container is-narrow"
             class:inactive={showKeyModal}
        >
            <div class="keymap-layout">
                {#each layout as key, i}
                    {#if keyEditStandard === keycapMode}
                        <PositionalKey {key} caption={currentLayer[i]} keyIndex={i} selected={i===selectedKey} on:selectedKey={handleSelectedKey} on:updateCaption={handleUpdateCaption} on:editCompositeKey={handleEditCompositeKey}/>
                    {:else if keyEditRaw === keycapMode }
                        <RawKey {key} caption={currentLayer[i]} keyIndex={i} selected={i===selectedKey} on:selectedKey={handleSelectedKey} on:updateCaption={handleUpdateCaption}/>
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
    <KeycodeLibrary {currentLayerIndex} layoutCount={keymap.length}/>
</div>

<style>
    .kc-modal-visible {
        display: block;
    }

    .kc-modal-hidden {
        display: none;
    }

    .keycap-modal {
        margin-top: 4rem;
        position: absolute;
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
