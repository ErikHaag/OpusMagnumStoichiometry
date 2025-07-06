let reagents = [];
let products = [];
let wheels = [];
let atoms = new Map();
let activeWheels = 0n;

let transformations = [];

let timeline = [];

const atomTypeTable = [
    { type: "section", name: "Opus Magnum" },
    { type: "atom", name: "salt" },
    { type: "atom", name: "air" },
    { type: "atom", name: "earth" },
    { type: "atom", name: "fire" },
    { type: "atom", name: "water" },
    { type: "atom", name: "quintessence" },
    { type: "atom", name: "mors" },
    { type: "atom", name: "vitae" },
    { type: "atom", name: "quicksilver" },
    { type: "atom", name: "lead" },
    { type: "atom", name: "tin" },
    { type: "atom", name: "iron" },
    { type: "atom", name: "copper" },
    { type: "atom", name: "silver" },
    { type: "atom", name: "gold" },
    { type: "section", name: "Halving Metallurgy" },
    { type: "atom", name: "wolfram" },
    { type: "atom", name: "vulcan" },
    { type: "atom", name: "nickel" },
    { type: "atom", name: "zinc" },
    { type: "atom", name: "sednum" },
    { type: "atom", name: "osmium" },
    { type: "section", name: "Noble Elements" },
    { type: "atom", name: "nobilis"},
    { type: "atom", name: "alpha"},
    { type: "atom", name: "beta"},
    { type: "atom", name: "gamma"},
    { type: "section", name: "True Animismus" },
    { type: "atom", name: "greyMors" },
    { type: "atom", name: "redVitae" },
    { type: "atom", name: "trueMors" },
    { type: "atom", name: "trueVitae" },
    { type: "section", name: "Unstable Elements" },
    { type: "atom", name: "aether" },
    { type: "atom", name: "uranium" }
];

const wheelTable = [
    {
        name: "Van Berlo's Wheel",
        atoms: ["water", "salt", "earth", "fire", "salt", "air"]
    },
    {
        name: "Ravari's Wheel",
        atoms: ["lead", "tin", "iron", "copper", "silver", "gold"]
    },
    {
        name: "Herriman's Wheel",
        atoms: ["trueVitae", "redVitae", "vitae", "mors", "greyMors", "trueMors"]
    }
];

const atomTypes = [
    "trueMors",
    "greyMors",
    "mors",
    "salt",
    "vitae",
    "redVitae",
    "trueVitae",
    "air",
    "earth",
    "fire",
    "water",
    "quintessence",
    "quicksilver",
    "lead",
    "wolfram",
    "tin",
    "vulcan",
    "iron",
    "nickel",
    "copper",
    "zinc",
    "silver",
    "sednum",
    "gold",
    "osmium",
    "nobilis",
    "alpha",
    "beta",
    "gamma",
    "uranium",
    "aether"
];

const templates = {
    molecule: document.getElementById("moleculeTemplate"),
    wheel: document.getElementById("wheelTemplate")
};

