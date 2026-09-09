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
            this.atomTypes.push(AtomType.fromString(aT.id.substring(6)));
        }
        this.atomTypes.sort((a, b) => {
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
        this.state = new OMSCState();
    }
    /** @type {Array<AtomType>} */
    static atomTypes = [];

    /** @type {OMSCState} */
    static state;
}

class OMSCState {
    constructor() {
        /** @type {Map<string,BigInt>} */
        this.atoms = new Map();
        for (let atomType of OMSC.atomTypes) {
            this.atoms.set(atomType.toString(), 0n);
        }
    }

}

window.addEventListener("load", () => {
    OMSC.load();
});