//From qmk firmware docs/keycodes.md

export const QKToDescription = new Map([
    ["KC_NO", "Ignore this key (NOOP)"],
    ["XXXXXXX", "Ignore this key (NOOP)"],
    ["KC_TRANSPARENT", "Use the next lowest non-transparent key"],
    ["KC_TRNS", "Use the next lowest non-transparent key"],
    ["_______", "Use the next lowest non-transparent key"],
    ["KC_A", "a and A"],
    ["KC_B", "b and B"],
    ["KC_C", "c and C"],
    ["KC_D", "d and D"],
    ["KC_E", "e and E"],
    ["KC_F", "f and F"],
    ["KC_G", "g and G"],
    ["KC_H", "h and H"],
    ["KC_I", "i and I"],
    ["KC_J", "j and J"],
    ["KC_K", "k and K"],
    ["KC_L", "l and L"],
    ["KC_M", "m and M"],
    ["KC_N", "n and N"],
    ["KC_O", "o and O"],
    ["KC_P", "p and P"],
    ["KC_Q", "q and Q"],
    ["KC_R", "r and R"],
    ["KC_S", "s and S"],
    ["KC_T", "t and T"],
    ["KC_U", "u and U"],
    ["KC_V", "v and V"],
    ["KC_W", "w and W"],
    ["KC_X", "x and X"],
    ["KC_Y", "y and Y"],
    ["KC_Z", "z and Z"],
    ["KC_1", "1 and !"],
    ["KC_2", "2 and @"],
    ["KC_3", "3 and #"],
    ["KC_4", "4 and $"],
    ["KC_5", "5 and %"],
    ["KC_6", "6 and ^"],
    ["KC_7", "7 and &"],
    ["KC_8", "8 and *"],
    ["KC_9", "9 and ("],
    ["KC_0", "0 and )"],
    ["KC_ENTER", "Return (Enter)"],
    ["KC_ENT", "Return (Enter)"],
    ["KC_ESCAPE", "Escape"],
    ["KC_ESC", "Escape"],
    ["KC_BACKSPACE", "Delete (Backspace)"],
    ["KC_BSPC", "Delete (Backspace)"],
    ["KC_TAB", "Tab"],
    ["KC_SPACE", "Spacebar"],
    ["KC_SPC", "Spacebar"],
    ["KC_MINUS", "- and _"],
    ["KC_MINS", "- and _"],
    ["KC_EQUAL", "= and +"],
    ["KC_EQL", "= and +"],
    ["KC_LEFT_BRACKET", "[ and {"],
    ["KC_LBRC", "[ and {"],
    ["KC_RIGHT_BRACKET", "] and }"],
    ["KC_RBRC", "] and }"],
    ["KC_BACKSLASH", "\\ and \\"],
    ["KC_BSLS", "\\ and \\"],
    ["KC_NONUS_HASH", "Non-US # and ~"],
    ["KC_NUHS", "Non-US # and ~"],
    ["KC_SEMICOLON", "; and :"],
    ["KC_SCLN", "; and :"],
    ["KC_QUOTE", "' and \""],
    ["KC_QUOT", "' and \""],
    ["KC_GRAVE", "<code>&#96;</code> and ~"],
    ["KC_GRV", "<code>&#96;</code> and ~"],
    ["KC_COMMA", ", and <"],
    ["KC_COMM", ", and <"],
    ["KC_DOT", ". and >"],
    ["KC_SLASH", "/ and ?"],
    ["KC_SLSH", "/ and ?"],
    ["KC_CAPS_LOCK", "Caps Lock"],
    ["KC_CAPS", "Caps Lock"],
    ["KC_F1", "F1"],
    ["KC_F2", "F2"],
    ["KC_F3", "F3"],
    ["KC_F4", "F4"],
    ["KC_F5", "F5"],
    ["KC_F6", "F6"],
    ["KC_F7", "F7"],
    ["KC_F8", "F8"],
    ["KC_F9", "F9"],
    ["KC_F10", "F10"],
    ["KC_F11", "F11"],
    ["KC_F12", "F12"],
    ["KC_PRINT_SCREEN", "Print Screen"],
    ["KC_PSCR", "Print Screen"],
    ["KC_SCROLL_LOCK", "Scroll Lock, Brightness Down (macOS)"],
    ["KC_SCRL", "Scroll Lock, Brightness Down (macOS)"],
    ["KC_BRMD", "Scroll Lock, Brightness Down (macOS)"],
    ["KC_PAUSE", "Pause, Brightness Up (macOS)"],
    ["KC_PAUS", "Pause, Brightness Up (macOS)"],
    ["KC_BRK", "Pause, Brightness Up (macOS)"],
    ["KC_BRMU", "Pause, Brightness Up (macOS)"],
    ["KC_INSERT", "Insert"],
    ["KC_INS", "Insert"],
    ["KC_HOME", "Home"],
    ["KC_PAGE_UP", "Page Up"],
    ["KC_PGUP", "Page Up"],
    ["KC_DELETE", "Forward Delete"],
    ["KC_DEL", "Forward Delete"],
    ["KC_END", "End"],
    ["KC_PAGE_DOWN", "Page Down"],
    ["KC_PGDN", "Page Down"],
    ["KC_RIGHT", "Right Arrow"],
    ["KC_RGHT", "Right Arrow"],
    ["KC_LEFT", "Left Arrow"],
    ["KC_DOWN", "Down Arrow"],
    ["KC_UP", "Up Arrow"],
    ["KC_NUM_LOCK", "Keypad Num Lock and Clear"],
    ["KC_NUM", "Keypad Num Lock and Clear"],
    ["KC_KP_SLASH", "Keypad /"],
    ["KC_PSLS", "Keypad /"],
    ["KC_KP_ASTERISK", "Keypad *"],
    ["KC_PAST", "Keypad *"],
    ["KC_KP_MINUS", "Keypad -"],
    ["KC_PMNS", "Keypad -"],
    ["KC_KP_PLUS", "Keypad +"],
    ["KC_PPLS", "Keypad +"],
    ["KC_KP_ENTER", "Keypad Enter"],
    ["KC_PENT", "Keypad Enter"],
    ["KC_KP_1", "Keypad 1 and End"],
    ["KC_P1", "Keypad 1 and End"],
    ["KC_KP_2", "Keypad 2 and Down Arrow"],
    ["KC_P2", "Keypad 2 and Down Arrow"],
    ["KC_KP_3", "Keypad 3 and Page Down"],
    ["KC_P3", "Keypad 3 and Page Down"],
    ["KC_KP_4", "Keypad 4 and Left Arrow"],
    ["KC_P4", "Keypad 4 and Left Arrow"],
    ["KC_KP_5", "Keypad 5"],
    ["KC_P5", "Keypad 5"],
    ["KC_KP_6", "Keypad 6 and Right Arrow"],
    ["KC_P6", "Keypad 6 and Right Arrow"],
    ["KC_KP_7", "Keypad 7 and Home"],
    ["KC_P7", "Keypad 7 and Home"],
    ["KC_KP_8", "Keypad 8 and Up Arrow"],
    ["KC_P8", "Keypad 8 and Up Arrow"],
    ["KC_KP_9", "Keypad 9 and Page Up"],
    ["KC_P9", "Keypad 9 and Page Up"],
    ["KC_KP_0", "Keypad 0 and Insert"],
    ["KC_P0", "Keypad 0 and Insert"],
    ["KC_KP_DOT", "Keypad . and Delete"],
    ["KC_PDOT", "Keypad . and Delete"],
    ["KC_NONUS_BACKSLASH", "Non-US \\ and \\"],
    ["KC_NUBS", "Non-US \\ and \\"],
    ["KC_APPLICATION", "Application (Windows Context Menu Key)"],
    ["KC_APP", "Application (Windows Context Menu Key)"],
    ["KC_KB_POWER", "System Power"],
    ["KC_KP_EQUAL", "Keypad ="],
    ["KC_PEQL", "Keypad ="],
    ["KC_F13", "F13"],
    ["KC_F14", "F14"],
    ["KC_F15", "F15"],
    ["KC_F16", "F16"],
    ["KC_F17", "F17"],
    ["KC_F18", "F18"],
    ["KC_F19", "F19"],
    ["KC_F20", "F20"],
    ["KC_F21", "F21"],
    ["KC_F22", "F22"],
    ["KC_F23", "F23"],
    ["KC_F24", "F24"],
    ["KC_EXECUTE", "Execute"],
    ["KC_EXEC", "Execute"],
    ["KC_HELP", "Help"],
    ["KC_MENU", "Menu"],
    ["KC_SELECT", "Select"],
    ["KC_SLCT", "Select"],
    ["KC_STOP", "Stop"],
    ["KC_AGAIN", "Again"],
    ["KC_AGIN", "Again"],
    ["KC_UNDO", "Undo"],
    ["KC_CUT", "Cut"],
    ["KC_COPY", "Copy"],
    ["KC_PASTE", "Paste"],
    ["KC_PSTE", "Paste"],
    ["KC_FIND", "Find"],
    ["KC_KB_MUTE", "Mute"],
    ["KC_KB_VOLUME_UP", "Volume Up"],
    ["KC_KB_VOLUME_DOWN", "Volume Down"],
    ["KC_LOCKING_CAPS_LOCK", "Locking Caps Lock"],
    ["KC_LCAP", "Locking Caps Lock"],
    ["KC_LOCKING_NUM_LOCK", "Locking Num Lock"],
    ["KC_LNUM", "Locking Num Lock"],
    ["KC_LOCKING_SCROLL_LOCK", "Locking Scroll Lock"],
    ["KC_LSCR", "Locking Scroll Lock"],
    ["KC_KP_COMMA", "Keypad ,"],
    ["KC_PCMM", "Keypad ,"],
    ["KC_KP_EQUAL_AS400", "Keypad = on AS/400 keyboards"],
    ["KC_INTERNATIONAL_1", "International 1"],
    ["KC_INT1", "International 1"],
    ["KC_INTERNATIONAL_2", "International 2"],
    ["KC_INT2", "International 2"],
    ["KC_INTERNATIONAL_3", "International 3"],
    ["KC_INT3", "International 3"],
    ["KC_INTERNATIONAL_4", "International 4"],
    ["KC_INT4", "International 4"],
    ["KC_INTERNATIONAL_5", "International 5"],
    ["KC_INT5", "International 5"],
    ["KC_INTERNATIONAL_6", "International 6"],
    ["KC_INT6", "International 6"],
    ["KC_INTERNATIONAL_7", "International 7"],
    ["KC_INT7", "International 7"],
    ["KC_INTERNATIONAL_8", "International 8"],
    ["KC_INT8", "International 8"],
    ["KC_INTERNATIONAL_9", "International 9"],
    ["KC_INT9", "International 9"],
    ["KC_LANGUAGE_1", "Language 1"],
    ["KC_LNG1", "Language 1"],
    ["KC_LANGUAGE_2", "Language 2"],
    ["KC_LNG2", "Language 2"],
    ["KC_LANGUAGE_3", "Language 3"],
    ["KC_LNG3", "Language 3"],
    ["KC_LANGUAGE_4", "Language 4"],
    ["KC_LNG4", "Language 4"],
    ["KC_LANGUAGE_5", "Language 5"],
    ["KC_LNG5", "Language 5"],
    ["KC_LANGUAGE_6", "Language 6"],
    ["KC_LNG6", "Language 6"],
    ["KC_LANGUAGE_7", "Language 7"],
    ["KC_LNG7", "Language 7"],
    ["KC_LANGUAGE_8", "Language 8"],
    ["KC_LNG8", "Language 8"],
    ["KC_LANGUAGE_9", "Language 9"],
    ["KC_LNG9", "Language 9"],
    ["KC_ALTERNATE_ERASE", "Alternate Erase"],
    ["KC_ERAS", "Alternate Erase"],
    ["KC_SYSTEM_REQUEST", "SysReq/Attention"],
    ["KC_SYRQ", "SysReq/Attention"],
    ["KC_CANCEL", "Cancel"],
    ["KC_CNCL", "Cancel"],
    ["KC_CLEAR", "Clear"],
    ["KC_CLR", "Clear"],
    ["KC_PRIOR", "Prior"],
    ["KC_PRIR", "Prior"],
    ["KC_RETURN", "Return"],
    ["KC_RETN", "Return"],
    ["KC_SEPARATOR", "Separator"],
    ["KC_SEPR", "Separator"],
    ["KC_OUT", "Out"],
    ["KC_OPER", "Oper"],
    ["KC_CLEAR_AGAIN", "Clear/Again"],
    ["KC_CLAG", "Clear/Again"],
    ["KC_CRSEL", "CrSel/Props"],
    ["KC_CRSL", "CrSel/Props"],
    ["KC_EXSEL", "ExSel"],
    ["KC_EXSL", "ExSel"],
    ["KC_LEFT_CTRL", "Left Control"],
    ["KC_LCTL", "Left Control"],
    ["KC_LEFT_SHIFT", "Left Shift"],
    ["KC_LSFT", "Left Shift"],
    ["KC_LEFT_ALT", "Left Alt (Option)"],
    ["KC_LALT", "Left Alt (Option)"],
    ["KC_LOPT", "Left Alt (Option)"],
    ["KC_LEFT_GUI", "Left GUI (Windows/Command/Meta key)"],
    ["KC_LGUI", "Left GUI (Windows/Command/Meta key)"],
    ["KC_LCMD", "Left GUI (Windows/Command/Meta key)"],
    ["KC_LWIN", "Left GUI (Windows/Command/Meta key)"],
    ["KC_RIGHT_CTRL", "Right Control"],
    ["KC_RCTL", "Right Control"],
    ["KC_RIGHT_SHIFT", "Right Shift"],
    ["KC_RSFT", "Right Shift"],
    ["KC_RIGHT_ALT", "Right Alt (Option/AltGr)"],
    ["KC_RALT", "Right Alt (Option/AltGr)"],
    ["KC_ROPT", "Right Alt (Option/AltGr)"],
    ["KC_ALGR", "Right Alt (Option/AltGr)"],
    ["KC_RIGHT_GUI", "Right GUI (Windows/Command/Meta key)"],
    ["KC_RGUI", "Right GUI (Windows/Command/Meta key)"],
    ["KC_RCMD", "Right GUI (Windows/Command/Meta key)"],
    ["KC_RWIN", "Right GUI (Windows/Command/Meta key)"],
    ["KC_SYSTEM_POWER", "System Power Down"],
    ["KC_PWR", "System Power Down"],
    ["KC_SYSTEM_SLEEP", "System Sleep"],
    ["KC_SLEP", "System Sleep"],
    ["KC_SYSTEM_WAKE", "System Wake"],
    ["KC_WAKE", "System Wake"],
    ["KC_AUDIO_MUTE", "Mute"],
    ["KC_MUTE", "Mute"],
    ["KC_AUDIO_VOL_UP", "Volume Up"],
    ["KC_VOLU", "Volume Up"],
    ["KC_AUDIO_VOL_DOWN", "Volume Down"],
    ["KC_VOLD", "Volume Down"],
    ["KC_MEDIA_NEXT_TRACK", "Next Track"],
    ["KC_MNXT", "Next Track"],
    ["KC_MEDIA_PREV_TRACK", "Previous Track"],
    ["KC_MPRV", "Previous Track"],
    ["KC_MEDIA_STOP", "Stop Track"],
    ["KC_MSTP", "Stop Track"],
    ["KC_MEDIA_PLAY_PAUSE", "Play/Pause Track"],
    ["KC_MPLY", "Play/Pause Track"],
    ["KC_MEDIA_SELECT", "Launch Media Player"],
    ["KC_MSEL", "Launch Media Player"],
    ["KC_MEDIA_EJECT", "Eject"],
    ["KC_EJCT", "Eject"],
    ["KC_MAIL", "Launch Mail"],
    ["KC_CALCULATOR", "Launch Calculator"],
    ["KC_CALC", "Launch Calculator"],
    ["KC_MY_COMPUTER", "Launch My Computer"],
    ["KC_MYCM", "Launch My Computer"],
    ["KC_WWW_SEARCH", "Browser Search"],
    ["KC_WSCH", "Browser Search"],
    ["KC_WWW_HOME", "Browser Home"],
    ["KC_WHOM", "Browser Home"],
    ["KC_WWW_BACK", "Browser Back"],
    ["KC_WBAK", "Browser Back"],
    ["KC_WWW_FORWARD", "Browser Forward"],
    ["KC_WFWD", "Browser Forward"],
    ["KC_WWW_STOP", "Browser Stop"],
    ["KC_WSTP", "Browser Stop"],
    ["KC_WWW_REFRESH", "Browser Refresh"],
    ["KC_WREF", "Browser Refresh"],
    ["KC_WWW_FAVORITES", "Browser Favorites"],
    ["KC_WFAV", "Browser Favorites"],
    ["KC_MEDIA_FAST_FORWARD", "Next Track"],
    ["KC_MFFD", "Next Track"],
    ["KC_MEDIA_REWIND", "Previous Track"],
    ["KC_MRWD", "Previous Track"],
    ["KC_BRIGHTNESS_UP", "Brightness Up"],
    ["KC_BRIU", "Brightness Up"],
    ["KC_BRIGHTNESS_DOWN", "Brightness Down"],
    ["KC_BRID", "Brightness Down"],
    ["KC_LOCK", ""],
    ["Hold down the next key pressed", ""],
    ["until the key is pressed again", ""],
    ["KC_LEAD", ""],
    ["Begins a leader sequence", ""],
    ["KC_MS_UP", "Mouse Cursor Up"],
    ["KC_MS_U", "Mouse Cursor Up"],
    ["KC_MS_DOWN", "Mouse Cursor Down"],
    ["KC_MS_D", "Mouse Cursor Down"],
    ["KC_MS_LEFT", "Mouse Cursor Left"],
    ["KC_MS_L", "Mouse Cursor Left"],
    ["KC_MS_RIGHT", "Mouse Cursor Right"],
    ["KC_MS_R", "Mouse Cursor Right"],
    ["KC_MS_BTN1", "Mouse Button 1"],
    ["KC_BTN1", "Mouse Button 1"],
    ["KC_MS_BTN2", "Mouse Button 2"],
    ["KC_BTN2", "Mouse Button 2"],
    ["KC_MS_BTN3", "Mouse Button 3"],
    ["KC_BTN3", "Mouse Button 3"],
    ["KC_MS_BTN4", "Mouse Button 4"],
    ["KC_BTN4", "Mouse Button 4"],
    ["KC_MS_BTN5", "Mouse Button 5"],
    ["KC_BTN5", "Mouse Button 5"],
    ["KC_MS_WH_UP", "Mouse Wheel Up"],
    ["KC_WH_U", "Mouse Wheel Up"],
    ["KC_MS_WH_DOWN", "Mouse Wheel Down"],
    ["KC_WH_D", "Mouse Wheel Down"],
    ["KC_MS_WH_LEFT", "Mouse Wheel Left"],
    ["KC_WH_L", "Mouse Wheel Left"],
    ["KC_MS_WH_RIGHT", "Mouse Wheel Right"],
    ["KC_WH_R", "Mouse Wheel Right"],
    ["KC_MS_ACCEL0", "Set mouse acceleration to 0"],
    ["KC_ACL0", "Set mouse acceleration to 0"],
    ["KC_MS_ACCEL1", "Set mouse acceleration to 1"],
    ["KC_ACL1", "Set mouse acceleration to 1"],
    ["KC_MS_ACCEL2", "Set mouse acceleration to 2"],
    ["KC_ACL2", "Set mouse acceleration to 2"],
    ["KC_MEH", "Left Control, Shift and Alt"],
    ["KC_HYPR", "Left Control, Shift, Alt and GUI"],
    ["KC_TILDE", "~"],
    ["KC_TILD", "~"],
    ["KC_EXCLAIM", "!"],
    ["KC_EXLM", "!"],
    ["KC_AT", "@"],
    ["KC_HASH", "#"],
    ["KC_DOLLAR", "$"],
    ["KC_DLR", "$"],
    ["KC_PERCENT", "%"],
    ["KC_PERC", "%"],
    ["KC_CIRCUMFLEX", "^"],
    ["KC_CIRC", "^"],
    ["KC_AMPERSAND", "&"],
    ["KC_AMPR", "&"],
    ["KC_ASTERISK", "*"],
    ["KC_ASTR", "*"],
    ["KC_LEFT_PAREN", "("],
    ["KC_LPRN", "("],
    ["KC_RIGHT_PAREN", ")"],
    ["KC_RPRN", ")"],
    ["KC_UNDERSCORE", "_"],
    ["KC_UNDS", "_"],
    ["KC_PLUS", "+"],
    ["KC_LEFT_CURLY_BRACE", "{"],
    ["KC_LCBR", "{"],
    ["KC_RIGHT_CURLY_BRACE", "}"],
    ["KC_RCBR", "}"],
    ["KC_PIPE", "|"],
    ["KC_COLON", ":"],
    ["KC_COLN", ":"],
    ["KC_DOUBLE_QUOTE", "\""],
    ["KC_DQUO", "\""],
    ["KC_DQT", "\""],
    ["KC_LEFT_ANGLE_BRACKET", "<"],
    ["KC_LABK", "<"],
    ["KC_LT", "<"],
    ["KC_RIGHT_ANGLE_BRACKET", ">"],
    ["KC_RABK", ">"],
    ["KC_GT", ">"],
    ["KC_QUESTION", "?"],
    ["KC_QUES", "?"],
    //Layer
        ["DF", "Switches the default layer. The default layer is the always-active base layer that other layers stack on top of. This might be used to switch from QWERTY to Dvorak layout. (Note that this is a temporary switch that only persists until the keyboard loses power.)"],
        ["MO", "Momentarily activates layer. As soon as you let go of the key, the layer is deactivated. Requires empty key on destination layer."],
        ["OSL", "Momentarily activates layer until a key is pressed."],
        ["TG", "Toggles layer, activating it if it's inactive and vice versa."],
        ["TO", "Activates layer and de-activates all other layers (except your default layer). This function is special, because instead of just adding/removing one layer to your active layer stack, it will completely replace your current active layers, uniquely allowing you to replace higher layers with a lower one. This is activated on keydown (as soon as the key is pressed)."],
        ["TT", "Layer Tap-Toggle. If you hold the key down, layer is activated, and then is de-activated when you let go (like MO). If you repeatedly tap it, the layer will be toggled on or off (like TG). It needs 5 taps by default, but you can change this by defining TAPPING_TOGGLE -- for example, #define TAPPING_TOGGLE 2 to toggle on just two taps."],
    //MultiLayer
        ["LM", "Momentarily activates layer (like MO), but with modifier(s) mod active. Only supports the left modifiers: MOD_LCTL, MOD_LSFT, MOD_LALT, MOD_LGUI."],
        ["LT", "Momentarily activates layer when held, and sends kc when tapped."],
    //ModTap
        ["LCTL_T", "Left Control when held, kc when tapped."],
        ["CTL_T", 	"Left Control when held, kc when tapped."],
        ["LSFT_T", "Left Shift when held, kc when tapped."],
        ["SFT_T", 	"Left Shift when held, kc when tapped."],
        ["LALT_T", 	"Left Alt when held, kc when tapped."],
        ["LOPT_T", "Left Alt when held, kc when tapped."],
        ["ALT_T",  "Left Alt when held, kc when tapped."],
        ["OPT_T", 	"Left Alt when held, kc when tapped."],
        ["LGUI_T", "Left GUI when held, kc when tapped."],
        ["LCMD_T", "Left GUI when held, kc when tapped."],
        ["LWIN_T", "Left GUI when held, kc when tapped."],
        ["GUI_T", "Left GUI when held, kc when tapped."],
        ["CMD_T", "Left GUI when held, kc when tapped."],
        ["WIN_T", "Left GUI when held, kc when tapped."],
        ["RCTL_T", "Right Control when held, kc when tapped."],
        ["RSFT_T", "Right Shift when held, kc when tapped."],
        ["RALT_T", "Right Alt when held, kc when tapped."],
        ["ROPT_T", "Right Alt when held, kc when tapped."],
        ["ALGR_T", "Right Alt when held, kc when tapped."],
        ["RGUI_T", "Right GUI when held, kc when tapped."],
        ["RCMD_T", "Right GUI when held, kc when tapped."],
        ["RWIN_T", "Right GUI when held, kc when tapped."],
        ["LSG_T", "Left Shift and GUI when held, kc when tapped."],
        ["SGUI_T", "Left Shift and GUI when held, kc when tapped."],
        ["SCMD_T", "Left Shift and GUI when held, kc when tapped."],
        ["SWIN_T", "Left Shift and GUI when held, kc when tapped."],
        ["LAG_T", "Left Alt and GUI when held, kc when tapped."],
        ["RSG_T", "Right Shift and GUI when held, kc when tapped."],
        ["RAG_T", "Right Alt and GUI when held, kc when tapped."],
        ["LCA_T", "Left Control and Alt when held, kc when tapped."],
        ["LSA_T", "Left Shift and Alt when held, kc when tapped."],
        ["RSA_T", "Right Shift and Right Alt (AltGr) when held, kc when tapped."],
        ["SAGR_T", "Right Shift and Right Alt (AltGr) when held, kc when tapped."],
        ["RCS_T", "Right Control and Right Shift when held, kc when tapped."],
        ["LCAG_T", "Left Control, Alt and GUI when held, kc when tapped."],
        ["RCAG_T", "Right Control, Alt and GUI when held, kc when tapped."],
        ["C_S_T", "Left Control and Shift when held, kc when tapped."],
        ["MEH_T", "Left Control, Shift and Alt when held, kc when tapped."],
        ["HYPR_T", "Left Control, Shift, Alt and GUI when held, kc when tapped."],
        ["ALL_T", "Left Control, Shift, Alt and GUI when held, kc when tapped."],
]);

