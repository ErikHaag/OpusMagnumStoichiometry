// @ts-check
/**
 * @typedef {Object} Molecule
 * @prop {string} name
 * @prop {Map<string,bigint>} atoms
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

    static init() {
        // @ts-ignore
        this.menuSelect = new TabRow(document.getElementById("mainNav"), this.menuSelectCallback);
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
    }

    static updateAll() {
        Elements.modPanelUpdate();
        Elements.reagentsPanelUpdate();
    }

    /**
     * @param {number} prev
     * @param {number} current
     * @param {boolean} _user
     */
    static menuSelectCallback(prev, current, _user) {
        if (prev == current) {
            return;
        }
        const panels = [Elements.modPanel, Elements.reagentPanel, Elements.productPanel, Elements.glyphPanel, Elements.timelinePanel];
        panels[current].classList.add("visible");
        panels[prev].classList.remove("visible");
    }

    static modPanelUpdate() {
        let container = Elements.modPanel.children[0];

        let previousLabel;
        let previousCheckbox;
        let first = true;
        for (let mod of ModData.modList.slice(1)) {
            let labelId = "modSelectedLabel_" + mod;
            let checkboxId = "modSelectedCheckbox_" + mod;
            previousLabel = document.getElementById(labelId);
            if (previousLabel == null) {
                previousLabel = document.createElement("label");
                previousLabel.id = labelId;
                previousLabel.setAttribute("for", checkboxId)
                previousLabel.innerText = Utilities.snakeToTitle(mod);
            }
            if (first) {
                container.insertAdjacentElement("afterbegin", previousLabel);
                first = false;
            } else {
                // @ts-ignore
                previousCheckbox.insertAdjacentElement("afterend", previousLabel);
            }
            previousCheckbox = document.getElementById(checkboxId);
            if (previousCheckbox == null) {
                previousCheckbox = document.createElement("input");
                previousCheckbox.id = checkboxId;
                previousCheckbox.setAttribute("type", "checkbox");
            }
            previousLabel.insertAdjacentElement("afterend", previousCheckbox);
        }
    }

    static reagentsPanelUpdate() {
        let container = Elements.reagentPanel.children[1];
        while (container.childElementCount > OMSC.reagents.length) {
            container.lastElementChild?.remove();
        }
        while (container.childElementCount < OMSC.reagents.length) {
            let tray = document.createElement("fieldset");
            container.appendChild(tray);
            let trayLegend = document.createElement("legend");
            trayLegend.setAttribute("contenteditable", "plaintext-only");
            trayLegend.setAttribute("spellcheck", "false");
            tray.appendChild(trayLegend);
        }

        for (let i = 0; i < OMSC.reagents.length; i++) {
            container.children[i].children[0].textContent = OMSC.reagents[i].name;

            let detailsName = "reagentGroup_" + i;
            let j = 0;
            for (let mod of ModData.modList) {
                if (mod != "opus_magnum" && !OMSC.activeMods.has(mod)) {
                    continue;
                }
                let elements = AtomType.atomTypes.filter((a) => a.namespace == mod);
                if (elements.length == 0) {
                    continue;
                }
                let detailsId = "reagent_" + i + "_mod_" + mod + "_details";
                let summaryId = "reagent_" + i + "_mod_" + mod + "_summary";
                let details = document.getElementById(detailsId);
                if (details == null) {
                    details = document.createElement("details");
                    details.id = detailsId;
                    details.setAttribute("name", detailsName);
                }
                container.children[i].children[j].insertAdjacentElement("afterend", details);
                let summary = document.getElementById(summaryId);
                if (summary == null) {
                    summary = document.createElement("summary");
                    summary.id = summaryId;
                    summary.innerText = Utilities.snakeToTitle(mod);
                }
                details.insertAdjacentElement("afterbegin", summary);
            }
        }
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

        combiningModule.atomMerge(combined, symbols, bases, { mode: 1 })

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

        Elements.init();
        Elements.updateAll();

        this.state = new State();
    }



    /** @type {State} */
    static state;

    static activeMods = new Set();
    static activeGlyphs = new Set("opus_magnum:calcification");

    /** @type {Array<Molecule>} */
    static reagents = [{
        name: "Unnamed group of proxies",
        atoms: new Map()
    }];

    /** @type {Array<Molecule>} */
    static products = [];
}

window.addEventListener("load", () => {
    OMSC.load();
});

document.addEventListener("click", (e) => {
    let target = e.target;

});