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
        let origWheel = ModData.getWheelFromId(wheelName);
        if (origWheel == undefined) {
            throw new Error("no wheel with the id \"" + wheelName + "\" found.");
        }
        let modulus = origWheel.atomCount;
        this.offsets = offsets.map((o) => (o % modulus + modulus) % modulus);
        for (let i = 0; i < this.offsets.length; i++) {
            for (let j = i + 1; j < this.offsets.length; j++) {
                if (this.offsets[i] == this.offsets[j]) {
                    throw new Error("Duplicate offset found!")
                }
            }
        } 
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
    constructor(inputAtoms, outputAtoms, wheelChanges = [], otherGlyphs = []) {
        this.inputAtoms = Utilities.listToMap(inputAtoms);
        this.outputAtoms = Utilities.listToMap(outputAtoms);
        this.wheelChanges = wheelChanges;
        this.otherGlyphs = otherGlyphs;
    }

    /**
     * @param {State} state
     */
    canApply(state) {
        for (let g of this.otherGlyphs) {
            if (!ModData.activeGlyphs.has(g)) {
                return false;
            }
        }
        for (let [a, c] of this.inputAtoms) {
            if ((state.atoms.get(a) ?? 0n) < c) {
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
            state.atoms.set(a, (state.atoms.get(a) ?? 0n) - c);
        }
        for (let [a, c] of this.outputAtoms) {
            state.atoms.set(a, (state.atoms.get(a) ?? 0n) + c);
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
        this.atomCount = this.initialAtoms.length;
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

    /**
     * @param {Array<Transmutation> | Transmutation} transmutations
     */
    appendTransmutations(transmutations) {
        if (transmutations instanceof Array) {
            this.transmutations = this.transmutations.concat(transmutations);
        } else {
            this.transmutations.push(transmutations);
        }
    }

    cleanup() {
        o:for (let i = 0; i < this.transmutations.length; i++) {
            let transmute = this.transmutations[i];
            let remove = false;
            for (let wheelTransmutation of transmute.wheelChanges) {
                let sourceWheel = ModData.getWheelFromId(wheelTransmutation.wheel);
                if (sourceWheel == undefined) {
                    console.error(`Unknown or undeclared wheel \"${wheelTransmutation.wheel}\" found.`)
                    remove = true;
                    break;
                }

                if (!sourceWheel.immutable) {
                    continue;
                }
                for (let j = 0; j < wheelTransmutation.offsets.length; j++) {
                    if (sourceWheel.initialAtoms[wheelTransmutation.offsets[j]] != wheelTransmutation.inputs[j]) {
                        this.transmutations.splice(i, 1);
                        i--;
                        continue o;
                    }
                }
            }
            transmute.wheelChanges.sort((a, b) => {
                if (a.wheel != b.wheel) {
                    return a.wheel > b.wheel ? 1 : -1;
                }
                return 0;
            });
        }
    }
}