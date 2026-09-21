class uiUpdater {
    static initiallizeStaticARIA() {
        const panels = [Elements.modPanel, Elements.reagentPanel, Elements.productPanel, Elements.glyphPanel, Elements.timelinePanel];
        for (let i = 0; i < 5; i++) {
            Elements.menuSelect.rootElement.children[i].setAttribute("aria-controls", panels[i].id);
        }
    }

    static updateAll() {
        uiUpdater.modPanelUpdate();
        uiUpdater.reagentsPanelUpdate();
        uiUpdater.reagentsPanelUpdate(true);
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
        uiUpdater.updateDynamicAria(current);
    }

    /**
     * 
     * @param {number?} page 
     */
    static updateDynamicAria(page = null) {
        let p = false;
        switch (page ?? Elements.menuSelect.option) {
            case 2:
                p = true;
            case 1:
                const reagentStr = p ? "product" : "reagent";
                const reagentList = p ? OMSC.products : OMSC.reagents;
                for (let i = 0; i < reagentList.length; i++) {
                    let elem = document.getElementById(`${reagentStr}Delete_${i}`);
                    if (elem != null) {
                        elem.ariaLabel = "Remove the " + reagentStr + " \"" + reagentList[i].name + "\"";
                    }
                }
                break;
            default:
                break;
        }
    }

    /**
     * @param {PointerEvent} e
     */
    static clickHandler(e) {
        const target = e.target;
        if (!(target instanceof Element)) {
            return;
        }
        const id = target.id;
        if (id == "addReagent") {
            OMSC.reagents.push({
                name: "Unnamed reagent",
                atoms: new Map()
            });
            uiUpdater.reagentsPanelUpdate();
            return;
        }
        if (id == "addProduct") {
            OMSC.products.push({
                name: "Unnamed product",
                atoms: new Map()
            });
            uiUpdater.reagentsPanelUpdate(true);
            return;
        }
        if (id.startsWith("reagentDelete_")) {
            let index = Number.parseInt(id.substring(14), 10);
            if (Number.isNaN(index)) {
                return;
            }
            OMSC.removeReagent(index);
            if (index == OMSC.reagents.length) {
                index--;
            }
            let focusTarget = document.getElementById(`reagentDelete_${index}`);
            if (focusTarget != null) {
                focusTarget.focus();
                return;
            }
            let alternateFocusTarget = Elements.reagentPanel.children[0];
            if (!(alternateFocusTarget instanceof HTMLElement)) {
                console.error("huh?");
                return;
            }
            alternateFocusTarget.focus();
            return;
        }
        if (id.startsWith("productDelete_")) {
            let index = Number.parseInt(id.substring(14), 10);
            if (Number.isNaN(index)) {
                return;
            }
            OMSC.removeReagent(index, true);
            if (index == OMSC.products.length) {
                index--;
            }
            let focusTarget = document.getElementById(`productDelete_${index}`);
            if (focusTarget != null) {
                focusTarget.focus();
                return;
            }
            let alternateFocusTarget = Elements.productPanel.children[0];
            if (!(alternateFocusTarget instanceof HTMLElement)) {
                console.error("huh?");
                return;
            }
            alternateFocusTarget.focus();
            return;
        }

    }

    /**
     * @param {Event} e
     */
    static changeHandler(e) {
        const target = e.target;
        if (!(target instanceof Element)) {
            return;
        }
        const id = target.id;
        if (id.startsWith("modSelectedCheckbox_")) {
            if (!(target instanceof HTMLInputElement)) {
                console.error("Huh?");
                return;
            }
            let mod = id.substring(20);
            if (target.checked ? ModData.propagateLoad(mod) : ModData.propagateUnload(mod)) {
                uiUpdater.modPanelUpdate();
                let replacedFocus = document.getElementById(id);
                if (replacedFocus != undefined) {
                    replacedFocus.focus();
                }
            }
            ModData.reset();
            return;
        }
        let isProduct = id.startsWith("product_");
        if (id.startsWith("reagent_") || isProduct) {
            if (!(target instanceof HTMLInputElement)) {
                console.error("Huh?");
                return;
            }
            let idTemp = id.substring(8);
            let v = (() => {
                let value = -1n;
                try {
                    value = BigInt(target.value);
                } catch {/* meh */ }
                if (value < 0n) {
                    target.value = "0";
                    value = 0n;
                }
                let numEndIndex = idTemp.indexOf("_");
                if (numEndIndex == -1) {
                    return false;
                }
                let index = Number.parseInt(idTemp.substring(0, numEndIndex));
                if (Number.isNaN(index)) {
                    return false;
                }
                let key = (AtomType.fromElementId(idTemp.substring(numEndIndex + 1))).toString();

                (isProduct ? OMSC.products : OMSC.reagents)[index].atoms.set(key, value);
                return true;
            })();
        }
    }

    /**
     * @param {FocusEvent} e
     */
    static blurHandler(e) {
        const target = e.target;
        if (!(target instanceof Element)) {
            return;
        }
        const id = target.id;
        if (id.startsWith("reagentName_")) {
            let index = Number.parseInt(id.substring(12), 10);
            if (Number.isNaN(index)) {
                return;
            }
            OMSC.reagents[index].name = target.textContent;
            uiUpdater.updateDynamicAria(1);
            return;
        }
        if (id.startsWith("productName_")) {
            let index = Number.parseInt(id.substring(12), 10);
            if (Number.isNaN(index)) {
                return;
            }
            OMSC.products[index].name = target.textContent;
            uiUpdater.updateDynamicAria(2);
            return;
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

    static reagentsPanelUpdate(updateProductInstead = false) {
        let container = (updateProductInstead ? Elements.productPanel : Elements.reagentPanel).children[1];
        let fragment = new DocumentFragment();
        const reagentStr = updateProductInstead ? "product" : "reagent";
        const reagentList = updateProductInstead ? OMSC.products : OMSC.reagents;
        for (let i = 0; i < reagentList.length; i++) {
            let tray = document.createElement("fieldset");
            fragment.appendChild(tray);
            let trayLegend = document.createElement("legend");
            trayLegend.id = `${reagentStr}Name_${i}`;
            trayLegend.setAttribute("contenteditable", "plaintext-only");
            trayLegend.setAttribute("spellcheck", "false");
            trayLegend.addEventListener("blur", uiUpdater.blurHandler);
            tray.appendChild(trayLegend);
            trayLegend.textContent = reagentList[i].name;

            const detailsName = `${reagentStr}Group_${i}`;
            const openDrawer = container.querySelector("details[name=" + detailsName + "][open] > summary")?.textContent ?? "";
            let removeButton = document.createElement("button");
            removeButton.id = `${reagentStr}Delete_${i}`;
            removeButton.innerText = "Delete"
            removeButton.className = "button-remove";
            tray.appendChild(removeButton);
            for (let mod of ModData.modList) {
                let elements = AtomType.atomTypes.filter((a) => ModData.activeAtomTypes.has(a.toString())).filter((a) => a.namespace == mod);
                if (elements.length == 0) {
                    continue;
                }
                const summaryName = Utilities.snakeToTitle(mod);
                let details = document.createElement("details");
                details.setAttribute("name", detailsName);
                if (openDrawer != "" && summaryName == openDrawer) {
                    details.setAttribute("open", "");
                }
                tray.appendChild(details);
                let summary = document.createElement("summary");
                summary.innerText = summaryName;
                details.appendChild(summary);
                let formElementBox = document.createElement("div");
                formElementBox.classList.add("atomFormBox");
                details.appendChild(formElementBox);
                for (let a of elements) {
                    let inputId = reagentStr + `_${i}_${a.name}__${a.namespace}`;
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
                    input.value = (reagentList[i].atoms.get(a.toString()) ?? 0n).toString();
                    formElementBox.appendChild(input);
                }
            }
        }
        container.replaceChildren(fragment);
        uiUpdater.updateDynamicAria(updateProductInstead ? 2 : 1);
    }

    static glyphPaneUpdate() {
        let container = Elements.glyphPanel.children[0];
        if (!(container instanceof HTMLDivElement)) {
            console.error("huh?");
            return;
        }
        let fragment = new DocumentFragment();
        for (let mod in ModData.modList) {
            let validGlyphs = ModData.glyphs.filter((g) => g.namespace == mod);
            
        }
        container.replaceChildren(fragment);
    }

    static timelinePanelUpdate() {

    }
}