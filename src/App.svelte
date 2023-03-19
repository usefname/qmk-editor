<script>
    import ImportKeyboard from "./ImportKeyboard.svelte";
    import KeymapWorkspace from "./editable-keyboard/KeymapWorkspace.svelte";
    import {invoke} from "@tauri-apps/api/tauri";
    import {open, save} from '@tauri-apps/api/dialog';
    import {onMount} from "svelte";
    import Config from "@/Config.svelte";

    let need_config_update = null;
    let qmk_error = false;
    let qmk_error_output = "Failed to execute QMK";

    let pageLoading = "loading";
    let pageWorkspace = "workspace";
    let pageBuild = "build";
    let pageSettings = "";


    let pageState = pageSettings;
    let editorState = {
        filename: null
    };

    $: keyboard_name = "";
    $: layout_name = "";
    $: layout = [];
    $: keymap = [[]];

    const handleLoadKeyboard = async (event) => {
        keyboard_name = event.detail.keyboardName;
        layout_name = event.detail.layoutName;
        layout = event.detail.layout;
        keymap = [[]];
        for (let i = 0; i < layout.length; i++) {
            keymap[0].push("KC_NO");
        }
        await invoke('set_current_file', {filename: null});
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
        if (keyboard_name) {
            pageState = pageWorkspace;
        } else {
            showLoadKeyboard();
        }
    }

    const onConfigSaved = (event) => {
        need_config_update = false;
        showWorkspace();
    }

    const onSaveKeymap = async (event) => {
        try {
            const selected = await save({
                title: "Save keymap",
                defaultPath: keyboard_name + ".keymap",
                filters: [{
                    name: "keymap",
                    extensions: ["keymap"]
                }]
            });
            if (selected !== null) {
                await invoke('save_keymap', {filename: selected, keymapDescription: {keyboard_name: keyboard_name, layout_name: layout_name, keymap: keymap}});
                await invoke('set_current_file', {filename: selected});
            }
        } catch (err) {
            qmk_error = true;
            qmk_error_output = err;
        }
    }

    const onBuild = async (event) => {
        try {
            await invoke('generate_keymap', {keyboard: keyboard_name, layout_name: layout_name, keymap: keymap})
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
            keyboard_name = keymapDescription.keyboard_name;
            layout_name = keymapDescription.layout_name;
            layout = loadedKeyboard.layouts[keymapDescription.layout_name].layout;
            keymap = keymapDescription.keymap;
        } catch(err) {
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
        }
    })
</script>
<div>
    {#if qmk_error}
        <h1 class="title has-text-centered has-text-danger is-block">Error</h1>
        <code class="is-size-6 has-text-black">
            {qmk_error_output}
        </code>
    {:else}
        {#if pageState === pageLoading}
            <ImportKeyboard on:QMKError={handleQMKError} on:loadKeyboard={handleLoadKeyboard}/>
        {/if}
        {#if pageState === pageWorkspace}
            <div class="container is-widescreen is-justify-content-space-between is-flex is-align-items-center">
                <div class="is-size-1">{keyboard_name ? keyboard_name : "Import QMK keyboard"}</div>
                <div class="is-flex is-align-items-center">
                    <button class="button class:is-invisible={!keyboard_name}" on:click={onSaveKeymap}>Save</button>
                    <button class="button ml-4" on:click={onLoadKeymap}>Load</button>
                    <button class="ml-4 button" on:click={showLoadKeyboard}>Import</button>
                    <button class="ml-4 button" on:click={onBuild}>Build</button>
                    <button class="ml-4 button" on:click={showConfig}>Settings</button>
                </div>
            </div>

            <KeymapWorkspace bind:keymap={keymap} keyboard_name={keyboard_name} layout_name={layout_name} layout={layout}/>
        {/if}
        {#if pageState === pageSettings}
            <Config requireUpdate={need_config_update} on:exitConfig={onConfigSaved}/>
        {/if}
    {/if}
</div>
