/**
 * @typedef {object} WheelReference
 * @prop {string} wheelName
 * @prop {Array<number>} additionalOffsets
 * @prop {Array<AtomType>} expectedAtoms
 */


class Transmutation {
    /**
     * 
     * @param {Array<AtomType>} inputAtoms 
     * @param {Array<WheelReference>} wheelInput 
     * @param {Array<AtomType>} outputAtoms
     */
     constructor(inputAtoms, wheelInput, outputAtoms) {
        for (let i = 0; i < wheelInput.length; i++) {
            if (wheelInput[i].additionalOffsets.length + 1 !=  wheelInput[i].expectedAtoms.length) {
                throw new Error(`Wheel at index ${i} has a mismatch in specified atoms.`);
            }
        }
        this.inputAtoms = inputAtoms;
        this.wheelInput = wheelInput;
        this.outputAtoms  = outputAtoms;
     }
}

class Glyph {
    constructor(name, namespace) {
        this.name = name;
        this.namespace = namespace;
    }
}