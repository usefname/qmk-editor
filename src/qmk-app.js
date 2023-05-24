import {QMKElement} from './qmk-element';
import {QMKError} from './qmk-error.js';
import {invoke} from "@tauri-apps/api/tauri";
import {QMKWorkspace} from './workspace/qmk-workspace.js'
import {appWindow} from "@tauri-apps/api/window";
import daskeyboard from './lib/daskeyboard4-info.json';
import {QMKSettings} from "@/qmk-settings.js";
import {open, save} from "@tauri-apps/api/dialog";
import {QMKImport} from "@/qmk-import.js";
import {insertEmptyLayer} from "@/lib/keymap.ts";
import {QMKBuild} from "@/qmk-build.js";

document.body.insertAdjacentHTML('afterbegin',
// language=HTML
    `<template id="qmk-app">
        <div id='qmk-app'>
            <div id='build'></div>
            <div id='settings'></div>
            <div id='import'></div>
            <div id='workspace'></div>
        </div>
    </template>`
);

class QMKApp extends QMKElement {
    constructor() {
        super('qmk-app');

        this.needConfigUpdate = false;
        this.page = null;
        this.workspaceElement = null;
        this.settingsElement = null;
        this.importElement = null;
        this.buildElement = null;
        this.keyboard = {
            keyboardName: null,
            keymap: null,
            editorState: {
                filename: null
            }
        }

        this.addEvents([
            ['qmk-error', this.onError],
            ['exit-config', this.onExitConfig],
            ['exit-import', this.onExitImport],
            ['exit-build', this.onExitBuild],
            ['import-keyboard', this.onImportKeyboard],
            ['saveAs', this.onSaveAs],
            ['save', this.onSave],
            ['load', this.onLoad],
            ['import', this.onImport],
            ['build', this.onBuild],
            ['config', this.onSettings],
            ]);

        this.loadEditorState().then((page) => {
            //For filesystem cache, import keyboard have a small timeout if not cached
            invoke('cache_keyboards');
        });

        this.shadowRoot.appendChild(this.template);
    }

    async loadEditorState() {
       if (typeof stubTauri !== "undefined") {
           console.log("stubbed");
           this.needConfigUpdate = false;
           this.loadStubbedKeymap();
           this.updatePage('settings');
       } else {
           try {
               this.needConfigUpdate = await invoke('need_config_update');
               if (this.needConfigUpdate) {
                   this.keyboard.editorState.filename = null;
                   this.updatePage('config');
               } else {
                   const editorState = await invoke('get_state');
                   if (editorState !== null && editorState.filename !== null && editorState.filename.length > 0) {
                       await this.loadKeymapFile(editorState.filename);
                       this.updatePage('workspace');
                   } else {
                       this.createImport(true);
                       this.updatePage('import');
                   }
               }
           } catch (err) {
               this.showError(err);
               this.updatePage('import');
           }
       }
    }

    loadStubbedKeymap() {
        this.keyboard.keyboardName = "stubbedKeyboard";
        this.keyboard.layoutName = "LAYOUT_fullsize_iso";
        this.keyboard.layout = daskeyboard.layouts.LAYOUT_fullsize_iso.layout;
        this.keyboard.keymap = [["KC_ESCAPE", "KC_F1", "KC_F2", "KC_F3", "KC_F4", "KC_F5", "KC_F6", "KC_F7", "KC_F8", "KC_F9", "KC_F10", "KC_F11", "KC_F12", "KC_PRINT_SCREEN", "KC_SCROLL_LOCK", "KC_PAUSE", "KC_NO", "KC_GRAVE", "KC_1", "KC_2", "KC_3", "KC_4", "KC_5", "KC_6", "KC_7", "KC_8", "KC_9", "KC_0", "KC_MINUS", "KC_EQUAL", "KC_BACKSPACE", "KC_INSERT", "KC_HOME", "KC_PAGE_UP", "KC_NUM_LOCK", "KC_KP_SLASH", "KC_KP_ASTERISK", "KC_KP_MINUS", "KC_TAB", "KC_Q", "KC_W", "KC_E", "KC_R", "KC_T", "KC_Y", "KC_U", "KC_I", "KC_O", "KC_P", "KC_LEFT_BRACKET", "KC_RIGHT_BRACKET", "KC_DELETE", "KC_END", "KC_PAGE_DOWN", "KC_KP_7", "KC_KP_8", "KC_KP_9", "KC_KP_PLUS", "KC_CAPS_LOCK", "KC_A", "KC_S", "KC_D", "KC_F", "KC_G", "KC_H", "LALT_T(KC_J)", "KC_K", "KC_L", "KC_SEMICOLON", "KC_QUOTE", "KC_BACKSLASH", "KC_ENTER", "KC_KP_4", "KC_KP_5", "KC_KP_6", "KC_LEFT_SHIFT", "KC_LT", "KC_Z", "KC_X", "KC_C", "KC_V", "KC_B", "KC_N", "KC_M", "KC_COMMA", "KC_DOT", "KC_SLASH", "KC_RIGHT_SHIFT", "KC_UP", "KC_KP_1", "KC_KP_2", "KC_KP_3", "KC_KP_ENTER", "KC_LEFT_CTRL", "KC_LEFT_GUI", "KC_LEFT_ALT", "KC_SPACE", "KC_RIGHT_ALT", "KC_RIGHT_GUI", "KC_APPLICATION", "KC_RIGHT_CTRL", "KC_LEFT", "KC_DOWN", "KC_RIGHT", "KC_KP_0", "KC_KP_DOT",]];
        this.keyboard.editorState.filename = null;
        this.keyboard.dirty = false;
    }

