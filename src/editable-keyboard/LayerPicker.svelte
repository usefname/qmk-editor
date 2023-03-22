<script>
    import {insertEmptyLayer} from "../lib/layers";

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
        return false;
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

<div class="is-flex is-flex-direction-column layers">
    <div class="is-size-3"> Layer</div>
    <div class="mt-1">
        {#if keymap.length >= maxLayers}
            <button class="button is-primary is-light is-size-7" on:click={addLayer} disabled>Add</button>
        {:else}
            <button class="button is-primary is-light is-size-7" on:click={addLayer}>Add</button>
        {/if}

        {#if keymap.length == 1}
            <button class="button is-primary is-light is-size-7" on:click={deleteLayer} disabled>Delete</button>
        {:else}
            <button class="button is-primary is-light is-size-7" on:click={deleteLayer }>Delete</button>
        {/if}
    </div>
    <div class="mt-4">
        <nav class="pagination is-small is-flex-direction-row" role="navigation" aria-label="pagination">
            <ul class="pagination-list">
                {#each keymap as layer, i}
                    {#if currentLayerIndex === i}
                        <li><a class="pagination-link is-current" target="_blank" on:click={() => changeLayer(i)}>{i}</a></li>
                    {:else}
                        <li><a class="pagination-link" target="_blank" on:click={() => changeLayer(i)}>{i}</a></li>
                    {/if}
                {/each}
            </ul>
        </nav>
    </div>
</div>
<style>
    .layers {
        width: 220px;
    }
</style>
