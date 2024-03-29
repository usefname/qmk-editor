// import {QMKElement} from "@/qmk-element.ts";
import {listen} from "@tauri-apps/api/event";
import {invoke} from "@tauri-apps/api/tauri";
import {QMKElement} from "./qmk-element.ts";
import {Keymap} from "./lib/keymap.ts";
import {requireNonNull} from "./lib/type-guard.ts";

// language=HTML
document.body.insertAdjacentHTML('afterbegin',
    `
        <template id="qmk-build">
            <style>
                #build-textarea {
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

            <div class="settings is-flex is-flex-direction-column is-align-items-center is-justify-content-center">
                <div class="build-section">
                    <h5 class="is-size-5">Keymap file</h5>
                    <div class="field is-horizontal">
                        <div class="field-body control">
                            <input id='keymap-input' class="input" type="text"/>
                        </div>
                    </div>
                </div>
                <div class="build-section">
                    <h5 id='buildcommand-heading' class="is-size-5"></h5>
                    <div class="field is-horizontal">
                        <div class="field-body">
                            <textarea id='build-textarea' class="textarea" type="text"></textarea>
                        </div>
                    </div>
                </div>
                <div class="build-section">
                    <button id='exit-button' class="ml-4 button is-primary">Back</button>
                </div>
            </div>
        </template>`
);

export class QMKBuild extends QMKElement {
    private keymapInput: HTMLInputElement;
    private buildCommandTitle: HTMLHeadingElement;
    private buildTextArea: HTMLTextAreaElement;
    private exitButton: HTMLButtonElement;
    private buildFinished: boolean;
    private buildPromiseStopping: boolean;
    private buildPromiseResolved: boolean;
    private buildOutputListener: (() => void) | null;
    private buildStatusListener: (() => void) | null;

    constructor() {
        super('qmk-build');
        this.keymapInput = requireNonNull(this.template.getElementById('keymap-input')) as HTMLInputElement;
        this.buildCommandTitle = requireNonNull(this.template.getElementById('buildcommand-heading')) as HTMLHeadingElement;
        this.buildTextArea = requireNonNull(this.template.getElementById('build-textarea')) as HTMLTextAreaElement;
        this.exitButton = requireNonNull(this.template.getElementById('exit-button')) as HTMLButtonElement;

        this.buildFinished = false;
        this.buildPromiseStopping = false;
        this.buildPromiseResolved = false;

        this.addEventsToElement(this.template, [
            ['#exit-button', 'click', this.onExitClick]
        ]);

        this.initElements();
        if (this.shadowRoot) {
            this.shadowRoot.appendChild(this.template);
        }
        this.buildOutputListener = null;
        this.buildStatusListener = null;
    }

    initElements() {
        this.buildFinished = false;
        this.buildPromiseStopping = false;
        this.buildPromiseResolved = false;

        this.exitButton.innerText = 'Cancel build';

        this.keymapInput.placeholder = 'Keymap filename';
        this.buildCommandTitle.textContent = 'Running:';
        this.buildTextArea.placeholder = 'Qmk build output';
        this.buildTextArea.textContent = '';
        this.buildTextArea.classList.remove('is-danger');
        this.buildTextArea.classList.remove('is-primary');
        this.keymapInput.classList.remove('is-danger');
        this.keymapInput.classList.remove('is-primary');
    }


    startBuild(keyboardName: string, layoutName: string, keymap: Keymap) {
        this._startBuild(keyboardName, layoutName, keymap);
    }

    async _startBuild(keyboardName: string, layoutName: string, keymap: Keymap) {
        this.buildPromiseResolved = false;
        try {
            const keymapPath: string = await invoke('create_keymap_path', {keyboardName: keyboardName});
            this.keymapInput.value = keymapPath;
            if (this.buildPromiseStopping) return;
            await this.enableBuildListeners();
            try {
                await invoke('generate_keymap', {
                    keymapDescription: {
                        keyboard_name: keyboardName,
                        layout_name: layoutName,
                        keymap: keymap
                    }
                });
            } catch (err) {
                this.failedKeymap();
                throw err;
            }
            this.successfulKeymap();
            if (this.buildPromiseStopping) return;
            const buildCommand = await invoke('start_flash', {keyboard: keyboardName});
            if (this.buildCommandTitle.textContent) {
                this.buildCommandTitle.textContent += buildCommand;
            }
        } catch (err) {
            this.setBuildFinished();
            this.emitEvent('qmk-error', err);
        }
        this.buildPromiseResolved = true;
    }

    disableBuildListeners() {
        if (this.buildOutputListener) {
            this.buildOutputListener();
        }
        if (this.buildStatusListener) {
            this.buildStatusListener();
        }
    }

    async enableBuildListeners() {
        this.buildOutputListener = await listen('build_output', (event) => {
            if (this.buildTextArea.textContent !== null) {
                this.buildTextArea.textContent += event.payload;
            }
            this.buildTextArea.scrollTop = this.buildTextArea.scrollHeight;
        });
        this.buildStatusListener = await listen('build_finished', (event) => {
            let status = event.payload === "true";
            if (status) {
                this.successfulFlash();
            } else {
                this.failedFlash();
            }
            this.setBuildFinished();
            this.buildTextArea.scrollTop = this.buildTextArea.scrollHeight;
            if (status) {
                this.emitEvent('exit-build', {});
            }
        });
    }

    stopBuild() {
        if (this.buildPromiseResolved === false) {
            this.buildPromiseResolved = true;
        }
        invoke('stop_flash').then(() => {
            this.buildTextArea.scrollTop = this.buildTextArea.scrollHeight;
        }).catch(err => {
            this.emitEvent('qmk-error', err);
        }).finally(() => {
            this.setBuildFinished();
        });
    }


    failedKeymap() {
        this.keymapInput.classList.add('is-danger');
    }

    successfulKeymap() {
        this.keymapInput.classList.add('is-primary');
    }

    failedFlash() {
        this.buildTextArea.classList.add('is-danger');
    }

    successfulFlash() {
        this.buildTextArea.classList.add('is-primary');
    }

    setBuildFinished() {
        this.exitButton.innerText = 'Back';
        this.buildFinished = true;
    }

    onExitClick() {
        if (this.buildFinished) {
            this.disableBuildListeners();
            this.initElements();
            this.emitEvent('exit-build', {});
        } else {
            this.stopBuild();
        }
    }
}

customElements.define('qmk-build', QMKBuild);
