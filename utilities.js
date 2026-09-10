
class Utilities {
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