<script>
    import ImportKeyboard from "./ImportKeyboard.svelte";
    import KeymapWorkspace from "./editable-keyboard/KeymapWorkspace.svelte";
    import {calcLayoutWidth, layout_largest_x, layout_largest_y} from "./lib/layout";
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
    let pageSave = "save";
    let pageSettings = "settings";


    let pageState = pageWorkspace;
    let editorState = {
        filename: null
    };

    $: keyboard = {
        keyboard_name: "Test",
        layout_name: "LAYOUT",
        layout: [
            {"x": 0, "y": 0.375, "w": 1.5}, {"x": 1.5, "y": 0.375}, {"x": 2.5, "y": 0.125}, {"x": 3.5, "y": 0}, {
                "x": 4.5,
                "y": 0.125
            }, {"x": 5.5, "y": 0.25}, {"x": 6.5, "y": 0.25},
            {"x": 9.5, "y": 0.25}, {"x": 10.5, "y": 0.25}, {"x": 11.5, "y": 0.125}, {"x": 12.5, "y": 0}, {
                "x": 13.5,
                "y": 0.125
            }, {"x": 14.5, "y": 0.375}, {"x": 15.5, "y": 0.375, "w": 1.5},

            {"x": 0, "y": 1.375, "w": 1.5}, {"x": 1.5, "y": 1.375}, {"x": 2.5, "y": 1.125}, {"x": 3.5, "y": 1}, {
                "x": 4.5,
                "y": 1.125
            }, {"x": 5.5, "y": 1.25}, {"x": 6.5, "y": 1.25, "h": 1.5},
            {"x": 9.5, "y": 1.25, "h": 1.5}, {"x": 10.5, "y": 1.25}, {"x": 11.5, "y": 1.125}, {
                "x": 12.5,
                "y": 1
            }, {"x": 13.5, "y": 1.125}, {"x": 14.5, "y": 1.375}, {"x": 15.5, "y": 1.375, "w": 1.5},

            {"x": 0, "y": 2.375, "w": 1.5}, {"x": 1.5, "y": 2.375}, {"x": 2.5, "y": 2.125}, {"x": 3.5, "y": 2}, {
                "x": 4.5,
                "y": 2.125
            }, {"x": 5.5, "y": 2.25},
            {"x": 10.5, "y": 2.25}, {"x": 11.5, "y": 2.125}, {"x": 12.5, "y": 2}, {"x": 13.5, "y": 2.125}, {
                "x": 14.5,
                "y": 2.375
            }, {"x": 15.5, "y": 2.375, "w": 1.5},

            {"x": 0, "y": 3.375, "w": 1.5}, {"x": 1.5, "y": 3.375}, {"x": 2.5, "y": 3.125}, {"x": 3.5, "y": 3}, {
                "x": 4.5,
                "y": 3.125
            }, {"x": 5.5, "y": 3.25}, {"x": 6.5, "y": 2.75, "h": 1.5},
            {"x": 9.5, "y": 2.75, "h": 1.5}, {"x": 10.5, "y": 3.25}, {"x": 11.5, "y": 3.125}, {
                "x": 12.5,
                "y": 3
            }, {"x": 13.5, "y": 3.125}, {"x": 14.5, "y": 3.375}, {"x": 15.5, "y": 3.375, "w": 1.5},

            {"x": 0.5, "y": 4.375}, {"x": 1.5, "y": 4.375}, {"x": 2.5, "y": 4.125}, {"x": 3.5, "y": 4}, {
                "x": 4.5,
                "y": 4.125
            },
            {"x": 11.5, "y": 4.125}, {"x": 12.5, "y": 4}, {"x": 13.5, "y": 4.125}, {"x": 14.5, "y": 4.375}, {
                "x": 15.5,
                "y": 4.375
            },

            {"x": 6, "y": 5}, {"x": 7, "y": 5}, {"x": 9, "y": 5}, {"x": 10, "y": 5},
            {"x": 7, "y": 6}, {"x": 9, "y": 6},
            {"x": 5, "y": 6, "h": 2}, {"x": 6, "y": 6, "h": 2}, {"x": 7, "y": 7}, {"x": 9, "y": 7}, {
                "x": 10,
                "y": 6,
                "h": 2
            }, {"x": 11, "y": 6, "h": 2}
        ] ,
        keymap: [[]],
    }

    let key_x_spacing = 55;
    let key_y_spacing = 55;
    let key_width = 50;
    let key_height = 50;
    $: calculatedAppWidth = "calc(((" + calcLayoutWidth(keyboard.layout, key_x_spacing) + "*1px)) + 20rem)";
    $: calculatedLayoutWidth = "calc((" + calcLayoutWidth(keyboard.layout, key_x_spacing) + "*1px))";
    $: largest_y = layout_largest_y(keyboard.layout);
    $: largest_x = layout_largest_x(keyboard.layout);

    const handleLoadKeyboard = (event) => {
        keyboard.keyboard_name = event.detail.keyboardName;
        keyboard.layout_name = event.detail.layoutName;
        keyboard.layout = event.detail.layout;
        keyboard.keymap = [[]];
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
        if (keyboard.keyboard_name) {
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
                defaultPath: keyboard.keyboard_name + ".keymap",
                filters: [{
                    name: "keymap",
                    extensions: ["keymap"]
                }]
            });
            if (selected !== null) {
                await invoke('save_keymap', {filename: selected, keymapDescription: keyboard})
            }
        } catch (err) {
            qmk_error = true;
            qmk_error_output = err;
        }
    }

    const onLoadKeymap = async (event) => {
        try {
            const selected = await open({
                title: "Open keymap",
                defaultPath: keyboard.keyboard_name + ".keymap",
                filters: [{
                    name: "keymap",
                    extensions: ["keymap"]
                }]
            });
            if (selected !== null) {
                let keymapDescription = await invoke('load_keymap', {filename: selected});
                let loadedKeyboard = await invoke('import_keyboard', {keyboard: keymapDescription.keyboard_name});
                let layouts = Object.keys(loadedKeyboard.layouts);
                if (layouts.length <= 0) {
                    qmk_error = true;
                    qmk_error_output = keymapDescription.keyboard_name + " is missing layouts";
                    return;
                }
                keyboard.keyboard_name = keymapDescription.keyboard_name;
                keyboard.layout_name = keymapDescription.layout_name;
                keyboard.layout = loadedKeyboard.layouts[keymapDescription.layout_name].layout;
                keyboard.keymap = keymapDescription.keymap;
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
                if (editorState !== null) {
                    //load last keymap
                    // await invoke('load_keymap', {filename: editorState.filename});
                }
                showWorkspace();
            }
        } catch (err) {
            qmk_error = true;
            qmk_error_output = err;
        }
    })
</script>
<div
        style="--app-width:{calculatedAppWidth};--layout-width:{calculatedLayoutWidth};--kb_largest_x: {largest_x};--kb_largest_y: {largest_y}; --key_x_spacing: {key_x_spacing}; --key_y_spacing: {key_y_spacing}; --key_width: {key_width}; --key_height: {key_height};">
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
                <div class="is-size-1">{keyboard.keyboard_name ? keyboard.keyboard_name : "Import QMK keyboard"}</div>
                <div class="is-flex is-align-items-center">
                    <button class="button class:is-invisible={!keyboard.keyboard_name}" on:click={onSaveKeymap}>Save</button>
                    <button class="button ml-4" on:click={onLoadKeymap}>Load</button>
                    <button class="ml-4 button" on:click={showLoadKeyboard}>Import</button>
                    <button class="ml-4 button">Build</button>
                    <button class="ml-4 button" on:click={showConfig}>Settings</button>
                </div>
            </div>

            <KeymapWorkspace {...keyboard}/>
        {/if}
        {#if pageState === pageSettings}
            <Config requireUpdate={need_config_update} on:exitConfig={onConfigSaved}/>
        {/if}
    {/if}
</div>
