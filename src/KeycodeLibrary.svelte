<script>
    import {
        QMK_Commands, QMK_FKeys,
        QMK_LockKeys, QMK_MediaKeys,
        QMK_Modifiers, QMK_MouseKeys, QMK_NumberPad,
        QMK_Punctuation, QMK_SpecialKeys
    } from "./lib/qk-keycode-types";
    import LibraryKey from "./LibraryKey.svelte";
    import layouts  from "./lib/daskeyboard4-info.json";
    import Key from "./Key.svelte";
    import {layout_largest_x, layout_largest_y} from "./lib/layout";

    let layout = layouts.layouts.LAYOUT_fullsize_iso.layout;
    let keymap = ["KC_ESCAPE","KC_F1","KC_F2","KC_F3","KC_F4","KC_F5","KC_F6","KC_F7","KC_F8","KC_F9","KC_F10","KC_F11","KC_F12","KC_PRINT_SCREEN","KC_SCROLL_LOCK","KC_PAUSE","KC_GRAVE","KC_1","KC_2","KC_3","KC_4","KC_5","KC_6","KC_7","KC_8","KC_9","KC_0","KC_MINUS","KC_EQUAL","KC_BACKSPACE","KC_INSERT","KC_HOME","KC_PAGE_UP","KC_NUM_LOCK","KC_KP_SLASH","KC_KP_ASTERISK","KC_KP_MINUS","KC_TAB","KC_Q","KC_W","KC_E","KC_R","KC_T","KC_Y","KC_U","KC_I","KC_O","KC_P","KC_LEFT_BRACKET","KC_RIGHT_BRACKET","KC_DELETE","KC_END","KC_PAGE_DOWN","KC_KP_7","KC_KP_8","KC_KP_9","KC_KP_PLUS","KC_CAPS_LOCK","KC_A","KC_S","KC_D","KC_F","KC_G","KC_H","KC_J","KC_K","KC_L","KC_SEMICOLON","KC_QUOTE","KC_BACKSLASH","KC_RETURN","KC_KP_4","KC_KP_5","KC_KP_6","KC_LEFT_SHIFT","KC_LT","KC_Z","KC_X","KC_C","KC_V","KC_B","KC_N","KC_M","KC_COMMA","KC_DOT","KC_SLASH","KC_RIGHT_SHIFT","KC_UP","KC_KP_1","KC_KP_2","KC_KP_3","KC_KP_ENTER","KC_LEFT_CTRL","KC_LEFT_GUI","KC_LEFT_ALT","KC_SPACE","KC_RIGHT_ALT","KC_RIGHT_GUI","KC_APPLICATION","KC_RIGHT_CTRL","KC_LEFT","KC_DOWN","KC_RIGHT","KC_0","KC_KP_DOT",]
    $: currentTab = "Keyboard";

    let basicKeycodeMap = new Map([
        ["Function keys", QMK_FKeys],
        ["Punctuation", QMK_Punctuation],
        ["Lock keys", QMK_LockKeys],
        ["Modifiers", QMK_Modifiers],
        ["Commands", QMK_Commands],
        ["Number pad", QMK_NumberPad],
        ["SpecialKeys", QMK_SpecialKeys],
        ]);

    let mediaKeycodeMap = new Map([
        ["Media keys", QMK_MediaKeys],
        ["Mouse keys", QMK_MouseKeys],
    ]);

    let layerKeycodeMap = new Map([
        ["DF(layer)", "Set the base (default) layer"],
        ["MO(layer)", "Momentarily turn on layer when pressed (requires KC_TRNS on destination layer)"],
        ["OSL(layer)", "Momentarily activates layer until a key is pressed. See One Shot Keys for details."],
        ["LM(layer, mod)", "Momentarily turn on layer (like MO) with mod active as well. Where mod is a mods_bit. Mods can be viewed here. Example Implementation: LM(LAYER_1, MOD_LALT)"],
        ["LT(layer, kc)", "Turn on layer when held, kc when tapped"],
        ["TG(layer)", "Toggle layer on or off"],
        ["TO(layer)", "Turns on layer and turns off all other layers, except the default layer"],
        ["TT(layer)", "Normally acts like MO unless it's tapped multiple times, which toggles layer on"],
    ]);

    $: largest_y = layout_largest_y(layout);
    $: largest_x = layout_largest_x(layout);
    let key_x_spacing = 45;
    let key_y_spacing = 45;
    let key_width = 40;
    let key_height = 40;
</script>
<div class="tabs is-centered is-boxed is-toggle">
    <ul>
        <li class:is-active={currentTab==="Keyboard"} on:click={() => currentTab = "Keyboard"}><a>Keyboard</a></li>
        <li class:is-active={currentTab==="Basic"} on:click={() => currentTab = "Basic"}><a>Basic</a></li>
        <li class:is-active={currentTab==="Layer"} on:click={() => currentTab = "Layer"}><a>Layer</a></li>
        <li class:is-active={currentTab==="Media"}  on:click={() => currentTab = "Media"}><a>Mouse/Media</a></li>
        <li class:is-active={currentTab==="System"} on:click={() => currentTab = "System"}><a>System</a></li>
    </ul>
</div>
<div>
    {#if currentTab === "Keyboard"}
        <div
                class="column keyboard is-narrow box"
        >
            {#each layout as key, i}
                <Key {key} caption={keymap[i]} keyIndex=i selected={false}/>
            {/each}
        </div>
    {:else if currentTab === "Basic"}
        {#each [...basicKeycodeMap] as [topic, keyList]}
            <section class="container">
                <h6 class="is-size-4">
                    {topic}
                </h6>
                {#each keyList as key}
                    <LibraryKey caption={key} />
                {/each}
            </section>
        {/each}
    {:else if currentTab === "Layer"}
        Layer
    {:else if currentTab === "Media"}
        {#each [...mediaKeycodeMap] as [topic, keyList]}
            <section class="container">
                <h6 class="is-size-4">
                    {topic}
                </h6>
                {#each keyList as key}
                    <LibraryKey caption={key} />
                {/each}
            </section>
        {/each}
    {:else if currentTab === "System"}
        System
    {/if}
</div>
<style>
    .keyboard {
        height: calc((var(--kb_largest_y) + 0.2) * var(--key_y_spacing) *1px);
        width: calc((var(--kb_largest_x) + 0.2) * var(--key_x_spacing) *1px);

        background: #fff;
        border-color: #fff;
        /*box-shadow: 0 0 3px #0000004d;*/

        /*border-radius: 5px;*/
        position: relative;    }
</style>
