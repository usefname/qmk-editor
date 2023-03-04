<script>
    import {allBasicCaptions, BASIC_ARG, LAYER_ARG} from "@/lib/key-info.js";

    export let keyDesc;
    export let layerCount;
    export let currentLayerIndex;
</script>
<div class="box is-flex is-flex-direction-column">
    {#each keyDesc.args as arg}
        {#if arg.type === BASIC_ARG}
            <div class="is-flex">
                <h2 class="mr-3 subtitle is-justify-content-center is-align-items-center">
                    Keycode</h2>
                <div class="ml-3 select is-small">
                    <select bind:value={arg.value}>
                        {#each Object.entries(allBasicCaptions()) as [label, keycode]}
                            <option value={keycode}>{label} ({keycode})</option>
                        {/each}
                    </select>
                </div>
            </div>
        {:else if arg.type === LAYER_ARG}
            <div class="is-flex">
                <h2 class="mr-3 subtitle is-justify-content-center is-align-items-center">
                    Layer</h2>
                <div class="ml-3 select is-small">
                    <select bind:value={arg.value}>
                        {#each [...Array(layerCount).keys()] as layerIndex}
                            {#if layerIndex !== currentLayerIndex}
                                <option value={layerIndex.toString()}>{layerIndex}</option>
                            {/if}
                        {/each}
                    </select>

                </div>
            </div>
        {/if}
    {/each}
</div>
