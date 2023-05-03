export const padLayerSize = (layers, layoutLenght) => {
    let i = 0;
    for (; i < layers.length; i ++) {
        let layer = layers[i];
        let missingKeys = layoutLenght - layer.length;
        while (missingKeys > 0) {
            layer.push("KC_NO");
            missingKeys--;
        }
    }
    return layers;
}


export const removeLayer = (layers, layerToDelete) => {
    if (layers.length > 1) {
        layers.splice(layerToDelete, 1);
    }
}

export const insertEmptyLayer = (layers, layoutLength) => {
    let emptyLayer = [];
    for(let i = 0; i < layoutLength; i++) {
        emptyLayer.push("KC_NO");
    }
    return [...layers, emptyLayer];
}

export const inserEmptyLayers = (layers, max_layers) => {
    for (let i = layers.length; i < max_layers; i++) {
        layers.push([]);
    }
    return layers;
}

export const isLayerEmpty = (layer) => {
   return layer.length < 1;
}
