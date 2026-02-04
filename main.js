let reagents = [];
let reagentsUsed = [];
let products = [];
let productsUsed = [];
let wheels = [];
let atoms = new Map();
let activeWheels = 0n;

let validTransformations = [];

let timeline = [];

const templates = {
    molecule: document.getElementById("moleculeTemplate"),
    wheel: document.getElementById("wheelTemplate")
};

const reagentsTray = document.getElementById("reagentsTray");
const productsTray = document.getElementById("productsTray");
const settingsTray = document.getElementById("settingsTray");

const enableModsCheckbox = document.getElementById("useMods");
const editModeCheckbox = document.getElementById("editMode");
const confirmDialog = document.getElementById("confirmDialog");

let permitUserInteraction = true;
let hasInteracted = false;

let usingSymbols = false;
let loadedSymbols = false;
let allowUpdates = true;

let loadPromise = null;

let confirmDialogAction = () => { console.log("huh?"); };


document.addEventListener("DOMContentLoaded", () => {
    /* Molecule template */
    {
        templates.molecule.id = "molecule_[0]_[1]";
        let section = null;
        let i = 0;
        for (const entry of atomSectionTable) {
            if (entry.type == "section") {
                if (section) {
                    templates.molecule.appendChild(section);
                }
                let header = document.createElement("h3");
                header.innerText = camelToTitle(entry.name);
                templates.molecule.appendChild(header);
                header.classList.add("showWhenModded");
                section = document.createElement("div");
                section.classList.add("pairs")
                if (i >= moddedAtomIndex) {
                    section.classList.add("showWhenModded");
                }
            } else if (entry.type == "atom") {
                let id = entry.name + "_[0]_[1]";
                let label = document.createElement("label");
                label.setAttribute("for", id);
                label.innerHTML = camelToTitle(entry.name) + elementToSVG(entry.name) + ":";
                section.appendChild(label);
                let input = document.createElement("input");
                input.id = id;
                input.setAttribute("type", "number");
                input.setAttribute("min", "0");
                input.setAttribute("step", "1");
                input.setAttribute("value", "0");
                section.appendChild(input);
            }
            i++;
        }
        templates.molecule.appendChild(section);

    }
    /* Settings */
    {
        const transformSettingsDiv = document.getElementById("tSettings");
        let i = 0;
        for (let t of transformationTable) {
            if (transformationTableHeaders[i]) {
                let header = document.createElement("h3");
                header.classList.add("reduceMargins");
                header.classList.add("showWhenModded");
                header.innerText = transformationTableHeaders[i];
                transformSettingsDiv.appendChild(header);
                let buffer = document.createElement("div");
                buffer.classList.add("showWhenModded");
                transformSettingsDiv.appendChild(buffer);
            }
            let id = "toggle_glyph_" + i.toFixed();
            let label = document.createElement("label");
            label.innerText = t.name;
            label.setAttribute("for", id);
            transformSettingsDiv.appendChild(label);
            let checkbox = document.createElement("input");
            checkbox.id = id;
            checkbox.setAttribute("type", "checkbox");
            if (allowedTransformations.has(t.name)) {
                checkbox.setAttribute("checked", "")
            }
            transformSettingsDiv.appendChild(checkbox);
            if (i >= moddedTransformIndex) {
                label.classList.add("showWhenModded");
                checkbox.classList.add("showWhenModded");
            }
            i++;
        }
        const wheelSettingsDiv = document.getElementById("wSettings");
        i = 0;
        for (let w of initialWheelTable) {
            let id = "toggle_wheel_" + i.toFixed();
            let label = document.createElement("label");
            label.innerText = w.name;
            label.setAttribute("for", id);
            wheelSettingsDiv.appendChild(label);
            let checkbox = document.createElement("input");
            checkbox.id = id;
            checkbox.setAttribute("type", "checkbox");
            wheelSettingsDiv.appendChild(checkbox);
            if (isWheelModded(w.name)) {
                label.classList.add("showWhenModded");
                checkbox.classList.add("showWhenModded");
            }
            i++;
        }
    }
});

document.addEventListener("click", (e) => {
    if (permitUserInteraction) {
        clickHandler(e.target);
    }
});

