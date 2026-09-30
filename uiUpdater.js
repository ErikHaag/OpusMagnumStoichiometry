class uiUpdater {
    static hexOffsets = [[0, 1], [1, 0], [1, -1], [0, -1], [-1, 0], [-1, 1]]
        .map(p => [81 * p[0] + 41 * p[1], -41 * Math.sqrt(3) * p[1]])
        .map(p => [p[0] - 30, p[1] - 30]);


    static initiallizeStaticARIA() {
        const panels = [Elements.modPanel, Elements.reagentPanel, Elements.productPanel, Elements.glyphPanel, Elements.timelinePanel];
        for (let i = 0; i < 5; i++) {
            panels[i].role = "tabpanel";
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
                const reagentList = p ? OMSC.products : OMSC.reagents;
                for (let i = 0; i < reagentList.length; i++) {
                    let elem = document.getElementById((p ? Strings.productPanel.delete : Strings.reagentPanel.delete) + i);
                    if (elem != null) {
                        elem.ariaLabel = "Remove the " + (p ? "product" : "reagent") + " \"" + reagentList[i].name + "\"";
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
        const rootTarget = e.target;
        if (!(rootTarget instanceof Element)) {
            return;
        }
        let target = rootTarget;
        while (!(target instanceof HTMLButtonElement)) {
            let parent = target.parentElement;
            if (parent == null) {
                return;
            }
            target = parent;
        }


        const id = target.id;
        if (id == Strings.reagentPanel.add) {
            OMSC.reagents.push({
                name: "Unnamed reagent",
                atoms: new Map()
            });
            uiUpdater.reagentsPanelUpdate();
            uiUpdater.timelinePanelUpdate();
            return;
        }
        if (id == Strings.productPanel.add) {
            OMSC.products.push({
                name: "Unnamed product",
                atoms: new Map()
            });
            uiUpdater.reagentsPanelUpdate(true);
            uiUpdater.timelinePanelUpdate();
            return;
        }
        if (id.startsWith(Strings.reagentPanel.delete)) {
            let index = Number.parseInt(id.substring(Strings.reagentPanel.delete.length), 10);
            if (Number.isNaN(index)) {
                return;
            }
            OMSC.removeReagent(index);
            if (index == OMSC.reagents.length) {
                index--;
            }
            let focusTarget = document.getElementById(Strings.reagentPanel.delete + index);
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
        if (id.startsWith(Strings.productPanel.delete)) {
            let index = Number.parseInt(id.substring(Strings.productPanel.delete.length), 10);
            if (Number.isNaN(index)) {
                return;
            }
            OMSC.removeReagent(index, true);

            if (index == OMSC.products.length) {
                index--;
            }
            let focusTarget = document.getElementById(Strings.productPanel.delete + index);
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

        if (id.startsWith(Strings.timelinePanel.reagentPull)) {
            let mI = Number.parseInt(id.substring(Strings.timelinePanel.reagentPull.length));
            if (Number.isNaN(mI) || mI < 0 || mI >= OMSC.reagents.length) {
                console.error("huh?");
                return;
            }
            /** @type {MoleculeTimelineEvent} */
            let event = {
                type: "inputReagent",
                moleculeIndex: mI
            };
            if (OMSC.timelineState.failureAt == -1) {
                OMSC.timeline.push(event);
            } else {
                OMSC.timeline.splice(OMSC.timelineState.failureAt, 0, event);
            }
            OMSC.recomputeTimeline();
            OMSC.updateAGT();
            uiUpdater.timelinePanelUpdate();
            let newFocus = document.getElementById(id);
            newFocus?.focus();
            return;
        }
        if (id.startsWith(Strings.timelinePanel.reagentRecycle)) {
            let mI = Number.parseInt(id.substring(Strings.timelinePanel.reagentRecycle.length));
            if (Number.isNaN(mI) || mI < 0 || mI >= OMSC.reagents.length) {
                console.error("huh?");
                return;
            }
            /** @type {MoleculeTimelineEvent} */
            let event = {
                type: "recycleReagent",
                moleculeIndex: mI
            };
            if (OMSC.timelineState.failureAt == -1) {
                OMSC.timeline.push(event);
            } else {
                OMSC.timeline.splice(OMSC.timelineState.failureAt, 0, event);
            }
            OMSC.recomputeTimeline();
            OMSC.updateAGT();
            uiUpdater.timelinePanelUpdate();
            let newFocus = document.getElementById(id);
            newFocus?.focus();
            return;
        }
        if (id.startsWith(Strings.timelinePanel.glyphChoice)) {
            let glyphId = Utilities.identifierToColonSep(Utilities.doubleUnderToIdentifier(id.substring(Strings.timelinePanel.glyphChoice.length)));
            OMSC.activeGlyph = glyphId;
            let glyph = ModData.getGlyphFromId(OMSC.activeGlyph);
            if (glyph == undefined) {
                console.error("huh?");
                return;
            }
            OMSC.updateAGT();
            uiUpdater.timelinePanelUpdate();
            let newFocus = document.getElementById(id);
            newFocus?.focus();
            return;
        }
        if (id.startsWith(Strings.timelinePanel.transmutationChoice)) {
            let transmutationIndex = Number.parseInt(id.substring(Strings.timelinePanel.transmutationChoice.length));
            let transmutation = OMSC.activeGlyphTransmutations.find((v) => v.uniqueId == transmutationIndex);
            if (transmutation == undefined) {
                console.error("huh?");
                return;
            }
            /** @type {GlyphTimelineEvent} */
            let event = {
                type: "glyph",
                transmutation: transmutation
            };
            if (OMSC.timelineState.failureAt == -1) {
                OMSC.timeline.push(event);
            } else {
                OMSC.timeline.splice(OMSC.timelineState.failureAt, 0, event);
            }
            OMSC.recomputeTimeline();
            OMSC.updateAGT();
            uiUpdater.timelinePanelUpdate();
            let newFocus = document.getElementById(id);
            newFocus?.focus();
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
        if (id.startsWith(Strings.modPanel.checkbox)) {
            if (!(target instanceof HTMLInputElement)) {
                console.error("Huh?");
                return;
            }
            let mod = id.substring(Strings.modPanel.checkbox.length);
            if (target.checked ? ModData.propagateLoad(mod) : ModData.propagateUnload(mod)) {
                uiUpdater.modPanelUpdate();
                let replacedFocus = document.getElementById(id);
                if (replacedFocus != undefined) {
                    replacedFocus.focus();
                }
            }
            ModData.reset();
            uiUpdater.glyphPaneUpdate();
            OMSC.recomputeTimeline();
            OMSC.updateAGT();
            uiUpdater.timelinePanelUpdate();
            return;
        }
        // reagents & products
        let isProduct = id.startsWith(Strings.productPanel.atomCount);
        if (id.startsWith(Strings.reagentPanel.atomCount) || isProduct) {
            if (!(target instanceof HTMLInputElement)) {
                console.error("Huh?");
                return;
            }
            let idTemp = id.substring((isProduct ? Strings.productPanel.atomCount : Strings.reagentPanel.atomCount).length);
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
            OMSC.recomputeTimeline();
            OMSC.updateAGT();
            uiUpdater.timelinePanelUpdate();
            return;
        }
        // glyphs
        if (id.startsWith(Strings.glyphPanel.glyphCheckbox)) {
            if (!(target instanceof HTMLInputElement)) {
                console.error("huh?");
                return;
            }
            let glyphID = Utilities.identifierToColonSep(Utilities.doubleUnderToIdentifier(id.substring(Strings.glyphPanel.glyphCheckbox.length)));
            if (target.checked) {
                ModData.activeGlyphs.add(glyphID);
            } else {
                ModData.activeGlyphs.delete(glyphID);
            }
            OMSC.recomputeTimeline();
            OMSC.updateAGT();
            uiUpdater.timelinePanelUpdate();
            return;
        }
        if (id.startsWith(Strings.glyphPanel.wheelCheckbox)) {
            if (!(target instanceof HTMLInputElement)) {
                console.error("huh?");
                return;
            }
            let wheelID = Utilities.identifierToColonSep(Utilities.doubleUnderToIdentifier(id.substring(Strings.glyphPanel.wheelCheckbox.length)));
            if (target.checked) {
                ModData.activeWheels.add(wheelID);
            } else {
                ModData.activeWheels.delete(wheelID);
            }
            OMSC.recomputeTimeline();
            OMSC.updateAGT();
            uiUpdater.timelinePanelUpdate();
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
        if (id.startsWith(Strings.reagentPanel.name)) {
            let index = Number.parseInt(id.substring(Strings.reagentPanel.name.length), 10);
            if (Number.isNaN(index)) {
                return;
            }
            OMSC.reagents[index].name = target.textContent;
            uiUpdater.updateDynamicAria(1);
            uiUpdater.timelinePanelUpdate();
            return;
        }
        if (id.startsWith(Strings.productPanel.name)) {
            let index = Number.parseInt(id.substring(Strings.productPanel.name.length), 10);
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
            let checkboxId = Strings.modPanel.checkbox + mod;
            let label = document.createElement("label");
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
        const reagentList = updateProductInstead ? OMSC.products : OMSC.reagents;
        for (let i = 0; i < reagentList.length; i++) {
            let tray = document.createElement("fieldset");
            fragment.appendChild(tray);
            let trayLegend = document.createElement("legend");
            trayLegend.id = `${updateProductInstead ? "product" : "reagent"}Name_${i}`;
            trayLegend.setAttribute("contenteditable", "plaintext-only");
            trayLegend.setAttribute("spellcheck", "false");
            trayLegend.addEventListener("blur", uiUpdater.blurHandler);
            tray.appendChild(trayLegend);
            trayLegend.textContent = reagentList[i].name;

            const detailsName = (updateProductInstead ? Strings.productPanel.detailsName : Strings.reagentPanel.detailsName) + i;
            const openDrawer = container.querySelector(`details[name=${detailsName}][open] > summary`)?.textContent ?? "";
            let dresserUnopened = true;
            let firstDetails = undefined;
            let removeButton = document.createElement("button");
            removeButton.id = (updateProductInstead ? Strings.reagentPanel.delete : Strings.reagentPanel.delete) + i;
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
                firstDetails ??= details;
                details.setAttribute("name", detailsName);
                if (openDrawer == "" ? dresserUnopened : summaryName == openDrawer) {
                    details.open = true;
                    dresserUnopened = false;
                }
                tray.appendChild(details);
                let summary = document.createElement("summary");
                summary.innerText = summaryName;
                details.appendChild(summary);
                let formElementBox = document.createElement("div");
                formElementBox.classList.add("atomFormBox");
                details.appendChild(formElementBox);
                for (let a of elements) {
                    let inputId = `${updateProductInstead ? Strings.productPanel.atomCount : Strings.reagentPanel.atomCount}${i}_${Utilities.identifierToDoubleUnder(a.identifier)}`;
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
            if (dresserUnopened && firstDetails instanceof HTMLDetailsElement) {
                firstDetails.open = true;
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
        let openDrawer = (container.querySelector(`details[name=${Strings.glyphPanel.detailsName}][open] > summary`)?.textContent) ?? "";
        let dresserUnopened = true;
        let firstDetails = undefined;
        for (let mod of ModData.modList) {
            let validGlyphs = ModData.usableGlyphs.filter((g) => g.identifier.namespace == mod);

            let validWheels = ModData.usableWheels.filter((w) => w.identifier.namespace == mod);

            if (validGlyphs.length == 0 && validWheels.length == 0) {
                continue;
            }
            let summaryText = Utilities.snakeToTitle(mod);
            let details = document.createElement("details");
            firstDetails ??= details;
            if (openDrawer == "" ? dresserUnopened : summaryText == openDrawer) {
                details.open = true;
                dresserUnopened = false;
            }
            details.name = Strings.glyphPanel.detailsName;
            fragment.appendChild(details);
            let summary = document.createElement("summary");
            summary.innerText = summaryText;
            details.appendChild(summary);
            if (validGlyphs.length != 0) {
                let glyphList = document.createElement("div");
                glyphList.className = "pairs";
                details.appendChild(glyphList);
                for (let glyph of validGlyphs) {
                    let inputId = Strings.glyphPanel.glyphCheckbox + Utilities.identifierToDoubleUnder(glyph.identifier);
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
                    let inputId = Strings.glyphPanel.wheelCheckbox + Utilities.identifierToDoubleUnder(wheel.identifier);
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
        if (dresserUnopened && firstDetails instanceof HTMLDetailsElement) {
            firstDetails.open = true;
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

        {
            let atomHeader = document.createElement("th");
            atomHeader.textContent = "Atoms";
            headerRow.appendChild(atomHeader);
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
            reagentsData.id = Strings.timelinePanel.reagentData;
            row.appendChild(reagentsData);
            for (let i = 0; i < OMSC.reagents.length; i++) {
                let reagentPanel = document.createElement("div");
                reagentsData.appendChild(reagentPanel);
                let namePlate = document.createElement("p");
                namePlate.textContent = OMSC.reagents[i].name;
                reagentPanel.appendChild(namePlate);
                let pullButton = document.createElement("button");
                pullButton.id = Strings.timelinePanel.reagentPull + i;
                pullButton.innerText = "Pull";
                reagentPanel.appendChild(pullButton);
                let recycleButton = document.createElement("button");
                recycleButton.id = Strings.timelinePanel.reagentRecycle + i;
                recycleButton.innerText = "Recycle";
                reagentPanel.appendChild(recycleButton);
            }
        }

        if (hasWheels) {
            let wheelData = document.createElement("td");
            row.appendChild(wheelData);
            let openDrawer = document.querySelector(`details[name=${Strings.timelinePanel.wheelDetailsName}][open] > summary`)?.textContent ?? ""
            let dresserUnopened = true;
            let firstDetails = undefined;
            for (let mod of ModData.modList) {
                let wheelsFromMods = ModData.usableWheels.filter((w) => w.identifier.namespace == mod && ModData.activeWheels.has(w.id));
                if (wheelsFromMods.length == 0) {
                    continue;
                }
                const summaryText = Utilities.snakeToTitle(mod);

                let details = document.createElement("details");
                firstDetails ??= details;
                details.name = Strings.timelinePanel.wheelDetailsName;
                if (openDrawer == "" ? dresserUnopened : summaryText == openDrawer) {
                    details.open = true;
                    dresserUnopened = false;
                }
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
                    let wheelLabel = document.createElement("p");
                    wheelLabel.textContent = wheel.displayName;
                    details.appendChild(wheelLabel);
                    let svgBox = document.createElementNS("http://www.w3.org/2000/svg", "svg");
                    const boxWidth = 228;
                    const boxHeight = 206;
                    svgBox.setAttribute("width", boxWidth.toString());
                    svgBox.setAttribute("height", boxHeight.toString());
                    svgBox.setAttribute("viewBox", `${-boxWidth / 2} ${-boxHeight / 2} ${boxWidth} ${boxHeight}`);
                    details.appendChild(svgBox);
                    for (let i = 0; i < 6; i++) {
                        let [x, y] = uiUpdater.hexOffsets[i];
                        let atomUse = document.createElementNS("http://www.w3.org/2000/svg", "use");
                        atomUse.setAttribute("href", `#OMA_A_${Utilities.identifierToDoubleUnder(Utilities.colonSepToIdentifier(wheelAtoms[i]))}`)
                        atomUse.setAttribute("transform", `translate(${x},${y})`);
                        svgBox.appendChild(atomUse);
                    }
                    for (let i = 0; i < 6; i++) {
                        let [x, y] = uiUpdater.hexOffsets[i];
                        let angle = 60 * (i - 1);
                        let atomCageUse = document.createElementNS("http://www.w3.org/2000/svg", "use");
                        atomCageUse.setAttribute("href", "#wheelArm");
                        atomCageUse.setAttribute("transform", `translate(${x},${y}) rotate(${angle},30,30)`);
                        svgBox.append(atomCageUse);
                    }
                    let wheelHubUse = document.createElementNS("http://www.w3.org/2000/svg", "use");
                    wheelHubUse.setAttribute("href", "#wheelHub");
                    svgBox.appendChild(wheelHubUse);
                }
            }
            if (dresserUnopened && firstDetails instanceof HTMLDetailsElement) {
                firstDetails.open = true;
            }
        }

        {
            let atomData = document.createElement("td");
            row.appendChild(atomData);
            const openDrawer = document.querySelector(`details[name=${Strings.timelinePanel.atomDetailsName}][open] > summary`)?.textContent ?? "";
            let dresserUnopened = true;
            let firstDetails = undefined;
            for (let mod of ModData.modList) {
                let validAtoms = AtomType.atomTypes.filter(a => a.identifier.namespace == mod && (OMSC.state.atoms.get(a.toString()) ?? 0n) != 0n);
                if (validAtoms.length == 0) {
                    continue;
                }
                const summaryText = Utilities.snakeToTitle(mod);
                let details = document.createElement("details");
                firstDetails ??= details;
                details.name = Strings.timelinePanel.atomDetailsName;
                if (openDrawer == "" ? dresserUnopened : summaryText == openDrawer) {
                    details.open = true;
                    dresserUnopened = false;
                }
                atomData.appendChild(details);
                let summary = document.createElement("summary");
                summary.textContent = summaryText;
                details.appendChild(summary);
                let pairs = document.createElement("div");
                pairs.className = "pairs";
                details.appendChild(pairs);
                for (let aT of validAtoms) {
                    let svgBox = document.createElementNS("http://www.w3.org/2000/svg", "svg");
                    svgBox.setAttribute("viewBox", "0 0 60 60");
                    svgBox.setAttribute("width", "40");
                    svgBox.setAttribute("height", "40");
                    pairs.appendChild(svgBox);
                    let use = document.createElementNS("http://www.w3.org/2000/svg", "use");
                    use.setAttribute("href", "#OMA_A_" + Utilities.identifierToDoubleUnder(aT.identifier));
                    svgBox.appendChild(use);
                    let counter = document.createElement("p");
                    counter.textContent = "x " + (OMSC.state.atoms.get(aT.toString())?.toString() ?? "???");
                    pairs.appendChild(counter);
                }
            }
            if (dresserUnopened && firstDetails instanceof HTMLDetailsElement) {
                firstDetails.open = true;
            }
        }

        if (hasGlyphs) {
            let glyphData = document.createElement("td");
            glyphData.id = Strings.timelinePanel.glyphData;
            row.appendChild(glyphData);
            const openDrawer = document.querySelector(`details[name=${Strings.timelinePanel.glyphDetailsName}][open] > summary`)?.textContent ?? "";
            let first = true;
            for (let mod of ModData.modList) {
                let currentGlyphs = ModData.usableGlyphs.filter((g) => g.identifier.namespace == mod && ModData.activeGlyphs.has(g.id));
                if (currentGlyphs.length == 0) {
                    continue;
                }
                const summaryText = Utilities.snakeToTitle(mod);
                let details = document.createElement("details");
                details.name = Strings.timelinePanel.glyphDetailsName;
                if (openDrawer == "" ? first : summaryText == openDrawer) {
                    details.open = true;
                }
                first = false;
                glyphData.appendChild(details);
                let summary = document.createElement("summary");
                summary.textContent = summaryText;
                details.appendChild(summary);
                for (let g of currentGlyphs) {
                    let buttonId = Strings.timelinePanel.glyphChoice + Utilities.identifierToDoubleUnder(g.identifier);
                    let button = document.createElement("button");
                    button.id = buttonId;
                    button.textContent = g.displayName;
                    details.appendChild(button);
                }
            }
            let transmutationsData = document.createElement("td");
            transmutationsData.id = Strings.timelinePanel.transmutationData;
            row.appendChild(transmutationsData);
            for (let transmutation of OMSC.activeGlyphTransmutations) {
                let transmutationDescBox = document.createElement("button");
                transmutationDescBox.id = Strings.timelinePanel.transmutationChoice + transmutation.uniqueId;
                transmutationsData.appendChild(transmutationDescBox);
                uiUpdater.drawTransmutationElements(transmutation, transmutationDescBox);
            }
        }

        {
            let eventData = document.createElement("td");
            eventData.id = Strings.timelinePanel.eventData;
            row.appendChild(eventData);
            for (let i = 0; i < OMSC.timeline.length; i++) {
                let eventBox = document.createElement("div");
                eventData.appendChild(eventBox);
                let statusIndicator = document.createElement("div");
                if (OMSC.timelineState.failureAt != -1) {
                    if (i == OMSC.timelineState.failureAt) {
                        statusIndicator.className = "failure";
                    } else if (i > OMSC.timelineState.failureAt) {
                        statusIndicator.className = "ignored";
                    }
                } else {
                    // repeat detection
                }
                eventBox.append(statusIndicator);

                let timelineEvent = OMSC.timeline[i];
                if (timelineEvent.type == "inputReagent") {
                    let reagentPullDisp = document.createElement("p");
                    reagentPullDisp.textContent = "Pulled " + OMSC.reagents[timelineEvent.moleculeIndex].name;
                    eventBox.appendChild(reagentPullDisp);
                } else if (timelineEvent.type == "recycleReagent") {
                    let reagentRecycleDisp = document.createElement("p");
                    reagentRecycleDisp.textContent = "Recycled " + OMSC.reagents[timelineEvent.moleculeIndex].name;
                    eventBox.appendChild(reagentRecycleDisp);
                } else if (timelineEvent.type == "outputProduct") {
                    let productOutputDisp = document.createElement("p");
                    productOutputDisp.textContent = "Submit " + OMSC.products[timelineEvent.moleculeIndex].name;
                    eventBox.appendChild(productOutputDisp);
                } else if (timelineEvent.type == "glyph") {
                    let descriptionBox = document.createElement("div");
                    eventBox.appendChild(descriptionBox);
                    uiUpdater.drawTransmutationElements(timelineEvent.transmutation, descriptionBox);
                    let glyphNameDisplay = document.createElement("p");
                    glyphNameDisplay.textContent = ModData.getGlyphFromId(timelineEvent.transmutation.glyph)?.displayName ?? "???";
                    eventBox.appendChild(glyphNameDisplay);
                }

                let deleteButton = document.createElement("button");
                deleteButton.id = Strings.timelinePanel.eventDelete + i;
                deleteButton.textContent = "Remove";
                eventBox.appendChild(deleteButton);
                let moveUp = document.createElement("button");
                if (i == 0) {
                    moveUp.disabled = true;
                }
                moveUp.id = Strings.timelinePanel.eventMoveUp + i;
                moveUp.textContent = "\u21D1";
                eventBox.appendChild(moveUp);
                let moveDown = document.createElement("button");
                if (i == OMSC.timeline.length - 1) {
                    moveDown.disabled = true;
                }
                moveDown.id = Strings.timelinePanel.eventMoveDown + i;
                moveDown.textContent = "\u21D3";
                eventBox.appendChild(moveDown);
            }
        }

        if (hasProducts) {
            let productsData = document.createElement("td");
            productsData.id = Strings.timelinePanel.productData;
            row.appendChild(productsData);
            for (let i = 0; i < OMSC.products.length; i++) {
                let productPanel = document.createElement("div");
                productsData.appendChild(productPanel);
                let namePlate = document.createElement("p");
                namePlate.textContent = OMSC.products[i].name;
                productPanel.appendChild(namePlate);
                let outputButton = document.createElement("button");
                outputButton.id = Strings.timelinePanel.productOutput + i;
                outputButton.innerText = "Output";
                productPanel.appendChild(outputButton);
            }
        }

        table.replaceChildren(fragment);
    }

    /**
     * @param {Transmutation} transmutation
     * @param {Element} transmutationDescBox
     */
    static drawTransmutationElements(transmutation, transmutationDescBox) {
        transmutationDescBox.classList.add("transmutationDisplay");
        if (transmutation.inputAtoms.size != 0) {
            let smallHeader = document.createElement("p");
            smallHeader.textContent = "Inputs:";
            transmutationDescBox.appendChild(smallHeader);
            let inputAtomsBox = document.createElement("div");
            inputAtomsBox.className = "I";
            transmutationDescBox.appendChild(inputAtomsBox);
            for (let aT of AtomType.atomTypes) {
                let count = transmutation.inputAtoms.get(aT.toString()) ?? 0n;
                if (count == 0n) {
                    continue;
                }
                let svgBox = document.createElementNS("http://www.w3.org/2000/svg", "svg");
                svgBox.setAttribute("viewBox", "0 0 60 60");
                svgBox.setAttribute("width", "30");
                svgBox.setAttribute("height", "30");
                inputAtomsBox.appendChild(svgBox);
                let use = document.createElementNS("http://www.w3.org/2000/svg", "use");
                use.setAttribute("href", "#OMA_A_" + Utilities.identifierToDoubleUnder(aT.identifier));
                svgBox.appendChild(use);
                let counter = document.createElement("p");
                counter.textContent = "x " + count;
                inputAtomsBox.appendChild(counter);
            }
        }
        if (transmutation.outputAtoms.size != 0) {
            let smallHeader = document.createElement("p");
            smallHeader.textContent = "Outputs:";
            transmutationDescBox.appendChild(smallHeader);
            let outputAtomsBox = document.createElement("div");
            outputAtomsBox.className = "O";
            transmutationDescBox.appendChild(outputAtomsBox);
            for (let aT of AtomType.atomTypes) {
                let count = transmutation.outputAtoms.get(aT.toString()) ?? 0n;
                if (count == 0n) {
                    continue;
                }
                let svgBox = document.createElementNS("http://www.w3.org/2000/svg", "svg");
                svgBox.setAttribute("viewBox", "0 0 60 60");
                svgBox.setAttribute("width", "30");
                svgBox.setAttribute("height", "30");
                outputAtomsBox.appendChild(svgBox);
                let use = document.createElementNS("http://www.w3.org/2000/svg", "use");
                use.setAttribute("href", "#OMA_A_" + Utilities.identifierToDoubleUnder(aT.identifier));
                svgBox.appendChild(use);
                let counter = document.createElement("p");
                counter.textContent = "x " + count;
                outputAtomsBox.appendChild(counter);
            }
        }
        if (transmutation.wheelChanges.length != 0) {
            let smallHeader = document.createElement("p");
            smallHeader.textContent = "Wheels:";
            transmutationDescBox.appendChild(smallHeader);
            let wheelChangesBox = document.createElement("div");
            wheelChangesBox.className = "W";
            transmutationDescBox.appendChild(wheelChangesBox);
            for (let wheelChange of transmutation.wheelChanges) {
                let wheelData = ModData.getWheelFromId(wheelChange.wheel);
                if (wheelData == undefined) {
                    console.error("huh?");
                    continue;
                }
                let wheelName = document.createElement("p");
                wheelName.textContent = wheelData.displayName;
                wheelChangesBox.appendChild(wheelName);

                let minX = Number.POSITIVE_INFINITY;
                let minY = Number.POSITIVE_INFINITY;
                let maxX = Number.NEGATIVE_INFINITY;
                let maxY = Number.NEGATIVE_INFINITY;
                let prevWheelBox = document.createElementNS("http://www.w3.org/2000/svg", "svg");
                let nextWheelBox = document.createElementNS("http://www.w3.org/2000/svg", "svg");
                for (let i = 0; i < wheelChange.offsets.length; i++) {
                    let offset = wheelChange.offsets[i];
                    let hex = uiUpdater.hexOffsets[offset];
                    minX = Math.min(minX, hex[0]);
                    minY = Math.min(minY, hex[1]);
                    maxX = Math.max(maxX, hex[0]);
                    maxY = Math.max(maxY, hex[1]);
                    let atomUsingP = document.createElementNS("http://www.w3.org/2000/svg", "use");
                    atomUsingP.setAttribute("href", `#OMA_A_${Utilities.identifierToDoubleUnder(Utilities.colonSepToIdentifier(wheelChange.inputs[i]))}`);
                    atomUsingP.setAttribute("transform", `translate(${hex[0]},${hex[1]})`);
                    prevWheelBox.appendChild(atomUsingP);
                    let atomUsingN = document.createElementNS("http://www.w3.org/2000/svg", "use");
                    atomUsingN.setAttribute("href", `#OMA_A_${Utilities.identifierToDoubleUnder(Utilities.colonSepToIdentifier(wheelChange.outputs[i]))}`);
                    atomUsingN.setAttribute("transform", `translate(${hex[0]},${hex[1]})`);
                    nextWheelBox.appendChild(atomUsingN);
                }
                for (let i = 0; i < 6; i++) {
                    let hex = uiUpdater.hexOffsets[i];
                    let angle = 60 * ((i + 5) % 6);
                    let cageUsingP = document.createElementNS("http://www.w3.org/2000/svg", "use");
                    let armRef = wheelChange.offsets.includes(i) ? "#wheelArm" : "#wheelArmFade";
                    cageUsingP.setAttribute("href", armRef);
                    cageUsingP.setAttribute("transform", `translate(${hex[0]},${hex[1]}) rotate(${angle},30,30)`);
                    prevWheelBox.appendChild(cageUsingP);
                    let cageUsingN = document.createElementNS("http://www.w3.org/2000/svg", "use");
                    cageUsingN.setAttribute("href", armRef);
                    cageUsingN.setAttribute("transform", `translate(${hex[0]},${hex[1]}) rotate(${angle},30,30)`);
                    nextWheelBox.appendChild(cageUsingN);
                }

                let wheelHubUseP = document.createElementNS("http://www.w3.org/2000/svg", "use");
                wheelHubUseP.setAttribute("href", "#wheelHub");
                prevWheelBox.appendChild(wheelHubUseP);
                let wheelHubUseN = document.createElementNS("http://www.w3.org/2000/svg", "use");
                wheelHubUseN.setAttribute("href", "#wheelHub");
                nextWheelBox.appendChild(wheelHubUseN);

                const width = maxX - minX + 70;
                const height = maxY - minY + 70;
                [prevWheelBox, nextWheelBox].forEach((wB) => {
                    wB.setAttribute("viewBox", `${minX - 6} ${minY - 6} ${width} ${height}`);
                    wB.setAttribute("width", (width / 2).toString());
                    wB.setAttribute("height", (height / 2).toString());
                });
                wheelChangesBox.appendChild(prevWheelBox);
                let arrow = document.createTextNode("\u23F5");
                wheelChangesBox.appendChild(arrow);
                wheelChangesBox.appendChild(nextWheelBox);
            }
        }
        if (transmutation.otherGlyphs.length != 0) {
            let smallHeader = document.createElement("p");
            smallHeader.textContent = "Catalysized:";
            transmutationDescBox.appendChild(smallHeader);
            let otherGlyphBox = document.createElement("div");
            otherGlyphBox.className = "C";
            transmutationDescBox.appendChild(otherGlyphBox);
            for (let g of transmutation.otherGlyphs) {
                let glyphData = ModData.getGlyphFromId(g);
                if (glyphData == undefined) {
                    console.error("huh?");
                    continue;
                }
                let item = document.createElement("p");
                item.textContent = `- ${glyphData.displayName}`;
                otherGlyphBox.appendChild(item);
            }
        }
    }
}