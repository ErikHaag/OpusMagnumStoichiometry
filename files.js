function saveState() {
    let state = {
        glyphs: Array.from(allowedTransformations),
        wheels: wheels.flatMap((e, i) => {
            if (activeWheels & 1n << BigInt(i)) {
                return [e.name];
            }
            return [];
        }),
        reagents: reagents.map((e, i) => {
            return {
                name: document.getElementById("name_reagent_" + i.toFixed()).innerText,
                atoms: Object.fromEntries(e)
            };
        }),
        products: products.map((e, i) => {
            return {
                name: document.getElementById("name_product_" + i.toFixed()).innerText,
                atoms: Object.fromEntries(e)
            };
        }),
        timeline: timeline.map((e) => {
            let t = structuredClone(e);
            if (t.glyph) {
                t.inputs = Object.fromEntries(t.inputs);
                t.outputs = Object.fromEntries(t.outputs);
                t.wheelInputs?.forEach((e) => {
                    e.type = initialWheelTable[e.type].name;
                })
            }
            return t;
        })
    };

    let downloadAnchor = document.getElementById("download");
    
    let productString = "";
    if (state.products.length != 0) {
        productString = state.products[0].name;
        for (let i = 1; i < state.products.length; i++) {
            if (productString.length + state.products[i].name.length > 48) {
                productString += ", and " + (state.products.length - i) + " others" ;
                break;
            }
            productString += ", " + state.products[i].name;
        }
    }
    
    let reagentString = "";
    if (state.reagents.length != 0) {
        reagentString = state.reagents[0].name;
        for (let i = 1; i < state.reagents.length; i++) {
            if (reagentString.length + state.reagents[i].name.length > 48) {
                reagentString += ", and " + (state.reagents.length - i) + " others" ;
                break;
            }
            reagentString += ", " + state.reagents[i].name;
        }
    }
    
    let fileName = "Empty plan";
    switch ((reagentString ? 1n : 0n) | (productString ? 2n : 0n)) {
        case 1n:
            fileName = "Disposal of " + reagentString;
            break;
        case 2n:
            fileName = productString + " Ex nihlo";
            break;
        case 3n:
            fileName = productString + " from " + reagentString;
            break;
        default:
            break;
    }
    
    downloadAnchor.setAttribute("download", fileName + ".json");
    downloadAnchor.href = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state));
    downloadAnchor.click();
}

function loadState(data) {
    let state = JSON.parse(data);
    let modded = false;

    allowUpdates = false;
    // reagents
    let i = 0;
    for (i = reagents.length - 1; i >= 0; i--) {
        clickHandler(document.getElementById("remove_reagent_" + i.toFixed()));
    }
    i = 0;
    for (const r of state.reagents) {
        clickHandler(document.getElementById("addReagent"));
        document.getElementById("name_reagent_" + i.toFixed()).innerText = r.name;
        for (const [aT, c] of Object.entries(r.atoms)) {
            modded ||= c != 0 && isAtomTypeModded(aT);
            let atomCountInput = document.getElementById(aT + "_reagent_" + i.toFixed());
            atomCountInput.value = c;
            changeHandler(atomCountInput);
        }
        i++;
    }
    //products
    for (i = products.length - 1; i >= 0; i--) {
        clickHandler(document.getElementById("remove_product_" + i.toFixed()));
    }
    i = 0;
    for (const p of state.products) {
        clickHandler(document.getElementById("addProduct"));
        document.getElementById("name_product_" + i.toFixed()).innerText = p.name;
        for (const [aT, c] of Object.entries(p.atoms)) {
            modded ||= c != 0 && isAtomTypeModded(aT);
            let atomCountInput = document.getElementById(aT + "_product_" + i.toFixed());
            atomCountInput.value = c;
            changeHandler(atomCountInput);
        }
        i++;
    }
    // glyph settings
    i = 0;
    for (const t of transformationTable) {
        let cB = document.getElementById("toggle_glyph_" + i.toFixed());
        cB.checked = state.glyphs.includes(t.name);
        modded ||= cB.checked && isGlyphModded(t.name);
        changeHandler(cB);
        i++;
    }
    i = 0;
    for (const w of initialWheelTable) {
        let cB = document.getElementById("toggle_wheel_" + i.toFixed());
        cB.checked = state.wheels.includes(w.name);
        modded ||= cB.checked && isWheelModded(w.name);
        changeHandler(cB);
        i++;
    }
    state.timeline.forEach((e) => {
        if (e.glyph) {
            e.inputs = new Map(Object.entries(e.inputs));
            e.outputs = new Map(Object.entries(e.outputs));
            e.wheelInputs?.forEach((w) => {
                w.type = initialWheelTable.findIndex((v) => v.name == w.type);
            });
        }
        modded ||= isTimelineEventModded(e);
    });

    enableModsCheckbox.checked = modded;
    changeHandler(enableModsCheckbox);

    timeline = state.timeline;
    allowUpdates = true;
    updateTimeline();
    updateInputs();
    updateOutputs();
}