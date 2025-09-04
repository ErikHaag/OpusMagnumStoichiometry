let transformationTable = [];

let allowedTransformations = new Set(["Glyph of Calcification", "Glyph of Duplication"]);

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

    const halfPromotionMap = new Map([
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

    const disproportionMap = new Map([
        ["greyMors", ["trueMors", "mors"]],
        ["mors", ["greyMors", "salt"]],
        ["vitae", ["redVitae", "salt"]],
        ["redVitae", ["trueVitae", "vitae"]],
    ]);

    const animismusToStrengthMap = new Map([
        ["trueMors", -3],
        ["greyMors", -2],
        ["mors", -1],
        ["salt", 0],
        ["vitae", 1],
        ["redVitae", 2],
        ["trueVitae", 3]
    ]);

    const strengthToAnimismusMap = new Map([
        [-3, "trueMors"],
        [-2, "greyMors"],
        [-1, "mors"],
        [0, "salt"],
        [1, "vitae"],
        [2, "redVitae"],
        [3, "trueVitae"]
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
                            group: 0
                        });
                    }
                }
                if ((activeWheels & wheelTypeTable.berlo.flag) != 0) {
                    for (const c of ["air", "earth", "fire", "water"]) {
                        let p = wheels[0].atoms.indexOf(c);
                        t.push({
                            inputs: ["salt"],
                            wheelInputs: [{ type: wheelTypeTable.berlo.type, id: p, atomType: c }],
                            outputs: [c],
                            wheelOutputs: [c],
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
                            group: 0
                        });
                    }
                }
                if ((activeWheels & wheelTypeTable.ravari.flag) != 0n) {
                    for (let i = 0; i < 6; i++) {
                        let promote = projectionMap.get(wheels[1].atoms[i]);
                        if (promote) {
                            t.push({
                                inputs: ["quicksilver"],
                                wheelInputs: [{ type: wheelTypeTable.ravari.type, id: i, atomType: wheels[1].atoms[i] }],
                                outputs: [],
                                wheelOutputs: [promote],
                                group: 1
                            });
                        }
                    }
                }
            }
            if ((activeWheels & wheelTypeTable.ravari.flag) != 0n) {
                for (let i = 0; i < 6; i++) {
                    let demote = rejectionMap.get(wheels[1].atoms[i]);
                    if (demote) {
                        for (const [base, promote] of projectionMap.entries()) {
                            if ((atoms.get(base) ?? 0) >= 1) {
                                t.push({
                                    inputs: [base],
                                    wheelInputs: [{ type: wheelTypeTable.ravari.type, id: i, atomType: wheels[1].atoms[i] }],
                                    outputs: [promote],
                                    wheelOutputs: [demote],
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
                            wheelInputs: [{ type: wheelTypeTable.ravari.type, id: i, atomType: wheels[1].atoms[i] }, { type: wheelTypeTable.ravari.type, id: (i + 1) % 6, atomType: wheels[1].atoms[(i + 1) % 6] }],
                            outputs: [],
                            wheelOutputs: [demote, promote],
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
                            wheelInputs: [{ type: wheelTypeTable.ravari.type, id: i, atomType: wheels[1].atoms[i] }, { type: wheelTypeTable.ravari.type, id: (i + 1) % 6, atomType: wheels[1].atoms[(i + 1) % 6] }],
                            outputs: [],
                            wheelOutputs: [promote, demote],
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
                        group: 0
                    });
                }
            }
            return t;
        }
    }, {
        name: "Glyph of Animismus",
        groups: ["Wheelless", "Wheel captures vitae", "Wheel captures mors"],
        transforms: () => {
            let t = [];
            if (atoms.get("salt") >= 2) {
                t.push({
                    inputs: ["salt", "salt"],
                    wheelInputs: null,
                    outputs: ["mors", "vitae"],
                    wheelOutputs: null,
                    group: 0
                });
            }
            if (atoms.get("salt") >= 1 && (activeWheels & wheelTypeTable.herriman.flag) != 0n) {
                for (let i = 0; i < 6; i++) {
                    let vitate = vitaeAbsorbitionMap.get(wheels[2].atoms[i]);
                    if (vitate) {
                        t.push({
                            inputs: ["salt"],
                            wheelInputs: [{ type: wheelTypeTable.herriman.type, id: i, atomType: wheels[2].atoms[i] }],
                            outputs: ["mors"],
                            wheelOutputs: [vitate],
                            group: 1
                        });
                    }
                }
                for (let i = 0; i < 6; i++) {
                    let morate = morsAbsorbitionMap.get(wheels[2].atoms[i]);
                    if (morate) {
                        t.push({
                            inputs: ["salt"],
                            wheelInputs: [{ type: wheelTypeTable.herriman.type, id: i, atomType: wheels[2].atoms[i] }],
                            outputs: ["vitae"],
                            wheelOutputs: [morate],
                            group: 2
                        });
                    }
                }
            }
            return t;
        }
    }, {
        name: "Glyph of Disposal / Waste Chain",
        groups: ["Remove from board"],
        transforms: () => {
            let t = [];
            for (const [aT, c] of atoms.entries()) {
                if (c > 0) {
                    t.push({
                        inputs: [aT],
                        wheelInputs: null,
                        outputs: [],
                        wheelOutputs: null,
                        group: 0
                    });
                }
            }
            return t;
        }
    }, {
        name: "Glyph of Unification",
        groups: ["Unify"],
        transforms: () => {
            let valid = true;
            for (const c of ["air", "earth", "fire", "water"]) {
                if ((atoms.get(c) ?? 0) <= 0) {
                    valid = false;
                    break;
                }
            }
            if (valid) {
                return [{
                    inputs: ["air", "earth", "fire", "water"],
                    wheelInputs: null,
                    outputs: ["quintessence"],
                    wheelOutputs: null,
                    group: 0
                }];
            }
            return [];
        }
    }, {
        name: "Glyph of Dispersion",
        groups: ["Disperse"],
        transforms: () => {
            if ((atoms.get("quintessence") ?? 0) >= 1) {
                return [{
                    inputs: ["quintessence"],
                    wheelInputs: null,
                    outputs: ["air", "earth", "fire", "water"],
                    wheelOutputs: null,
                    group: 0
                }];
            }
            return [];
        }
    }, {
        name: "Glyph of Halves",
        groups: ["Half project metals with quicksilver", "Half project wheel and metal with quicksilver", "Half project metals with wheel", "Half project metal from wheel transfer", "Distribute quicksilver around wheel"],
        transforms: () => {
            let t = [];
            let halfPromotable = Array.from(halfPromotionMap.keys());
            if ((atoms.get("quicksilver") ?? 0) >= 1) {
                for (let i = 0; i < halfPromotable.length; i++) {
                    let baseI = halfPromotable[i];
                    let promoteI = halfPromotionMap.get(baseI);
                    if ((atoms.get(baseI) ?? 0) <= 0) {
                        continue;
                    }
                    if ((atoms.get(baseI) ?? 0) >= 2) {
                        t.push({
                            inputs: ["quicksilver", baseI, baseI],
                            wheelInputs: null,
                            outputs: [promoteI, promoteI],
                            wheelOutputs: null,
                            group: 0
                        });
                    }
                    for (let j = i + 1; j < halfPromotable.length; j++) {
                        let baseJ = halfPromotable[j];
                        let promoteJ = halfPromotionMap.get(baseJ);
                        if ((atoms.get(baseJ) ?? 0) >= 1) {
                            t.push({
                                inputs: ["quicksilver", baseI, baseJ],
                                wheelInputs: null,
                                outputs: [promoteI, promoteJ],
                                wheelOutputs: null,
                                group: 0
                            });
                        }
                    }
                }
                if ((activeWheels & wheelTypeTable.ravari.flag) != 0n) {
                    for (let i = 0; i < 6; i++) {
                        let promoteW = halfPromotionMap.get(wheels[1].atoms[i]);
                        if (promoteW) {
                            for (const [baseF, promoteF] of halfPromotionMap.entries()) {
                                if ((atoms.get(baseF) ?? 0) >= 1) {
                                    t.push({
                                        inputs: ["quicksilver", baseF],
                                        wheelInputs: [
                                            { type: wheelTypeTable.ravari.type, id: i, atomType: wheels[1].atoms[i] }
                                        ],
                                        outputs: [promoteF],
                                        wheelOutputs: [promoteW],
                                        group: 1
                                    });
                                }
                            }
                        }
                    }
                }
            }
            if ((activeWheels & wheelTypeTable.ravari.flag) != 0n) {
                for (let i = 0; i < 6; i++) {
                    let demoteW = rejectionMap.get(wheels[1].atoms[i]);
                    if (demoteW) {
                        for (let j = 0; j < halfPromotable.length; j++) {
                            let baseJ = halfPromotable[j];
                            let promoteJ = halfPromotionMap.get(baseJ);
                            if ((atoms.get(baseJ) ?? 0) <= 0) {
                                continue;
                            }
                            if ((atoms.get(baseJ) ?? 0) >= 2) {
                                t.push({
                                    inputs: [baseJ, baseJ],
                                    wheelInputs: [{ type: wheelTypeTable.ravari.type, id: i, atomType: wheels[1].atoms[i] }],
                                    outputs: [promoteJ, promoteJ],
                                    wheelOutputs: [demoteW],
                                    group: 2
                                });
                            }
                            for (let k = j + 1; k < halfPromotable.length; k++) {
                                let baseK = halfPromotable[k];
                                let promoteK = halfPromotionMap.get(baseK);
                                if ((atoms.get(baseK) ?? 0) >= 1) {
                                    t.push({
                                        inputs: [baseJ, baseK],
                                        wheelInputs: [{ type: wheelTypeTable.ravari.type, id: i, atomType: wheels[1].atoms[i] }],
                                        outputs: [promoteJ, promoteK],
                                        wheelOutputs: [demoteW],
                                        group: 2
                                    });
                                }
                            }
                        }
                    }
                }
                for (let i = 0; i < 6; i++) {
                    let demoteW = rejectionMap.get(wheels[1].atoms[i]);
                    let promoteW = halfPromotionMap.get(wheels[1].atoms[(i + 1) % 6]);
                    if (demoteW && promoteW) {
                        for (const [baseF, promoteF] of halfPromotionMap.entries()) {
                            if ((atoms.get(baseF) ?? 0) >= 1) {
                                t.push({
                                    inputs: [baseF],
                                    wheelInputs: [{ type: wheelTypeTable.ravari.type, id: i, atomType: wheels[1].atoms[i] }, { type: wheelTypeTable.ravari.type, id: (i + 1) % 6, atomType: wheels[1].atoms[(i + 1) % 6] }],
                                    outputs: [promoteF],
                                    wheelOutputs: [demoteW, promoteW],
                                    group: 3
                                });
                            }
                        }
                    }
                }
                for (let i = 0; i < 6; i++) {
                    let promoteW = halfPromotionMap.get(wheels[1].atoms[i]);
                    let demoteW = rejectionMap.get(wheels[1].atoms[(i + 1) % 6]);
                    if (demoteW && promoteW) {
                        for (const [baseF, promoteF] of halfPromotionMap.entries()) {
                            if ((atoms.get(baseF) ?? 0) >= 1) {
                                t.push({
                                    inputs: [baseF],
                                    wheelInputs: [{ type: wheelTypeTable.ravari.type, id: i, atomType: wheels[1].atoms[i] }, { type: wheelTypeTable.ravari.type, id: (i + 1) % 6, atomType: wheels[1].atoms[(i + 1) % 6] }],
                                    outputs: [promoteF],
                                    wheelOutputs: [promoteW, demoteW],
                                    group: 3
                                });
                            }
                        }
                    }
                }
                for (let i = 0; i < 6; i++) {
                    let demote = rejectionMap.get(wheels[1].atoms[i]);
                    let promoteF = halfPromotionMap.get(wheels[1].atoms[(i + 1) % 6]);
                    let promoteB = halfPromotionMap.get(wheels[1].atoms[(i + 5) % 6]);
                    if (demote && promoteF && promoteB) {
                        t.push({
                            inputs: [],
                            wheelInputs: [{ type: wheelTypeTable.ravari.type, id: (i + 5) % 6, atomType: wheels[1].atoms[(i + 5) % 6] }, { type: wheelTypeTable.ravari.type, id: i, atomType: wheels[1].atoms[i] }, { type: wheelTypeTable.ravari.type, id: (i + 1) % 6, atomType: wheels[1].atoms[(i + 1) % 6] }],
                            outputs: [],
                            wheelOutputs: [promoteB, demote, promoteF],
                            group: 4
                        });
                    }
                }
            }
            return t;
        }
    }, {
        name: "Quicksilver Sump",
        groups: ["Drain quicksilver"],
        transforms: () => {
            if ((atoms.get("quicksilver") ?? 0) >= 7) {
                return [{
                    inputs: ["quicksilver", "quicksilver", "quicksilver", "quicksilver", "quicksilver", "quicksilver", "quicksilver"],
                    wheelInputs: null,
                    outputs: ["quicksilver", "quicksilver", "quicksilver", "quicksilver", "quicksilver", "quicksilver"],
                    wheelOutputs: null,
                    group: 0
                }];
            }
            return [];
        }
    }, {
        name: "Glyph of Coronation",
        groups: ["Coronate"],
        transforms: () => {
            let t = [];
            for (const a of ["alpha", "beta", "gamma"]) {
                if ((atoms.get(a) ?? 0) >= 1) {
                    t.push({
                        inputs: [a],
                        wheelInputs: null,
                        outputs: ["nobilis"],
                        wheelOutputs: null,
                        group: 0
                    })
                }
            }
            return t;
        }
    }, {
        name: "Glyph of Reactivity",
        groups: ["React"],
        transforms: () => {
            let t = [];
            if ((atoms.get("nobilis") ?? 0) >= 1) {
                const nobles = ["alpha", "beta", "gamma"];
                for (const n of nobles) {
                    if ((atoms.get(n) ?? 0) >= 1) {
                        for (let j = 0; j < 2; j++) {
                            let aJ = nobles[j];
                            for (let k = j + 1; k < 3; k++) {
                                let aK = nobles[k];
                                t.push({
                                    inputs: ["nobilis", n],
                                    wheelInputs: null,
                                    outputs: [aJ, aK],
                                    wheelOutputs: null,
                                    group: 0
                                })
                            }
                        }
                    }
                }
            }
            return t;
        }
    }, {
        name: "Glyph of Rejection",
        groups: ["Reject metal", "Promote wheel", "Reject wheel", "Transfer around wheel"],
        transforms: () => {
            let t = [];
            for (const [base, demote] of rejectionMap) {
                if ((atoms.get(base) ?? 0) >= 1) {
                    t.push({
                        inputs: [base],
                        wheelInputs: null,
                        outputs: ["quicksilver", demote],
                        wheelOutputs: null,
                        group: 0
                    });
                }
            }
            if ((activeWheels & wheelTypeTable.ravari.flag) != 0n) {
                for (let i = 0; i < 6; i++) {
                    let promote = projectionMap.get(wheels[1].atoms[i]);
                    if (promote) {
                        for (const [base, demote] of rejectionMap) {
                            if ((atoms.get(base) ?? 0) >= 1) {
                                t.push({
                                    inputs: [base],
                                    wheelInputs: [{ type: wheelTypeTable.ravari.type, id: i, atomType: wheels[1].atoms[i] }],
                                    outputs: [demote],
                                    wheelOutputs: [promote],
                                    group: 1
                                });
                            }
                        }
                    }
                }
                for (let i = 0; i < 6; i++) {
                    let demote = rejectionMap.get(wheels[1].atoms[i]);
                    if (demote) {
                        t.push({
                            inputs: [],
                            wheelInputs: [{ type: wheelTypeTable.ravari.type, id: i, atomType: wheels[1].atoms[i] }],
                            outputs: ["quicksilver"],
                            wheelOutputs: [demote],
                            group: 2
                        });
                    }
                }
                for (let i = 0; i < 6; i++) {
                    let demote = rejectionMap.get(wheels[1].atoms[i]);
                    let promote = projectionMap.get(wheels[1].atoms[(i + 1) % 6]);
                    if (promote && demote) {
                        t.push({
                            inputs: [],
                            wheelInputs: [{ type: wheelTypeTable.ravari.type, id: i, atomType: wheels[1].atoms[i] }, { type: wheelTypeTable.ravari.type, id: (i + 1) % 6, atomType: wheels[1].atoms[(i + 1) % 6] }],
                            outputs: [],
                            wheelOutputs: [demote, promote],
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
                            wheelInputs: [{ type: wheelTypeTable.ravari.type, id: i, atomType: wheels[1].atoms[i] }, { type: wheelTypeTable.ravari.type, id: (i + 1) % 6, atomType: wheels[1].atoms[(i + 1) % 6] }],
                            outputs: [],
                            wheelOutputs: [promote, demote],
                            group: 3
                        });
                    }
                }
            }
            return t;
        }
    }, {
        name: "Glyph of Deposition",
        groups: ["Divide metals"],
        transforms: () => {
            let t = [];
            for (const [base, split] of depositionMap.entries()) {
                if ((atoms.get(base) ?? 0) >= 1) {
                    t.push({
                        inputs: [base],
                        wheelInputs: null,
                        outputs: split,
                        wheelOutputs: null,
                        group: 0
                    });
                }
            }
            return t;
        }
    }, {
        name: "Glyph of Proliferation",
        groups: ["Clone metal with quicksilver", "Clone from wheel with quicksilver", "Clone metal with wheel", "Clone with wheel"],
        transforms: () => {
            let t = [];
            const metals = ["lead", "wolfram", "tin", "vulcan", "iron", "nickel", "copper", "zinc", "silver", "sednum", "gold", "osmium"];
            if ((atoms.get("quicksilver") ?? 0) >= 1) {
                for (const m of metals) {
                    if ((atoms.get(m) ?? 0) >= 1) {
                        t.push({
                            inputs: ["quicksilver", m],
                            wheelInputs: null,
                            outputs: [m, m],
                            wheelOutputs: null,
                            group: 0
                        });
                    }
                }
                if ((activeWheels & wheelTypeTable.ravari.flag) != 0n) {
                    for (let i = 0; i < 6; i++) {
                        t.push({
                            inputs: ["quicksilver"],
                            wheelInputs: [{ type: wheelTypeTable.ravari.type, id: i, atomType: wheels[1].atoms[i] }],
                            outputs: [wheels[1].atoms[i]],
                            wheelOutputs: [wheels[1].atoms[i]],
                            group: 1
                        });
                    }
                }
            }
            if ((activeWheels & wheelTypeTable.ravari.flag) != 0n) {
                for (let i = 0; i < 6; i++) {
                    let demote = rejectionMap.get(wheels[1].atoms[i]);
                    if (demote) {
                        for (const m of metals) {
                            if ((atoms.get(m) ?? 0) >= 1) {
                                t.push({
                                    inputs: [m],
                                    wheelInputs: [{ type: wheelTypeTable.ravari.type, id: i, atomType: wheels[1].atoms[i] }],
                                    outputs: [m, m],
                                    wheelOutputs: [demote],
                                    group: 2
                                });
                            }
                        }
                    }
                }
                for (let i = 0; i < 6; i++) {
                    let demote = rejectionMap.get(wheels[1].atoms[i]);
                    if (demote) {
                        t.push({
                            inputs: [],
                            wheelInputs: [{ type: wheelTypeTable.ravari.type, id: i, atomType: wheels[1].atoms[i] }, { type: wheelTypeTable.ravari.type, id: (i + 1) % 6, atomType: wheels[1].atoms[(i + 1) % 6] }],
                            outputs: [wheels[1].atoms[(i + 1) % 6]],
                            wheelOutputs: [demote, wheels[1].atoms[(i + 1) % 6]],
                            group: 3
                        });
                    }
                }
                for (let i = 0; i < 6; i++) {
                    let demote = rejectionMap.get(wheels[1].atoms[(i + 1) % 6]);
                    if (demote) {
                        t.push({
                            inputs: [],
                            wheelInputs: [{ type: wheelTypeTable.ravari.type, id: i, atomType: wheels[1].atoms[i] }, { type: wheelTypeTable.ravari.type, id: (i + 1) % 6, atomType: wheels[1].atoms[(i + 1) % 6] }],
                            outputs: [wheels[1].atoms[i]],
                            wheelOutputs: [wheels[1].atoms[i], demote],
                            group: 3
                        });
                    }
                }
            }
            return t;
        }
    }, {
        name: "Glyph of Disproportion",
        groups: ["Wheelless", "Wheel captures dilute", "Wheel captures potent"],
        transforms: () => {
            let t = [];
            for (const [equals, divided] of disproportionMap.entries()) {
                if ((atoms.get(equals) ?? 0) >= 2) {
                    t.push({
                        inputs: [equals, equals],
                        wheelInputs: null,
                        outputs: divided,
                        wheelOutputs: null,
                        group: 0
                    });
                }
            }
            if ((activeWheels & wheelTypeTable.herriman.flag) != 0n) {
                for (let i = 0; i < 6; i++) {
                    for (const [equals, divided] of disproportionMap.entries()) {
                        if ((atoms.get(equals) ?? 0) >= 1) {
                            let wheelDilute = strengthToAnimismusMap.get(animismusToStrengthMap.get(wheels[2].atoms[i]) - animismusToStrengthMap.get(equals));
                            let wheelConcentrate = strengthToAnimismusMap.get(animismusToStrengthMap.get(wheels[2].atoms[(i + 1) % 6]) + animismusToStrengthMap.get(divided[1]));
                            if (wheelDilute && wheelConcentrate) {
                                t.push({
                                    inputs: [equals],
                                    wheelInputs: [{ type: wheelTypeTable.herriman.type, id: i, atomType: wheels[2].atoms[i] }, { type: wheelTypeTable.herriman.type, id: (i + 1) % 6, atomType: wheels[2].atoms[(i + 1) % 6] }],
                                    outputs: [divided[0]],
                                    wheelOutputs: [wheelDilute, wheelConcentrate],
                                    group: 1
                                });
                            }
                        }
                    }
                }
                for (let i = 0; i < 6; i++) {
                    for (const [equals, divided] of disproportionMap.entries()) {
                        if ((atoms.get(equals) ?? 0) >= 1) {
                            let wheelConcentrate = strengthToAnimismusMap.get(animismusToStrengthMap.get(wheels[2].atoms[i]) + animismusToStrengthMap.get(divided[1]));
                            let wheelDilute = strengthToAnimismusMap.get(animismusToStrengthMap.get(wheels[2].atoms[(i + 1) % 6]) - animismusToStrengthMap.get(equals));
                            if (wheelDilute && wheelConcentrate) {
                                t.push({
                                    inputs: [equals],
                                    wheelInputs: [{ type: wheelTypeTable.herriman.type, id: i, atomType: wheels[2].atoms[i] }, { type: wheelTypeTable.herriman.type, id: (i + 1) % 6, atomType: wheels[2].atoms[(i + 1) % 6] }],
                                    outputs: [divided[0]],
                                    wheelOutputs: [wheelConcentrate, wheelDilute],
                                    group: 1
                                });
                            }
                        }
                    }
                }

                for (let i = 0; i < 6; i++) {
                    for (const [equals, divided] of disproportionMap.entries()) {
                        if ((atoms.get(equals) ?? 0) >= 1) {
                            let wheelDilute = strengthToAnimismusMap.get(animismusToStrengthMap.get(wheels[2].atoms[i]) - animismusToStrengthMap.get(equals));
                            let wheelConcentrate = strengthToAnimismusMap.get(animismusToStrengthMap.get(wheels[2].atoms[(i + 1) % 6]) + animismusToStrengthMap.get(divided[0]));
                            if (wheelDilute && wheelConcentrate) {
                                t.push({
                                    inputs: [equals],
                                    wheelInputs: [{ type: wheelTypeTable.herriman.type, id: i, atomType: wheels[2].atoms[i] }, { type: wheelTypeTable.herriman.type, id: (i + 1) % 6, atomType: wheels[2].atoms[(i + 1) % 6] }],
                                    outputs: [divided[1]],
                                    wheelOutputs: [wheelDilute, wheelConcentrate],
                                    group: 2
                                });
                            }
                        }
                    }
                }
                for (let i = 0; i < 6; i++) {
                    for (const [equals, divided] of disproportionMap.entries()) {
                        if ((atoms.get(equals) ?? 0) >= 1) {
                            let wheelConcentrate = strengthToAnimismusMap.get(animismusToStrengthMap.get(wheels[2].atoms[i]) + animismusToStrengthMap.get(divided[0]));
                            let wheelDilute = strengthToAnimismusMap.get(animismusToStrengthMap.get(wheels[2].atoms[(i + 1) % 6]) - animismusToStrengthMap.get(equals));
                            if (wheelDilute && wheelConcentrate) {
                                t.push({
                                    inputs: [equals],
                                    wheelInputs: [{ type: wheelTypeTable.herriman.type, id: i, atomType: wheels[2].atoms[i] }, { type: wheelTypeTable.herriman.type, id: (i + 1) % 6, atomType: wheels[2].atoms[(i + 1) % 6] }],
                                    outputs: [divided[1]],
                                    wheelOutputs: [wheelConcentrate, wheelDilute],
                                    group: 2
                                });
                            }
                        }
                    }
                }
            }
            return t;
        }
    }, {
        name: "Glyph of the Left Hand",
        groups: ["Inversion"],
        transforms: () => {
            let t = [];
            for (const [s, a] of strengthToAnimismusMap.entries()) {
                if (s == 0) {
                    continue;
                }
                let inverse = strengthToAnimismusMap.get(-s);
                if (inverse && (atoms.get(a) ?? 0) >= 1) {
                    t.push({
                        inputs: [a],
                        wheelInputs: null,
                        outputs: [inverse],
                        wheelOutputs: null,
                        group: 0
                    });
                }
            }
            return t;
        }
    }, {
        name: "Glyph of Infusion",
        groups: ["Transfer between atoms", "Concentrate wheel", "Dilute wheel", "Distribute around wheel"],
        transforms: () => {
            let t = [];
            for (const [sI, aI] of strengthToAnimismusMap.entries()) {
                for (const [sJ, aJ] of strengthToAnimismusMap.entries()) {
                    if (Math.abs(sI) >= Math.abs(sJ)) {
                        continue;
                    }
                    if (sI < 0 && sJ > 0 || sI > 0 && sJ < 0) {
                        continue;
                    }
                    if (sI + 1 == sJ || sI - 1 == sJ) {
                        continue;
                    }
                    if ((atoms.get(aI) ?? 0) >= 1 && (atoms.get(aJ) ?? 0) >= 1) {
                        let concentrateDirection = sJ > 0 ? 1 : -1;
                        let dilute = strengthToAnimismusMap.get(sJ - concentrateDirection);
                        let concentrate = strengthToAnimismusMap.get(sI + concentrateDirection);
                        t.push({
                            inputs: [aI, aJ],
                            wheelInputs: null,
                            outputs: [dilute, concentrate],
                            wheelOutputs: null,
                            group: 0
                        });
                    }
                }
            }
            if ((activeWheels & wheelTypeTable.herriman.flag) != 0n) {
                for (let i = 0; i < 6; i++) {
                    let strength = animismusToStrengthMap.get(wheels[2].atoms[i]);
                    for (const [s, a] of strengthToAnimismusMap.entries()) {
                        if (s == 0) {
                            continue;
                        }
                        if ((atoms.get(a) ?? 0) >= 1) {
                            let concentrateDirection = s > 0 ? 1 : -1;
                            if (s > 0 ? strength >= s : strength <= s) {
                                continue;
                            }
                            let concentrate = strengthToAnimismusMap.get(strength + concentrateDirection);
                            let dilute = strengthToAnimismusMap.get(s - concentrateDirection);
                            t.push({
                                inputs: [a],
                                wheelInputs: [{ type: wheelTypeTable.herriman.type, id: i, atomType: wheels[2].atoms[i] }],
                                outputs: [dilute],
                                wheelOutputs: [concentrate],
                                group: 1
                            });
                        }
                    }
                }
                for (let i = 0; i < 6; i++) {
                    let strength = animismusToStrengthMap.get(wheels[2].atoms[i]);
                    if (strength == 0) {
                        continue;
                    }
                    for (const [s, a] of strengthToAnimismusMap.entries()) {
                        if (s != 0 && ((s > 0) != (strength > 0))) {
                            continue;
                        }
                        if (Math.abs(s) >= Math.abs(strength)) {
                            continue;
                        }
                        if ((atoms.get(a) ?? 0) >= 1) {
                            let concentrateDirection = strength > 0 ? 1 : -1;
                            let concentrate = strengthToAnimismusMap.get(s + concentrateDirection);
                            let dilute = strengthToAnimismusMap.get(strength - concentrateDirection);
                            t.push({
                                inputs: [a],
                                wheelInputs: [{ type: wheelTypeTable.herriman.type, id: i, atomType: wheels[2].atoms[i] }],
                                outputs: [concentrate],
                                wheelOutputs: [dilute],
                                group: 2
                            });
                        }
                    }
                }
                for (let i = 0; i < 6; i++) {
                    let toDiluteStrength = animismusToStrengthMap.get(wheels[2].atoms[i]);
                    let toConcentrateStrength = animismusToStrengthMap.get(wheels[2].atoms[(i + 1) % 6]);
                    if (Math.abs(toDiluteStrength) <= Math.abs(toConcentrateStrength)) {
                        continue;
                    }
                    if (toConcentrateStrength != 0 && ((toDiluteStrength > 0) != (toConcentrateStrength > 0))) {
                        continue;
                    }
                    let concentrateDirection = toDiluteStrength > 0 ? 1 : -1;
                    let dilute = strengthToAnimismusMap.get(toDiluteStrength - concentrateDirection);
                    let concentrate = strengthToAnimismusMap.get(toConcentrateStrength + concentrateDirection);
                    t.push({
                        inputs: [],
                        wheelInputs: [{ type: wheelTypeTable.herriman.type, id: i, atomType: wheels[2].atoms[i] }, { type: wheelTypeTable.herriman.type, id: (i + 1) % 6, atomType: wheels[2].atoms[(i + 1) % 6] }],
                        outputs: [],
                        wheelOutputs: [dilute, concentrate],
                        group: 3
                    });
                }
                for (let i = 0; i < 6; i++) {
                    let toConcentrateStrength = animismusToStrengthMap.get(wheels[2].atoms[i]);
                    let toDiluteStrength = animismusToStrengthMap.get(wheels[2].atoms[(i + 1) % 6]);
                    if (Math.abs(toDiluteStrength) <= Math.abs(toConcentrateStrength)) {
                        continue;
                    }
                    if (toConcentrateStrength != 0 && ((toDiluteStrength > 0) != (toConcentrateStrength > 0))) {
                        continue;
                    }
                    let concentrateDirection = toDiluteStrength > 0 ? 1 : -1;
                    let dilute = strengthToAnimismusMap.get(toDiluteStrength - concentrateDirection);
                    let concentrate = strengthToAnimismusMap.get(toConcentrateStrength + concentrateDirection);
                    t.push({
                        inputs: [],
                        wheelInputs: [{ type: wheelTypeTable.herriman.type, id: i, atomType: wheels[2].atoms[i] }, { type: wheelTypeTable.herriman.type, id: (i + 1) % 6, atomType: wheels[2].atoms[(i + 1) % 6] }],
                        outputs: [],
                        wheelOutputs: [concentrate, dilute],
                        group: 3
                    });
                }
            }
            return t;
        }
    }, {
        name: "Glyph of Irradiation",
        groups: ["Irradiate"],
        transforms: () => {
            if ((atoms.get("quicksilver") ?? 0) >= 3 && (atoms.get("gold") ?? 0) >= 1) {
                return [{
                    inputs: ["quicksilver", "quicksilver", "quicksilver", "gold"],
                    wheelInputs: null,
                    outputs: ["uranium"],
                    wheelOutputs: null,
                    group: 0
                }];
            }
            return [];
        }
    }, {
        name: "Glyph of Sublimation",
        groups: ["Sublimate"],
        transforms: () => {
            if ((atoms.get("quintessence") ?? 0) >= 1) {
                return [{
                    inputs: ["quintessence"],
                    wheelInputs: null,
                    outputs: ["aether", "aether", "salt", "salt"],
                    wheelOutputs: null,
                    group: 0
                }];
            }
            return [];
        }
    }, {
        name: "Atom Decay",
        groups: ["Decay"],
        transforms: () => {
            let t = [];
            if ((atoms.get("aether") ?? 0) >= 1) {
                t.push({
                    inputs: ["aether"],
                    wheelInputs: null,
                    outputs: [],
                    wheelOutputs: null,
                    group: 0
                });
            }
            if ((atoms.get("uranium") ?? 0) >= 1) {
                t.push({
                    inputs: ["uranium"],
                    wheelInputs: null,
                    outputs: ["lead"],
                    wheelOutputs: null,
                    group: 0
                });
            }
            return t;
        }
    });
}