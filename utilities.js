
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

class Strings {
    static modPanel = {
        checkbox: "modSelectedCheckbox_"
    }
    static reagentPanel = {
        add: "reagentAdd",
        atomCount: "reagentAtomCount_",
        delete: "reagentDelete_",
        detailsName: "reagentGroup_",
        name: "reagentName_"
    }
    static productPanel = {
        add: "productAdd",
        atomCount: "productAtomCount_",
        delete: "productDelete_",
        detailsName: "productGroup_",
        name: "productName_"
    }
    static glyphPanel = {
        detailsName: "glyphPaneDetails",
        glyphCheckbox: "glyphSelectedCheckbox_",
        wheelCheckbox: "wheelSelectedCheckbox_"
    }
    static timelinePanel = {
        atomDetailsName: "timelineAtomDetails",
        eventData: "timelineEvents",
        eventDelete: "timelineEventDelete_",
        eventMoveUp: "timeelineEventMoveUp_",
        eventMoveDown: "timelineEventMoveDown_",
        glyphChoice: "timelineSelectGlyph_",
        glyphData: "timelineGlyphs",
        glyphDetailsName: "timelineGlyphDetails",
        productData: "timelineProducts",
        productOutput: "productOutput_",
        reagentData: "timelineReagents",
        reagentPull: "reagentPull_",
        reagentRecycle: "reagentRecycle_",
        transmutationChoice: "timelineTransmutation_",
        transmutationData: "timelineTransmutations",
        wheelDetailsName: "timelineWheelDetails"
    }

}