export const modifiers = new Map([
        ["MOD_LCTL", "Left Control"],
        ["MOD_LSFT", "Left Shift"],
        ["MOD_LALT", "Left Alt"],
        ["MOD_LGUI", "Left GUI (Windows/Command/Meta key)"],
        ["MOD_RCTL", "Right Control"],
        ["MOD_RSFT", "Right Shift"],
        ["MOD_RALT", "Right Alt (AltGr)"],
        ["MOD_RGUI", "Right GUI (Windows/Command/Meta key)"],
        ["MOD_HYPR", "Hyper (Left Control, Shift, Alt and GUI)"],
        ["MOD_MEH", "Meh (Left Control, Shift, and Alt)"],
]);

export const basicKeycodes = new Set([
        "KC_ENTER",
        "KC_ENT",
        "KC_RETURN",
        "KC_RETN",
        "KC_BACKSPACE",
        "KC_BSPC",
        "KC_ESCAPE",
        "KC_ESC",
        "KC_TAB",
        "KC_RIGHT",
        "KC_RGHT",
        "KC_LEFT",
        "KC_DOWN",
        "KC_UP",
        "KC_A",
        "KC_B",
        "KC_C",
        "KC_D",
        "KC_E",
        "KC_F",
        "KC_G",
        "KC_H",
        "KC_I",
        "KC_J",
        "KC_K",
        "KC_L",
        "KC_M",
        "KC_N",
        "KC_O",
        "KC_P",
        "KC_Q",
        "KC_R",
        "KC_S",
        "KC_T",
        "KC_U",
        "KC_V",
        "KC_W",
        "KC_X",
        "KC_Y",
        "KC_Z",
        "KC_1",
        "KC_2",
        "KC_3",
        "KC_4",
        "KC_5",
        "KC_6",
        "KC_7",
        "KC_8",
        "KC_9",
        "KC_0",
        "KC_SPACE",
        "KC_SPC",
        "KC_MINUS",
        "KC_MINS",
        "KC_EQUAL",
        "KC_EQL",
        "KC_LEFT_BRACKET",
        "KC_LBRC",
        "KC_RIGHT_BRACKET",
        "KC_RBRC",
        "KC_BACKSLASH",
        "KC_BSLS",
        "KC_NONUS_HASH",
        "KC_NUHS",
        "KC_SEMICOLON",
        "KC_SCLN",
        "KC_QUOTE",
        "KC_QUOT",
        "KC_GRAVE",
        "KC_GRV",
        "KC_COMMA",
        "KC_COMM",
        "KC_DOT",
        "KC_SLASH",
        "KC_SLSH",
        "KC_CAPS_LOCK",
        "KC_CAPS",
        "KC_F1",
        "KC_F2",
        "KC_F3",
        "KC_F4",
        "KC_F5",
        "KC_F6",
        "KC_F7",
        "KC_F8",
        "KC_F9",
        "KC_F10",
        "KC_F11",
        "KC_F12",
        "KC_PRINT_SCREEN",
        "KC_PSCR",
        "KC_SCROLL_LOCK",
        "KC_SCRL",
        "KC_BRMD",
        "KC_PAUSE",
        "KC_PAUS",
        "KC_BRK",
        "KC_BRMU",
        "KC_INSERT",
        "KC_INS",
        "KC_HOME",
        "KC_PAGE_UP",
        "KC_PGUP",
        "KC_DELETE",
        "KC_DEL",
        "KC_END",
        "KC_PAGE_DOWN",
        "KC_PGDN",
        "KC_NUM_LOCK",
        "KC_NUM",
        "KC_KP_SLASH",
        "KC_PSLS",
        "KC_KP_ASTERISK",
        "KC_PAST",
        "KC_KP_MINUS",
        "KC_PMNS",
        "KC_KP_PLUS",
        "KC_PPLS",
        "KC_KP_ENTER",
        "KC_PENT",
        "KC_KP_1",
        "KC_P1",
        "KC_KP_2",
        "KC_P2",
        "KC_KP_3",
        "KC_P3",
        "KC_KP_4",
        "KC_P4",
        "KC_KP_5",
        "KC_P5",
        "KC_KP_6",
        "KC_P6",
        "KC_KP_7",
        "KC_P7",
        "KC_KP_8",
        "KC_P8",
        "KC_KP_9",
        "KC_P9",
        "KC_KP_0",
        "KC_P0",
        "KC_KP_DOT",
        "KC_PDOT",
        "KC_NONUS_BACKSLASH",
        "KC_NUBS",
        "KC_APPLICATION",
        "KC_APP",
        "KC_KB_POWER",
        "KC_KP_EQUAL",
        "KC_PEQL",
    ]
);

