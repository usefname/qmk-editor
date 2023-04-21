<script>
    import {keyEditText, keyEditInteractive} from "./keymapWorkspace";
    export let keycapMode;
</script>

<div>
    <div class="mt-5">
        <h4 class="is-size-3">Edit mode</h4>
        <div class="column">
            <label class="radio is-size-5">
                <input value={keyEditInteractive} bind:group={keycapMode} type="radio" name="keytype" checked="true">
                {keyEditInteractive}
            </label>
            <label class="radio is-size-5">
                <input value={keyEditText} bind:group={keycapMode} type="radio" name="keytype">
                {keyEditText}
            </label>
        </div>
    </div>
</div>

