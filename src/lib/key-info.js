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
