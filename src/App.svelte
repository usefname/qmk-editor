<script>
    import ImportKeyboard from "./ImportKeyboard.svelte";
    import KeymapWorkspace from "./editable-keyboard/KeymapWorkspace.svelte";
    import {invoke} from "@tauri-apps/api/tauri";
    import {open, save, confirm} from '@tauri-apps/api/dialog';
    import { appWindow } from "@tauri-apps/api/window";
    import {onMount} from "svelte";
    import Config from "@/Config.svelte";
    import {TauriEvent} from "@tauri-apps/api/event";

    let need_config_update = null;
    let qmk_error = false;
    let qmk_error_output = "QMK Error";

    let pageLoading = "loading";
    let pageWorkspace = "workspace";
    let pageBuild = "build";
    let pageSettings = "settings";


    let pageState = "";
    let editorState = {
        filename: null
    };

    $: keyboardName = "";
    $: layoutName = "";
    $: layout = [];
    $: keymap = [[]];
    $: dirty = false;

    appWindow.listen(TauriEvent.WINDOW_CLOSE_REQUESTED, () => {
        if (dirty) {
            confirm('Unsaved changes exist, exit anyway?', editorState.filename).then((result) => {
                if (result) {
                    appWindow.close();
                }
                },
                (error) => {
                    console.log(error)
                })
            return false;
        } else {
            appWindow.close();
        }
    })

    const handleLoadKeyboard = async (event) => {
        keyboardName = event.detail.keyboardName;
        layoutName = event.detail.layoutName;
        layout = event.detail.layout;
        keymap = [[]];
        for (let i = 0; i < layout.length; i++) {
            keymap[0].push("KC_NO");
        }
        await invoke('set_current_file', {filename: null});
        editorState.filename = null;
        updateTitle()
        pageState = pageWorkspace;
    }

    const handleQMKError = (event) => {
        qmk_error = true;
        qmk_error_output = event.detail.output;
    }

    const showLoadKeyboard = () => {
        pageState = pageLoading;
    }

    const showConfig = () => {
        pageState = pageSettings;
    }

    const showWorkspace = () => {
        if (keyboardName) {
            pageState = pageWorkspace;
        } else {
            showLoadKeyboard();
        }
    }

    const updateTitle = () => {
        let title = "QMK Editor";
        if (editorState.filename) {
            title += " - " + editorState.filename
        }
        appWindow.setTitle(title);
    }

    const onConfigSaved = (event) => {
        need_config_update = false;
        showWorkspace();
    }

    const onSaveAsKeymap = async (event) => {
        try {
            const selected = await save({
                title: "Save keymap",
                defaultPath: keyboardName + ".keymap",
                filters: [{
                    name: "keymap",
                    extensions: ["keymap"]
                }]
            });
            if (selected !== null) {
                await invoke('save_keymap', {
                    filename: selected,
                    keymapDescription: {keyboard_name: keyboardName, layout_name: layoutName, keymap: keymap}
                });
                await invoke('set_current_file', {filename: selected});
            }
            dirty = false;
            updateTitle();
        } catch (err) {
            qmk_error = true;
            qmk_error_output = err;
        }
    }

    const onSaveKeymap = async (event) => {
        if (editorState.filename) {
            try {
                await invoke('save_keymap', {
                    filename: editorState.filename,
                    keymapDescription: {keyboard_name: keyboardName, layout_name: layoutName, keymap: keymap}
                });
                dirty = false;
            } catch (err) {
                qmk_error = true;
                qmk_error_output = err;
            }
        }
    }

    const onBuild = async (event) => {
        try {
            await invoke('generate_keymap', {
                keymapDescription: {
                    keyboard_name: keyboardName,
                    layout_name: layoutName,
                    keymap: keymap
                }
            })
        } catch (err) {
            qmk_error = true;
            qmk_error_output = err;
        }
    }

    const loadKeymap = async (keymapFile) => {
        try {
            let keymapDescription = await invoke('load_keymap', {filename: keymapFile});
            let loadedKeyboard = await invoke('import_keyboard', {keyboard: keymapDescription.keyboard_name});
            await invoke('set_current_file', {filename: keymapFile});
            let layouts = Object.keys(loadedKeyboard.layouts);
            if (layouts.length <= 0) {
                qmk_error = true;
                qmk_error_output = keymapDescription.keyboard_name + " is missing layouts";
                return;
            }
            keyboardName = keymapDescription.keyboard_name;
            layoutName = keymapDescription.layout_name;
            layout = loadedKeyboard.layouts[keymapDescription.layout_name].layout;
            keymap = keymapDescription.keymap;
            editorState.filename = keymapFile;
            dirty = false;
            updateTitle();
        } catch (err) {
            qmk_error = true;
            qmk_error_output = err;
        }
    }

    const onLoadKeymap = async (event) => {
        try {
            const selected = await open({
                title: "Open keymap",
                filters: [{
                    name: "keymap",
                    extensions: ["keymap"]
                }]
            });
            if (selected !== null) {
                await loadKeymap(selected);
            }
        } catch (err) {
            qmk_error = true;
            qmk_error_output = err;
        }
    }

    onMount(async () => {
        try {
            need_config_update = await invoke('need_config_update');
            if (need_config_update) {
                editorState.filename = null;
                showConfig();
            } else {
                editorState = await invoke('get_state');
                if (editorState !== null && editorState.filename !== null) {
                    await loadKeymap(editorState.filename);
                    showWorkspace();
                } else {
                    showLoadKeyboard();
                }
            }
        } catch (err) {
            qmk_error = true;
            qmk_error_output = err;
            showLoadKeyboard();
        }
    })
</script>
<div>
    {#if qmk_error}
        <div class="modal"
             class:is-active={qmk_error}>
            <div class="modal-background"></div>
            <div class="modal-card">
                <header class="modal-card-head">
                    <p class="modal-card-title">Unexpected Error</p>
                    <button class="delete" aria-label="close" on:click={() => {qmk_error = false}}></button>
                </header>
                <section class="modal-card-body">
                    {qmk_error_output}
                </section>
                <footer class="modal-card-foot">
                    <button class="button" on:click={() => {qmk_error = false}}>Cancel</button>
                </footer>
            </div>
        </div>
    {:else}
        {#if pageState === pageLoading}
            <ImportKeyboard on:QMKError={handleQMKError} on:loadKeyboard={handleLoadKeyboard}/>
        {/if}
        {#if pageState === pageWorkspace}
            <div class="container is-widescreen is-justify-content-space-between is-flex is-align-items-center">
                <div class="is-size-3">{keyboardName ? keyboardName : "Import QMK keyboard"} {editorState.filename ? " - " + editorState.filename : ""}</div>
                <div class="is-flex is-align-items-center">
                    <button class="button class:is-invisible={!keyboardName}" on:click={onSaveAsKeymap}>Save as</button>
                    <button class="button ml-4 class:is-invisible={!keyboardName}" on:click={onSaveKeymap} disabled={!dirty}>Save</button>
                    <button class="button ml-4" on:click={onLoadKeymap}>Load</button>
                    <button class="ml-4 button" on:click={showLoadKeyboard}>Import</button>
                    <button class="ml-4 button" on:click={onBuild}>Build</button>
                    <button class="ml-4 button" on:click={showConfig}>Settings</button>
                </div>
            </div>

            <KeymapWorkspace bind:dirty bind:keymap={keymap} keyboardName={keyboardName} layoutName={layoutName} layout={layout}/>
        {/if}
        {#if pageState === pageSettings}
            <Config requireUpdate={need_config_update} on:exitConfig={onConfigSaved}/>
        {/if}
    {/if}
</div>
