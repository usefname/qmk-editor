<script>
    import {invoke} from '@tauri-apps/api/tauri';
    import {createEventDispatcher} from 'svelte';
    import {listen} from "@tauri-apps/api/event";

    const eventDispatcher = createEventDispatcher();

    export let keyboardName;
    export let layoutName;
    export let keymap;

    export let build = false;

    let keymapCreated = false;

    let buildOutputListener = null;
    let buildStatusListener = null;
    let textarea;
    let buildCommand = "...";
    const startBuild = async (started) => {
        buildInProgress = started;
        if (started) {
            buildOutputListener = await listen('build_output', (event) => {
                buildLog += event.payload;
                textarea.scrollTop = textarea.scrollHeight;
            });
            buildStatusListener = await listen('build_finished', (event) => {
               let status = event.payload == "true";
               buildSuccess = status;
               buildInProgress = false;
                textarea.scrollTop = textarea.scrollHeight;
            });
        }
    }

    $: startBuild(build)

    let buildInProgress = false;
    let buildLog = "";
    let buildSuccess = false;
    let keymapFailed = false;
    let qmkPath;
    let keymapPath;
    let config;

    $: buildButtonText = buildInProgress ? "Cancel" : "Back";

    const exitBuild = async (event) => {
        if (!buildInProgress) {
            eventDispatcher('exitBuild');
        } else {
            invoke('stop_flash').then((result) => {
                    buildInProgress = false;
                    buildSuccess = result;
                    if (buildOutputListener) {
                        buildOutputListener();
                    }
                    if (buildStatusListener) {
                        buildStatusListener();
                    }
                    textarea.scrollTop = textarea.scrollHeight;
            },
                (err) => {
                    keymapFailed = true;
                    eventDispatcher('QMKError', {output: err});
                });

        }
    };

    const load_config = async () => {
        invoke('get_config').then((loadedConfig) => {
                config = loadedConfig;
                qmkPath = config.qmk_path ? config.qmk_path : "";
                keymapPath = config.generated_keymap;
                keymapCreated = true;
            },
            (err) => {
                keymapFailed = true;
                eventDispatcher('QMKError', {output: err});
            })

    };

    const generateKeymap = async (keymap) => {
        try {
            await invoke('generate_keymap', {
                keymapDescription: {
                    keyboard_name: keyboardName,
                    layout_name: layoutName,
                    keymap: keymap
                }
            })
        } catch (err) {
            keymapFailed = true;
            eventDispatcher('QMKError', {output: err});
        }
    }

    load_config();
    invoke('start_flash', {keyboard: keyboardName}).then((flash_result) => {
       buildInProgress = true;
       buildCommand = flash_result;
    }).catch((err) => {
        eventDispatcher('QMKError', {output: err});
    });

</script>
<div class="settings is-flex is-flex-direction-column is-align-items-center is-justify-content-center">
    <div class="build-section">
        <h5 class="is-size-5">Writing keymap: </h5>
        <div class="field is-horizontal">
            <div class="field-body control">
                <input class:is-danger={keymapFailed} class:is-primary={keymapCreated} class="input" type="text" value={qmkPath + "/keyboards/" + keymapPath}/>
            </div>
        </div>
    </div>
    <div class="build-section">
        <h5 class="is-size-5">{buildCommand}</h5>
        <div class="field is-horizontal">
            <div class="field-body">
                <textarea bind:this={textarea} class:is-danger={!buildInProgress && !buildSuccess} class:is-primary={!buildInProgress && buildSuccess} class="textarea" type="text" >{buildLog}</textarea>
            </div>
        </div>
    </div>
    <div class="build-section">
        <!--{#if !buildInProgress}-->
            <button class="ml-4 button is-primary"
                    on:click={exitBuild}>{buildButtonText}
            </button>
        <!--{/if}-->
    </div>
</div>
<style>
    textarea {
        height: 30rem;
    }
    .settings {
        margin-top: 6rem;
    }
    .build-section {
        margin-top: 2rem;
    }
    .field {
        width: 40rem;
    }
</style>
