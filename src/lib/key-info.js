export const NORMAL_KEY = "NormalKey";
export const LAYERED_KEY = "LayeredKey";
export const LAYERED_WHEN_HELD_KEY = "LayeredWhenHeldKey";

export const classifyKey = (caption) => {
    if (isKeyLayeredWhenHeld(caption)) {
        return LAYERED_WHEN_HELD_KEY;
    } else if (isKeyLayered(caption)) {
        return LAYERED_KEY;
    } else {
        return NORMAL_KEY;
    }
}

const isKeyLayered = (caption) => {
    return ["MO(", "DF(", "OSL(","TG(", "TO(", "TT("]
        .filter((match) => caption.startsWith(match)).length > 0;
}

const isKeyLayeredWhenHeld = (caption) => {
        return ["LM(", "LT("]
            .filter((match) => caption.startsWith(match)).length > 0;
}

export const hasNoKey = (caption) => {return caption === "KC_NO"}
export const isNormalKey = (caption) => {return caption.substring(0,3) === "KC_"}
export const isComposedKey = (caption) => {return caption.indexOf('(') > 0}
export const getComposedKeyCaption = (caption) => {return caption.substring(0, caption.indexOf('('))}
export const getComposedKeyInnerCaption = (caption) => {
    // if (caption.indexOf('(')) {
    //     return captionToLabel(caption.substring(caption.indexOf('(')+1, caption.length-1));
    // }
    // return '';
    let innerCaption = caption.substring(caption.indexOf('(')+1, caption.length-1);
    console.log("inner:" + innerCaption);
    let label = captionToLabel(innerCaption);
    console.log("label:" + label);
    return label;
}

export const captionToLabelOld = (caption) => {
    if (hasNoKey(caption)) {
        return "N/A";
    } else if (isNormalKey(caption)) {
        return caption.substring(3);
    } else if (isComposedKey(caption)) {
        return getComposedKeyCaption(caption);
    }
    else {
        return caption;
    }
}


export const captionToDisplayRepresentation = new Map ([
    ["KC_NO", "N/A"],
    ["KC_ESCAPE", "Esc"],
    ["KC_ESC", "Esc"],
    ["KC_LEFT_CTRL", "Left Ctrl"],
    ["KC_RIGHT_CTRL", "Right Ctrl"],
    ["KC_ALT", "Alt"],
    ]
);

for (let number = 0; number < 10; number++) {
    captionToDisplayRepresentation.set("KC_"+number, number.toString());
}

for (let functionKey = 1; functionKey <= 12; functionKey++) {
    captionToDisplayRepresentation.set("KC_F"+functionKey, "F"+functionKey.toString());
}

for (let i = 'a'.charCodeAt(0); i <= 'z'.charCodeAt(0); i++) {
    let c = String.fromCharCode(i)
    captionToDisplayRepresentation.set("KC_"+c, c);
}
for (let i = 'A'.charCodeAt(0); i <= 'Z'.charCodeAt(0); i++) {
    let c = String.fromCharCode(i)
    captionToDisplayRepresentation.set("KC_"+c, c);
}

export const captionToLabel = (caption) => {
    let upperCaseCaption = caption.toUpperCase();
    if (captionToDisplayRepresentation.has(upperCaseCaption)) {
        return captionToDisplayRepresentation.get(upperCaseCaption);
    }
    return caption;
}
