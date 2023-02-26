import {QKToDescription} from "./qk-keycode-caption";
import keycodeCaption from './keycodes/qmkCaption.json';

export const LAYER_ARG = "Layer";
export const BASIC_ARG = "Basic";
export const MOD_ARG = "Basic";

const mKeyes2Args = new Set(["LM", "LT"]);
const mKeyes1Args = new Set(["DF", "MO", "OSL", "TG", "TO", "TT", "LCTL_T", "CTL_T", "LSFT_T", "SFT_T", "LALT_T", "LOPT_T", "ALT_T", "OPT_T", "LGUI_T", "LCMD_T", "LWIN_T", "GUI_T", "CMD_T", "WIN_T", "RCTL_T", "RSFT_T", "RALT_T", "ROPT_T", "ALGR_T", "RGUI_T", "RCMD_T", "RWIN_T", "LSG_T", "SGUI_T", "SCMD_T", "SWIN_T", "LAG_T", "RSG_T", "RAG_T", "LCA_T", "LSA_T", "RSA_T", "SAGR_T", "RCS_T", "LCAG_T", "RCAG_T", "C_S_T", "MEH_T", "HYPR_T", "ALL_T"]);

let argument1Type = new Map();
let argument2Type = new Map();
let arg1Layer = ["DF", "MO", "OSL", "TG", "TO", "TT", "LM", "LT"];
for (let i in arg1Layer) {
    let key = arg1Layer[i];
    argument1Type.set(key, LAYER_ARG);
}
for (let i in mKeyes1Args) {
    let key = arg1Layer[i];
    if (!argument1Type.has(key)) {
        argument1Type.set(key, BASIC_ARG);
    }
}
argument2Type.set("LT", BASIC_ARG);
argument2Type.set("LM", MOD_ARG);

export const hasNoKey = (caption) => {return caption === "KC_NO" || caption === "XXXXXXX"}
export const isMultiActionKey = (caption) => {
    return caption.indexOf('(') > 0;
}

export const hasSplitCaption = (caption) => {
    let argStart = caption.indexOf('(');
    if (argStart > 0) {
        let outerCaption = caption.substring(0, argStart).toUpperCase();
        let isSplitCaption = (argument2Type.has(outerCaption) || argument1Type.get(outerCaption) !== LAYER_ARG);
        return isSplitCaption;
    }
}

export const getOuterCaption = (caption) => {
    let argStart = caption.indexOf('(');
    let outerCaption = caption.substring(0, argStart).toUpperCase();
    let label = captionToLabel(outerCaption);
    if (argument1Type.get(outerCaption) === LAYER_ARG) {
        let innerString = caption.substring(argStart, caption.length);
        if (innerString.length > 2) {
            let needle = innerString.search("[,)]");
            if (needle > 1) {
                let arg1 = innerString.substring(1, needle);
                return label + " " + arg1;
            }
        }
    }
    return label;
}

export const getInnerCaption = (caption) => {
    let argStart = caption.indexOf('(');
    let outerCaption = caption.substring(0, argStart).toUpperCase();
    if (mKeyes2Args.has(outerCaption)) {
        let innerCaption = caption.substring(caption.indexOf(',')+1, caption.length-1).toUpperCase();
        let label = captionToLabel(innerCaption);
        return label;
    } else {
        let innerCaption = caption.substring(caption.indexOf('(')+1, caption.length-1).toUpperCase();
        let label = captionToLabel(innerCaption);
        return label;
    }
}

export const captionArity = (caption) => {
    let outerCaption = caption.substring(0, caption.indexOf('(')).toUpperCase();
    if (mKeyes1Args.has(outerCaption)) {
        return 1;
    } else if (mKeyes2Args.has(outerCaption)) {
        return 2;
    }
    return 0;
}

export const getFirstArgType = (caption) => {
    let outerCaption = caption.substring(0, caption.indexOf('(')).toUpperCase();
    if (mKeyes1Args.has(outerCaption)) {
        return argument1Type.get(outerCaption);
    }
    return null;
}

export const getSecondArgType = (caption) => {
    let outerCaption = caption.substring(0, caption.indexOf('(')).toUpperCase();
    if (mKeyes2Args.has(outerCaption)) {
        return argument2Type.get(outerCaption);
    }
    return null;
}

export const replaceFirstArgInCaption = (caption, arg) => {
    if (!isMultiActionKey(caption)) {
        throw("'" + caption + "' does not take any arguments")
    }
    let beforeArg = caption.substring(0, caption.indexOf('(')+1, caption.length-1).toUpperCase();
    let rest = caption.substring(caption.search('[,)]'), caption.length).toUpperCase();

    let newCaption = beforeArg + arg + rest;
    return newCaption;
}

export const getFirstArg = (caption) => {
    if (isMultiActionKey(caption)) {
        let start = caption.indexOf('(');
        let end = caption.search('[,)]');
        if (end > start+1) {
            return caption.substring(start+1, end);
        }
    }
    return "";
}

export const getSecondArg = (caption) => {
    if (isMultiActionKey(caption)) {
        let start = caption.indexOf(',');
        let end = caption.indexOf(')');
        if (end > start+1) {
            return caption.substring(start+1, end);
        }
    }
    return "";
}

export const captionToLabel = (caption) => {
    if (isMultiActionKey(caption)) {
        return getOuterCaption(caption);
    } else {
        let upperCaseCaption = caption.toUpperCase();
        if (keycodeCaption[upperCaseCaption]) {
            return keycodeCaption[upperCaseCaption];
        }
    }
    return caption;
}

export const captionToDescription = (caption) => {
    if (isMultiActionKey(caption)) {
        let argStart = caption.indexOf('(');
        let outerCaption = caption.substring(0, argStart).toUpperCase();
        let description = QKToDescription.has(outerCaption) ? QKToDescription.get(outerCaption) : null;
        return description;
    } else {
        return QKToDescription.has(caption) ? QKToDescription.get(caption) : "";
    }
}