function clickHandler(element) {
    if (!element) {
        return;
    }
    let elementId = element.id;
    if (!elementId) {
        return;
    }
    switch (elementId) {
        case "addReagent":
            {
                hasInteracted = true;
                let reagent = useTemplate(templates.molecule, "reagent", reagents.length.toFixed(), " [3]");
                reagent.hidden = false;
                reagentsTray.appendChild(reagent);
                reagents.push(new Map());
                reagentsUsed.push(0n);
                updateInputs();
            }
            break;
        case "addProduct":
            {
                hasInteracted = true;
                let product = useTemplate(templates.molecule, "product", products.length.toFixed(), " [3]");
                product.hidden = false;
                productsTray.appendChild(product);
                products.push(new Map());
                productsUsed.push(0n);
                updateOutputs();
            }
            break;
        case "collapseReagents":
            {
                let currentlyHidden = reagentsTray.style.display == "none";
                element.innerText = currentlyHidden ? "\\/" : "/\\";
                document.getElementById("addReagent").hidden = !currentlyHidden;
                reagentsTray.style.display = currentlyHidden ? "" : "none";
            }
            break;
        case "collapseProducts":
            {
                let currentlyHidden = productsTray.style.display == "none";
                element.innerText = currentlyHidden ? "\\/" : "/\\";
                document.getElementById("addProduct").hidden = !currentlyHidden;
                productsTray.style.display = currentlyHidden ? "" : "none";
            }
            break;
        case "collapseSettings":
            {
                let currentlyHidden = settingsTray.style.display == "none";
                element.innerText = currentlyHidden ? "\\/" : "/\\";
                settingsTray.style.display = currentlyHidden ? "" : "none";
            }
            break;
        case "deleteLastEvent":
            timeline.pop();
            updateTimeline();
            updateInputs();
            updateOutputs();
            break;
        case "confirm":
            confirmDialogAction();
        // fall through
        case "disagree":
            confirmDialog.close();
            break;
        case "save":
            saveState();
            break;
        default:
            // handle dynamically created elements
            let [type, subject, id] = elementId.split("_");
            id = Number.parseInt(id);
            switch (type) {
                case "remove":
                    switch (subject) {
                        case "reagent":
                            reagents.splice(id, 1);
                            reagentsUsed.splice(id, 1);
                            document.getElementById("molecule_reagent_" + id.toFixed()).remove();
                            for (let i = id; i < reagents.length; i++) {
                                updateTemplateId(document.getElementById("molecule_reagent_" + (i + 1).toFixed()), i.toFixed());
                            }
                            for (let i = 0; i < timeline.length; i++) {
                                if (timeline[i].action != "inject" && timeline[i].action != "retract") {
                                    continue;
                                }
                                if (timeline[i].reagent == id) {
                                    timeline.splice(id, 1);
                                } else if (timeline[i].reagent > id) {
                                    timeline[i].reagent--;
                                }
                            }
                            updateTimeline();
                            updateInputs();
                            break;
                        case "product":
                            products.splice(id, 1);
                            productsUsed.splice(id, 1);
                            document.getElementById("molecule_product_" + id.toFixed()).remove();
                            for (let i = id; i < products.length; i++) {
                                updateTemplateId(document.getElementById("molecule_product_" + (i + 1).toFixed()), i.toFixed());
                            }
                            for (let i = 0; i < timeline.length; i++) {
                                if (timeline[i].action != "submit") {
                                    continue;
                                }
                                if (timeline[i].product == id) {
                                    timeline.splice(id, 1);
                                } else if (timeline[i].product > id) {
                                    timeline[i].reagent--;
                                }
                            }
                            updateTimeline();
                            updateOutputs();
                            break;
                        case "event":
                            timeline.splice(id, 1);
                            updateTimeline();
                            updateInputs();
                            updateOutputs();
                            break;
                        default:
                            break;
                    }
                    break;
                case "inject":
                case "retract":
                    hasInteracted = true;
                    timeline.push({ action: type, reagent: id });
                    updateTimeline();
                    updateInputs();
                    break;
                case "submit":
                    hasInteracted = true;
                    timeline.push({ action: "submit", product: id });
                    updateTimeline();
                    updateOutputs();
                    break;
                case "use":
                    hasInteracted = true;
                    let glyphSelect = document.getElementById("glyph_" + id.toFixed());
                    let action = validTransformations[glyphSelect.value];
                    delete action.group;
                    if (action.requires) {
                        if (action.requires.length == 0) {
                            delete action.requires;
                        }
                    }
                    timeline.push(action);
                    updateTimeline();
                    break;
                default:
                    break;
            }
            break;
    }
}

document.addEventListener("change", (e) => {
    let element = e.target;
    if (permitUserInteraction) {
        changeHandler(element);
    } else {
        if (element.tagName == "INPUT" && element.getAttribute("type") == "checkbox") {
            element.checked = !element.checked;
        }
    }
});

