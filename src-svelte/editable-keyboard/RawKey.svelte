<script>
    import {createEventDispatcher} from "svelte";
    import {parseCaption} from "../lib/key-info";

    const eventDispatcher = createEventDispatcher();

    export let caption;
    export let keyIndex = -1;
    export let selected = false;

    $: capInfo = parseCaption(caption);
    $: calculatedColor = capInfo.emptyKey ? "#999" : "#0a2040";
    $: calculatedBackgroundColor = capInfo.emptyKey ? "#eee" : "#dad4c4";

    let captionField = caption;
    const dispatchSelectedKey = (event) => {
        event.stopImmediatePropagation();
        event.preventDefault();
        captionField = caption;
        if (selected === false) {
            eventDispatcher("selectedKey", {key: keyIndex});
        } else {
            eventDispatcher("selectedKey", {key: null});
        }
    }

    const deselectKey = (event) => {
        event.stopImmediatePropagation();
        event.preventDefault();
        eventDispatcher("selectedKey", {key: null});
        captionField = caption;
    }

    const updateCaption = (newCaption) => {
        eventDispatcher("updateCaption", {key: keyIndex, caption: newCaption});
        eventDispatcher("selectedKey", {key: null});
    }

    const onSave = (event) => {
        event.stopPropagation();
        event.preventDefault();
        updateCaption(captionField);
    }

    const onKeyUp = (event) => {
        if (event.key === "Enter") {
            event.stopPropagation();
            event.preventDefault();
            updateCaption(event.target.value);
        }
    }

</script>

<div
        class="key"
        class:key-selected={selected}
        class:key-not-selected={!selected}
     on:click={dispatchSelectedKey}
>
    {#if selected}
        <div class="modal is-active"
        on:click={(e) => {e.stopPropagation(); e.preventDefault();}}>
            <div class="modal-card">
                <header class="modal-card-head">
                    <p class="modal-card-title">Edit key</p>
                    <button class="delete" aria-label="close" on:click={deselectKey}></button>
                </header>
                <section class="modal-card-body">
                    <input class="key-input" type="text" bind:value={captionField} on:keyup={onKeyUp} autofocus/>
                </section>
                <footer class="modal-card-foot">
                    <button class="button is-success" on:click={onSave}>Save</button>
                    <button class="button" on:click={deselectKey}>Cancel</button>
                </footer>
            </div>
        </div>
    {:else}
        {caption}
    {/if}
</div>

<style>
    .key {
        font-size: x-small;
        line-break: anywhere;

        width: calc(var(--key_w) * var(--key_width) * 1px);
        height: calc(var(--key_h) * var(--key_height) * 1px);
        position: relative;
        background-color: var(--key-noop-background-color);

        display: inline-block;
        box-sizing: border-box;
        cursor: pointer;
        padding: 1px 1px 3px;
        line-height: 1.3rem;

        font-family: 'Montserrat', sans-serif;
        box-shadow: 0px -1px 0px 3px inset rgba(0, 0, 0, 0.1),
        0px 0px 0px 1px rgba(0, 0, 0, 0.3);
        text-align: center;
    }
    .key-selected {
        border-radius: 6px;
        border-style: solid;

        border-color: var(--color5);
    }

    .key-not-selected {
        border-radius: 6px;
        border-left: 1px solid rgba(0, 0, 0, 0.1);
        border-right: 1px solid rgba(0, 0, 0, 0.1);
    }

    .key-input {
        /*width: 30px;*/
        /*height: 25px;*/
        /*background-color: white;*/
        border-radius: 2px;
        border: 1px solid;
        margin: 0 auto;
        padding: 1px;
        text-align: center;
        z-index: 1000;
    }
</style>
