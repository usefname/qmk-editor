<script>
    import {createEventDispatcher} from "svelte";
    import {
        replaceArgsInMultiCaption,
        parseCaption,
    } from "../lib/key-info";

    const eventDispatcher = createEventDispatcher();

    export let caption;
    export let keyIndex = -1;
    export let selected = false;
    export let popupDescription = false;

    $: capInfo = parseCaption(caption);
    $: dropHover = false;

    const updateCaption = (arg) => {
        caption = replaceArgsInMultiCaption(caption, arg);
    };

    const dispatchSelectedKey = (event) => {
        event.stopImmediatePropagation();
        event.preventDefault();
        if (selected === false) {
            if (capInfo.multiKey) {
                eventDispatcher("editCompositeKey", {key: keyIndex});
            } else {
                eventDispatcher("selectedKey", {key: keyIndex});
            }
        } else {
            eventDispatcher("selectedKey", {key: null});
        }
    }

    const onDragStart = (event) => {
        event.dataTransfer.setData("text/plain", caption);
        event.dataTransfer.setData("_qmk/source", "keycap");
        event.dataTransfer.setData("_qmk/sourceIndex", keyIndex);
        if (event.ctrlKey) {
            event.dataTransfer.setData("_qmk/effect", "copy");
            event.dataTransfer.dropEffect = "copy";
        } else {
            event.dataTransfer.setData("_qmk/effect", "swap");
        }
    };

    const dndUpdateCaption = (event) => {
        let data = event.dataTransfer.getData("text/plain");
        if (data.length > 0 && data.length < 1024) {
            let type = event.dataTransfer.getData("_qmk/effect");
            let sourceKeyIndex = event.dataTransfer.getData("_qmk/sourceIndex");
            if (type === "swap" && !isNaN(sourceKeyIndex)) {
                eventDispatcher("updateCaption", {key: sourceKeyIndex, caption: caption});
                eventDispatcher("updateCaption", {key: keyIndex, caption: data});
            } else {
                if (capInfo.multiKey) {
                    eventDispatcher("updateCaptionMultiKey", {key: keyIndex, caption: data});
                } else {
                    eventDispatcher("updateCaption", {key: keyIndex, caption: data});
                }
            }
        }
        dropHover = false;
        selected = false;
    }

    const onDrop = (event) => {
        event.stopPropagation();
        event.preventDefault();
        dndUpdateCaption(event);
    };

    const onDragEnter = (event) => {
        event.stopPropagation();
        event.preventDefault();
        dropHover = true;
    };
    const onDragOver = (event) => {
        event.stopPropagation();
        event.preventDefault();
    };
    const onDragLeave = (event) => {
        event.preventDefault();
        dropHover = false;
    };

    const unicodeRegex = /[^\u0000-\u00ff]/;
</script>
<div>
    <div
            class="key"
            class:key-not-selected={selected === false && dropHover === false}
            class:key-drop-hover={dropHover}
            class:key-selected={selected}

            class:key-with-caption={!capInfo.emptyKey}
            class:key-without-caption={capInfo.emptyKey}

            class:key-small-caption={capInfo.label.base.length > 3 || capInfo.label.split}
            class:key-large-caption={capInfo.label.base.length <= 3 && !capInfo.label.split}
            on:click={dispatchSelectedKey}
            on:dragstart={onDragStart}
            on:drop={onDrop}
            on:dragenter={onDragEnter}
            on:dragover={onDragOver}
            on:dragleave={onDragLeave}
            draggable="true"
    >
        <div
                class:key-caption-single-letter={capInfo.label.base.length === 1}
                class:key-caption={capInfo.label.base.length !== 1}
        >
            {#if capInfo.label.split}
                <div class="outer-key"
                     class:key-nowrap={capInfo.label.base.length < 6}
                >
                    {capInfo.label.base}
                </div>
                <div class="inner-key">
                    {capInfo.label.inner}
                </div>
            {:else }
                <div class="inner-key"
                     class:key-nowrap={capInfo.label.base.length < 6}
                     class:inner-key-emoji={unicodeRegex.test(capInfo.label.base)}>
                    {capInfo.label.base}
                </div>
            {/if}
        </div>

    </div>
    {#if popupDescription && dropHover === false}
        <div
                class="key-info-popup notification message is-info is-size-7 description">
            <div class="key-info-message message-body description">
                <h6 class="is-size-6">
                    {caption}
                </h6>
                {#if capInfo.label.description}
                    <div class="description">
                        {capInfo.label.description}
                    </div>
                {/if}
            </div>
        </div>
    {/if}
</div>
<style>
    .description {
        width: 20em;
    }

    .key-info-popup {
        display: none;
        position: relative;
        padding: 5px;
        left: calc(var(--key_w) * var(--key_width) * 1px + 30px);
        top: calc(-1 * (var(--key_y_spacing)) * 1px);
        z-index: 2000;
    }

    .key-info-message {
        padding: 1em 1.25em;
        margin: 0 0;
    }

    @keyframes fadeTooltip {
        0% {
            opacity: 0;
        }
        30% {
            opacity: 0;
        }
        100% {
            opacity: 1;
        }
    }

    /*.key:hover + .key-info-popup {*/
    /*    display: block;*/
    /*    opacity: 1;*/
    /*    animation: fadeTooltip 1s ease-in-out;*/
    /*}*/

    .key-nowrap {
        white-space: nowrap;
    }

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
        width: calc(var(--key_w) * var(--key_width) * 1px);
        height: calc(var(--key_h) * var(--key_height) * 1px);
        position: relative;

        display: inline-block;
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
