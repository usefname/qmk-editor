<script>
    import {createEventDispatcher} from "svelte";
    import {captionToLabel, getComposedKeyInnerCaption, isComposedKey, hasNoKey} from "./lib/key-info";

    export let caption;
    export let key;
    export let keyIndex;
    export let selected = false;

    const eventDispatcher = createEventDispatcher();

    function dispatchSelectedKey() {
        let selectedValue = selected ? null : keyIndex;
        eventDispatcher("selectedKey", {key: selectedValue});
    }


$: calculatedCaption = captionToLabel(caption);
    $: calculatedIsComposedKey = isComposedKey(caption);
    $: calculatedInnerCaption = getComposedKeyInnerCaption(caption);
    $: calculatedHasKey = !hasNoKey(caption);
</script>

<div
        class="key"
        class:key-not-selected={selected === false}
        class:key-selected={selected}
        class:key-with-caption={calculatedHasKey}
        class:key-without-caption={!calculatedHasKey}
        class:key-small-caption={calculatedCaption.length > 3}
        class:key-large-caption={calculatedCaption.length <= 3}
        on:click={dispatchSelectedKey}
        style="--key_x:{key.x}; --key_y:{key.y}; --key_w:{key.w?key.w:1}; --key_h:{key.h?key.h:1};">
    <div class="key-caption">
        {#if calculatedIsComposedKey}
            <div class="outer-key">
                {calculatedCaption}
            </div>
            <div class="inner-key">
                {calculatedInnerCaption}
            </div>
        {:else }
            {calculatedCaption}
        {/if}
    </div>
</div>

<style>
    .key-small-caption {
        font-size: small;
    }

    .key-large-caption {
        font-size: larger;
    }

    .key-with-caption {
        color: var(--key-color);
        background-color: var(--key-background-color);
    }

    .key-without-caption {
        color: var(--key-noop-color);
        background-color: var(--key-noop-background-color);
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

    .key {
        top: calc(var(--key_y)*var(--key_y_spacing));
        left: calc(var(--key_x)*var(--key_x_spacing));
        width: calc(var(--key_w)*var(--key_width));
        height: calc(var(--key_h)*var(--key_height));
        position: absolute;

        box-sizing: border-box;
        white-space: pre-line;
        cursor: pointer;
        padding: 1px 1px 3px;
        line-height: 1.3rem;

        font-family: 'Montserrat', sans-serif;
        box-shadow: 0px -1px 0px 3px inset rgba(0, 0, 0, 0.1),
        0px 0px 0px 1px rgba(0, 0, 0, 0.3);
    }
    .key-caption {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
    }
    .inner-key {
        text-align: center;
    }
    .outer-key {
        width: 30px;
        height: 25px;

        border-radius: 1px;
        border: 1px solid;
        border-top: 0px;
        border-right: 0px;
        border-left: 0px;
        margin: 0 auto;
        padding: 1px;
        text-align: center;
        font-size: small;
        /*text-shadow: 1px 1px gray;*/
        /*text-shadow: 0px 0px 9px white;*/
        /*box-shadow: 0px 0px 0px 1px inset rgba(0, 0, 0, 0.1),*/
        /*0px 0px 0px 0px rgba(0, 0, 0, 0.3);*/

        /*text-shadow: 2px 2px 3px rgba(255,255,255,0.1);*/
    }
</style>
