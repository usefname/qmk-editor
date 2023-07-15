export enum EditMode {
    KEY_EDIT_INTERACTIVE= 'Interactive',
    KEY_EDIT_TEXT = 'Text'
}

export type Layer = string[];
export type Keymap = Layer[];

export const padKeymap = (layers: Keymap, layoutLenght: number) => {
    for (let i = 0; i < layers.length; i ++) {
        let layer = layers[i];
        let missingKeys = layoutLenght - layer.length;
        while (missingKeys > 0) {
            layer.push("KC_NO");
            missingKeys--;
        }
    }
    return layers;
}


export const removeLayer = (layers: Keymap, layerToDelete: number) => {
    if (layers.length > 1) {
        layers.splice(layerToDelete, 1);
    }
}

export const insertEmptyLayer = (keymap: Keymap, layoutLength: number) => {
    let emptyLayer: Layer = [];
    for(let i = 0; i < layoutLength; i++) {
        emptyLayer.push("KC_NO");
    }
    return [...keymap, emptyLayer];
}
