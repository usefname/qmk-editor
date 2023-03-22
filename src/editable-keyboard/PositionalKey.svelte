<script>
    import {createEventDispatcher} from "svelte";
    import Keycap from "./Keycap.svelte"
    import {parseCaption} from "@/lib/key-info.js";

    const eventDispatcher = createEventDispatcher();

    export let key;
    export let caption;
    export let keyIndex;
    export let selected;
    export let popupDescription = false;

    $: capInfo = parseCaption(caption);

    const forwardEvent = (eventMessage) => {
            return (event) => {
                    eventDispatcher(eventMessage, event.detail);
            }
    }
</script>
<div
        class="key-position"
        style="--key_x:{key.x}; --key_y:{key.y}; --key_w:{key.w?key.w:1}; --key_h:{key.h?key.h:1};">
        <Keycap {caption} {keyIndex} {selected} popupDescription={popupDescription}
                on:selectedKey={forwardEvent("selectedKey")}
                on:updateCaption={forwardEvent("updateCaption")}
                on:editCompositeKey={forwardEvent("editCompositeKey")}
        />
</div>

<style>

    .key-position {
        top: calc(var(--key_y)*var(--key_y_spacing)*1px);
        left: calc(var(--key_x)*var(--key_x_spacing)*1px);
        width: calc(var(--key_w)*var(--key_width)*1px);
        height: calc(var(--key_h)*var(--key_height)*1px);
        position: absolute;
    }
</style>