function changeHandler(element) {
    let elementId = element.id;
    if (!elementId) {
        return;
    }
    if (element.tagName == "INPUT") {
        if (elementId == "darkMode") {
            if (element.checked) {
                document.body.classList.replace("light", "dark");
            } else {
                document.body.classList.replace("dark", "light");
            }
            return;
        }
        if (elementId == "useSymbols") {
            usingSymbols = element.checked;
            if (usingSymbols) {
                loadSVGs();
                for (let e of document.querySelectorAll("svg.symbol")) {
                    e.classList.remove("hide");
                }
            } else {
                for (let e of document.querySelectorAll("svg.symbol")) {
                    e.classList.add("hide");
                }
            }
            updateTimeline();
            return;
        }
        if (elementId == "useMods") {
            if (!enableModsCheckbox.checked) {
                if (allowUpdates) {
                    confirmDialog.children[0].innerText = "Are you sure you want to disable mods?\nThis will remove any non-vanilla transmutations."
                    enableModsCheckbox.checked = true;
                    confirmDialogAction = () => {
                        enableModsCheckbox.checked = false;
                        document.body.classList.remove("modded");
                        allowUpdates = false;

                        const changeEvent = new Event("change", { bubbles: true });

                        for (let i = 0; i < reagents.length; i++) {
                            for (let j = moddedAtomIndex; j < atomSectionTable.length; j++) {
                                if (atomSectionTable[j].type == "section") {
                                    continue;
                                }
                                let input = document.getElementById(atomSectionTable[j].name + "_reagent_" + i.toFixed());
                                input.value = "";
                                input.dispatchEvent(changeEvent);
                            }
                        }

                        for (let i = 0; i < products.length; i++) {
                            for (let j = moddedAtomIndex; j < atomSectionTable.length; j++) {
                                if (atomSectionTable[j].type == "section") {
                                    continue;
                                }
                                let input = document.getElementById(atomSectionTable[j].name + "_product_" + i.toFixed());
                                input.value = "";
                                input.dispatchEvent(changeEvent);
                            }
                        }

                        for (let i = moddedTransformIndex; i < transformationTable.length; i++) {
                            let cB = document.getElementById("toggle_glyph_" + i.toFixed());
                            cB.checked = false;
                            cB.dispatchEvent(changeEvent);
                        }

                        timeline = timeline.filter((e) => !isTimelineEventModded(e));

                        allowUpdates = true;
                        updateTimeline();
                        updateInputs();
                        updateOutputs();
                    }
                    confirmDialog.showModal();
                };
            } else {
                document.body.classList.add("modded");
            }
            return;
        }
        if (elementId == "load") {
            let f = element.files[0];
            if (!f) {
                return;
            }
            loadPromise = f.text()
            loadPromise.then(loadState);
            return;
        }
        if (element.id == "editMode") {
            hasInteracted = true;
            const timelineElement = document.getElementById("timeline");
            timelineElement.className = "";
            if (element.checked) {
                document.getElementById("deleteLastEvent").hidden = true;
                timelineElement.classList.add("quadruplets");
            } else {
                document.getElementById("deleteLastEvent").hidden = false;
                timelineElement.classList.add("triplets")

            }
            updateTimeline();
            return;
        }
        let [type, subject, id] = elementId.split("_");
        if (atomTypes.includes(type)) {
            hasInteracted = true;
            let v = Number.parseInt(element.value) || 0;
            v = Math.abs(v);
            element.value = v.toFixed();
            if (subject == "reagent") {
                if (v == 0) {
                    reagents[id].delete(type);
                } else {
                    reagents[id].set(type, v);
                }
                updateTimeline();
                updateInputs();
                updateOutputs();
            } else if (subject == "product") {
                if (v == 0) {
                    products[id].delete(type);
                } else {
                    products[id].set(type, v);
                }
                updateTimeline();
                updateInputs();
                updateOutputs();
            }
        } else if (type == "toggle") {
            hasInteracted = true;
            if (subject == "glyph") {
                if (element.checked) {
                    allowedTransformations.add(transformationTable[id].name);
                } else {
                    allowedTransformations.delete(transformationTable[id].name);
                }
                updateTimeline();
            } else if (subject == "wheel") {
                if (element.checked) {
                    activeWheels |= (1n << BigInt(id));
                } else {
                    activeWheels &= ~(1n << BigInt(id));
                }
                updateTimeline();
            }
        }
    }
}

let selectedEvent = -1n

let hoveredEvent = -1n;

