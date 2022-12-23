<script>
export let caption;
export let key;
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
$: calculatedCaption = captionToLabel(caption);
$: calculatedColor = isEmpty(caption) ? "#999" : "#0a2040";
$: calculatedBackgroundColor = isEmpty(caption) ? "#eee" : "#dad4c4";
$: calculatedIsComposedKey = isComposedKey(caption);
</script>

<div class="key" style="--key_x:{key.x}; --key_y:{key.y}; --key_w:{key.w?key.w:1}; --key_h:{key.h?key.h:1};background: {calculatedBackgroundColor}; color: {calculatedColor}">
    <!--{cap}-->
    {#if calculatedIsComposedKey}
        <div class="compsed-key">
            {calculatedCaption}
            <div>
            <input class="inner-key" type="text"/>
            </div>
        </div>
    {:else }
        {calculatedCaption}
    {/if}
</div>

<style>
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

        border-radius: 6px;
        font-family: 'Montserrat', sans-serif;
        box-shadow: 0px -1px 0px 3px inset rgba(0, 0, 0, 0.1),
        0px 0px 0px 1px rgba(0, 0, 0, 0.3);
        border-left: 1px solid rgba(0, 0, 0, 0.1);
        border-right: 1px solid rgba(0, 0, 0, 0.1);
    }
    .compsed-key {
    }
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
