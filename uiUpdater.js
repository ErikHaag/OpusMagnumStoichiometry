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
        uiUpdater.glyphPaneUpdate();
        uiUpdater.timelinePanelUpdate()
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
            uiUpdater.timelinePanelUpdate();
            return;
        }
        if (id == "addProduct") {
            OMSC.products.push({
                name: "Unnamed product",
                atoms: new Map()
            });
            uiUpdater.reagentsPanelUpdate(true);
            uiUpdater.timelinePanelUpdate();
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

        if (id.startsWith("reagentPull_")) {
            let mI = Number.parseInt(id.substring(12));
            if (Number.isNaN(mI) || mI < 0 || mI >= OMSC.reagents.length) {
                console.error("huh?");
                return;
            }
            /** @type {MoleculeTimelineEvent} */
            let event = {
                type: "inputReagent",
                moleculeIndex: mI
            };
            OMSC.timeline.push(event);
            OMSC.recomputeTimeline();
        }
        if (id.startsWith("reagentRecycle_")) {
            let mI = Number.parseInt(id.substring(15));
            if (Number.isNaN(mI) || mI < 0 || mI >= OMSC.reagents.length) {
                console.error("huh?");
                return;
            }
            /** @type {MoleculeTimelineEvent} */
            let event = {
                type: "recycleReagent",
                moleculeIndex: mI
            };
            OMSC.timeline.push(event);
            OMSC.recomputeTimeline();
        }
        if (id.startsWith("timelineSelectGlyph_")) {
            let glyphId = Utilities.identifierToColonSep(Utilities.doubleUnderToIdentifier(id.substring(20)));
            OMSC.activeGlyph = glyphId;
            let glyph = ModData.getGlyphFromId(OMSC.activeGlyph);
            if (glyph == undefined) {
                console.error("huh?");
                return;
            }
            OMSC.updateAGT();
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
        //mods
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
            uiUpdater.glyphPaneUpdate();
            return;
        }
        // reagents & products
        let isProduct = id.startsWith("productAtomCount_");
        if (id.startsWith("reagentAtomCount_") || isProduct) {
            if (!(target instanceof HTMLInputElement)) {
                console.error("Huh?");
                return;
            }
            let idTemp = id.substring(17);
            let value = -1n;
            try {
                value = BigInt(target.value);
            } catch { /* meh */ }
            if (value < 0n) {
                target.value = "0";
                value = 0n;
            }
            let numEndIndex = idTemp.indexOf("_");
            if (numEndIndex == -1) {
                return;
            }
            let index = Number.parseInt(idTemp.substring(0, numEndIndex));
            if (Number.isNaN(index)) {
                return;
            }
            let key = Utilities.identifierToColonSep(Utilities.doubleUnderToIdentifier(idTemp.substring(numEndIndex + 1)));

            (isProduct ? OMSC.products : OMSC.reagents)[index].atoms.set(key, value);
            return;
        }
        // glyphs
        if (id.startsWith("glyphSelectedCheckbox_")) {
            if (!(target instanceof HTMLInputElement)) {
                console.error("huh?");
                return;
            }
            let glyphID = Utilities.identifierToColonSep(Utilities.doubleUnderToIdentifier(id.substring(22)));
            if (target.checked) {
                ModData.activeGlyphs.add(glyphID);
            } else {
                ModData.activeGlyphs.delete(glyphID);
            }
            OMSC.recomputeTimeline();
            return;
        }
        console.log(id);

        if (id.startsWith("wheelSelectedCheckbox_")) {
            if (!(target instanceof HTMLInputElement)) {
                console.error("huh?");
                return;
            }
            let wheelID = Utilities.identifierToColonSep(Utilities.doubleUnderToIdentifier(id.substring(22)));
            if (target.checked) {
                ModData.activeWheels.add(wheelID);
            } else {
                ModData.activeWheels.delete(wheelID);
            }
            OMSC.recomputeTimeline();
            return;
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
            uiUpdater.timelinePanelUpdate();
            return;
        }
        if (id.startsWith("productName_")) {
            let index = Number.parseInt(id.substring(12), 10);
            if (Number.isNaN(index)) {
                return;
            }
            OMSC.products[index].name = target.textContent;
            uiUpdater.updateDynamicAria(2);
            uiUpdater.timelinePanelUpdate();
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
            let first = true;
            let removeButton = document.createElement("button");
            removeButton.id = `${reagentStr}Delete_${i}`;
            removeButton.innerText = "Delete"
            removeButton.className = "button-remove";
            tray.appendChild(removeButton);
            for (let mod of ModData.modList) {
                let elements = AtomType.atomTypes.filter((a) => ModData.usableAtomTypes.has(a.toString())).filter((a) => a.identifier.namespace == mod);
                if (elements.length == 0) {
                    continue;
                }
                const summaryName = Utilities.snakeToTitle(mod);
                let details = document.createElement("details");
                details.setAttribute("name", detailsName);
                if (openDrawer == "" ? first : summaryName == openDrawer) {
                    details.open = true;
                }
                first = false;
                tray.appendChild(details);
                let summary = document.createElement("summary");
                summary.innerText = summaryName;
                details.appendChild(summary);
                let formElementBox = document.createElement("div");
                formElementBox.classList.add("atomFormBox");
                details.appendChild(formElementBox);
                for (let a of elements) {
                    let inputId = `${reagentStr}AtomCount_${i}_${Utilities.identifierToDoubleUnder(a.identifier)}`;
                    let label = document.createElement("label");
                    label.setAttribute("for", inputId);
                    label.ariaLabel = Utilities.snakeToTitle(a.identifier.name);
                    label.setAttribute("title", Utilities.snakeToTitle(a.identifier.name));
                    formElementBox.appendChild(label);
                    let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
                    svg.setAttribute("viewBox", "0 0 60 60");
                    svg.setAttribute("width", "30");
                    svg.setAttribute("height", "30");
                    label.appendChild(svg);
                    let use = document.createElementNS("http://www.w3.org/2000/svg", "use")
                    use.setAttribute("href", `#OMA_A_${Utilities.identifierToDoubleUnder(a.identifier)}`);
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
        const detailsName = "glyphPaneDetails";
        let openDrawer = (container.querySelector("details[name=" + detailsName + "][open] > summary")?.textContent) ?? "";
        let first = true;
        for (let mod of ModData.modList) {
            let validGlyphs = ModData.usableGlyphs.filter((g) => g.identifier.namespace == mod);
            
            let validWheels = ModData.usableWheels.filter((w) => w.identifier.namespace == mod);

            if (validGlyphs.length == 0 && validWheels.length == 0) {
                continue;
            }
            let summaryText = Utilities.snakeToTitle(mod);
            let details = document.createElement("details");
            if (openDrawer == "" ? first : summaryText == openDrawer) {
                details.open = true;
            }
            first = false;
            details.name = detailsName;
            fragment.appendChild(details);
            let summary = document.createElement("summary");
            summary.innerText = summaryText;
            details.appendChild(summary);
            if (validGlyphs.length != 0) {
                let glyphList = document.createElement("div");
                glyphList.className = "pairs";
                details.appendChild(glyphList);
                for (let glyph of validGlyphs) {
                    let inputId = `glyphSelectedCheckbox_${Utilities.identifierToDoubleUnder(glyph.identifier)}`;
                    let label = document.createElement("label");
                    label.innerText = glyph.displayName;
                    label.setAttribute("for", inputId);
                    label.setAttribute("title", glyph.description);
                    glyphList.appendChild(label);
                    let checkbox = document.createElement("input");
                    checkbox.id = inputId;
                    checkbox.setAttribute("type", "checkbox");
                    if (ModData.activeGlyphs.has(glyph.id)) {
                        checkbox.checked = true;
                    }
                    glyphList.appendChild(checkbox);
                }
            }
            if (validWheels.length != 0) {
                if (validGlyphs.length != 0) {
                    details.appendChild(document.createElement("hr"));
                }
                let wheelList = document.createElement("div");
                wheelList.className = "pairs";
                details.appendChild(wheelList);
                for (let wheel of validWheels) {
                    let inputId = `wheelSelectedCheckbox_${Utilities.identifierToDoubleUnder(wheel.identifier)}`;
                    let label = document.createElement("label");
                    label.innerHTML = wheel.displayName;
                    label.setAttribute("for", inputId);
                    label.setAttribute("title", wheel.description);
                    wheelList.appendChild(label);
                    let checkbox = document.createElement("input");
                    checkbox.id = inputId;
                    checkbox.setAttribute("type", "checkbox");
                    if (ModData.activeWheels.has(wheel.id)) {
                        checkbox.checked = true;
                    }
                    wheelList.appendChild(checkbox);
                }
            }
        }
        container.replaceChildren(fragment);
    }

    static timelinePanelUpdate() {
        const hasReagents = OMSC.reagents.length > 0;
        const hasWheels = ModData.activeWheels.size > 0;
        const hasGlyphs = ModData.activeGlyphs.size > 0;
        const hasProducts = OMSC.products.length > 0;


        let table = Elements.timelinePanel.children[0];
        if (!(table instanceof HTMLTableElement)) {
            console.error("huh?");
            return;
        }
        let fragment = new DocumentFragment();
        let tableHead = document.createElement("thead");
        fragment.appendChild(tableHead);
        let headerRow = document.createElement("tr");
        tableHead.appendChild(headerRow);
        if (hasReagents) {
            let reagentsHeader = document.createElement("th");
            reagentsHeader.textContent = "Reagents";
            headerRow.appendChild(reagentsHeader);
        }

        if (hasWheels) {
            let wheelsHeader = document.createElement("th");
            wheelsHeader.textContent = "Wheels";
            headerRow.appendChild(wheelsHeader);
        }

        if (hasGlyphs) {
            let glyphHeader = document.createElement("th");
            glyphHeader.textContent = "Glyphs";
            glyphHeader.colSpan = 2;
            headerRow.appendChild(glyphHeader);
        }

        {
            let timelineHeader = document.createElement("th");
            timelineHeader.textContent = "Events";
            headerRow.appendChild(timelineHeader);
        }

        if (hasProducts) {
            let productHeader = document.createElement("th");
            productHeader.textContent = "Products";
            headerRow.appendChild(productHeader);
        }

        let tableBody = document.createElement("tbody");
        fragment.appendChild(tableBody);
        let row = document.createElement("tr");
        tableBody.appendChild(row);

        if (hasReagents) {
            let reagentsData = document.createElement("td");
            reagentsData.id = "timelineReagents";
            row.appendChild(reagentsData);
            for (let i = 0; i < OMSC.reagents.length; i++) {
                let reagentPanel = document.createElement("div");
                reagentsData.appendChild(reagentPanel);
                let namePlate = document.createElement("p");
                namePlate.textContent = OMSC.reagents[i].name;
                reagentPanel.appendChild(namePlate);
                let pullButton = document.createElement("button");
                pullButton.id = `reagentPull_${i}`;
                pullButton.innerText = "Pull";
                reagentPanel.appendChild(pullButton);
                let recycleButton = document.createElement("button");
                recycleButton.id = `reagentRecycle_${i}`;
                recycleButton.innerText = "Recycle";
                reagentPanel.appendChild(recycleButton);
            }
        }

        if (hasWheels) {
            let wheelData = document.createElement("td");
            row.appendChild(wheelData);
            const timelineWheelSummaryName = "timelineWheelDetails";
            let openDrawer = document.querySelector(`details[name=${timelineWheelSummaryName}][open] > summary`)?.textContent ?? ""
            let first = true;
            for (let mod of ModData.modList) {
                let wheelsFromMods = ModData.usableWheels.filter((w) => w.identifier.namespace == mod && ModData.activeWheels.has(w.id));
                if (wheelsFromMods.length == 0) {
                    continue;
                }
                const summaryText = Utilities.snakeToTitle(mod);

                let details = document.createElement("details");
                details.name = timelineWheelSummaryName;
                if (openDrawer == "" ? first : summaryText == openDrawer) {
                    details.open = true;
                }
                first = false;
                wheelData.appendChild(details);
                let summary = document.createElement("summary");
                summary.textContent = summaryText;
                details.appendChild(summary);
                for (let wheel of wheelsFromMods) {
                    const wheelAtoms = OMSC.state.wheels.get(wheel.id);
                    if (wheelAtoms == undefined) {
                        console.error("huh?")
                        continue;
                    }
                    let svgBox = document.createElementNS("http://www.w3.org/2000/svg", "svg");
                    svgBox.setAttribute("width", "228");
                    svgBox.setAttribute("height", "206");
                    svgBox.setAttribute("viewBox", "0 0 228 206");
                    details.appendChild(svgBox);
                    const offsets = [[0, 1], [1, 0], [1, -1], [0, -1], [-1, 0], [-1, 1]];
                    for (let i = 0; i < 6; i++) {
                        let hex = offsets[i];
                        let x = 81 * hex[0] + 41 * hex[1];
                        let y = -41 * Math.sqrt(3) * hex[1];
                        let atomUse = document.createElementNS("http://www.w3.org/2000/svg", "use");
                        atomUse.setAttribute("href", `#OMA_A_${Utilities.identifierToDoubleUnder(Utilities.colonSepToIdentifier(wheelAtoms[i]))}`)
                        atomUse.setAttribute("transform", "translate(" + (x + 84) + "," + (y + 73) + ")");
                        svgBox.appendChild(atomUse);
                    }
                    let wheelOverlayUse = document.createElementNS("http://www.w3.org/2000/svg", "use");
                    wheelOverlayUse.setAttribute("href", "wheelOverlay.svg");
                    svgBox.appendChild(wheelOverlayUse);
                    let wheelLabel = document.createElement("p");
                    wheelLabel.textContent = wheel.displayName;
                    details.appendChild(wheelLabel);
                }
            }
        }

        if (hasGlyphs) {
            let glyphData = document.createElement("td");
            glyphData.id = "timelineGlyphs";
            row.appendChild(glyphData);
            const timelineGlyphSummaryName = "timelineGlyphDetails";
            const openDrawer = document.querySelector(`details[name=${timelineGlyphSummaryName}][open] > summary`)?.textContent ?? "";
            let first = true;
            for (let mod of ModData.modList) {
                let currentGlyphs = ModData.usableGlyphs.filter((g) => g.identifier.namespace == mod && ModData.activeGlyphs.has(g.id));
                if (currentGlyphs.length == 0) {
                    continue;
                }
                const summaryText = Utilities.snakeToTitle(mod);
                let details = document.createElement("details");
                details.name = timelineGlyphSummaryName;
                if (openDrawer == "" ? first : summaryText == openDrawer) {
                    details.open = true;
                }
                first = false;
                glyphData.appendChild(details);
                let summary = document.createElement("summary");
                summary.textContent = summaryText;
                details.appendChild(summary);
                for (let g of currentGlyphs) {
                    let buttonId = "timelineSelectGlyph_" + Utilities.identifierToDoubleUnder(g.identifier);
                    let button = document.createElement("button");
                    button.id = buttonId;
                    button.textContent = g.displayName;
                    details.appendChild(button);
                }
            }
        }

        table.replaceChildren(fragment);
    }
}