document.addEventListener("pointerdown", (e) => {
    if (!permitUserInteraction || !editModeCheckbox.checked || !e.target.id.startsWith("timeline_event_")) {
        selectedEvent = -1n;
        if (hoveredEvent != -1n) {
            hoveredEvent = -1n;
            updateDragBorder();
        }
        return;
    }
    selectedEvent = BigInt(e.target.id.substring(15));
});

document.addEventListener("pointermove", (e) => {
    if (!permitUserInteraction || !editModeCheckbox.checked || selectedEvent == -1n) {
        if (hoveredEvent != -1n) {
            hoveredEvent = -1n;
            updateDragBorder();
        }
        return;
    }
    let L = BigInt(timeline.length);
    let v = L;
    if (L == 0n) {
        // huh?
        selectedEvent = -1n;
        return;
    }
    for (let i = 0n; i < L; i++) {
        let bounds = document.getElementById("timeline_event_" + i).getBoundingClientRect();
        if (bounds.y + bounds.height / 2 > e.clientY) {
            v = i;
            break;
        }
    }
    hoveredEvent = v;
    updateDragBorder();
});

document.addEventListener("pointerup", (e) => {
    if (!permitUserInteraction || !editModeCheckbox.checked || selectedEvent == -1n || hoveredEvent == -1n) {
        selectedEvent = -1n;
        if (hoveredEvent != -1n) {
            hoveredEvent = -1n;
            updateDragBorder();
        }
        return;
    }
    let element = timeline.splice(Number(selectedEvent), 1);
    if (selectedEvent < hoveredEvent) {
        hoveredEvent--;
    }
    timeline.splice(Number(hoveredEvent), 0, ...element);
    updateTimeline();
    updateInputs();
    updateOutputs();
    selectedEvent = -1n;
    hoveredEvent = -1n;
    updateDragBorder();
});

function updateDragBorder() {
    let L = BigInt(timeline.length);
    for (let i = 0n; i < L; i++) {
        let e = document.getElementById("timeline_event_" + i);
        switch ((i == -1n) ? -2n : i) {
            case hoveredEvent - 1n:
                e.classList.remove("selectAbove");
                e.classList.add("selectBelow");
                break;
            case hoveredEvent:
                e.classList.add("selectAbove");
                e.classList.remove("selectBelow");
                break;
            default:
                e.classList.remove("selectAbove");
                e.classList.remove("selectBelow");
                break;
        }
    }
}


window.addEventListener("beforeunload", (e) => {
    if (hasInteracted) {
        e.preventDefault();
    }
});

function blurHandler(e) {
    let element = e.target;
    let elementId = element.id;
    let [subject, type, id] = elementId.split("_");
    if (subject == "name") {
        hasInteracted = true;
        element.innerText = element.innerText.trim();
        updateTimeline();
        if (type == "reagent") {
            updateInputs();
        } else if (type == "product") {
            updateOutputs();
        }
    }
}

function* treeIterator(parent) {
    let stack = [parent];
    while (stack.length != 0) {
        let current = stack.pop();
        yield current;
        for (const child of current.children) {
            stack.push(child);
        }
    }
}

function useTemplate(template, ...replacements) {
    function replaceTags(s) {
        return s.replace(/([^\\](?:\\\\)*)\[(\d+)]/g, (m, s, i) => {
            let r = replacements[i];
            if (!r) {
                throw new Error("Invalid index from \"" + m + "\"");
            }
            return s + r;
        }).replace("\\\\", "\\").replace("\\[", "[");
    };

    let clone = template.cloneNode(true);
    for (let node of treeIterator(clone)) {
        if (node.id) {
            node.id = replaceTags(node.id);
        }
        if (node.hasAttribute("for")) {
            node.setAttribute("for", replaceTags(node.getAttribute("for")));
        }
        if (node.childElementCount == 0) {
            node.innerHTML = replaceTags(node.innerHTML);
        }
    }
    Array.from(clone.getElementsByClassName("editable")).forEach(element => {
        element.addEventListener("blur", blurHandler);
    });
    return clone;
}

function updateTemplateId(template, newID) {
    function replaceID(s) {
        return s.replace(/_(\d+)$/g, (s, id) => "_" + newID);
    }
    for (const node of treeIterator(template)) {
        if (node.id) {
            node.id = replaceID(node.id);
        }
        if (node.hasAttribute("for")) {
            node.setAttribute("for", replaceID(node.getAttribute("for")));
        }
    }
}

