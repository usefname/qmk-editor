<script>
    import {keyEditRaw, keyEditStandard} from "./keymapWorkspace";
    export let keycapMode;
</script>

<div>
    <div>
        <h4 class="is-size-3">Key edit mode</h4>
        <div class="column">
            <label class="radio is-size-4">
                <input value={keyEditStandard} bind:group={keycapMode} type="radio" name="keytype" checked="true">
                {keyEditStandard}
            </label>
            <label class="radio is-size-4">
                <input value={keyEditRaw} bind:group={keycapMode} type="radio" name="keytype">
                {keyEditRaw}
            </label>
        </div>
    </div>
</div>

