<script>
    import {layout_largest_x, layout_largest_y} from "../lib/layout";
    import {insertEmptyLayer, isLayerEmpty, padLayerSize} from "../lib/layers";
    import {onMount} from "svelte";
    import {classifyKey, LAYERED_KEY, LAYERED_WHEN_HELD_KEY, NORMAL_KEY} from "../lib/key-info.js";
    import {eventKeyCodeToQMKKeyCode} from "../lib/js-qk-keycode";
    import RawKey from "./RawKey.svelte";
    import KeycodeLibrary from "./KeycodeInventory.svelte";
    import LayerPicker from "./LayerPicker.svelte";
    import {keyEditRaw, keyEditStandard} from "./keymapWorkspace";
    import KeyEditMode from "./KeyEditMode.svelte";
    import PositionalKey from "./PositionalKey.svelte";

    const maxLayers = 9;

    export let name = "Unnamed keyboard";
    export let layout;
    export let keymap;

    $: currentLayerIndex = 1;

    onMount(async () => {
        try {
            // load_keyboard(keyboardName, keyboardLayout);
        } catch (err) {
            // eventDispatcher('QMKError', {output: err});
        }
    });


    function handleSelectedKey(event) {
        selectedKey = event.detail.key;

    }
    function handleUpdateCaption(event) {
        keymap[currentLayerIndex][event.detail.key] = event.detail.caption;
    }

    $: currentLayer = keymap[currentLayerIndex];
    $: keyClass = keymap[currentLayerIndex].map((val) => classifyKey(val));
    $: selectedKey = null;

    let keycapMode = keyEditStandard;

    let generatedLayer = [];
    for (let i = 0; i < layout.length; i++) {
        generatedLayer.push("LM(KC_" + i + ")");
    }
    generatedLayer[70] = "KC_A";
    generatedLayer[71] = "KC_ENTER";
    keymap.push(generatedLayer);
    keymap = padLayerSize(keymap, layout.length);

    const setCaption = (event) => {
        if (keycapMode === keyEditStandard && event.key && eventKeyCodeToQMKKeyCode.has(event.code)) {
            currentLayer[selectedKey] = eventKeyCodeToQMKKeyCode.get(event.code);
            event.preventDefault();
            selectedKey = null;
        }
    };

    const deselectKey = () => {
        selectedKey = null;
    };

</script>

<div class="workspace">
    <div
            class="edit-workspace"
            on:keydown={setCaption}
            on:mouseup={deselectKey}
            on:dragstart={deselectKey}
            tabindex="0">
        <div
                class="keyboard-container is-narrow box">
            <div class="keymap-layout">
                {#each layout as key, i}
                    {#if keyEditStandard === keycapMode}
                        <PositionalKey {key} caption={currentLayer[i]} keyIndex={i} selected={i===selectedKey} on:selectedKey={handleSelectedKey} on:updateCaption={handleUpdateCaption}/>
                    {:else if keyEditRaw === keycapMode }
                        <RawKey {key} caption={currentLayer[i]} keyIndex={i} selected={i===selectedKey} on:selectedKey={handleSelectedKey} on:updateCaption={handleUpdateCaption}/>
                    {/if}
                {/each}
            </div>
        </div>
        <div class="is-flex is-flex-direction-column is-justify-content-space-between ml-5">
            <LayerPicker {keymap} {currentLayerIndex} {maxLayers} layoutKeyCount={layout.length}/>
            <KeyEditMode {keycapMode}/>
        </div>
    </div>
    <KeycodeLibrary/>
</div>
<style>
    .workspace {
    }
    .edit-workspace {
        display: flex;
        justify-content: center;
        flex-wrap: wrap;
    }
    .keyboard-container {
        padding-left: 5px;
        padding-top: 5px;
        /*box-shadow: 0 0 3px #0000004d;*/
        /*background-color: #eee;*/
        border-color: #ccc;
        height: calc((var(--kb_largest_y) + 0.0) * (var(--key_y_spacing) * 1px));
        width: calc((var(--kb_largest_x) + 0.0) * (var(--key_x_spacing) * 1px));
    }
    .keymap-layout {
        position: absolute;
        border-style: none;
        /*background-color: #eee;*/
    }

</style>
