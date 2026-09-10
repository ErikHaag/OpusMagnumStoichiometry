/**
 * @typedef {Map<string,bigint>} AtomCounts
 * @typedef {Map<string,Array<string>>} WheelStates
 */

class State {
    constructor() {
        /** @type {AtomCounts} */
        this.atoms = new Map();
        /** @type {WheelStates} */
        this.wheels = new Map();
    }

    /** @this {State} */
    copy() {
        return structuredClone(this);
    }
}

class WheelTransmutation {
    /**
     *
     * @param {string} wheelName
     * @param {Array<number>} offsets
     * @param {Array<string>} inputList 
     * @param {Array<string>} outputList
     */
    constructor(wheelName, offsets, inputList, outputList) {
        this.wheel = wheelName;
        this.offsets = offsets;
        this.inputs = inputList;
        this.outputs = outputList;
        if (this.offsets.length != this.inputs.length || this.inputs.length != this.outputs.length) {
            throw new Error("offsets and atoms must match.");
        }
    }
}

class Transmutation {
    /**
     * 
     * @param {Array<string>} inputAtoms 
     * @param {Array<WheelTransmutation>} wheelChanges 
     * @param {Array<string>} outputAtoms
     * @param {Array<string>} otherGlyphs
     */
    constructor(inputAtoms, outputAtoms, wheelChanges, otherGlyphs = []) {
        this.isModded = true;
        this.inputAtoms = Utilities.listToMap(inputAtoms);
        this.outputAtoms = Utilities.listToMap(outputAtoms);
        this.wheelChanges = wheelChanges;
        this.otherGlyphs = otherGlyphs;
    }

    setVanilla() {
        this.isModded = false;
        return this;
    }

    /**
     * @param {State} state
     */
    canApply(state) {
        for (let g of this.otherGlyphs) {
            if (!OMSC.activeGlyphs.has(g)) {
                return false;
            }
        }
        for (let [a, c] of this.inputAtoms) {
            if (state.atoms.get(a) < c) {
                return false;
            }
        }
        for (let w of this.wheelChanges) {
            let currentWheel = state.wheels.get(w.wheel) 
            if (currentWheel == undefined) {
                return false;
            }
            for (let i = 0; i < w.offsets.length; i++) {
                if (currentWheel[w.offsets[i]] != w.inputs[i]) {
                    return false;
                }
            }
        }
        return true;
    }

    /**
     * 
     * @param {State} state 
     */
    apply(state) {
        for (let [a, c] of this.inputAtoms) {
            state.atoms.set(a, state.atoms.get(a) - c);
        }
        for (let [a, c] of this.outputAtoms) {
            state.atoms.set(a, state.atoms.get(a) + c);
        }
        for (let w of this.wheelChanges) {
            let currentWheel = state.wheels.get(w.wheel);
            if (currentWheel == undefined) {
                throw new Error("The wheel " + w.wheel + " is not active!");
            }
            for (let i = 0; i < w.offsets.length; i++) {
                currentWheel[w.offsets[i]] = w.outputs[i];
            }
        }
    }
}

class Wheel {
    /**
     * 
     * @param {string} namespace 
     * @param {string} name 
     * @param {string} displayName
     * @param {string} description
     * @param {Array<string>} initialAtoms 
     * @param {boolean} immutable
     */
    constructor(namespace, name, displayName, description, initialAtoms, immutable = false) {
        this.id = namespace + ":" + name;
        this.displayName = displayName;
        this.description = description
        for (let a of initialAtoms) {
            AtomType.sanityCheck(a);
        }
        this.initialAtoms = initialAtoms;
        this.immutable = immutable;
    }
}

class Glyph {
    /**
     * 
     * @param {string} namespace 
     * @param {string} name 
     * @param {string} displayName 
     * @param {string} description 
     */
    constructor(namespace, name, displayName, description) {
        this.id = namespace + ":" + name;
        this.displayName = displayName;
        this.description = description;
        /** @type {Array<Transmutation>} */
        this.transmutations = [];
    }

    cleanup() {
        for (let i = 0; i < this.transmutations.length; i++) {
            let transmute = this.transmutations[i];
            let remove = false;
            wLoop: for (let wheelTransmutation of transmute.wheelChanges) {
                let sourceWheel = GlyphData.getWheelFromId(wheelTransmutation.wheel);
                if (!sourceWheel.immutable) {
                    continue;
                }
                for (let j = 0; j < wheelTransmutation.offsets.length; j++) {
                    if (sourceWheel.initialAtoms[wheelTransmutation.offsets[j]] != wheelTransmutation.inputs[j]) {
                        remove = true;
                        break wLoop;
                    }
                }
            }
            if (remove) {
                this.transmutations.splice(i, 1);
                i--;
            }
        }
    }
}