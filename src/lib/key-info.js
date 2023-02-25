import {QKToCaption, QKToDescription} from "./qk-keycode-caption";

export const LAYER_ARG = "Layer";
export const BASIC_ARG = "Basic";
export const MOD_ARG = "Basic";

const mKeyes2Args = new Set(["LM", "LT"]);
const mKeyes1Arg = new Set(["DF", "MO", "OSL", "TG", "TO", "TT", "LCTL_T", "CTL_T", "LSFT_T", "SFT_T", "LALT_T", "LOPT_T", "ALT_T", "OPT_T", "LGUI_T", "LCMD_T", "LWIN_T", "GUI_T", "CMD_T", "WIN_T", "RCTL_T", "RSFT_T", "RALT_T", "ROPT_T", "ALGR_T", "RGUI_T", "RCMD_T", "RWIN_T", "LSG_T", "SGUI_T", "SCMD_T", "SWIN_T", "LAG_T", "RSG_T", "RAG_T", "LCA_T", "LSA_T", "RSA_T", "SAGR_T", "RCS_T", "LCAG_T", "RCAG_T", "C_S_T", "MEH_T", "HYPR_T", "ALL_T"]);

let argument1Type = new Map();
let argument2Type = new Map();
let arg1Layer = ["DF", "MO", "OSL", "TG", "TO", "TT", "LM", "LT"];
for (let i in arg1Layer) {
    let key = arg1Layer[i];
    argument1Type.set(key, LAYER_ARG);
}
for (let i in mKeyes1Arg) {
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
    if (argument1Type.get(label) === LAYER_ARG) {
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
    let innerCaption = caption.substring(caption.indexOf('(')+1, caption.length-1).toUpperCase();
    let label = captionToLabel(innerCaption);
    return label;
}

export const captionArity = (caption) => {
    let outerCaption = caption.substring(0, caption.indexOf('(')).toUpperCase();
    if (mKeyes1Arg.has(outerCaption)) {
        return 1;
    } else if (mKeyes2Args.has(outerCaption)) {
        return 2;
    }
    return 0;
}

export const captionToLabel = (caption) => {
    if (isMultiActionKey(caption)) {
        return getOuterCaption(caption);
    } else {
        let upperCaseCaption = caption.toUpperCase();
        if (QKToCaption.has(upperCaseCaption)) {
            return QKToCaption.get(upperCaseCaption);
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

// export const captionToDescription = (caption) => {
//     let key;
//     if (isMultiActionKey(caption)) {
//         key = getOuterCaption(caption);
//     } else {
//         key = caption;
//     }
//     return QKToDescription.has(key) ? QKToDescription.get(key) : ""
// }
