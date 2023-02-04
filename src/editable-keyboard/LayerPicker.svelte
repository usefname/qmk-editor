<script>
    import {insertEmptyLayer, isLayerEmpty} from "../lib/layers";

    export let keymap;
    export let currentLayerIndex;
    export let maxLayers;
    export let layoutKeyCount;

    const changeLayer = (layerIndex) => currentLayerIndex = layerIndex;
    const addLayer = () => {
        if (keymap.length < maxLayers) {
            keymap = insertEmptyLayer(keymap, layoutKeyCount);
        }
        currentLayerIndex++;
    }
    const deleteLayer = () => {
        if (keymap.length > 1) {
            keymap.splice(currentLayerIndex, 1);
            keymap = keymap;

            if (currentLayerIndex > 0) {
                currentLayerIndex = currentLayerIndex - 1;
            }
        }
    }
</script>

<div class="">
    <h4 class="is-size-3">Layers</h4>
    <div class="is-size-4">
        {#if keymap.length >= maxLayers}
            <button class="button is-primary" on:click={addLayer} disabled>Add layer</button>
        {:else}
            <button class="button is-primary" on:click={addLayer}>Add layer</button>
        {/if}

        {#if keymap.length == 1}
            <button class="button is-primary" on:click={deleteLayer} disabled>Delete selected layer</button>
        {:else}
            <button class="button is-primary" on:click={deleteLayer }>Delete selected layer</button>
        {/if}

    </div>
    <div class="">
        {#each keymap as layer, i}
            {#if !isLayerEmpty(layer)}
                <label class="radio is-size-4 is-block ml-2">
                    <input value={i} on:change={changeLayer} type="radio" name="layer" checked={currentLayerIndex === i ? "checked" : ""}/> {i}</label>
            {:else}<label class="radio is-size-4 is-block"><input type="radio" name="layer" disabled />  {i}</label>{/if}
        {/each}
    </div>
</div>
