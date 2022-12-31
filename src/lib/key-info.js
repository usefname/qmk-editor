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
    if (caption.indexOf('(')) {
        return captionToLabel(caption.substring(caption.indexOf('(')+1, caption.length-1));
    }
    return '';
}

export const captionToLabel = (caption) => {
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
