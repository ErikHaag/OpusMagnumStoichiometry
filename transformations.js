const berloWheelFlag = 1n;
const ravariWheelFlag = 2n;
const herrimanWheelFlag = 4n;

let transformationTable = [];

{
    const projectionMap = new Map([
        ["lead", "tin"],
        ["wolfram", "vulcan"],
        ["tin", "iron"],
        ["vulcan", "nickel"],
        ["iron", "copper"],
        ["nickel", "zinc"],
        ["copper", "silver"],
        ["zinc", "sednum"],
        ["silver", "gold"],
        ["sednum", "osmium"]
    ]);

    const rejectionMap = new Map([
        ["tin", "lead"],
        ["vulcan", "wolfram"],
        ["iron", "tin"],
        ["nickel", "vulcan"],
        ["copper", "iron"],
        ["zinc", "nickel"],
        ["silver", "copper"],
        ["sednum", "zinc"],
        ["gold", "silver"],
        ["osmium", "sednum"]
    ]);

    const depositionMap = new Map([
        ["tin", ["lead", "lead"]],
        ["vulcan", ["wolfram", "lead"]],
        ["iron", ["tin", "lead"]],
        ["nickel", ["tin", "wolfram"]],
        ["copper", ["tin", "tin"]],
        ["zinc", ["vulcan", "tin"]],
        ["silver", ["iron", "tin"]],
        ["sednum", ["iron", "vulcan"]],
        ["gold", ["iron", "iron"]],
        ["osmium", ["nickel", "iron"]]
    ]);

    const halvePromotionMap = new Map([
        ["lead", "wolfram"],
        ["wolfram", "tin"],
        ["tin", "vulcan"],
        ["vulcan", "iron"],
        ["iron", "nickel"],
        ["nickel", "copper"],
        ["copper", "zinc"],
        ["zinc", "silver"],
        ["silver", "sednum"],
        ["sednum", "gold"],
        ["gold", "osmium"]
    ]);

    const vitaeAbsorbitionMap = new Map([
        ["trueMors", "greyMors"],
        ["greyMors", "mors"],
        ["mors", "salt"],
        ["salt", "vitae"],
        ["vitae", "redVitae"],
        ["redVitae", "trueVitae"]
    ]);

    const morsAbsorbitionMap = new Map([
        ["greyMors", "trueMors"],
        ["mors", "greyMors"],
        ["salt", "mors"],
        ["vitae", "salt"],
        ["redVitae", "vitae"],
        ["trueVitae", "redVitae"]
    ]);

    transformationTable.push({
        name: "Glyph of Calcification",
        groups: ["Calcify cardinal"],
        transforms: () => {
            let t = []; 
            for (const c of ["air", "earth", "fire", "water"]) {
                if ((atoms.get(c) ?? 0) >= 1) {
                    t.push({
                        inputs: [c],
                        wheelInputs: null,
                        outputs: ["salt"],
                        wheelOutputs: null,
                        desc: "Calcify " + c + " into salt",
                        group: 0
                    });
                }
            }
            return t;
        }
    }, {
        name: "Glyph of Duplication",
        groups: ["Use existing atom", "Use Van Berlo's Wheel"],
        transforms: () => {
            let t = [];
            if ((atoms.get("salt") ?? 0) >= 1) {
                for (const c of ["air", "earth", "fire", "water"]) {
                    if ((atoms.get(c) ?? 0) >= 1) {
                        t.push({
                            inputs: [c, "salt"],
                            wheelInputs: null,
                            outputs: [c, c],
                            wheelOutputs: null,
                            desc: `Duplicate ${c}`,
                            group: 0
                        });
                    }
                }
                if ((activeWheels & berloWheelFlag) != 0) {
                    for (const c of ["air", "earth", "fire", "water"]) {
                        let p = wheels[0].atoms.indexOf(c);
                        t.push({
                            inputs: ["salt"],
                            wheelInputs: [{ type: 0, id: p, atomType: c }],
                            outputs: [c],
                            wheelOutputs: [c],
                            desc: `Duplicate ${c} via Van Berlo's Wheel`,
                            group: 1
                        });
                    }
                }
            }
            return t;
        }
    }, {
        name: "Glyph of Projection",
        groups: ["Project metal with quicksilver", "Project wheel with quicksilver", "Project metal from wheel", "Transfer quicksilver around wheel"],
        transforms: () => {
            let t = [];
            if ((atoms.get("quicksilver") ?? 0) >= 1) {
                for (const [base, promote] of projectionMap.entries()) {
                    if ((atoms.get(base) ?? 0) >= 1) {
                        t.push({
                            inputs: ["quicksilver", base],
                            wheelInputs: null,
                            outputs: [promote],
                            wheelOutputs: null,
                            desc: `Promote ${base} into ${promote}`,
                            group: 0
                        });
                    }
                }
                if ((activeWheels & ravariWheelFlag) != 0n) {
                    for (let i = 0; i < 6; i++) {
                        let promote = projectionMap.get(wheels[1].atoms[i]);
                        if (promote) {
                            t.push({
                                inputs: ["quicksilver"],
                                wheelInputs: [{ type: 1, id: i, atomType: wheels[1].atoms[i] }],
                                outputs: [],
                                wheelOutputs: [promote],
                                desc: `Promote ${wheels[1].atoms[i]} on Ravari's wheel in slot ${i + 1} to ${promote}`,
                                group: 1
                            });
                        }
                    }
                }
            }
            if ((activeWheels & ravariWheelFlag) != 0n) {
                for (let i = 0; i < 6; i++) {
                    let demote = rejectionMap.get(wheels[1].atoms[i]);
                    if (demote) {
                        for (const [base, promote] of projectionMap.entries()) {
                            if ((atoms.get(base) ?? 0) >= 1) {
                                t.push({
                                    inputs: [base],
                                    wheelInputs: [{ type: 1, id: i, atomType: wheels[1].atoms[i] }],
                                    outputs: [promote],
                                    wheelOutputs: [demote],
                                    desc: `Promote ${base} into ${promote} by demoting ${wheels[1].atoms[i]} on Ravari's wheel in slot ${i + 1}`,
                                    group: 2
                                });
                            }
                        }
                    }
                }
                for (let i = 0; i < 6; i++) {
                    let demote = rejectionMap.get(wheels[1].atoms[i]);
                    let promote = projectionMap.get(wheels[1].atoms[(i + 1) % 6]);
                    if (promote && demote) {
                        t.push({
                            inputs: [],
                            wheelInputs: [{ type: 1, id: i, atomType: wheels[1].atoms[i] }, { type: 1, id: (i + 1) % 6, atomType: wheels[1].atoms[(i + 1) % 6] }],
                            outputs: [],
                            wheelOutputs: [demote, promote],
                            desc: `Transfer quicksilver from ${wheels[1].atoms[i]} in slot ${i + 1} to ${wheels[1].atoms[(i + 1) % 6]} in slot ${(i + 1) % 6 + 1} on Ravari's Wheel`,
                            group: 3
                        });
                    }
                }
                for (let i = 0; i < 6; i++) {
                    let promote = projectionMap.get(wheels[1].atoms[i]);
                    let demote = rejectionMap.get(wheels[1].atoms[(i + 1) % 6]);
                    if (promote && demote) {
                        t.push({
                            inputs: [],
                            wheelInputs: [{ type: 1, id: i, atomType: wheels[1].atoms[i] }, { type: 1, id: (i + 1) % 6, atomType: wheels[1].atoms[(i + 1) % 6] }],
                            outputs: [], wheelOutputs: [promote, demote],
                            desc: `Transfer quicksilver from ${wheels[1].atoms[(i + 1) % 6]} in slot ${(i + 1) % 6 + 1} to ${wheels[1].atoms[i]} in slot ${i + 1} on Ravari's Wheel`,
                            group: 3
                        });
                    }
                }
            }
            return t;
        }
    }, {
        name: "Glyph of Purification",
        groups: ["Purify metal"],
        transforms: () => {
            t = [];
            for (const [base, promote] of projectionMap) {
                if ((atoms.get(base) ?? 0) >= 2) {
                    t.push({
                        inputs: [base, base],
                        wheelInputs: null,
                        outputs: [promote],
                        wheelOutputs: null,
                        group: 0,
                        desc: `Purify ${base} into ${promote}`
                    });
                }
            }
            return t;
        }
    }, {
        name: "Glyph of Animismus",
        groups: ["Normal", "Wheel captures vitae", "Wheel captures mors"],
        transforms: () => {
            let t = [];
            if (atoms.get("salt") >= 2) {
                t.push({
                    inputs: ["salt", "salt"],
                    wheelInputs: null,
                    outputs: ["mors", "vitae"],
                    wheelOutputs: null,
                    group: 0,
                    desc: "Salts are consumed to become vitae and mors"
                });
            }
            if (atoms.get("salt") >= 1 && (activeWheels & herrimanWheelFlag) != 0n) {
                for (let i = 0; i < 6; i++) {
                    let vitate = vitaeAbsorbitionMap.get(wheels[2].atoms[i]);
                    if (vitate) {
                        t.push({
                            inputs: ["salt"],
                            wheelInputs: [{type: 2, id: i, atomType: wheels[2].atoms[i]}],
                            outputs: ["mors"],
                            wheelOutputs: [vitate],
                            group: 1,
                            desc: `Convert salt to mors via ${camelToLower(wheels[2].atoms[i])} in slot ${i + 1} absorbing vitae`
                        });
                    }
                }
                for (let i = 0; i < 6; i++) {
                    let morate = morsAbsorbitionMap.get(wheels[2].atoms[i]);
                    if (morate) {
                        t.push({
                            inputs: ["salt"],
                            wheelInputs: [{type: 2, id: i, atomType: wheels[2].atoms[i]}],
                            outputs: ["vitae"],
                            wheelOutputs: [morate],
                            group: 1,
                            desc: `Convert salt to vitae via ${camelToLower(wheels[2].atoms[i])} in slot ${i + 1} absorbing mors`
                        });
                    }
                }
            }
            return t;
        }
    }, {
        name: "Glyph of Disposal / Waste Chain",
        groups: ["Remove from board "],
        transforms: () => {
            let t = [];
            for (const [aT, c] of atoms.entries()) {
                if (c > 0) {
                    t.push({
                        inputs: [aT],
                        wheelInputs: null,
                        outputs: [],
                        wheelOutputs: null,
                        group: 0,
                        desc: `Remove an atom of ${camelToLower(aT)}`
                    });
                }
            }
            return t;
        }
    });
    // Glyph of Unification
    // Glyph of Dispersion

    // Glyph of Halves
    // Quicksilver Sump

    // Glyph of Rejection
    // Glyph of Deposition
    // Glyph of Proliferation

    // Glyph of Disproportion
    // Glyph of the Left Hand
    // Glyph of Infusion

    // Glyph of Irradiation
    // Glyph of Sublimation
    // Atom Decay
}