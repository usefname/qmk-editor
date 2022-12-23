<script>
    import {invoke} from '@tauri-apps/api/tauri';
    import {onMount} from 'svelte';
    import { createEventDispatcher } from 'svelte';

    const eventDispatcher = createEventDispatcher();

    let validKeyboard = false;

    let keyboardList = [];
    let selectedKeyboard = null;

    let keymapList = [];
    let selectedKeymap = null;

    onMount(async () => {
        try {
            keyboardList = await invoke('list_keyboards');
        } catch (err) {
            eventDispatcher('QMKError', {output: err});
        }
    })

    async function import_keyboard_layout(keyboard, layout)  {
        const loadedKeyboard = await invoke('import_keyboard', { keyboard: "ergodox_ez" });
        if (Object.keys(loadedKeyboard).length <= 0) {
            eventDispatcher('QMKError', {output: 'keyboard is missing layouts'});
            return;
        }
        const current_layout = Object.keys(loadedKeyboard.layouts)[0];
        return current_layout;
    }


    async function loadKeymaps(kb) {
        try {
            keymapList = await invoke('list_keymaps', {keyboard: kb});
            validKeyboard = true;
        } catch (err) {
            eventDispatcher("QMKError", {output: err});
        }
    }

    function changeEvent(event) {
        const new_kb = event.target.value;
        if (keyboardList.indexOf(new_kb) != -1) {
            selectedKeyboard = new_kb;
            loadKeymaps(new_kb);
        } else {
            selectedKeyboard = null;
            keymapList = [];
            selectedKeymap = null;
        }
    }

    async function dispatchLoadKeyboard() {
        if (validKeyboard) {
            // const layout = await import_keyboard_layout(selectedKeyboard, selectedKeymap);
            eventDispatcher("loadKeyboard", {keyboardName: selectedKeyboard});
        }
    }
</script>

<main>
    <div class="columns">
        <div class="column is-three-fifths">
            <input class="input" type="search" bind:value={selectedKeyboard} on:change={changeEvent} list="keyboard-list" id="keyboard-choice" name="keyboard-choice" />
            <datalist id="keyboard-list">
                {#each keyboardList as keyboard}
                    <option value="{keyboard}" />
                {/each}
            </datalist>
        </div>
        <div class="column is-narrow">
            <div class="select">
                <select>
                    {#each keymapList as keymap}
                        <option>{keymap}</option>
                    {/each}
                </select>
            </div>
        </div>
        <div class="column is-narrow">
            <button class="button is-primary" on:click={dispatchLoadKeyboard} disabled={!validKeyboard}>Load keyboard</button>
        </div>
    </div>
</main>