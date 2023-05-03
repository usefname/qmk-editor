import keycodeCaption from './keycodes/keyCaption.json' assert {type: "json"};
import keycodeDescription from './keycodes/keyDescription.json' assert {type: "json"};
import fnTypeInfo from './keycodes/keycodeType.json' assert {type: "json"};
import fnTypeDefault from './keycodes/keycodeTypeDefault.json' assert {type: "json"};
import keycodes from './keycodes/keycodes.json' assert {type: "json"};

export const LAYER_ARG = "Layer";
export const BASIC_ARG = "Basic";
export const LEFT_MOD_ARG = "Left Mod";

export const unicodeRegex = /[^\u0000-\u00ff]/;

export const parseCaption = (caption) => {
    let uppercaseCaption = caption.toUpperCase().trim();
    let captionObj = {
        caption: uppercaseCaption,
        emptyKey: hasNoKey(uppercaseCaption),
        multiKey: isMultiActionKey(uppercaseCaption),
        label: {
            base: "",
            split: false,
            description: ""
        }
    }

    if (captionObj.multiKey) {
        let captionFn = parseCaptionFunction(uppercaseCaption);
        if (captionFn.err) {
            captionObj.label.base = uppercaseCaption;
            captionObj.label.split = false;
            captionObj.label.error = captionFn.err;
        } else {
            captionObj.captionFn = captionFn;
            captionObj.label.base = parseBaseLabel(captionFn);
            captionObj.label.description = keycodeToDescription(captionFn.fn);
            captionObj.label.split = isSplitCaption(captionFn);
            if (captionObj.label.split) {
                captionObj.label.inner = parseInnerLabel(captionFn);
            }
        }
    } else {
        let label = captionToLabel(uppercaseCaption);
        if (label) {
            captionObj.label.base = label;
            captionObj.label.description = keycodeToDescription(uppercaseCaption);
            captionObj.label.split = false;
        } else {
            captionObj.label.base = uppercaseCaption;
            captionObj.label.error = "Unknown key";
            captionObj.label.split = false;
            captionObj.label.description = "";
        }
    }
    if (!captionObj.label.base) {
        console.log("Label undefined");
        console.log(captionObj);
    }
    return captionObj;
}

export const replaceArgsInMultiCaption = (keyInfo, args) => {
    if (!keyInfo.multiKey) {
        return keyInfo.caption;
    }
    let captionFn = keyInfo.captionFn;
    let newCaption = captionFn.fn + "(" + args[0].value;
    if (captionFn.args.length > 1) {
        newCaption = newCaption + "," + args[1].value + ")";
    } else {
        newCaption = newCaption + ")";
    }
    return newCaption;
}

const hasNoKey = (caption) => {
    return caption === "KC_NO" || caption === "XXXXXXX"
}

const isMultiActionKey = (caption) => {
    return caption.indexOf('(') > 0;
}

const isArgumentInvalid = (type, value) => {
    if (type === LAYER_ARG) {
        if (isNaN(value)) {
            return "Layer argument requires a number";
        }
    } else if (type === BASIC_ARG) {
        if (!keycodes.basic.includes(value)) {
            return value + " is not a basic keycode";
        }
    } else if (type === LEFT_MOD_ARG) {
        if (!keycodes.leftMods.includes(value)) {
            return value + " is not a valid modifier";
        }
    } else {
        return "Unknown argument type: " + type + " " + LAYER_ARG;
    }
    return false;
}

export const parseCaptionFunction = (caption) => {
    let argStart = caption.indexOf('(');
    if (argStart === -1 || caption.length === argStart+1) {
        return {err: "Invalid multiaction key"};
    }
    if (!caption.endsWith(')')) {
        return {err: "Invalid multiaction key"};
    }
    let fn = caption.substring(0, argStart).trim();
    if (!fnTypeInfo[fn]) {
        return {err: "Unknown multiaction key: " + fn};
    }
    let args = [];
    let rest = caption.substring(argStart+1);

    let argEnd = rest.search("[,)]");
    if (argEnd <= 0) {
        return {err: "Invalid multiaction key"};
    }
    let arg = rest.substring(0, argEnd).trim();
    args.push(arg);

    if (rest.at(argEnd) === ',') {
        rest = rest.substring(argEnd+1);
        argEnd = rest.indexOf(")");
        if (argEnd <= 0) {
            return {err: "Invalid multiaction key"};
        }
        arg = rest.substring(0, argEnd).trim();
        args.push(arg)
    }

    if (fnTypeInfo[fn].length !== args.length) {
        return {err: "Argument length mismatch"};
    }
    let typedArgs = [];
    for (let i in args) {
        let type = fnTypeInfo[fn][i];
        let value = args[i];
        let err = isArgumentInvalid(type, value);
        if (type === LAYER_ARG) {
            value = parseInt(value);
        }
        if (err) {
            return {err: err};
        }
        typedArgs.push({type: type, value: value})
    }
    return {
        fn: fn,
        args: typedArgs
    }
}

const isSplitCaption = (captionFn) => {
    return !(captionFn.args.length === 1 && captionFn.args[0].type === LAYER_ARG);
}

const parseBaseLabel = (captionFn) => {
    let label = captionToLabel(captionFn.fn);
    if (!label) {
        return captionFn.fn;
    }
    if (captionFn.args[0].type === LAYER_ARG) {
        return label + " " + captionFn.args[0].value;
    }
    return label;
}

const parseInnerLabel = (captionFn) => {
    let label;
    if (captionFn.args[0].type === LAYER_ARG && captionFn.args.length > 1) {
        label = captionToLabel(captionFn.args[1].value);
    } else {
        label = captionToLabel(captionFn.args[0].value);
    }
    if (label === null) {
        return captionFn.args[captionFn.args.length-1].value;
    }
    return label;
}

export const captionToLabel = (caption) => {
    if (keycodeCaption[caption]) {
        return keycodeCaption[caption];
    }
    return null;
}

let basicCaptions = {};
export const allBasicCaptions = () => {
    if (Object.entries(basicCaptions).length === 0) {
        for (let keycodeCaptionKey in keycodes.basic) {
            let keyCode =keycodes.basic[keycodeCaptionKey];
            let label = captionToLabel(keyCode);
            if (!basicCaptions[label]) {
                basicCaptions[label] = keyCode;
            }
        }
    }
    return basicCaptions;
}

const keycodeToDescription = (caption) => {
    return keycodeDescription[caption] ? keycodeDescription[caption] : "";
}

export const captionFnKeyArgumentDesc = (captionFn) => {
    // if (fnTypeInfo[keycode]) {
    //     return fnTypeInfo[keycode].map(keyType => {return {"type": keyType, "value": fnTypeDefault[keyType]};});
    // }
    captionFn.args.map()
    return [];
}

export const getKeyArgumentDesc = (keycode) => {
    if (fnTypeInfo[keycode]) {
        return fnTypeInfo[keycode].map(keyType => {return {"type": keyType, "value": fnTypeDefault[keyType]};});
    }
    return [];
}

export const appendDefaultArgs = (caption, argList) => {
    if (argList.length === 1) {
        return caption + "(" + argList[0].value + ")"
    } else if (argList.length === 2) {
        return caption  + "(" +
            argList[0].value +
            ", " +
            argList[1].value +
            ")";
    }
}
