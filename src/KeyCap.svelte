<script>
    import {createEventDispatcher, tick} from "svelte";

    export let caption;
    export let key;
    export let keyIndex;
    export let selected = false;

    const eventDispatcher = createEventDispatcher();

    function isEmpty(caption) {return caption === "KC_NO"}
    function isNormalKey(caption) {return caption.substring(0,3) === "KC_"}
    function isComposedKey(caption) {return caption.indexOf('(') > 0}
    function getComposedKeyCaption(caption) {return caption.substring(0, caption.indexOf('('))}
    function captionToLabel(caption) {
        if (isEmpty(caption)) {
            return "N/A";
        } else if (isNormalKey(caption)) {
            return caption.substring(3);
        } else if (isComposedKey(caption)) {
            return getComposedKeyCaption(caption);
        }
        else {
            return caption;
        }
    }

    function dispatchSelectedKey() {
        let selectedValue = selected ? null : keyIndex;
        eventDispatcher("selectedKey", {key: selectedValue});
    }


$: calculatedCaption = captionToLabel(caption);
    $: calculatedColor = isEmpty(caption) ? "#999" : "#0a2040";
    $: calculatedBackgroundColor = isEmpty(caption) ? "#eee" : "#dad4c4";
    $: calculatedIsComposedKey = isComposedKey(caption);


</script>

<div
        class="key"
        class:key-normal={selected === false}
        class:key-selected={selected}
        on:click={dispatchSelectedKey}
        style="--key_x:{key.x}; --key_y:{key.y}; --key_w:{key.w?key.w:1}; --key_h:{key.h?key.h:1};background: {calculatedBackgroundColor}; color: {calculatedColor}">
    {#if calculatedIsComposedKey}
        <div class="composed-key">
            {calculatedCaption}
            <div>
                <input class="inner-key" type="text" style="background: {calculatedBackgroundColor}; color: {calculatedColor}"/>
            </div>
        </div>
    {:else }
        {calculatedCaption}
    {/if}
</div>

<style>
    .key-selected {
        border-radius: 6px;
        border-style: solid;
        border-color: #00a4a7;
    }

    .key-normal {
        border-radius: 6px;
        border-left: 1px solid rgba(0, 0, 0, 0.1);
        border-right: 1px solid rgba(0, 0, 0, 0.1);
    }

    .key {
        top: calc(var(--key_y)*var(--key_y_spacing));
        left: calc(var(--key_x)*var(--key_x_spacing));
        width: calc(var(--key_w)*var(--key_width));
        height: calc(var(--key_h)*var(--key_height));
        display: flex;
        justify-content: space-around;
        -webkit-box-align: center;
        align-items: center;
        text-align: center;
        position: absolute;
        box-sizing: border-box;
        white-space: pre-line;
        cursor: pointer;
        padding: 1px 1px 3px;

        font-family: 'Montserrat', sans-serif;
        box-shadow: 0px -1px 0px 3px inset rgba(0, 0, 0, 0.1),
        0px 0px 0px 1px rgba(0, 0, 0, 0.3);

    }
    .composed-key{}
    .inner-key {
        width: 30px;
        height: 25px;

        border-radius: 2px;
        border: 1px solid;
        margin: 0 auto;
        padding: 1px;
        text-align: center;
    }
</style>
