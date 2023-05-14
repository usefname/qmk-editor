import {QMKElement} from "@/qmk-element.js";
import {invoke} from "@tauri-apps/api/tauri";
import {open} from "@tauri-apps/api/dialog";

// language=HTML
document.body.insertAdjacentHTML('afterbegin',
    `<template id="qmk-settings">
        <style>
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

        <div class="settings is-flex is-flex-direction-column is-align-items-center is-justify-content-center">
            <p id='error-message' class="message is-size-2 has-background-danger p-4" style="display:none">Failed to read application settings</p>
            <div class="build-section">
                <h5 class="is-size-5">Path to your <a href="https://qmk.github.io/qmk_mkdocs/master/en/tutorial_getting_started/">qmk firmware installation</a>.</h5>
                <div class="field is-horizontal">
                    <div class="field-body control">
                        <input id='qmk-path' class="input" type="text"/>
                        <button id='file-picker' class="ml-4 button is-primary">Select folder</button>
                    </div>
                </div>
            </div>
            <div class="build-section">
                <h5 class="is-size-5">Keymap directory</h5>
                <div class="field is-horizontal">
                    <div class="field-body">
                        <input id='keymap-path' class="input" type="text"/>
                    </div>
                </div>
            </div>
            <div class="build-section">
                <button id='save-button' class="ml-4 button is-primary">Save</button>
                <button id='exit-button' class="ml-4 button is-primary">Back</button>
            </div>
        </div>
    </template>`
);

export class QMKSettings extends QMKElement {
    constructor(requireUpdate) {
        super('qmk-settings');
        this.originalConfig = null;
        this.requireUpdate = requireUpdate;
        this.qmkPathInput = this.template.getElementById('qmk-path');
        this.keymapPathInput = this.template.getElementById('keymap-path');
        this.saveButton = this.template.getElementById('save-button');
        this.exitButton = this.template.getElementById('exit-button');
        this.warningParagraph = this.template.getElementById('error-message');

        this.validQmkPath = false;
        this.validKeymapPath = false;

        this.addEventsToElement(this.template, [
            ['#qmk-path', 'keyup', this.validateQmkPath],
            ['#qmk-path', 'change', this.validateQmkPath],
            ['#keymap-path', 'keyup', this.validateKeyMapDir],
            ['#save-button', 'click', this.onSaveConfig],
            ['#exit-button', 'click', this.onExitSettings],
            ['#file-picker', 'click', this.openFilePicker]
        ]);

        if (this.requireUpdate) {
            this.exitButton.display.style = 'none';
        }

        this.refreshSettings();
        this.shadowRoot.appendChild(this.template);
    }

    refreshSettings() {
        this.load_config().then(originalConfig => {
            this.validateKeyMapDir();
            return this.validateQmkPath();
        }).catch(err => {
            this.warningParagraph.style.display = 'block';
        });
    }

    async load_config() {
        try {
            if (typeof stubTauri !== "undefined") {
                this.originalConfig = {qmk_path: null, generated_keymap: ""};
            } else {
                this.originalConfig = await invoke('get_config');
            }
            const qmkPath = this.originalConfig.qmk_path ? this.originalConfig.qmk_path : "";
            this.updateQmkPath(qmkPath);
            const keymapPath = this.originalConfig.generated_keymap;
            this.updateKeymapPath(keymapPath);
            return this.originalConfig;
        } catch (err) {
            this.emitEvent('qmk-error', err);
            throw err;
        }
    };

    async validateQmkPath() {
        const qmkPath = this.qmkPathInput.value;
        let valid = false;
        if (qmkPath && qmkPath.length > 0) {
            try {
                this.validQmkPath = await invoke('validate_qmk_path', {qmkPath: qmkPath});
                 valid = true;
            } catch (err) {
                this.emitEvent('qmk-error', err);
                throw err;
            }
        }
        this.validQmkPath = valid;
        this.setOrRemoveClass(this.qmkPathInput, 'is-danger', !valid);
        this.validateSettings();
    };

    validateKeyMapDir = () => {
        const valid = this.keymapPathInput.value.length > 0;
        this.validKeymapPath = valid;
        this.setOrRemoveClass(this.keymapPathInput, 'is-danger', !valid);
        this.validateSettings();
    };

    validateSettings() {
        const allSettingsValid= this.validQmkPath && this.validKeymapPath;

        if (allSettingsValid) {
            this.saveButton.disabled = false;
        } else {
            this.saveButton.disabled = true;
        }
        return allSettingsValid;
    };

   async onSaveConfig(qmkPath, keymapPath) {
       if (!this.validateSettings()) {
            return;
       }
        try {
            if (this.validateSettings()) {
                const qmkPath = this.qmkPathInput.value;
                const keymapPath = this.keymapPathInput.value;
                await invoke('save_config', {newConfig: {qmk_path: qmkPath, generated_keymap: keymapPath}});
                this.emitEvent('exit-config');
            }
        } catch (err) {
            this.emitEvent('qmk-error', err);
        }
    };

    onExitSettings() {
        if (!this.requireUpdate) {
            this.emitEvent('exit-config');
        }
    };

    async openFilePicker() {
        try {
            const selected = await open({
                directory: true,
            });
            if (selected !== null) {
                this.updateQmkPath(selected);
                await this.validateQmkPath();
            }
        } catch (err) {
            this.emitEvent('qmk-error', err);
        }
    };

    updateQmkPath(qmkPath) {
        this.qmkPathInput.value = qmkPath;
    }

    updateKeymapPath(keymapPath) {
        this.keymapPathInput.value = keymapPath;
    }
}

customElements.define('qmk-settings', QMKSettings);
