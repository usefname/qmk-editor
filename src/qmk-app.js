import {QMKElement} from './qmk-element.js';

document.body.insertAdjacentHTML('afterbegin',
// language=HTML
    `<template id="qmk-app">
        <div class="container is-widescreen is-justify-content-space-between is-flex is-align-items-center">
            <div id="keyboardTitle" class="is-size-3"></div>
            <div class="is-flex is-align-items-center">
                <button id="saveAsButton" class="button class:is-invisible={!keyboardName}">Save as</button>
                <button id="saveButton" class="button ml-4 class:is-invisible={!keyboardName}" disabled={!dirty}>Save</button>
                <button id="loadButton" class="button ml-4">Load</button>
                <button id="importButton" class="ml-4 button">Import</button>
                <button id="buildButton" class="ml-4 button">Build</button>
                <button id="configButton" class="ml-4 button">Settings</button>
            </div>
        </div>
        <KeymapWorkspace bind:dirty bind:keymap={keymap} keyboardName={keyboardName} layoutName={layoutName} layout={layout}/>
    </template>`
);


class QMKApp extends QMKElement {
    constructor() {
        super('qmk-app');

        let needConfigUpdate = await

        let keyboardName = "Hello";
        let editorState = {
           filename: "dude"
        }

        let kbtext = keyboardName ? keyboardName : "Import QMK keyboard" + editorState.filename ? " - " + editorState.filename : "";
        this.template.querySelector("#keyboardTitle").textContent = kbtext;
        this.template.addEvents([
            ['#saveAsButton', 'click', this.onSaveAs],
            ['#saveButton', 'click', this.onSave],
            ['#loadButton', 'click', this.onLoad],
            ['#importButton', 'click', this.onImport],
            ['#buildButton', 'click', this.onBuild],
            ['#configButton', 'click', this.onConfig],
        ]);
        this.shadowRoot.appendChild(this.template);
    }

    onSaveAs() {
        console.log("onSaveAs");
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
    }

    onConfig() {
        console.log("onConfig");
    }

}

customElements.define('qmk-app', QMKApp);


class PopUpInfo extends HTMLElement {
    constructor() {
        // Always call super first in constructor
        super();

    //     // Create a shadow root
    //     const shadow = this.attachShadow({mode: 'open'});
    //
    //     // Create spans
    //     const wrapper = document.createElement('span');
    //     wrapper.setAttribute('class', 'wrapper');
    //
    //     const icon = document.createElement('span');
    //     icon.setAttribute('class', 'icon');
    //     icon.setAttribute('tabindex', 0);
    //
    //     const info = document.createElement('span');
    //     info.setAttribute('class', 'info');
    //
    //     // Take attribute content and put it inside the info span
    //     const text = this.getAttribute('data-text');
    //     info.textContent = text;
    //
    //     // Insert icon
    //     let imgUrl;
    //     if(this.hasAttribute('img')) {
    //         imgUrl = this.getAttribute('img');
    //     } else {
    //         imgUrl = 'img/default.png';
    //     }
    //
    //     const img = document.createElement('img');
    //     img.src = imgUrl;
    //     icon.appendChild(img);
    //
    //     // Create some CSS to apply to the shadow dom
    //     const style = document.createElement('style');
    //     console.log(style.isConnected);
    //
    //     style.textContent = `
    //   .wrapper {
    //     position: relative;
    //   }
    //   .info {
    //     font-size: 0.8rem;
    //     width: 200px;
    //     display: inline-block;
    //     border: 1px solid black;
    //     padding: 10px;
    //     background: white;
    //     border-radius: 10px;
    //     opacity: 0;
    //     transition: 0.6s all;
    //     position: absolute;
    //     bottom: 20px;
    //     left: 10px;
    //     z-index: 3;
    //   }
    //   img {
    //     width: 1.2rem;
    //   }
    //   .icon:hover + .info, .icon:focus + .info {
    //     opacity: 1;
    //   }
    // `;
    //
    //     // Attach the created elements to the shadow dom
    //     shadow.appendChild(style);
    //     console.log(style.isConnected);
    //     shadow.appendChild(wrapper);
    //     wrapper.appendChild(icon);
    //     wrapper.appendChild(info);
    }
}

// Define the new element
customElements.define('popup-info', PopUpInfo);
