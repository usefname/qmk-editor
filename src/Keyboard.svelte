<script>
    import {layout_largest_x, layout_largest_y} from "./lib/layout";
    import {insertEmptyLayer, isLayerEmpty, padLayerSize} from "./lib/layers";
    import {onMount} from "svelte";
    import Key from "./Key.svelte";
    import {classifyKey, LAYERED_KEY, LAYERED_WHEN_HELD_KEY, NORMAL_KEY} from "./lib/key-info.js";
    import {eventKeyCodeToQMKKeyCode} from "./lib/keycode";
    import RawKey from "./RawKey.svelte";
    import CompositeKey from "./CompositeKey.svelte";

    export let name = "Unnamed keyboard";
    export let layout;
    let keymap = [];
    export let layers;
    let currentLayerIndex = 1;
    const max_layers = 10;

    let largest_y = layout_largest_y(layout);
    let largest_x = layout_largest_x(layout);
    let key_x_spacing = 55;
    let key_y_spacing = 55;
    let key_width = 50;
    let key_height = 50;

    onMount(async () => {
        try {
            // load_keyboard(keyboardName, keyboardLayout);
        } catch (err) {
            // eventDispatcher('QMKError', {output: err});
        }
    });
    async function changeLayer(event) {
        currentLayerIndex = event.target.value;
    }
    async function addLayer() {
        if (layers.length < max_layers) {
            layers = insertEmptyLayer(layers, layout.length);
        }
        currentLayerIndex++;
    }
    async function deleteLayer() {
        if (layers.length > 1) {
            layers.splice(currentLayerIndex, 1);
            layers = layers;

            if (currentLayerIndex > 0) {
                currentLayerIndex = currentLayerIndex - 1;
            }
        }
    }

    function handleSelectedKey(event) {
        selectedKey = event.detail.key;

    }
    function handleUpdateCaption(event) {
        layers[currentLayerIndex][event.detail.key] = event.detail.caption;
    }

    $: currentLayer = layers[currentLayerIndex];
    $: keyClass = layers[currentLayerIndex].map((val) => classifyKey(val));
    $: selectedKey = 3;

    const keyEditStandard = "Standard";
    const keyEditComposite = "Composite";
    const keyEditRaw = "Raw";
    let keyCapMode = keyEditStandard;

    for (let i = 0; i < layout.length; i++) {
        keymap.push("LM(KC_" + i + ")");
    }
    keymap[70] = "KC_A";
    keymap[71] = "KC_ENTER";
    layers.push(keymap);
    layers = padLayerSize(layers, layout.length);

    const onKeyDown = (event) => {
        if (keyCapMode === keyEditStandard && event.key && eventKeyCodeToQMKKeyCode.has(event.code)) {
            currentLayer[selectedKey] = eventKeyCodeToQMKKeyCode.get(event.code);
            event.preventDefault();
            selectedKey = null;
        }
    };

    const onMouseUp = () => {
        selectedKey = null;
    };

</script>

<div class="columns"
     on:keydown={onKeyDown}
     on:mouseup={onMouseUp}
     tabindex="0"
     autofocus
>
    <div
        class="column keyboard is-narrow box"
        style="--kb_largest_x: {largest_x};--kb_largest_y: {largest_y}; --key_x_spacing: {key_x_spacing}px; --key_y_spacing: {key_y_spacing}px; --key_width: {key_width}px; --key_height: {key_height}px"
    >
        {#each layout as key, i}

            {#if keyEditStandard === keyCapMode}
                <Key {key} caption={currentLayer[i]} keyIndex={i} selected={i===selectedKey} on:selectedKey={handleSelectedKey}/>
            {:else if keyEditRaw === keyCapMode }
                <RawKey {key} caption={currentLayer[i]} keyIndex={i} selected={i===selectedKey} on:selectedKey={handleSelectedKey} on:updateCaption={handleUpdateCaption}/>
            {/if}
        {/each}
    </div>

    <div class="column control">
        <h4 class="is-size-3">Layers</h4>
        <div class="is-size-5">
            {#if layers.length >= max_layers}
                <button on:click={addLayer} disabled>Add layer</button>
            {:else}
                <button on:click={addLayer}>Add layer</button>
            {/if}

            {#if layers.length == 1}
                <button on:click={deleteLayer} disabled>Delete selected layer</button>
            {:else}
                <button on:click={deleteLayer }>Delete selected layer</button>
            {/if}

        </div>
        {#each layers as layer, i}
            {#if !isLayerEmpty(layer)}
                <label class="label-layer-select radio is-size-5">
                    <input
                        value={i}
                        on:change={changeLayer}
                        type="radio"
                        name="layer"
                        checked={currentLayerIndex === i ? "checked" : ""}
                    />
                    {i}
                </label>
            {:else}
                <label class="radio is-size-5">
                    <input type="radio" name="layer" disabled />
                    {i}
                </label>
            {/if}
        {/each}
    </div>
</div>
<div class="columns">
    <div class="column column control">
        <h4 class="is-size-4">Key edit mode</h4>
        <div class="column">
            <label class="label-key-type radio is-size-5">
                <input value={keyEditStandard} bind:group={keyCapMode} type="radio" name="keytype" checked="true">
                {keyEditStandard}
            </label>
            <label class="radio is-size-5">
                <input value={keyEditRaw} bind:group={keyCapMode} type="radio" name="keytype">
                {keyEditRaw}
            </label>
        </div>
    </div>
</div>
<style>
    .columns {
        outline: none;
    }
    button {
        margin: 5px;
    }
    label.radio {
        margin-left: 0.5em;
    }
    .label-layer-select {
        display: block;
    }
    .keyboard {
        height: calc((var(--kb_largest_y) + 0.2) * var(--key_y_spacing));
        width: calc((var(--kb_largest_x) + 0.2) * var(--key_x_spacing));

        background: #fff;
        border-color: #fff;
        /*box-shadow: 0 0 3px #0000004d;*/

        /*border-radius: 5px;*/
        position: relative;
        /*border-bottom-style: solid;*/
        /*border-bottom-width: 5px;*/
        /*border-left-style: solid;*/
        /*border-left-width: 5px;*/
        /*border-right-style: solid;*/
        /*border-right-width: 5px;*/
        /*border-top-style: solid;*/
        /*border-top-width: 5px;*/
    }
</style>
