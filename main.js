// @ts-check

class OMSC {
    static async load() {
        // @ts-ignore
        const symbolModule = await import("https://cdn.jsdelivr.net/gh/ErikHaag/Opus-Magnum-Assets/symbols/atomSymbolsExpand.js");
        const symbolDump = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        symbolDump.style.display = "none";
        document.body.appendChild(symbolDump);

        await symbolModule.expandAtomSymbols(symbolDump, { mode: 1 });

        for (let aT of symbolDump.children) {
            AtomType.atomTypes.push(AtomType.fromElementId(aT.id.substring(6)));
        }
        AtomType.atomTypes.sort((a, b) => {
            if (a.namespace > b.namespace) {
                return 1;
            }
            if (a.namespace < b.namespace) {
                return -1;
            }
            if (a.name > b.name) {
                return 1;
            }
            if (a.name < b.name) {
                return -1;
            }
            return 0; 
        });
        
        this.state = new State();
    }
    

    /** @type {State} */
    static state;

    static activeGlyphs = new Set("opus_magnum:calcification");
}

window.addEventListener("load", () => {
    OMSC.load();
});