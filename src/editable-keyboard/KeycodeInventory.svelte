<script>
    import keycodes from "../lib/keycodes/keycodes.json";
    import layouts from "../lib/daskeyboard4-info.json";
    import {layout_largest_x, layout_largest_y} from "../lib/layout";
    import PositionalKey from "./PositionalKey.svelte";
    import Keycap from "./Keycap.svelte";
    import {
        allBasicCaptions,
        BASIC_ARG,
        LAYER_ARG,
        LEFT_MOD_ARG,
        parseCaption
    } from "@/lib/key-info.js";
    import {replaceArgsInMultiCaption} from "@/lib/key-info";

    export let currentLayerIndex;
    export let layoutCount;
    const layout = layouts.layouts.LAYOUT_fullsize_iso.layout;
    const keymap = ["KC_ESCAPE", "KC_F1", "KC_F2", "KC_F3", "KC_F4", "KC_F5", "KC_F6", "KC_F7", "KC_F8", "KC_F9", "KC_F10", "KC_F11", "KC_F12", "KC_PRINT_SCREEN", "KC_SCROLL_LOCK", "KC_PAUSE", "KC_GRAVE", "KC_1", "KC_2", "KC_3", "KC_4", "KC_5", "KC_6", "KC_7", "KC_8", "KC_9", "KC_0", "KC_MINUS", "KC_EQUAL", "KC_BACKSPACE", "KC_INSERT", "KC_HOME", "KC_PAGE_UP", "KC_NUM_LOCK", "KC_KP_SLASH", "KC_KP_ASTERISK", "KC_KP_MINUS", "KC_TAB", "KC_Q", "KC_W", "KC_E", "KC_R", "KC_T", "KC_Y", "KC_U", "KC_I", "KC_O", "KC_P", "KC_LEFT_BRACKET", "KC_RIGHT_BRACKET", "KC_DELETE", "KC_END", "KC_PAGE_DOWN", "KC_KP_7", "KC_KP_8", "KC_KP_9", "KC_KP_PLUS", "KC_CAPS_LOCK", "KC_A", "KC_S", "KC_D", "KC_F", "KC_G", "KC_H", "KC_J", "KC_K", "KC_L", "KC_SEMICOLON", "KC_QUOTE", "KC_BACKSLASH", "KC_RETURN", "KC_KP_4", "KC_KP_5", "KC_KP_6", "KC_LEFT_SHIFT", "KC_LT", "KC_Z", "KC_X", "KC_C", "KC_V", "KC_B", "KC_N", "KC_M", "KC_COMMA", "KC_DOT", "KC_SLASH", "KC_RIGHT_SHIFT", "KC_UP", "KC_KP_1", "KC_KP_2", "KC_KP_3", "KC_KP_ENTER", "KC_LEFT_CTRL", "KC_LEFT_GUI", "KC_LEFT_ALT", "KC_SPACE", "KC_RIGHT_ALT", "KC_RIGHT_GUI", "KC_APPLICATION", "KC_RIGHT_CTRL", "KC_LEFT", "KC_DOWN", "KC_RIGHT", "KC_KP_0", "KC_KP_DOT",]
    $: currentTab = "Multi action";

    const keymapArgs = {
        "Mod Tap": [{type: BASIC_ARG, default: "KC_A"}],
        "Layer": [{type: LAYER_ARG, default: "0"}],
        "Layer Tap": [{type: LAYER_ARG, default: "0"}, {type: BASIC_ARG, default: "KC_A"}],
        "Layer With Modifier": [{type: LAYER_ARG, default: "0"}, {type: LEFT_MOD_ARG, default: "MOD_LALT"}]
    }

    const createKcSection = (entries) => {
        let map = new Map();
        for (let entry of entries) {
            const sectionName = entry[0];
            let sectionKeyList = entry[1];
            let argList = [];
            if (keymapArgs[sectionName]) {
                let args = "";
                if (keymapArgs[sectionName].length === 1) {
                    args = "(" + keymapArgs[sectionName][0].default + ")"
                } else if (keymapArgs[sectionName].length === 2) {
                    args = "(" +
                        keymapArgs[sectionName][0].default +
                        ", " +
                        keymapArgs[sectionName][1].default +
                        ")";
                } else {
                    throw ("Unknown arg count for sections");
                }
                sectionKeyList = sectionKeyList.map(x => x + args);
                argList = keymapArgs[sectionName];
            }
            map.set(sectionName, {keyList: sectionKeyList.map(parseCaption), args: argList});
        }
        return map;
    }

    const basicKeycodeMap = createKcSection([
        ["Function keys", keycodes.functionKeys],
        ["Punctuation", keycodes.punctuation],
        ["Lock keys", keycodes.lockKeys],
        ["Modifiers", keycodes.modifiers],
        ["Number pad", keycodes.numpad],
        ["SpecialKeys", keycodes.special],
    ]);


    const mediaKeycodeMap = createKcSection([
        ["Media keys", keycodes.media],
        ["Mouse keys", keycodes.mouse],
    ]);

    const commandsKeycodeMap = createKcSection([
        ["Navigation", keycodes.navigation],
        ["Commands", keycodes.commands],
        ["Linux", keycodes.linux],
    ])

    const layerKeycodeMap = createKcSection([
        ["Layer", keycodes.layers],
    ])

    const multiActionKeycodeMap = createKcSection([
        ["Mod Tap", keycodes.modTap],
        ["Layer Tap", keycodes.layerTap],
        ["Layer With Modifier", keycodes.layerMod]
    ]);

    const sections = new Map([
        ["Basic", basicKeycodeMap],
        ["Commands", commandsKeycodeMap],
        ["Media", mediaKeycodeMap],
        ["Layers", layerKeycodeMap],
        ["Multi action", multiActionKeycodeMap]
    ])

    $: largest_y = layout_largest_y(layout);
    $: largest_x = layout_largest_x(layout);
