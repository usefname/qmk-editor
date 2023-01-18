<script>
    import {keyEditRaw, keyEditStandard} from "./keymapWorkspace";
    export let keycapMode;
</script>

<div>
    <div>
        <h4 class="is-size-4">Key edit mode</h4>
        <div class="column">
            <label class="label-key-type radio is-size-5">
                <input value={keyEditStandard} bind:group={keycapMode} type="radio" name="keytype" checked="true">
                {keyEditStandard}
            </label>
            <label class="radio is-size-5">
                <input value={keyEditRaw} bind:group={keycapMode} type="radio" name="keytype">
                {keyEditRaw}
            </label>
        </div>
    </div>
</div>

<style>

</style>
