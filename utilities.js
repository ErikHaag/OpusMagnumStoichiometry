
class Utilities {
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
}