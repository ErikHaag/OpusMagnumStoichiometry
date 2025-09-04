let reagents = [];
let reagentsUsed = [];
let products = [];
let productsUsed = [];
let wheels = [];
let atoms = new Map();
let activeWheels = 0n;

let transformations = [];

let timeline = [];

const templates = {
    molecule: document.getElementById("moleculeTemplate"),
    wheel: document.getElementById("wheelTemplate")
};

const reagentsTray = document.getElementById("reagentsTray");
const productsTray = document.getElementById("productsTray");
const settingsTray = document.getElementById("settingsTray");

const editModeSelect = document.getElementById("editMode");

let usingSymbols = false;
let loadedSymbols = false;
let allowUpdates = true;

let loadPromise = null;

document.addEventListener("DOMContentLoaded", () => {
    /* Molecule template */
    {
        templates.molecule.id = "molecule_[0]_[1]";
        let section = null;
        for (const entry of atomTypeTable) {
            if (entry.type == "section") {
                if (section) {
                    templates.molecule.appendChild(section);
                }
                let header = document.createElement("h3");
                header.innerText = camelToTitle(entry.name);
                templates.molecule.appendChild(header);
                section = document.createElement("div");
                section.classList.add("pairs")
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
        }
        templates.molecule.appendChild(section);
    }
    /* Settings */
    {
        const transformSettingsDiv = document.getElementById("tSettings");
        let i = 0;
        for (let t of transformationTable) {
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
            i++;
        }
        const wheelSettingsDiv = document.getElementById("wSettings");
        i = 0;
        for (let w of wheelTable) {
            let id = "toggle_wheel_" + i.toFixed();
            let label = document.createElement("label");
            label.innerText = w.name;
            label.setAttribute("for", id);
            wheelSettingsDiv.appendChild(label);
            let checkbox = document.createElement("input");
            checkbox.id = id;
            checkbox.setAttribute("type", "checkbox");
            wheelSettingsDiv.appendChild(checkbox);
            i++;
        }
    }
});

document.addEventListener("click", (e) => {
    let element = e.target;
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
                            reagentsTray.children[id].remove();
                            for (let i = id; i < reagentsTray.children.length; i++) {
                                updateTemplateId(reagentsTray.children[i], i.toFixed());
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
                            productsTray.children[id].remove();
                            for (let i = id; i < productsTray.children.length; i++) {
                                updateTemplateId(productsTray.children[i], i.toFixed());
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
                case "event":
                    switch (subject) {
                        case "delay":
                            timeline.splice(id, 0, ...timeline.splice(id + 1, 1));
                            break;
                        case "expedite":
                            timeline.splice(id - 1, 0, ...timeline.splice(id, 1));
                            break;
                        case "remove":
                            timeline.splice(id, 1);
                            break;
                        default:
                            break;
                    }
                    updateTimeline();
                    updateInputs();
                    updateOutputs();
                    break;
                case "inject":
                case "retract":
                    timeline.push({ action: type, reagent: id });
                    updateTimeline();
                    updateInputs();
                    break;
                case "submit":
                    timeline.push({ action: "submit", product: id });
                    updateTimeline();
                    updateOutputs();
                    break;
                case "use":
                    let glyphSelect = document.getElementById("glyph_" + id.toFixed());
                    let action = transformations[glyphSelect.value];
                    delete action.group;
                    timeline.push(action);
                    updateTimeline();
                    break;
                default:
                    break;
            }
            break;
    }
});

document.addEventListener("change", (e) => {
    let element = e.target;
    let elementId = element.id;
    if (!elementId) {
        return;
    }
    if (element.tagName == "INPUT") {
        if (elementId == "darkMode") {
            document.body.className = element.checked ? "dark" : "light";
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
        if (elementId == "load") {
            let f = element.files[0];
            if (!f) {
                return;
            }
            loadPromise = f.text()
            loadPromise.then(loadState);
            return;
        }
        let [type, subject, id] = elementId.split("_");
        if (atomTypes.includes(type)) {
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
    } else if (element.tagName == "SELECT" /* * FROM jokes WHERE subject = "SQL"*/) {
        if (element.id == "editMode") {
            const timelineElement = document.getElementById("timeline");
            timelineElement.className = ""
            if (element.value == "normal") {
                document.getElementById("deleteLastEvent").hidden = false;
                timelineElement.classList.add("triplets")
            } else {
                document.getElementById("deleteLastEvent").hidden = true;
                timelineElement.classList.add("quadruplets");

            }
            updateTimeline(); 
        }
    }
});

function blurHandler(e) {
    let element = e.target;
    let elementId = element.id;
    let [subject, type, id] = elementId.split("_");
    if (subject == "name") {
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
        loadedSymbols = true;
        try {
            let response = await fetch("./symbols.svg");
            let data = await response.text();
            let info = /<symbol[\s\S]*<\/symbol>/.exec(data);
            symbolsElement.innerHTML = info[0];
        } catch {

            loadedSymbols = false;
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

function elementToSVG(s) {
    s = s.replace(/([a-z])([A-Z])/g, (s, a, b) => a + "_" + b.toLowerCase());
    let svg = "<svg width=\"30\" height=\"30\" class=\"symbol";
    if (!usingSymbols) {
        svg += " hide";
    }
    return svg + "\"><use href=\"#" + s + "_symbol\"/></svg>";
}

function camelToLower(s) {
    return s.replace(/([a-z])([A-Z])/g, (s, a, b) => a + " " + b.toLowerCase());
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
    wheels = structuredClone(wheelTable);
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
        for (const [aT, c] of molecule.entries()) {
            let current = atoms.get(aT) ?? 0;
            if (current < c) {
                return false;
            }
        }
        for (const [aT, c] of molecule.entries()) {
            let current = atoms.get(aT) ?? 0;
            current -= c;
            if (current == 0) {
                atoms.delete(aT);
            } else {
                atoms.set(aT, current);
            }
        }
        return true
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
                    success &&= removeAtomsFromMap(event.inputs) && applyWheelChanges(event.wheelInputs, event.wheelOutputs);
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
        index.innerText = (i + 1) + ": ";
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
        if (editModeSelect.value == "tweak") {
            let buttonDiv = document.createElement("div");
            tempElement.appendChild(buttonDiv);
            if (i > 0) {
                let upEventButton = document.createElement("button");
                upEventButton.id = "event_expedite_" + i.toFixed();
                upEventButton.innerHTML = "&#x2191;"
                buttonDiv.appendChild(upEventButton);
            }
            if (i < timeline.length - 1) {
                let upEventButton = document.createElement("button");
                upEventButton.id = "event_delay_" + i.toFixed();
                upEventButton.innerHTML = "&#x2193;"
                buttonDiv.appendChild(upEventButton);
            }
            let deleteEventButton = document.createElement("button");
            deleteEventButton.id = "event_remove_" + i.toFixed();
            deleteEventButton.innerHTML = "&#x1F5D1;"
            buttonDiv.appendChild(deleteEventButton);
        }
    }
    [document.getElementById("timeline").innerHTML, tempElement.innerHTML] = [tempElement.innerHTML, ""];

    // Looping check
    if (success && productsUsed.length > 0 && productsUsed.reduce((min, v) => min > v ? v : min) >= 1n) {
        let endAtoms = structuredClone(atoms);
        let endWheels = structuredClone(wheels);
        atoms.clear();
        wheels = structuredClone(wheelTable);
        let repeatStart = timeline.length - 1;
        for (const [i, event] of timeline.entries()) {
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
        if (repeatStart != timeline.length - 1) {
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

        transformations = [];
        let i = 0;
        let accumulatedLength = 0;
        for (const glyph of transformationTable) {
            if (!allowedTransformations.has(glyph.name)) {
                continue;
            }
            let transforms = glyph.transforms();
            if (transforms.length == 0) {
                continue;
            }
            transforms = transforms.map((e) => {
                e.inputs = listToMap(e.inputs);
                e.outputs = listToMap(e.outputs);
                e.glyph = glyph.name;
                return e;
            })
            transformations = transformations.concat(transforms);
            let label = document.createElement("label");
            label.setAttribute("for", "glyph_" + i.toFixed());
            label.innerText = glyph.name;
            tempElement.appendChild(label);
            let select = document.createElement("select");
            select.id = "glyph_" + i.toFixed();
            tempElement.appendChild(select);
            let lastGroup = -1;
            let groupLabel;
            for (let j = 0; j < transforms.length; j++) {
                if (transforms[j].group != lastGroup) {
                    groupLabel = document.createElement("optgroup");
                    groupLabel.setAttribute("label", glyph.groups[transforms[j].group]);
                    select.appendChild(groupLabel);
                    lastGroup = transforms[j].group;
                }
                let transformOption = document.createElement("option");
                transformOption.innerHTML = simpleDesc(transforms[j]);
                transformOption.value = accumulatedLength++;
                groupLabel.appendChild(transformOption);
            }
            let button = document.createElement("button");
            button.id = "use_glyph_" + i.toFixed();
            button.innerHTML = "&Rightarrow;";
            tempElement.appendChild(button);
            i++;
        }
        [document.getElementById("glyphs").innerHTML, tempElement.innerHTML] = [tempElement.innerHTML, ""];
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