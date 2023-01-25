<script>
    import {captionToLabel, getComposedKeyInnerCaption, isComposedKey, hasNoKey} from "../lib/key-info";
    import {QKToDescription} from "../lib/qk-keycode-caption"

    export let caption;

    $: captionDescription = QKToDescription.has(caption) ? QKToDescription.get(caption) : null;
    $: calculatedCaption = captionToLabel(caption);
    $: calculatedIsComposedKey = isComposedKey(caption);
    $: calculatedInnerCaption = getComposedKeyInnerCaption(caption);
    $: calculatedHasKey = !hasNoKey(caption);

</script>
<div
        class="key key-not-selected"
        class:key-with-caption={calculatedHasKey}
        class:key-without-caption={!calculatedHasKey}
        class:key-smallest-caption={calculatedCaption.length > 6}
        class:key-small-caption={calculatedCaption.length > 3 && calculatedCaption <= 6}
        class:key-large-caption={calculatedCaption.length <= 3}
>
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
    <div class="key-info-popup notification message is-info is-size-7">
        <div class="key-info-message message-body">
            <h6 class="is-size-6">
                {caption}
            </h6>
            {#if captionDescription}
                {captionDescription}
            {/if}
        </div>
    </div>
</div>

<style>
    .key-info-popup {
        display: none;
        position: absolute;
        padding: 5px;
        /*top: 25px;*/
        /*left: 100px;*/
        top: -75px;
        left: 50px;
        z-index: 2000;
    }
    .key-info-message {
        padding: 1em 1.25em;
    }

    @keyframes fadeTooltip {
        0%   { opacity: 0; }
        30%   { opacity: 0; }
        100% { opacity: 1; }
    }
    .key:hover > .key-info-popup {
        display: block;
        opacity: 1;
        animation: fadeTooltip 1s ease-in-out;
    }

    .key-smallest-caption {
        font-size: x-small;
    }

    .key-small-caption {
        font-size: small;
    }

    .key-large-caption {
        font-size: medium;
    }

    .key-with-caption {
        color: var(--key-color);
        background-color: var(--key-background-color);
    }

    .key-without-caption {
        color: var(--key-noop-color);
        background-color: var(--key-noop-background-color);
    }

    .key-not-selected {
        border-radius: 6px;
        border-left: 1px solid rgba(0, 0, 0, 0.1);
        border-right: 1px solid rgba(0, 0, 0, 0.1);
        margin: calc(var(--small_key_spacing) - 3px);
    }

    .key-not-selected:hover {
        border-style: solid;
        border-width: thin;
        border-color: var(--color3);
    }
    .key {
        height: calc(var(--small_key_width)*1px);
        width: calc(var(--small_key_height)*1px);
        position: relative;
        display: inline-grid;
        align-items: center;
        justify-content: center;

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
        justify-content: center;
        /*position: absolute;*/
        /*top: 50%;*/
        /*left: 50%;*/
        /*transform: translate(-50%, -50%);*/
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
    }
</style>
