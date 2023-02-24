<script>
    import {createEventDispatcher} from "svelte";
    import Keycap from "./Keycap.svelte"
    import {QKToDescription} from "../lib/qk-keycode-caption.js";

    const eventDispatcher = createEventDispatcher();

    export let key;
    export let caption;
    export let keyIndex;
    export let selected;

    const forwardEvent = (eventMessage) => {
            return (event) => {
                    eventDispatcher(eventMessage, event.detail);
            }
    }

    $: captionDescription = QKToDescription.has(caption) ? QKToDescription.get(caption) : null;
</script>
<div
        class="key-position"
        style="--key_x:{key.x}; --key_y:{key.y}; --key_w:{key.w?key.w:1}; --key_h:{key.h?key.h:1};">
        <Keycap {caption} {keyIndex} {selected}
                on:selectedKey={forwardEvent("selectedKey")}
                on:updateCaption={forwardEvent("updateCaption")}
                on:editCompositeKey={forwardEvent("editCompositeKey")}
        />
</div>
<div
        class="key-info-popup notification message is-info is-size-7"
        style="--key_x:{key.x}; --key_y:{key.y}; --key_w:{key.w?key.w:1}; --key_h:{key.h?key.h:1};">
        <div class="key-info-message message-body">
                <h6 class="is-size-6">
                        {caption}
                </h6>
                {#if captionDescription}
                        {captionDescription}
                {/if}
        </div>
</div>

<style>
    .key-position {
        top: calc(var(--key_y)*var(--key_y_spacing)*1px);
        left: calc(var(--key_x)*var(--key_x_spacing)*1px);
        width: calc(var(--key_w)*var(--key_width)*1px);
        height: calc(var(--key_h)*var(--key_height)*1px);
        position: absolute;
    }
    .key-info-popup {
            display: none;
            position: absolute;
            padding: 5px;
            top: calc((var(--key_y)*var(--key_y_spacing)) * 1px);
            left: calc((var(--key_x)*var(--key_x_spacing) * 1px) + (var(--key_w)*var(--key_width)) * 1px);
            z-index: 2000;
    }
    .key-info-message {
            padding: 1em 1.25em;
            margin: 0 0;
    }

    @keyframes fadeTooltip {
            0%   { opacity: 0; }
            30%   { opacity: 0; }
            100% { opacity: 1; }
    }
    .key-position:hover + .key-info-popup {
            display: block;
            opacity: 1;
            animation: fadeTooltip 1s ease-in-out;
    }
</style>

