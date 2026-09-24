// @ts-check

class AtomType {
    /** @type {Array<AtomType>} */
    static atomTypes = [];

    /**
     * @param {Identifier} iden
     */
    constructor(iden) {
        this.identifier = iden;
    }

    /**
     * @param {string} str
     */
    static fromElementId(str) {
        return new AtomType((Utilities.doubleUnderToIdentifier(str)));
    }

    /**
     * 
     * @param {string} id
     */
    static fromId(id) {
        return new AtomType((Utilities.colonSepToIdentifier(id)));
    }

    /**
     * 
     * @param {string} id 
     */
    static sanityCheck(id) {
        let a = AtomType.fromId(id);
        a.sanityCheck();
    }

    sanityCheck() {
        for (let aT of AtomType.atomTypes) {
            if (this.identifier.namespace == aT.identifier.namespace && this.identifier.name == aT.identifier.name) {
                return;
            }
        }
        throw new Error(`unknown atom type \"${this}\"`);
    }

    toString() {
        return Utilities.identifierToColonSep(this.identifier);
    }
}