// @ts-check
/**
 * @typedef {object} Molecule
 * @prop {string} name
 * @prop {Map<string,bigint>} atoms
 */

/**
 * @typedef {object} MoleculeTimelineEvent
 * @prop {"inputReagent" | "recycleReagent" | "outputProduct" } type
 * @prop {number} moleculeIndex
 */

/**
 * @typedef {object} GlyphTimelineEvent
 * @prop {"glyph"} type
 * @prop {Transmutation} transmutation
 */

class Elements {
    /** @type {TabRow} */
    static menuSelect;
    /** @type {HTMLElement} */
    static modPanel;
    /** @type {HTMLElement} */
    static reagentPanel;
    /** @type {HTMLElement} */
    static productPanel;
    /** @type {HTMLElement} */
    static glyphPanel;
    /** @type {HTMLElement} */
    static timelinePanel

    static initiallize() {
        // @ts-ignore
        this.menuSelect = new TabRow(document.getElementById("mainNav"), uiUpdater.menuSelectCallback);
        // @ts-ignore
        this.modPanel = document.getElementById("modPanel");
        // @ts-ignore
        this.reagentPanel = document.getElementById("reagentPanel");
        // @ts-ignore
        this.productPanel = document.getElementById("productPanel");
        // @ts-ignore
        this.glyphPanel = document.getElementById("glyphPanel");
        // @ts-ignore
        this.timelinePanel = document.getElementById("timelinePanel");

        document.addEventListener("click", uiUpdater.clickHandler);
        document.addEventListener("change", uiUpdater.changeHandler);

        uiUpdater.initiallizeStaticARIA();
    }
}

class OMSC {
    static async load() {
        const assetsRoot = "https://cdn.jsdelivr.net/gh/ErikHaag/Opus-Magnum-Assets/";
        const [symbolModule, baseModule, combiningModule] = await Promise.all([
            import(assetsRoot + "symbols/atomSymbolsExpand.js"),
            import(assetsRoot + "bases/atomBasesExpand.js"),
            import(assetsRoot + "combining/atomMerge.js")
        ]);
        const atomsDump = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        atomsDump.style.display = "none";
        document.body.appendChild(atomsDump);

        const symbols = document.createElementNS("http://www.w3.org/2000/svg", "g")
        atomsDump.appendChild(symbols);
        const bases = document.createElementNS("http://www.w3.org/2000/svg", "g");
        atomsDump.appendChild(bases);
        const combined = document.createElementNS("http://www.w3.org/2000/svg", "g");
        atomsDump.appendChild(combined);

        await Promise.all([
            symbolModule.expandAtomSymbols(symbols, { mode: 3, allowOutlines: true }),
            baseModule.expandAtomBases(bases, { mode: 1 })
        ]);

        combiningModule.atomMerge(combined, symbols, bases, { mode: 1 });

        // remove "repeat" atom
        ["S", "B", "A"].forEach((v) => document.getElementById("OMA_" + v + "_repeat__opus_magnum")?.remove());

        for (let aT of combined.children) {
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

        ModData.reset();

        uiUpdater.updateAll();

        this.state = new State();
    }

    /**
     * @param {number} index
     */
    static removeReagent(index, removeProductInstead = false) {
        (removeProductInstead ? OMSC.products : OMSC.reagents).splice(index, 1);
        for (let i = 0; i < OMSC.timeline.length; i++) {
            let event = OMSC.timeline[i];
            if (event.type == "glyph") {
                continue;
            }
            if (event.moleculeIndex < index) {
                continue;
            }
            if (removeProductInstead ? event.type != "outputProduct" : (event.type != "inputReagent" && event.type != "recycleReagent")) {
                continue;
            }
            if (event.moleculeIndex == index) {
                OMSC.timeline.splice(i, 1);
                i--;
                continue;
            }
            event.moleculeIndex--;
        }
        uiUpdater.reagentsPanelUpdate(removeProductInstead);
    }

    /** @type {State} */
    static state;

    /** @type {Array<Molecule>} */
    static reagents = [];

    /** @type {Array<Molecule>} */
    static products = [];

    /**
     * @type {Array<MoleculeTimelineEvent | GlyphTimelineEvent>}
     */
    static timeline = [];
}

document.addEventListener("DOMContentLoaded", () => {
    Elements.initiallize();
})

window.addEventListener("load", () => {
    OMSC.load();
});