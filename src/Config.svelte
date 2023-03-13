<script>
    import {invoke} from '@tauri-apps/api/tauri';
    import {open} from '@tauri-apps/api/dialog';
    import {onMount} from 'svelte';
    import {createEventDispatcher} from 'svelte';

    const eventDispatcher = createEventDispatcher();

    export let requireUpdate = false;
    let qmkPath;
    let isQmkPathValid;
    let keymapPath;
    let isKeymapPathValid;
    let originalConfig;

    onMount(async () => {
        await load_config();
    });

    const load_config = async () => {
        try {
            originalConfig = await invoke('get_config');
            qmkPath = originalConfig.qmk_path ? originalConfig.qmk_path : "";
            await validateQmkPath();
            keymapPath = originalConfig.generated_keymap;
            validateKeyMapDir();
        } catch (err) {
            eventDispatcher('QMKError', {output: err});
        }
    };

    const validateQmkPath = async () => {
        isQmkPathValid = qmkPath ? await invoke('validate_qmk_path', {qmkPath: qmkPath}) : false;
    };

    const validateKeyMapDir = () => {
        return isKeymapPathValid = keymapPath ? keymapPath.length > 0 : false;
    };

    const is_config_valid = () => {
        return validateQmkPath() && validateKeyMapDir();
    };

    const on_keymap_dir_changed = () => {
        validateKeyMapDir();
    };

    const saveConfig = async (event) => {
        try {
            if (is_config_valid()) {
                await invoke('save_config', {newConfig: {qmk_path: qmkPath, generated_keymap: keymapPath}});
                eventDispatcher('exitConfig');
            }
        } catch (err) {
            eventDispatcher('QMKError', {output: err});
        }
    };
    const exitConfig = async (event) => {
        if (!requireUpdate) {
            eventDispatcher('exitConfig');
        }
    };

    const openFilePicker = async (event) => {
        const selected = await open({
            directory: true,
        });
        if (selected !== null) {
            qmkPath = selected;
            await validateQmkPath();
        }
    };
</script>
<div class="is-flex is-flex-direction-column is-align-items-center is-justify-content-center">
    <div class="settings">
        <h5 class="is-size-5">Path to your <a
                href="https://qmk.github.io/qmk_mkdocs/master/en/tutorial_getting_started/">qmk firmware
            installation</a>.</h5>
        <div class="field is-horizontal">
            <div class="field-body control">
                <input class:is-danger={!isQmkPathValid} class="input" type="text" bind:value={qmkPath}
                       on:change={validateQmkPath}
                />
                <button class="ml-4 button is-primary" on:click={openFilePicker}>Select folder
                </button>
            </div>
        </div>
    </div>
    <div class="settings">
        <h5 class="is-size-5">Keymap directory</h5>
        <div class="field is-horizontal">
            <div class="field-body">
                <input class:is-danger={!isKeymapPathValid} class="input" type="text" bind:value={keymapPath} on:change={on_keymap_dir_changed}/>
            </div>
        </div>
    </div>
    <div class="settings">
        <button disabled={!is_config_valid} class="ml-4 button is-primary"
                on:click={saveConfig}
        >Save
        </button>
        {#if !requireUpdate}
            <button disabled={!isKeymapPathValid} class="ml-4 button is-primary"
                    on:click={exitConfig}>Discard changes
            </button>
        {/if}
    </div>
</div>
<style>
    .settings {
        margin-top: 2em;
        width: 40rem;
    }
</style>
