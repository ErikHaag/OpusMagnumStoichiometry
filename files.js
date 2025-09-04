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
                    e.type = wheelTable[e.type].name;
                })
            }
            return t;
        })
    };

    let downloadAnchor = document.getElementById("download");
    downloadAnchor.href = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state));
    downloadAnchor.click();
}

function loadState(data) {
    let state = JSON.parse(data);
    const clickEvent = new Event("click", { bubbles: true });
    const changeEvent = new Event("change", { bubbles: true });
    allowUpdates = false;
    // reagents
    let i = 0;
    for (i = reagents.length - 1; i >= 0; i--) {
        document.getElementById("remove_reagent_" + i.toFixed()).dispatchEvent(clickEvent);
    }
    i = 0;
    for (const r of state.reagents) {
        document.getElementById("addReagent").dispatchEvent(clickEvent);
        document.getElementById("name_reagent_" + i.toFixed()).innerText = r.name;
        for (const [aT, c] of Object.entries(r.atoms)) {
            let atomCountInput = document.getElementById(aT + "_reagent_" + i.toFixed());
            atomCountInput.value = c;
            atomCountInput.dispatchEvent(changeEvent);
        }
        i++;
    }
    //products
    for (i = products.length - 1; i >= 0; i--) {
        document.getElementById("remove_product_" + i.toFixed()).dispatchEvent(clickEvent);
    }
    i = 0;
    for (const p of state.products) {
        document.getElementById("addProduct").dispatchEvent(clickEvent);
        document.getElementById("name_product_" + i.toFixed()).innerText = p.name;
        for (const [aT, c] of Object.entries(p.atoms)) {
            let atomCountInput = document.getElementById(aT + "_product_" + i.toFixed());
            atomCountInput.value = c;
            atomCountInput.dispatchEvent(changeEvent);
        }
        i++;
    }
    // glyph settings
    i = 0;
    for (const t of transformationTable) {
        let cB = document.getElementById("toggle_glyph_" + i.toFixed());
        cB.checked = state.glyphs.includes(t.name);
        cB.dispatchEvent(changeEvent);
        i++;
    }
    i = 0;
    for (const w of wheelTable) {
        let cB = document.getElementById("toggle_wheel_" + i.toFixed());
        cB.checked = state.wheels.includes(w.name);
        cB.dispatchEvent(changeEvent);
        i++;
    }
    state.timeline.forEach((e) => {
        if (e.glyph) {
            e.inputs = new Map(Object.entries(e.inputs));
            e.outputs = new Map(Object.entries(e.outputs));
            e.wheelInputs?.forEach((w) => {
                w.type = wheelTable.findIndex((v) => v.name == w.type);
            });
        }
    });
    timeline = state.timeline;
    allowUpdates = true;
    updateTimeline();
    updateInputs();
    updateOutputs();
}