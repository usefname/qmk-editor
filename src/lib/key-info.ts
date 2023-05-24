import keycodeCaption from './keycodes/keyCaption.json';
import keycodeDescription from './keycodes/keyDescription.json';
import {fnTypeInfoMap, ArgumentType, fnTypeDefault} from './keycodetype';
import keycodes from './keycodes/keycodes.json';

export const LAYER_ARG = "Layer";
export const BASIC_ARG = "Basic";
export const LEFT_MOD_ARG = "Left Mod";

export const unicodeRegex = /[^\u0000-\u00ff]/;

export const keycodeLabelMap = new Map<string, string>();
for (const key in keycodeCaption) {
    keycodeLabelMap.set(key, (keycodeCaption as any)[key]);
}

export const keycodeDescriptionMap = new Map<string, string>();
for (const key in keycodeDescription) {
    keycodeDescriptionMap.set(key, (keycodeDescription as any)[key]);
}

export interface CaptionInfo {
    caption: string,
    emptyKey: boolean,
    multiKey: boolean,
    label: KeyLabel,
    captionFn?: MultiFunctionKey
}

export interface KeyLabel {
    base: string,
    inner?: string,
    split: boolean,
    description: string,
    error?: string
}

export class MultiFunctionKey {
    fn: string;
    args: KeyArg[];
    err?: ParseError;

    constructor(fn: string, args: KeyArg[], err?: ParseError) {
        this.fn = fn;
        this.args = args;
        this.err = err;
    }
}

export class ParseError {
    err: string;

    constructor(err: string) {
        this.err = err;
    }
}

export interface KeyArg {
    type: ArgumentType,
    value: string|number
}


export const parseCaption = (caption: string) => {
    let uppercaseCaption = caption.toUpperCase().trim();
    let captionObj: CaptionInfo = {
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

        if (captionFn instanceof ParseError) {
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
        let label = keycodeLabelMap.get(uppercaseCaption);
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

export const replaceArgsInMultiCaption = (captionFn: MultiFunctionKey, args: KeyArg[]) => {
    let newCaption = captionFn.fn + "(" + args[0].value;
    if (captionFn.args.length > 1) {
        newCaption = newCaption + "," + args[1].value + ")";
    } else {
        newCaption = newCaption + ")";
    }
    return newCaption;
}

export const replaceArgInMultiCaption = (captionFn: MultiFunctionKey, replacedArg: string|number, argType: ArgumentType): string => {
    let args: KeyArg[] = [];
    for (const arg of captionFn.args) {
        if (argType === arg.type) {
            arg.value = replacedArg;
        }
        args.push(arg);
    }

    return replaceArgsInMultiCaption(captionFn, args);
}


const hasNoKey = (caption: string) => {
    return caption === "KC_NO" || caption === "XXXXXXX"
}

const isMultiActionKey = (caption: string) => {
    return caption.indexOf('(') > 0;
}

const isArgumentInvalid = (keyArg: KeyArg) => {
    if (keyArg.type === LAYER_ARG) {
        if (isNaN(keyArg.value as number)) {
            return "Layer argument requires a number";
        }
    } else if (keyArg.type === BASIC_ARG) {
        if (!keycodes.basic.includes(keyArg.value as string)) {
            return keyArg.value + " is not a basic keycode";
        }
    } else if (keyArg.type === LEFT_MOD_ARG) {
        if (!keycodes.leftMods.includes(keyArg.value as string)) {
            return keyArg.value + " is not a valid modifier";
        }
    } else {
        return "Unknown argument type: " + keyArg.type + " " + LAYER_ARG;
    }
    return false;
}

export const parseCaptionFunction = (caption: string): MultiFunctionKey | ParseError => {
    let argStart = caption.indexOf('(');
    if (argStart === -1 || caption.length === argStart+1) {
        return new ParseError("Invalid multiaction key");
    }
    if (!caption.endsWith(')')) {
        return new ParseError("Invalid multiaction key");
    }
    let fn = caption.substring(0, argStart).trim();

    const keyTypeInfo = fnTypeInfoMap.get(fn)
    if (!keyTypeInfo) {
        return new ParseError("Unknown multiaction key: " + fn);
    }

    let args = [];
    let rest = caption.substring(argStart+1);

    let argEnd = rest.search("[,)]");
    if (argEnd <= 0) {
        return new ParseError("Invalid multiaction key");
    }
    let arg = rest.substring(0, argEnd).trim();
    args.push(arg);


    if (rest.at(argEnd) === ',') {
        rest = rest.substring(argEnd+1);
        argEnd = rest.indexOf(")");
        if (argEnd <= 0) {
            return new ParseError("Invalid multiaction key");
        }
        arg = rest.substring(0, argEnd).trim();
        args.push(arg)
    }

    if (keyTypeInfo.length !== args.length) {
        return new ParseError("Argument length mismatch");
    }

    let typedArgs: KeyArg[] = [];
    for (let i in args) {
        let type: ArgumentType = keyTypeInfo[i];
        let value: string|number = args[i];

        if (type === LAYER_ARG) {
            value = parseInt(value);
        }

        const keyArg: KeyArg = {type: type, value: value};

        let err = isArgumentInvalid(keyArg);
        if (err) {
            return new ParseError(err);
        }

        typedArgs.push(keyArg)
    }
    return new MultiFunctionKey(fn, typedArgs);
}

const isSplitCaption = (captionFn: MultiFunctionKey) => {
    return !(captionFn.args.length === 1 && captionFn.args[0].type === LAYER_ARG);
}

const parseBaseLabel = (captionFn: MultiFunctionKey) => {
    let label = keycodeLabelMap.get(captionFn.fn);
    if (!label) {
        return captionFn.fn;
    }
    if (captionFn.args[0].type === LAYER_ARG) {
        return label + " " + captionFn.args[0].value;
    }
    return label;
}

const parseInnerLabel = (captionFn: MultiFunctionKey) => {
    let label;
    if (captionFn.args[0].type === LAYER_ARG && captionFn.args.length > 1) {
        label = keycodeLabelMap.get(captionFn.args[1].value as string);
    } else {
        label = keycodeLabelMap.get(captionFn.args[0].value as string);
    }
    if (label === null) {
        return captionFn.args[captionFn.args.length-1].value as string;
    }
    return "";
}

let basicCaptions = new Map<string, string>();
export const allBasicCaptions = (): Map<string,string> => {
    if (basicCaptions.size === 0) {
        for (let keycodeCaptionKey in keycodes.basic) {
            let keyCode = keycodes.basic[keycodeCaptionKey];
            let label = keycodeLabelMap.get(keyCode);
            if (typeof label == "string" && !basicCaptions.has(label)) {
                basicCaptions.set(label, keyCode);
            }
        }
    }
    return basicCaptions;
}

const keycodeToDescription = (keycode: string): string => {
    const desc = keycodeDescriptionMap.get(keycode);
    return desc ? desc : "";
}

export const getKeyArgumentDesc = (keycode: string): KeyArg[] => {
    const argTypes = fnTypeInfoMap.get(keycode);
    if (!argTypes) {
        return [];
    }

    return argTypes.map(argType => {
        const defaultValue = fnTypeDefault.get(argType);
        if (typeof defaultValue !== "string") {
            throw "No default value for Argument type" + argType;
        }
        return {
            "type": argType,
            "value": defaultValue
        };
    });
}

export const appendDefaultArgs = (caption: string, argList: KeyArg[]) => {
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
