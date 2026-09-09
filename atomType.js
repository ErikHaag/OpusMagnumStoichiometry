// @ts-check

class AtomType {
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
    static fromString(str) {
        let [n, ns] = str.split("__");
        return new AtomType(ns, n);
    }

    toString() {
        return this.name + "__" + this.namespace;
    }
}