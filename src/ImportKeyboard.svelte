<script>
    import {invoke} from '@tauri-apps/api/tauri';
    import {onMount} from 'svelte';
    import {createEventDispatcher} from 'svelte';

    const eventDispatcher = createEventDispatcher();

    let keyboardList = [];
    let selectedKeyboard = null;
    let loadedKeyboard = null;

    let layoutList = [];
    let selectedLayout = null;

    onMount(async () => {
        try {
            keyboardList = await invoke('list_keyboards');
        } catch (err) {
            eventDispatcher('QMKError', {output: err});
        }
    })

    async function loadKeyboard(keyboardName) {
        try {
            loadedKeyboard = await invoke('import_keyboard', {keyboard: keyboardName});
            let layouts = Object.keys(loadedKeyboard.layouts);
            if (layouts.length <= 0) {
                eventDispatcher('QMKError', {output: 'keyboard is missing layouts'});
                return;
            }
            layoutList = layouts;
            selectedLayout = layoutList[0];
        } catch (err) {
            eventDispatcher('QMKError', {output: err});
        }
    }

    function selectedKeyboardEvent(event) {
        const new_kb = event.target.value;
        if (keyboardList.indexOf(new_kb) != -1) {
            selectedKeyboard = new_kb;
            loadKeyboard(new_kb);
        }
    }

    async function dispatchLoadKeyboard() {
        if (selectedKeyboard && selectedLayout) {
            eventDispatcher("loadKeyboard", {
                keyboardName: selectedKeyboard,
                layoutName: selectedLayout,
                layout: loadedKeyboard.layouts[selectedLayout].layout
            });
        }
    }
</script>

<div class="columns">
    <div class="column is-5">
        <label class="is-size-6" for="keyboard-choice">Keyboard</label><br>
        <input class="input" type="search" bind:value={selectedKeyboard} on:change={selectedKeyboardEvent}
               on:select={selectedKeyboardEvent}
               on:keyup={selectedKeyboardEvent}
               list="keyboard-list" id="keyboard-choice" name="keyboard-choice"/>
        <datalist id="keyboard-list">
            {#each keyboardList as keyboard}
                <option value="{keyboard}"/>
            {/each}
        </datalist>
    </div>
    <div class="column is-narrow">
        <label class="is-size-6" for="layout-choice">Layout</label><br>
        <div class="select" id="layout-choice">
            <select bind:value={selectedLayout}>
                {#each layoutList as layout}
                    <option>{layout}</option>
                {/each}
            </select>
        </div>
    </div>
    <div class="column is-narrow">
        <br>
        <button id="load-keyboard-button" class="button is-primary" on:click={dispatchLoadKeyboard}
                disabled={!selectedKeyboard || !selectedLayout}>Load keyboard
        </button>
    </div>
</div>
