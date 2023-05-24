import _fnTypeInfo from './keycodes/keycodeType.json';



export enum ArgumentType {
    LAYER_ARG = "Layer",
    BASIC_ARG = "Basic",
    LEFT_MOD_ARG = "Left Mod",
}

export const fnTypeDefault = new Map([
    [ArgumentType.LAYER_ARG, "0"],
    [ArgumentType.LEFT_MOD_ARG, "MOD_LALT"],
    [ArgumentType.BASIC_ARG, "KC_A"]
]);


export const fnTypeInfoMap: Map<string, ArgumentType[]> = new Map<string, ArgumentType[]>(_fnTypeInfo as any);
