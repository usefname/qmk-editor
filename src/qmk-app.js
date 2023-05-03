import {QMKElement} from './qmk-element.js';
import {QMKError} from './qmk-error.js';
import {invoke} from "@tauri-apps/api/tauri";
import {QMKWorkspace} from './qmk-workspace.js'
import {appWindow} from "@tauri-apps/api/window";
import daskeyboard from './lib/daskeyboard4-info.json';

document.body.insertAdjacentHTML('afterbegin',
// language=HTML
    `<template id="qmk-app">
        <div id="page"></div>
    </template>`
);

class QMKApp extends QMKElement {
    constructor() {
        super('qmk-app');

        this.needConfigUpdate = false;
        this.page = null;
        this.pageElement = null;
        this.keyboard = {
            keyboardName: "ergoDoxEz",
            editorState: {
                filename: null
            }
        }

        this.loadEditorState().then((page) => {
        });
    }

    async loadEditorState() {
       if (stubTauri) {
           console.log("stubbed");
           this.keyboard.keyboardName = "stubbed";
           this.keyboard.editorState.filename = "/home/joe/km/stubbed.json"
           this.needConfigUpdate = false;
           this.loadStubbedKeymap();
           this.updatePage('workspace');
           return 'workspace';
       } else {
           try {
               this.needConfigUpdate = await invoke('need_config_update');
               if (this.needConfigUpdate) {
                   this.keyboard.editorState.filename = null;
                   this.updatePage('config');
                   return 'config';
               } else {
                   const editorState = await invoke('get_state');
                   if (editorState !== null && editorState.filename !== null) {
                       await this.loadKeymap(editorState.filename);
                       this.updatePage('workspace');
                       return 'workspace'
                   } else {
                       this.updatePage('import');
                       return 'import';
               }
           }
           } catch (err) {
               this.showError(err);
               this.updatePage('import');
               return 'import';
           }
       }
    }

    loadStubbedKeymap() {
        this.keyboard.keyboardName = "stubbedKeyboard";
        this.keyboard.layoutName = "LAYOUT_fullsize_iso";
        this.keyboard.layout = daskeyboard.layouts.LAYOUT_fullsize_iso.layout;
        this.keyboard.keymap = [["KC_ESCAPE", "KC_F1", "KC_F2", "KC_F3", "KC_F4", "KC_F5", "KC_F6", "KC_F7", "KC_F8", "KC_F9", "KC_F10", "KC_F11", "KC_F12", "KC_PRINT_SCREEN", "KC_SCROLL_LOCK", "KC_PAUSE", "KC_NO", "KC_GRAVE", "KC_1", "KC_2", "KC_3", "KC_4", "KC_5", "KC_6", "KC_7", "KC_8", "KC_9", "KC_0", "KC_MINUS", "KC_EQUAL", "KC_BACKSPACE", "KC_INSERT", "KC_HOME", "KC_PAGE_UP", "KC_NUM_LOCK", "KC_KP_SLASH", "KC_KP_ASTERISK", "KC_KP_MINUS", "KC_TAB", "KC_Q", "KC_W", "KC_E", "KC_R", "KC_T", "KC_Y", "KC_U", "KC_I", "KC_O", "KC_P", "KC_LEFT_BRACKET", "KC_RIGHT_BRACKET", "KC_DELETE", "KC_END", "KC_PAGE_DOWN", "KC_KP_7", "KC_KP_8", "KC_KP_9", "KC_KP_PLUS", "KC_CAPS_LOCK", "KC_A", "KC_S", "KC_D", "KC_F", "KC_G", "KC_H", "LALT_T(KC_J)", "KC_K", "KC_L", "KC_SEMICOLON", "KC_QUOTE", "KC_BACKSLASH", "KC_ENTER", "KC_KP_4", "KC_KP_5", "KC_KP_6", "KC_LEFT_SHIFT", "KC_LT", "KC_Z", "KC_X", "KC_C", "KC_V", "KC_B", "KC_N", "KC_M", "KC_COMMA", "KC_DOT", "KC_SLASH", "KC_RIGHT_SHIFT", "KC_UP", "KC_KP_1", "KC_KP_2", "KC_KP_3", "KC_KP_ENTER", "KC_LEFT_CTRL", "KC_LEFT_GUI", "KC_LEFT_ALT", "KC_SPACE", "KC_RIGHT_ALT", "KC_RIGHT_GUI", "KC_APPLICATION", "KC_RIGHT_CTRL", "KC_LEFT", "KC_DOWN", "KC_RIGHT", "KC_KP_0", "KC_KP_DOT",]];
        this.keyboard.editorState.filename = "stuppedFilename.km";
        this.keyboard.dirty = false;
    }

    async loadKeymap(keymapFile) {
        let keymapDescription = await invoke('load_keymap', {filename: keymapFile});
        let loadedKeyboard = await invoke('import_keyboard', {keyboard: keymapDescription.keyboard_name});
        await invoke('set_current_file', {filename: keymapFile});
        let layouts = Object.keys(loadedKeyboard.layouts);
        if (layouts.length <= 0) {
            throw keymapDescription.keyboard_name + " is missing layouts";
        }
        this.keyboard.keyboardName = keymapDescription.keyboard_name;
        this.keyboard.layoutName = keymapDescription.layout_name;
        this.keyboard.layout = loadedKeyboard.layouts[keymapDescription.layout_name].layout;
        this.keyboard.keymap = keymapDescription.keymap;
        this.keyboard.editorState.filename = keymapFile;
        this.keyboard.dirty = false;
        this.updateTitle();
    }

    updateTitle() {
        let title = "QMK Editor";
        if (this.keyboard.editorState.filename) {
            title += " - " + this.keyboard.editorState.filename
        }
        appWindow.setTitle(title);
    }

    updatePage(newPage) {
        if (newPage === this.page)
            return;
        this.page = newPage;
        if (this.pageElement) {
            this.shadowRoot.removeChild(this.pageElement);
        }
        switch (this.page) {
            case 'workspace':
                this.showWorkspace();
                break;
            case 'config':
                break;
        }
    }

    showWorkspace() {
        this.pageElement = new QMKWorkspace(this.keyboard);
        const events = [['saveAs', this.onSaveAs],
            ['saveAs', this.onSaveAs],
            ['save', this.onSave],
            ['load', this.onLoad],
            ['import', this.onImport],
            ['build', this.onBuild],
            ['config', this.onConfig],];

        for (const e of events) {
            this.pageElement.addEventListener(e[0], e[1]);
        }
        this.shadowRoot.appendChild(this.pageElement);
    }

    onSaveAs() {
        console.log("onSaveAs");
        this.setKeyboardTitle();
        this.markAsClean();
    }

    onSave() {
        console.log("onSave");
    }

    onLoad() {
       console.log("onLoad");
    }

    onImport() {
        console.log("onImport");
    }

    onBuild() {
        console.log("onBuild");
        this.markAsDirty();
    }

    onConfig() {
        console.log("onConfig");
        this.showError();
    }

    showError(error) {
        const qmkError = new QMKError("QMK ERROR", error);
        const shadowRoot = this.shadowRoot;
        qmkError.addEventListener('close-error', () => {
           shadowRoot.removeChild(qmkError);
        });
        this.shadowRoot.appendChild(qmkError);
    }
}

customElements.define('qmk-app', QMKApp);
