// @ts-check

class AtomType {
    /** @type {Array<AtomType>} */
    static atomTypes = [];

    /**
     * 
     * @param {string} namespace 
     * @param {string} name 
     */
    constructor(namespace, name) {
        this.namespace = namespace;
        this.name = name;
    }

    /**
     * @param {string} str
     */
    static fromElementId(str) {
        let [n, ns] = str.split("__");
        return new AtomType(ns, n);
    }

    /**
     * 
     * @param {string} id
     */
    static fromId(id) {
        let [ns, n] = id.split(":");
        return new AtomType(ns, n);
    }

    /**
     * 
     * @param {string} id 
     */
    static sanityCheck(id) {
        let a = AtomType.fromId(id);

        let valid = false;
            for (let aT of AtomType.atomTypes) {
                if (a.namespace == aT.namespace && a.name == aT.name) {
                    valid = true;
                    break;
                }
            }
            if (!valid) {
                throw new Error("unknown atom type \"" + id + "\"");
            }
    }

    isModded() {
        return this.namespace != "opus_magnum";
    }

    toString() {
        return this.namespace + ":" + this.name;
    }
}