async function loadSVGs() {
    // semi-inelegant hack
    let symbolsElement = document.getElementById("symbols");
    if (!loadedSymbols && !symbolsElement.childElementCount) {
        try {
            let response = await fetch("./symbols.svg");
            let data = await response.text();
            let info = /<symbol[\s\S]*<\/symbol>/.exec(data);
            symbolsElement.innerHTML = info[0];
            let useElem;
            while (useElem = symbolsElement.querySelector("use")) {
                const T = useElem.getAttribute("transform");
                const symbolChildren = symbolsElement.getElementById(useElem.getAttribute("href").substring(1)).children;
                if (T) {
                    for (const c of symbolChildren) {
                        let cClone = c.cloneNode();
                        cClone.setAttribute("transform", T + " " + (cClone.getAttribute("transform") ?? ""));
                        useElem.insertAdjacentElement("beforebegin", cClone);
                    }
                } else {
                    for (const c of symbolChildren) {
                        useElem.insertAdjacentElement("beforebegin", c.cloneNode());
                    }
                }
                useElem.remove();
            }
            loadedSymbols = true;
            distributeSVG();
        } catch {
            loadedSymbols = false;
        }
    }
}

function elementToSVG(s) {
    s = s.replace(/([a-z])([A-Z])/g, (s, a, b) => a + "_" + b.toLowerCase());
    let svg = "<svg width=\"30\" height=\"30\" class=\"symbol symbol_" + s;
    if (!usingSymbols) {
        svg += " hide";
    }
    return svg + "\" viewBox=\"0 0 60 60\"></svg>";
}

function distributeSVG() {
    let symbolsElement = document.getElementById("symbols");
    for (let a of atomTypesSVGNames) {
        let stamp = symbolsElement.getElementById(a + "_symbol");
        if (!stamp) {
            console.log("No svg symbol for " + a + " found, skipping!");
            continue;
        }
        for (const target of document.querySelectorAll("svg.symbol_" + a)) {
            if (target.childElementCount > 0) {
                continue;
            }
            target.replaceChildren(...Array.from(stamp.children).map((e) => e.cloneNode()));
        }
    }
}

function capitalize(s) {
    return s[0].toUpperCase() + s.substring(1);
}

function camelToTitle(s) {
    s = s.replace(/([a-z])([A-Z])/g, (s, a, b) => a + " " + b);
    return capitalize(s);
}

function camelToLower(s) {
    return s.replace(/([a-z])([A-Z])/g, (s, a, b) => a + " " + b.toLowerCase());
}

function isAtomTypeModded(atomType) {
    return atomSectionTable.findIndex((e) => e.type == "atom" && e.name == atomType) > moddedAtomIndex;
}

function isGlyphModded(glyph) {
    return transformationTable.findIndex((f) => f.name == glyph) >= moddedTransformIndex;
}

function isWheelModded(wheel) {
    return wheel != "Van Berlo's Wheel";
}

function isTransformationModded(transformation) {
    if (transformation.requires) {
        for (let g of transformation.requires) {
            if (isGlyphModded(g)) {
                return true;
            }
        }
    }

    for (let at of transformation.inputs.keys()) {
        if (isAtomTypeModded(at)) {
            return true;
        }
    }

    for (let at of transformation.outputs.keys()) {
        if (isAtomTypeModded(at)) {
            return true;
        }
    }

    if (transformation.wheelInputs) {
        for (let w of transformation.wheelInputs) {
            if (isWheelModded(initialWheelTable[w.type].name) || isAtomTypeModded(w.atomType)) {
                return true;
            }
        }

        for (let w of transformation.wheelOutputs) {
            if (isAtomTypeModded(w)) {
                return true;
            }
        }
    }

    return false;
}

function isTimelineEventModded(e) {
    if ((e.action ?? "glyph") != "glyph") {
        return false;
    }
    if (isGlyphModded(e.glyph)) {
        return true;
    }
    return isTransformationModded(e);
}

function updateInputs() {
    if (!allowUpdates) {
        return;
    }
    let inputTray = document.getElementById("inputs");
    inputTray.innerHTML = "";
    for (const i in reagents) {
        let inputName = document.createElement("p");
        inputName.innerText = document.getElementById("name_reagent_" + i).innerText + " x" + reagentsUsed[i];
        inputTray.appendChild(inputName);
        let retractButton = document.createElement("button");
        retractButton.id = "retract_reagent_" + i;
        retractButton.innerHTML = "&LeftArrowBar;";
        inputTray.appendChild(retractButton);
        let addButton = document.createElement("button");
        addButton.id = "inject_reagent_" + i;
        addButton.innerHTML = "&RightArrowBar;";
        inputTray.appendChild(addButton);
    }
}

