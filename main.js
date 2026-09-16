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

    static initiallize() {
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

        document.addEventListener("change", Elements.changeHandler)

        Elements.initiallizeStaticARIA();
    }

    static initiallizeStaticARIA() {
        const panels = [Elements.modPanel, Elements.reagentPanel, Elements.productPanel, Elements.glyphPanel, Elements.timelinePanel];
        for (let i = 0; i < 5; i++) {
            Elements.menuSelect.rootElement.children[i].setAttribute("aria-controls", panels[i].id);
        }
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

    /**
     * @param {Event} e
     */
    static changeHandler(e) {
        /** @type {Element} */
        // @ts-ignore
        let target = e.target;
        const id = target.id;
        if (id.startsWith("modSelectedCheckbox_")) {
            let mod = id.substring(20);
            // @ts-ignore
            if (target.checked ? ModData.propagateLoad(mod) : ModData.propagateUnload(mod)) {
                Elements.modPanelUpdate();
                let replacedFocus = document.getElementById(id);
                if (replacedFocus != undefined) {
                    replacedFocus.focus();
                }
            }
            ModData.reset();
        }
    }

    /**
     * @param {FocusEvent} e
     */
    static blurHandler(e) {
        /** @type {Element} */
        // @ts-ignore
        let target = e.target;
        if (target.id.startsWith("")) {

        }
    }



    static modPanelUpdate() {
        let container = Elements.modPanel.children[0];
        let fragment = new DocumentFragment();
        for (let mod of ModData.modList.slice(1)) {
            let checkboxId = "modSelectedCheckbox_" + mod;
            let label = document.createElement("label");
            label.id = "modSelectedLabel_" + mod;
            label.setAttribute("for", checkboxId)
            label.innerText = Utilities.snakeToTitle(mod);
            fragment.appendChild(label);
            let checkbox = document.createElement("input");
            checkbox.id = checkboxId;
            checkbox.setAttribute("type", "checkbox");
            if (ModData.activeMods.has(mod)) {
                checkbox.setAttribute("checked", "");
            }
            fragment.appendChild(checkbox);
        }
        container.replaceChildren(fragment);
    }

    static reagentsPanelUpdate() {
        let container = Elements.reagentPanel.children[1];
        let fragment = new DocumentFragment();

        for (let i = 0; i < OMSC.reagents.length; i++) {
            let tray = document.createElement("fieldset");
            fragment.appendChild(tray);
            let trayLegend = document.createElement("legend");
            trayLegend.id = "reagentName_" + i;
            trayLegend.setAttribute("contenteditable", "plaintext-only");
            trayLegend.setAttribute("spellcheck", "false");
            tray.appendChild(trayLegend);
            trayLegend.textContent = OMSC.reagents[i].name;

            let detailsName = "reagentGroup_" + i;
            for (let mod of ModData.modList) {
                let elements = AtomType.atomTypes.filter((a) => ModData.activeAtomTypes.has(a.toString())).filter((a) => a.namespace == mod);
                if (elements.length == 0) {
                    continue;
                }
                let details = document.createElement("details");
                details.setAttribute("name", detailsName);
                tray.appendChild(details);
                let summary = document.createElement("summary");
                summary.innerText = Utilities.snakeToTitle(mod);
                details.appendChild(summary);
                let formElementBox = document.createElement("div");
                formElementBox.classList.add("atomFormBox");
                details.appendChild(formElementBox);
                for (let a of elements) {
                    let inputId = `reagent_${i}_${a.name}__${a.namespace}`;
                    let label = document.createElement("label");
                    label.setAttribute("for", inputId);
                    label.ariaLabel = Utilities.snakeToTitle(a.name);
                    label.setAttribute("title", Utilities.snakeToTitle(a.name));
                    formElementBox.appendChild(label);
                    let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
                    svg.setAttribute("viewBox", "0 0 60 60");
                    svg.setAttribute("width", "30");
                    svg.setAttribute("height", "30");
                    label.appendChild(svg);
                    let use = document.createElementNS("http://www.w3.org/2000/svg", "use")
                    use.setAttribute("href", `#OMA_A_${a.name}__${a.namespace}`);
                    svg.appendChild(use);
                    let textNode = document.createTextNode(":");
                    label.appendChild(textNode);
                    let input = document.createElement("input");
                    input.id = inputId;
                    input.setAttribute("type", "number");
                    input.setAttribute("min", "0");
                    input.setAttribute("step", "1");
                    input.value = (OMSC.reagents[i].atoms.get(a.toString()) ?? 0n).toString();
                    formElementBox.appendChild(input);
                }
            }
        }
        container.replaceChildren(fragment);
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

        Elements.updateAll();

        this.state = new State();
    }



    /** @type {State} */
    static state;

    /** @type {Array<Molecule>} */
    static reagents = [];

    /** @type {Array<Molecule>} */
    static products = [];
}

document.addEventListener("DOMContentLoaded", () => {
    Elements.initiallize();
})

window.addEventListener("load", () => {
    OMSC.load();
});