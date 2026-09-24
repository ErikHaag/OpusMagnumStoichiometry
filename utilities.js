
/**
 * @typedef {object} Identifier
 * @prop {string} namespace
 * @prop {string} name
 */

class Utilities {
    /**
     * @param {string} str
     * @returns {Identifier}
     */
    static doubleUnderToIdentifier(str) {
        let splits = str.split("__", 2);
        if (splits.length != 2) {
            throw Error("Invalid input!");
        }
        return {
            namespace: splits[1],
            name: splits[0]
        };
    }
    /**
     * @param {string} str
     * @returns {Identifier}
     */
    static colonSepToIdentifier(str) {
        let splits = str.split(":", 2);
        if (splits.length != 2) {
            throw Error("Invalid input!");
        }
        return {
            namespace: splits[0],
            name: splits[1]
        };
    }

    /**
     * @param {Identifier} iden
     */
    static identifierToColonSep(iden) {
        return `${iden.namespace}:${iden.name}`;
    }

    /**
     * @param {Identifier} iden
     */
    static identifierToDoubleUnder(iden) {
        return `${iden.name}__${iden.namespace}`;
    }

    /**
     * @param {string} str
     */
    static snakeToTitle(str) {
        return str.split("_").map(s => Utilities.capitiallize(s)).join(" ");
    }

    /**
     * @param {string} s
     */
    static capitiallize(s) {
        if (s.length == 0) {
            return s;
        }
        return s[0].toUpperCase() + s.substring(1).toLowerCase();
    }
    /**
     * 
     * @param {Array<string>} list 
     * @returns {Map<string,bigint>}
    */
    static listToMap(list) {
        let m = new Map();
        for (let elem of list) {
            m.set(elem, (m.get(elem) ?? 0n) + 1n);
        }
        return m;
    }

    /**
     * @template T
     * @param {Array<T>} subject
     * @param {(v: T) => boolean} predicate
     */
    static partitionList(subject, predicate) {
        let passed = [];
        let failed = [];
        for (let element of subject) {
            if (predicate(element)) {
                passed.push(element);
            } else {
                failed.push(element);
            }
        }
        return { passed, failed };
    }
}