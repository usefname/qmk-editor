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

<div class="layer-picker">
    <h4 class="is-size-3">Layers</h4>
    <div class="is-size-5">
        {#if keymap.length >= maxLayers}
            <button on:click={addLayer} disabled>Add layer</button>
        {:else}
            <button on:click={addLayer}>Add layer</button>
        {/if}

        {#if keymap.length == 1}
            <button on:click={deleteLayer} disabled>Delete selected layer</button>
        {:else}
            <button on:click={deleteLayer }>Delete selected layer</button>
        {/if}

    </div>
    {#each keymap as layer, i}
        {#if !isLayerEmpty(layer)}
            <label class="label-layer-select radio is-size-5">
                <input value={i} on:change={changeLayer} type="radio" name="layer" checked={currentLayerIndex === i ? "checked" : ""}/>{i}</label>
        {:else}<label class="radio is-size-5"><input type="radio" name="layer" disabled />{i}</label>{/if}
    {/each}
</div>
<style lang="scss">
  @use "../bulma-override.scss";

  .layer-picker {
    display: inline-block;
  }
  .layer-picker
  .layer-picker {
    display: inline-block;
  }
  label.radio {
    margin-left: 0.5em;
  }
  .label-layer-select {
    display: block;
  }
</style>