</script>
<div class="inventory" style="--key_w:1; --key_h:1;">
    <div class="tabs is-centered is-boxed is-toggle">
        <ul>
            <li class:is-active={currentTab==="Keyboard"} on:click={() => currentTab = "Keyboard"}><a>Keyboard</a></li>
            {#each [...sections.keys()] as section}
                <li class:is-active={currentTab===section} on:click={() => currentTab = section}><a>{section}</a></li>
            {/each}
        </ul>
    </div>
    <div class="is-flex is-justify-content-center"
         style="--sample-kb-largest_y:{largest_y}; --sample-kb-largest_x:{largest_x};">
        {#if currentTab === "Keyboard"}
            <div class="column keyboard is-narrow box">
                {#each layout as key, i}
                    <PositionalKey {key} caption={keymap[i]} keyIndex=i selected={false}/>
                {/each}
            </div>
        {:else if sections.has(currentTab)}
            {#each [...sections.get(currentTab)] as [topic, keyDesc]}
                <div class="m-2">
                    <h1 class="title is-4">{topic}</h1>

                    {#if keyDesc.args.length > 0 && keyDesc.args[0].type === LAYER_ARG && layoutCount <= 1}
                        <div class="notification is-warning">
                            <h2 class="subtitle">Need more than one layer</h2>
                        </div>
                    {:else}
                        {#if keyDesc.args}
                            <div class="box is-flex is-flex-direction-column">
                                {#each keyDesc.args as arg}
                                    {#if arg.type === BASIC_ARG}
                                        <div class="is-flex">
                                            <h2 class="mr-3 subtitle is-justify-content-center is-align-items-center">
                                                Keycode</h2>
                                            <div class="ml-3 select is-small">
                                                <select bind:value={arg.default}>
                                                    {#each Object.entries(allBasicCaptions()) as [label, keycode]}
                                                        <option value={keycode}>{label} ({keycode})</option>
                                                    {/each}
                                                </select>
                                            </div>
                                        </div>
                                    {:else if arg.type === LAYER_ARG}
                                        <div class="is-flex">
                                            <h2 class="mr-3 subtitle is-justify-content-center is-align-items-center">
                                                Layer</h2>
                                            <div class="ml-3 select is-small">
                                                <select bind:value={arg.default}>
                                                    {#each [...Array(layoutCount).keys()] as layerIndex}
                                                        {#if layerIndex !== currentLayerIndex}
                                                            <option value={layerIndex.toString()}>{layerIndex}</option>
                                                        {/if}
                                                    {/each}
                                                </select>

                                            </div>
                                        </div>
                                    {/if}
                                {/each}
                            </div>
                        {/if}
                        <table class="table is-bordered is-striped is-widescreen is-hoverable">
                            <thead>
                            <tr>
                                <th>Key</th>
                                <th>Description</th>
                            </tr>
                            </thead>
                            {#each keyDesc.keyList as key}
                                <tr>
                                    <td>
                                        <Keycap caption={replaceArgsInMultiCaption(key, keyDesc.args)}/>
                                    </td>
                                    <td>
                                        {key.label.description}
                                    </td>
                                </tr>
                            {/each}
                        </table>
                    {/if}
                </div>
            {/each}
        {/if}
    </div>
</div>

<style>
    .tabs a {
    }

    .keyboard {
        height: calc((var(--sample-kb-largest_y) + 0.2) * var(--key_y_spacing) * 1px);
        width: calc((var(--sample-kb-largest_x) + 0.2) * var(--key_x_spacing) * 1px);

        background: #fff;
        border-color: #fff;
        position: relative;
    }

    td {
        max-width: 40em;
    }
</style>
