<script>
    import {createEventDispatcher} from "svelte";
    import {captionToLabel, getComposedKeyInnerCaption, isComposedKey, hasNoKey} from "../lib/key-info";
    import {QKToDescription} from "../lib/qk-keycode-caption"

    const eventDispatcher = createEventDispatcher();

    export let caption;
    export let keyIndex = -1;
    export let selected = false;

    $: captionDescription = QKToDescription.has(caption) ? QKToDescription.get(caption) : null;
    $: calculatedCaption = captionToLabel(caption);
    $: calculatedIsComposedKey = isComposedKey(caption);
    $: calculatedInnerCaption = getComposedKeyInnerCaption(caption);
    $: calculatedHasKey = !hasNoKey(caption);
    $: dropHover = false;

    let dispatchSelectedKey = (event) => {
        event.stopImmediatePropagation();
        event.preventDefault();
        if (selected === false) {
            eventDispatcher("selectedKey", {key: keyIndex});
        } else {
            eventDispatcher("selectedKey", {key: null});
        }
    }

    const onDragStart = (event) => {
        event.dataTransfer.setData("text/plain", caption);
        event.dataTransfer.setData("_qmk/effect", "swap");
        event.dataTransfer.setData("_qmk/source", "keycap");
        event.dataTransfer.setData("_qmk/sourceIndex", keyIndex);
    };

    const onDrop = (event) => {
        let data = event.dataTransfer.getData("text/plain");
        if (data.length > 0 && data.length < 1024) {
            let type = event.dataTransfer.getData("_qmk/effect");
            let sourceKeyIndex = event.dataTransfer.getData("_qmk/sourceIndex");
            if (type === "swap" && !isNaN(sourceKeyIndex)) {
                eventDispatcher("updateCaption", {key: sourceKeyIndex, caption: caption});
            }
            eventDispatcher("updateCaption", {key: keyIndex, caption: data});
        }
        dropHover = false;
        selected = false;
        event.preventDefault();
    };

    const onDragEnter = (event) => {
        event.dataTransfer.dropEffect = "copy";
        dropHover = true;
        event.preventDefault();
    };
    const onDragOver = (event) => {
        event.dataTransfer.dropEffect = "copy";
        dropHover = true;
        event.preventDefault();
    };
    const onDragLeave = (event) => {
        dropHover = false;
        event.preventDefault();
    };

    const unicodeRegex =/[^\u0000-\u00ff]/;
</script>
<div
        class="key"
        class:key-not-selected={selected === false && dropHover === false}
        class:key-drop-hover={dropHover}
        class:key-selected={selected}
        class:key-with-caption={calculatedHasKey}
        class:key-without-caption={!calculatedHasKey}
        class:key-small-caption={calculatedCaption.length > 3}
        class:key-large-caption={calculatedCaption.length <= 3}
        on:mouseup={dispatchSelectedKey}
        on:dragstart={onDragStart}
        on:drop={onDrop}
        on:dragenter={onDragEnter}
        on:dragover={onDragOver}
        on:dragleave={onDragLeave}
        draggable="true"
>
    <div
            class:key-caption-single-letter={calculatedCaption.length === 1}
            class:key-caption={calculatedCaption.length !== 1}
    >
        {#if calculatedIsComposedKey}
            <div class="outer-key">
                {calculatedCaption}
            </div>
            <div class="inner-key">
                {calculatedInnerCaption}
            </div>
        {:else }
            <div class="inner-key"
            class:inner-key-emoji={unicodeRegex.test(calculatedCaption)}>
                {calculatedCaption}
            </div>
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

    .key-drop-hover {
        border-radius: 6px;
        border-style: solid;

        border-color: var(--color4);
    }

    .key-not-selected {
        border-radius: 6px;
        border-left: 1px solid rgba(0, 0, 0, 0.1);
        border-right: 1px solid rgba(0, 0, 0, 0.1);
    }

    .key-not-selected:hover {
        border-style: solid;
        border-width: thin;
        border-color: var(--color3);
    }

    .key {
        width: calc(var(--key_w)*var(--key_width)*1px);
        height: calc(var(--key_h)*var(--key_height)*1px);
        position: relative;

        box-sizing: border-box;
        white-space: pre-line;
        cursor: pointer;
        padding: 1px 1px 3px;
        line-height: 1.3rem;

        font-family: 'Montserrat', sans-serif;
        box-shadow: 0px -1px 0px 3px inset rgba(0, 0, 0, 0.1),
        0px 0px 0px 1px rgba(0, 0, 0, 0.3);
        text-align: center;
    }

    @font-face {
        font-family: 'notoemoji';
        src: url('/notoemoji.ttf');
    }

    .key-caption-single-letter {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
    }
    .key-caption {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-60%, -50%);
    }

    .inner-key {
        text-align: center;
        width: 30px;
    }

    .inner-key-emoji {
        font-family: notoemoji;
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

