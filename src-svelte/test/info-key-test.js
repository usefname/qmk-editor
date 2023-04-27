import test from 'node:test';
import assert from 'node:assert/strict';
import {BASIC_ARG, LAYER_ARG, MOD_ARG, parseCaption, parseCaptionFunction} from "../../src/lib/key-info.js";

test('Parsing malformed caption functions returns error', () => {
    assert(parseCaptionFunction("LM(1,A,").err);
    assert(parseCaptionFunction("LM(A,A").err);
    assert(parseCaptionFunction("MO").err);
    assert(parseCaptionFunction("MO(").err);
    assert(parseCaptionFunction("AA(A)").err);
    assert(parseCaptionFunction("MO()").err);
});

test('Parse function args', () => {
    assert.equal(parseCaptionFunction("OSL(1)").args[0].value, 1);
    assert.equal(parseCaptionFunction("OSL(1)").args[0].type, LAYER_ARG);
    assert.equal(parseCaptionFunction("LALT_T(KC_B)").args[0].value, "KC_B");
    assert.equal(parseCaptionFunction("LT(2,KC_A)").args[0].type, LAYER_ARG);
    assert.equal(parseCaptionFunction("LT(2,KC_A)").args[1].type, BASIC_ARG);
    assert.equal(parseCaptionFunction("LM(2,MOD_LALT)").args[1].type, MOD_ARG);
    assert.equal(parseCaptionFunction("LT(2,KC_A)").args[1].value, "KC_A");
});

test('Split caption label', () => {
    assert.equal(parseCaption("OSL(1)").label.split, false);
    assert.equal(parseCaption("LALT_T(KC_B)").label.split, true);
    assert.equal(parseCaption("LM(2,MOD_LALT)").label.split, true);
    assert.equal(parseCaption("LT(2,KC_A)").label.split, true);
    assert.equal(parseCaption("LT(2,KC_A)").label.inner, "A");
    assert.equal(parseCaption("LT(1,KC_A)").label.split, true);
    assert.equal(parseCaption("  LT(  2 ,   KC_A  ) ").label.inner, "A");
});