const reagentsTray = document.getElementById("reagentsTray");
const productsTray = document.getElementById("productsTray");
const settingsTray = document.getElementById("settingsTray");

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
                label.innerText = camelToTitle(entry.name) + ":";
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
            if (allowedTransformations.get(t.name)) {
                checkbox.setAttribute("checked", "")
            } else {
                allowedTransformations.set(t.name, false);
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
    let element = document.elementFromPoint(e.clientX, e.clientY);
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
                let reagent = useTemplate(templates.molecule, "reagent", reagents.length.toFixed());
                reagent.hidden = false;
                reagentsTray.appendChild(reagent);
                reagents.push(new Map());
                updateInputs();
            }
            break;
        case "addProduct":
            {
                let product = useTemplate(templates.molecule, "product", products.length.toFixed());
                product.hidden = false;
                productsTray.appendChild(product);
                products.push(new Map());
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
            break;
        default:
            // handle dynamically created elements
            let [type, subject, id] = elementId.split("_");
            id = Number.parseInt(id);
            switch (type) {
                case "remove":
                    if (subject == "reagent") {
                        reagents.splice(id, 1);
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
                        updateInputs();
                        updateTimeline();
                    } else if (subject == "product") {
                        products.splice(id, 1);
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
                        updateOutputs();
                        updateTimeline();
                    }
                    break;
                case "inject":
                case "retract":
                    timeline.push({ action: type, reagent: id });
                    updateTimeline();
                    break;
                case "submit":
                    timeline.push({ action: "submit", product: id });
                    updateTimeline();
                    break;
                case "use":
                    let glyphSelect = document.getElementById("glyph_" + id.toFixed());
                    timeline.push(transformations[glyphSelect.value]);
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
    if (element.tagName != "INPUT") {
        return;
    }
    let elementId = element.id;
    if (!elementId) {
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
        } else if (subject == "product") {
            if (v == 0) {
                products[id].delete(type);
            } else {
                products[id].set(type, v);
            }
            updateTimeline();
        }
    } else if (type == "toggle") {
        if (subject == "glyph") {
            allowedTransformations.set(transformationTable[id].name, element.checked);
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
});

function blurHandler(e) {
    let element = e.target;
    let elementId = element.id;
    let [subject, type, id] = elementId.split("_");
    if (subject == "name") {
        if (type == "reagent") {
            updateInputs();
        } else if (type == "product") {
            updateOutputs();
        }
        updateTimeline();
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
            node.innerText = replaceTags(node.innerText);
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

function updateInputs() {
    let inputTray = document.getElementById("inputs");
    inputTray.innerHTML = "";
    for (const i in reagents) {
        let inputName = document.createElement("p");
        inputName.innerText = document.getElementById("name_reagent_" + i).innerText;
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
    atoms.clear();
    wheels = structuredClone(wheelTable);

    function addAtomsFromMap(molecule) {
        for (const [aT, c] of molecule.entries()) {
            let current = atoms.get(aT) ?? 0;
            current += c;
            if (current == 0) {
                atoms.delete(aT);
            } else {
                atoms.set(aT, current);
            }
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
            if (c == 0) {
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

    function simpleDesc(t) {
        let s = "";
        let wheelStr = [];
        if (t.inputs.size + t.outputs.size) {
            let i = [];
            let o = [];
            for (let aT of atomTypes) {
                let c = t.inputs.get(aT) ?? 0;
                if (c == 1) {
                    i.push(camelToTitle(aT));
                } else if (c >= 2) {
                    i.push(camelToTitle(aT) + " x" + c);
                }
                c = t.outputs.get(aT) ?? 0;
                if (c == 1) {
                    o.push(camelToTitle(aT));
                } else if (c >= 2) {
                    o.push(camelToTitle(aT) + " x" + c);
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
                wheelStr[0] += `, ${camelToTitle(t.wheelInputs[i].atomType)} (#${t.wheelInputs[i].id + 1}) &rightarrow; ${camelToTitle(t.wheelOutputs[i])}`
            }
            wheelStr.reverse();
            if (s) {
                s += "; <br>";
            }
            s += wheelStr.join("; ");
        }
        return s;
    }

    let timelineDiv = document.getElementById("timeline");
    timelineDiv.innerHTML = "";
    let i = 1;
    let success = true;
    let failure = false;
    for (let event of timeline) {
        let description = "";
        let glyphName = "";
        switch (event.action ?? "glyph") {
            case "inject":
                description = "Add " + document.getElementById("name_reagent_" + event.reagent.toFixed()).innerText;
                if (!failure) {
                    addAtomsFromMap(reagents[event.reagent]);
                }
                break;
            case "retract":
                description = "Return " + document.getElementById("name_reagent_" + event.reagent.toFixed()).innerText;
                if (!failure) {
                    success &&= removeAtomsFromMap(reagents[event.reagent]);
                }
                break;
            case "submit":
                description = "Output " + document.getElementById("name_product_" + event.product.toFixed()).innerText;
                if (!failure) {
                    success &&= removeAtomsFromMap(products[event.product]);
                }
                break;
            case "glyph":
                description = simpleDesc(event);
                glyphName = event.glyph;
                if (!failure) {
                    success &&= allowedTransformations.get(event.glyph);
                    success &&= removeAtomsFromMap(event.inputs) && applyWheelChanges(event.wheelInputs, event.wheelOutputs);
                    success && addAtomsFromMap(event.outputs);
                }
                break;
            default:
                break;
        }
        if (description) {
            let index = document.createElement("div");
            index.innerText = i + ": ";
            timelineDiv.appendChild(index);
            let item = document.createElement("div");
            item.innerHTML = description;
            if (!success) {
                item.classList.add(failure ? "ignore" : "fail");
                failure = true;
            }
            timelineDiv.appendChild(item);
            let glyphTag = document.createElement("div");
            glyphTag.innerText = glyphName;
            timelineDiv.appendChild(glyphTag);
        }
        i++;
    }

    // Wheels
    {
        const wheelColumn = document.getElementById("wheels");
        wheelColumn.innerHTML = "";
        for (const i in wheels) {
            if ((activeWheels & (1n << BigInt(i))) == 0n) {
                continue;
            }
            let wheelElement = useTemplate(templates.wheel, i);
            wheelElement.id = "";
            wheelElement.hidden = false;
            wheelColumn.appendChild(wheelElement);
            document.getElementById("name_wheel_" + i).innerText = wheels[i].name;
            let atomList = document.getElementById("atoms_wheel_" + i);
            for (let j = 0; j < 6; j++) {
                let atomItem = document.createElement("li");
                atomItem.innerText = camelToTitle(wheels[i].atoms[j]);
                atomList.appendChild(atomItem);
            }
        }
    }
    // Atoms
    {
        const atomColumn = document.getElementById("atoms");
        atomColumn.innerHTML = "";
        for (const aT of atomTypes) {
            let c = atoms.get(aT) ?? 0;
            if (c == 0) {
                continue;
            }
            let entry = document.createElement("div");
            entry.innerText = camelToTitle(aT);
            atomColumn.appendChild(entry);
            let count = document.createElement("div");
            count.innerText = "x " + c.toFixed();
            if (c < 0) {
                count.classList.add("negative");
            }
            atomColumn.appendChild(count);
        }
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

        const transformColumn = document.getElementById("glyphs");
        transformColumn.innerHTML = "";
        transformations = [];
        let i = 0;
        let accumulatedLength = 0;
        for (const glyph of transformationTable) {
            if (!allowedTransformations.get(glyph.name)) {
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
            transformColumn.appendChild(label);
            let select = document.createElement("select");
            select.id = "glyph_" + i.toFixed();
            transformColumn.appendChild(select);
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
            transformColumn.appendChild(button);
            i++;
        }
    }
}

function updateOutputs() {
    let outputTray = document.getElementById("outputs");
    outputTray.innerHTML = "";
    for (const i in products) {
        let outputName = document.createElement("p");
        outputName.innerText = document.getElementById("name_product_" + i).innerText;
        outputTray.appendChild(outputName);
        let addButton = document.createElement("button");
        addButton.id = "submit_product_" + i;
        addButton.innerHTML = "&RightTeeArrow;";
        outputTray.appendChild(addButton);
    }
}

updateTimeline();