function updateTimeline() {
    if (!allowUpdates) {
        return;
    }
    atoms.clear();
    wheels = structuredClone(initialWheelTable);
    reagentsUsed = reagentsUsed.fill(0n);
    productsUsed = productsUsed.fill(0n);

    function addAtomsFromMap(molecule) {
        for (const [aT, c] of molecule.entries()) {
            let current = atoms.get(aT) ?? 0;
            current += c;
            atoms.set(aT, current);
        }
    }

    function removeAtomsFromMap(molecule) {
        let r = true;
        for (const [aT, c] of molecule.entries()) {
            let current = atoms.get(aT) ?? 0;
            current -= c;
            if (current == 0) {
                atoms.delete(aT);
                continue;
            }
            if (current < 0) {
                r = false
            }
            atoms.set(aT, current);
        }
        return r;
    }

    function applyWheelChanges(from, to) {
        if (!from) {
            return true;
        }
        for (let i = 0; i < from.length; i++) {
            if ((activeWheels & (1n << BigInt(from[i].type))) == 0n) {
                return false;
            }
            if (wheels[from[i].type].atoms[from[i].id] != from[i].atomType) {
                return false;
            }
        }
        for (let i = 0; i < from.length; i++) {
            wheels[from[i].type].atoms[from[i].id] = to[i];
        }
        return true;
    }

    function simpleDesc(t, useSymbols = false) {
        let s = "";
        let wheelStr = [];
        if (t.inputs.size + t.outputs.size) {
            let i = [];
            let o = [];
            for (let aT of atomTypes) {
                let c = t.inputs.get(aT) ?? 0;
                let word = ""
                if (useSymbols) {
                    word = elementToSVG(aT);
                } else {
                    word = camelToTitle(aT);
                }
                if (c == 1) {
                    i.push(word);
                } else if (c >= 2) {
                    i.push(word + " x" + c);
                }
                c = t.outputs.get(aT) ?? 0;
                if (c == 1) {
                    o.push(word);
                } else if (c >= 2) {
                    o.push(word + " x" + c);
                }
            }
            s = (i.length ? i.join(", ") : "&lt;nothing&gt;") + " &rightarrow; " + (o.length ? o.join(", ") : "&lt;nothing&gt;");
        }
        if (t.wheelInputs) {
            let pW = -1
            for (let i = 0; i < t.wheelInputs.length; i++) {
                if (t.wheelInputs[i].type != pW) {
                    pW = t.wheelInputs[i].type;
                    wheelStr.unshift(wheels[pW].name);
                }
                let [wInput, wOutput] = [t.wheelInputs[i].atomType, t.wheelOutputs[i]];

                if (useSymbols) {
                    wInput = elementToSVG(wInput);
                    wOutput = elementToSVG(wOutput);
                } else {
                    wInput = camelToTitle(wInput);
                    wOutput = camelToTitle(wOutput);
                }

                wheelStr[0] += `, ${wInput} (#${t.wheelInputs[i].id + 1}) &rightarrow; ${wOutput}`
            }
            wheelStr.reverse();
            if (s) {
                s += "; <br>";
            }
            s += wheelStr.join("; ");
        }
        return s;
    }

    const tempElement = document.getElementById("temp");
    tempElement.innerHTML = "";
    let success = true;
    let failure = false;
    for (const [i, event] of timeline.entries()) {
        let description = "";
        let glyphName = "";
        switch (event.action ?? "glyph") {
            case "inject":
                description = "Add " + document.getElementById("name_reagent_" + event.reagent.toFixed()).innerText;
                if (!failure) {
                    addAtomsFromMap(reagents[event.reagent]);
                    reagentsUsed[event.reagent]++;
                }
                break;
            case "retract":
                description = "Return " + document.getElementById("name_reagent_" + event.reagent.toFixed()).innerText;
                if (!failure) {
                    success &&= removeAtomsFromMap(reagents[event.reagent]);
                    reagentsUsed[event.reagent]--;
                }
                break;
            case "submit":
                description = "Output " + document.getElementById("name_product_" + event.product.toFixed()).innerText;
                if (!failure) {
                    success &&= removeAtomsFromMap(products[event.product]);
                    productsUsed[event.product]++;
                }
                break;
            case "glyph":
                description = simpleDesc(event, usingSymbols);
                glyphName = event.glyph;
                if (!failure) {
                    success &&= allowedTransformations.has(event.glyph);
                    if (event.requires) {
                        success &&= event.requires.every((g) => allowedTransformations.has(g));
                    }
                    success &&= removeAtomsFromMap(event.inputs) && applyWheelChanges(event.wheelInputs ?? [], event.wheelOutputs ?? []);
                    success && addAtomsFromMap(event.outputs);
                }
                break;
            default:
                break;
        }
        if (!description) {
            description = "<missing>";
        }
        let index = document.createElement("div");
        index.id = "timeline_event_" + i.toFixed();
        index.innerText = (i + 1) + ":";
        if (editModeCheckbox.checked) {
            index.innerText = "|| " + index.innerText;
            index.classList.add("noSelect");
        }
        tempElement.appendChild(index);
        let item = document.createElement("div");
        item.innerHTML = description;
        if (!success) {
            item.classList.add(failure ? "ignore" : "fail");    
            failure = true;
        }
        tempElement.appendChild(item);
        let glyphTag = document.createElement("div");
        glyphTag.innerText = glyphName;
        tempElement.appendChild(glyphTag);
        if (editModeCheckbox.checked) {
            let buttonDiv = document.createElement("div");
            tempElement.appendChild(buttonDiv);
            let deleteEventButton = document.createElement("button");
            deleteEventButton.id = "remove_event_" + i.toFixed();
            deleteEventButton.innerHTML = "&#x1F5D1;"
            buttonDiv.appendChild(deleteEventButton);
        }
    }
    document.getElementById("timeline").innerHTML = tempElement.innerHTML;
    tempElement.innerHTML = "";

    // Looping check
    if (success && productsUsed.length > 0 && productsUsed.reduce((min, v) => min > v ? v : min) >= 1n) {
        let endAtoms = structuredClone(atoms);
        let endWheels = structuredClone(wheels);
        atoms.clear();
        wheels = structuredClone(initialWheelTable);
        let repeatStart = -1;

        let lastPotentialRepeat = timeline.length;
        for (let i = 0; i < products.length; i++) {
            lastPotentialRepeat = Math.min(lastPotentialRepeat, timeline.findLastIndex((v) => v.action == "submit" && v.product == i));
        }

        for (const [i, event] of timeline.entries()) {
            if (i > lastPotentialRepeat) {
                break;
            }
            let match = true;

            for (const [aT, c] of atoms.entries()) {
                if (c != (endAtoms.get(aT) ?? 0)) {
                    match = false;
                    break;
                }
            }
            if (match) {
                for (const [aT, c] of endAtoms.entries()) {
                    if (c != (atoms.get(aT) ?? 0)) {
                        match = false;
                        break;
                    }
                }
            }
            if (match) {
                wheelLoop: for (const j in wheels) {
                    nextKOff: for (let kOff = 0; kOff < 6; kOff++) {
                        for (let k = 0; k < 6; k++) {
                            if (wheels[j].atoms[k] != endWheels[j].atoms[(k + kOff) % 6]) {
                                continue nextKOff;
                            }
                        }
                        continue wheelLoop;
                    }
                    match = false;
                    break;
                }
            }
            if (match) {
                repeatStart = i;
                break;
            }

            switch (event.action ?? "glyph") {
                case "inject":
                    addAtomsFromMap(reagents[event.reagent]);
                    break;
                case "retract":
                    removeAtomsFromMap(reagents[event.reagent]);
                    break;
                case "submit":
                    removeAtomsFromMap(products[event.product]);
                    break;
                case "glyph":
                    removeAtomsFromMap(event.inputs)
                    applyWheelChanges(event.wheelInputs, event.wheelOutputs);
                    addAtomsFromMap(event.outputs);
                    break;
                default:
                    break;
            }
        }
        atoms = endAtoms;
        wheels = endWheels;
        if (repeatStart != -1) {
            let eventIndex = document.getElementById("timeline_event_" + repeatStart.toFixed());
            eventIndex.innerHTML = "&#x21B1; " + eventIndex.innerHTML;
        }
    }

    // Wheels
    {
        for (const i in wheels) {
            if ((activeWheels & (1n << BigInt(i))) == 0n) {
                continue;
            }
            let wheelElement = useTemplate(templates.wheel, i);
            wheelElement.id = "";
            wheelElement.hidden = false;
            tempElement.appendChild(wheelElement);
            document.getElementById("name_wheel_" + i).innerText = wheels[i].name;
            let atomList = document.getElementById("atoms_wheel_" + i);
            for (let j = 0; j < 6; j++) {
                let atomItem = document.createElement("li");
                if (usingSymbols) {
                    atomItem.innerHTML = elementToSVG(wheels[i].atoms[j]);
                } else {
                    atomItem.innerText = camelToTitle(wheels[i].atoms[j]);
                }
                atomList.appendChild(atomItem);
            }
        }
        [document.getElementById("wheels").innerHTML, tempElement.innerHTML] = [tempElement.innerHTML, ""];
    }
    // Atoms
    {
        for (const aT of atomTypes) {
            let c = atoms.get(aT) ?? 0;
            if (c == 0) {
                continue;
            }
            let entry = document.createElement("div");
            if (usingSymbols) {
                entry.innerHTML = elementToSVG(aT);
            } else {
                entry.innerText = camelToTitle(aT);
            }
            tempElement.appendChild(entry);
            let count = document.createElement("div");
            count.innerText = "x " + c.toFixed();
            if (c < 0) {
                count.classList.add("negative");
            }
            tempElement.appendChild(count);
        }

        [document.getElementById("atoms").innerHTML, tempElement.innerHTML] = [tempElement.innerHTML, ""];
    }
    // Transformations
    {

        function listToMap(l) {
            let m = new Map();
            for (const atomType of l) {
                m.set(atomType, (m.get(atomType) ?? 0) + 1);
            }
            return m;
        }

        let previousValidTransformations = validTransformations;
        validTransformations = [];
        let i = -1;
        let accumulatedLength = 0;
        for (const glyph of transformationTable) {
            i++;
            if (!allowedTransformations.has(glyph.name)) {
                continue;
            }
            let glyphsAllowedTransformations = glyph.transforms();
            if (glyphsAllowedTransformations.length == 0) {
                continue;
            }
            glyphsAllowedTransformations.forEach((e) => {
                e.inputs = listToMap(e.inputs);
                e.outputs = listToMap(e.outputs);
                e.glyph = glyph.name;
            });

            if (!enableModsCheckbox.checked) {
                glyphsAllowedTransformations = glyphsAllowedTransformations.filter((e) => !isTransformationModded(e));
                if (glyphsAllowedTransformations.length == 0) {
                    continue;
                }
            }

            let previousOptionText = "";
            {
                let prevS = document.getElementById("glyph_" + i.toFixed());
                if (prevS) {
                    previousOptionText = prevS.querySelector("option[value=\"" + prevS.value + "\"]" ).innerText ?? "";
                }
            }
            validTransformations = validTransformations.concat(glyphsAllowedTransformations);
            let label = document.createElement("label");
            label.setAttribute("for", "glyph_" + i.toFixed());
            label.innerText = glyph.name;
            tempElement.appendChild(label);
            let select = document.createElement("select");
            select.id = "glyph_" + i.toFixed();
            tempElement.appendChild(select);
            let lastGroup = -1;
            let groupLabel;
            for (let j = 0; j < glyphsAllowedTransformations.length; j++) {
                if (glyphsAllowedTransformations[j].group != lastGroup) {
                    groupLabel = document.createElement("optgroup");
                    groupLabel.setAttribute("label", glyph.groups[glyphsAllowedTransformations[j].group]);
                    select.appendChild(groupLabel);
                    lastGroup = glyphsAllowedTransformations[j].group;
                }
                let transformOption = document.createElement("option");
                transformOption.innerHTML = simpleDesc(glyphsAllowedTransformations[j]);
                transformOption.value = accumulatedLength++;
                groupLabel.appendChild(transformOption);
                if (previousOptionText) {
                    if (transformOption.innerText == previousOptionText) {
                        transformOption.setAttribute("selected", "");
                        previousOptionText = "";       
                    }
                }
            }
            let button = document.createElement("button");
            button.id = "use_glyph_" + i.toFixed();
            button.innerHTML = "&Rightarrow;";
            tempElement.appendChild(button);
        }
        [document.getElementById("glyphs").innerHTML, tempElement.innerHTML] = [tempElement.innerHTML, ""];
    }
    if (loadedSymbols && usingSymbols) {
        distributeSVG();
    }
}

function updateOutputs() {
    if (!allowUpdates) {
        return;
    }
    let outputTray = document.getElementById("outputs");
    outputTray.innerHTML = "";
    for (const i in products) {
        let outputName = document.createElement("p");
        outputName.innerText = document.getElementById("name_product_" + i).innerText + " x" + productsUsed[i];
        outputTray.appendChild(outputName);
        let addButton = document.createElement("button");
        addButton.id = "submit_product_" + i;
        addButton.innerHTML = "&RightTeeArrow;";
        outputTray.appendChild(addButton);
    }
}

updateTimeline();