    async loadKeymapFile(keymapFile) {
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

    async loadKeyboard(keyboardName, layoutName) {
        let loadedKeyboard = await invoke('import_keyboard', {keyboard: keyboardName});
        await invoke('set_current_file', {filename: ''});
        let layouts = Object.keys(loadedKeyboard.layouts);
        if (layouts.length <= 0 || layoutName in loadedKeyboard.layouts === false) {
            throw keyboardName + " is missing layout " + layoutName;
        }
        const layout = loadedKeyboard.layouts[layoutName].layout;
        this.keyboard.keyboardName = keyboardName;
        this.keyboard.layoutName = layoutName;
        this.keyboard.layout = layout;
        this.keyboard.keymap = insertEmptyLayer([], layout.length);
        this.keyboard.editorState.filename = '';
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
        const rootElement = this.shadowRoot.hasChildNodes() ? this.shadowRoot : this.template;
        for (const child of rootElement.getElementById('qmk-app').children) {
            child.style.display = 'none';
        }
        this.page = newPage;
        switch (this.page) {
            case 'workspace':
                this.showWorkspace();
                break;
            case 'settings':
                this.showSettings();
                break;
            case 'import':
                this.showImport();
                break;
            case 'build':
                this.showBuild();
                break;
        }
    }

    showWorkspace() {
        if (!this.workspaceElement) {
            this.createNewWorkspace();
        }
        this.workspaceElement.style.display = 'block';
    }

    createNewWorkspace() {
        const rootElement = this.shadowRoot.hasChildNodes() ? this.shadowRoot : this.template;
        this.workspaceElement = new QMKWorkspace(this.keyboard);
        this.workspaceElement.id = 'workspace';
        rootElement.querySelector('#workspace').replaceWith(this.workspaceElement);
    }

    showSettings() {
        if (!this.settingsElement) {
            const rootElement = this.shadowRoot.hasChildNodes() ? this.shadowRoot : this.template;
            this.settingsElement = new QMKSettings(false);
            rootElement.querySelector('#settings').replaceWith(this.settingsElement);
            this.settingsElement.id = 'settings';
        } else {
            this.settingsElement.refreshSettings();
        }

        this.settingsElement.style.display = 'block';
    }

    showImport() {
        if (!this.importElement) {
            this.createImport(false);
        } else {
            this.importElement.refreshKeyboardData();
        }
        this.importElement.style.display = 'block';
    }

    showBuild() {
        if (!this.buildElement) {
            const rootElement = this.shadowRoot.hasChildNodes() ? this.shadowRoot : this.template;
            this.buildElement = new QMKBuild(false);
            rootElement.querySelector('#build').replaceWith(this.buildElement);
            this.buildElement.id = 'settings';
        }

        this.buildElement.startBuild(this.keyboard.keyboardName, this.keyboard.layoutName, this.keyboard.keymap);

        this.buildElement.style.display = 'block';
    }

    createImport(requireSelection) {
        const rootElement = this.shadowRoot.hasChildNodes() ? this.shadowRoot : this.template;
        this.importElement = new QMKImport(requireSelection);
        rootElement.querySelector('#import').replaceWith(this.importElement);
        this.importElement.id = 'import';
    }

    onImportKeyboard(ev) {
        this.loadKeyboard(ev.detail.keyboardName, ev.detail.layoutName).then(() => {
            this.createNewWorkspace();
            this.updatePage('workspace');
        }).catch(err => {
            this.showError(err);
        });
    }

    onSaveAs() {
        save({
            title: "Save keymap",
            defaultPath: this.keyboard.keyboardName + ".keymap",
            filters: [{
                name: "keymap",
                extensions: ["keymap"]
            }]
        }).then(selected => {
            if (selected === null)
                return;
            return invoke('save_keymap', {
                filename: selected,
                keymapDescription: {keyboard_name: this.keyboard.keyboardName, layout_name: this.keyboard.layoutName, keymap: this.keyboard.keymap}
            }).then(() => {
                this.keyboard.dirty = false;
                this.keyboard.editorState.filename = selected; //; this should probably use return value from save_keymap
                this.workspaceElement.markAsClean();
                this.workspaceElement.updateFileName();
                this.updateTitle();
                return invoke('set_current_file', {filename: selected});
            }).catch(err => {
                this.showError(err);
            });
        });
    }

    onSave() {
        if (this.keyboard.editorState.filename && this.keyboard.editorState.filename.length > 0) {
            invoke('save_keymap', {
                filename: this.keyboard.editorState.filename,
                keymapDescription: {keyboard_name: this.keyboard.keyboardName, layout_name: this.keyboard.layoutName, keymap: this.keyboard.keymap}
            }).then(() => {
                this.keyboard.dirty = false;
                this.workspaceElement.markAsClean();
            }).catch(err => {
                this.showError(err);
            })
        }
    }

    onLoad() {
        open({
            title: "Open keymap",
            filters: [{
                name: "keymap",
                extensions: ["keymap"]
            }]
        }).then(selected => {
            if (selected !== null) {
                return this.loadKeymapFile(selected);
            }
        }).then(() => {
            this.createNewWorkspace();
        }).catch(err => {
            this.showError(err);
        });
    }

    onImport() {
        this.updatePage('import');
    }

    onBuild() {
        this.updatePage('build');
        // start build
    }

    onSettings() {
        this.updatePage('settings');
    }

    onError(ev) {
        if (typeof stubTauri !== "undefined") {
            console.log(ev);
            return;
        }
        this.showError(ev.detail);
    }

    onExitConfig() {
        this.updatePage('workspace');
    }

    onExitImport() {
        this.updatePage('workspace');
    }

    onExitBuild() {
        this.updatePage('workspace');
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
