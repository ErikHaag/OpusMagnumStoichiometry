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
                if ((activeWheels & berloWheelFlag) != 0) {
                    for (const c of ["air", "earth", "fire", "water"]) {
                        let p = wheels[0].atoms.indexOf(c);
                        t.push({
                            inputs: ["salt"],
                            wheelInputs: [{ type: 0, id: p, atomType: c }],
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
                if ((activeWheels & ravariWheelFlag) != 0n) {
                    for (let i = 0; i < 6; i++) {
                        let promote = projectionMap.get(wheels[1].atoms[i]);
                        if (promote) {
                            t.push({
                                inputs: ["quicksilver"],
                                wheelInputs: [{ type: 1, id: i, atomType: wheels[1].atoms[i] }],
                                outputs: [],
                                wheelOutputs: [promote],
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
            if (atoms.get("salt") >= 1 && (activeWheels & herrimanWheelFlag) != 0n) {
                for (let i = 0; i < 6; i++) {
                    let vitate = vitaeAbsorbitionMap.get(wheels[2].atoms[i]);
                    if (vitate) {
                        t.push({
                            inputs: ["salt"],
                            wheelInputs: [{ type: 2, id: i, atomType: wheels[2].atoms[i] }],
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
                            wheelInputs: [{ type: 2, id: i, atomType: wheels[2].atoms[i] }],
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
                if ((activeWheels & ravariWheelFlag) != 0n) {
                    for (let i = 0; i < 6; i++) {
                        let promoteW = halfPromotionMap.get(wheels[1].atoms[i]);
                        if (promoteW) {
                            for (const [baseF, promoteF] of halfPromotionMap.entries()) {
                                if ((atoms.get(baseF) ?? 0) >= 1) {
                                    t.push({
                                        inputs: ["quicksilver", baseF],
                                        wheelInputs: [
                                            { type: 1, id: i, atomType: wheels[1].atoms[i] }
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
            if ((activeWheels & ravariWheelFlag) != 0n) {
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
                                    wheelInputs: [{ type: 1, id: i, atomType: wheels[1].atoms[i] }],
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
                                        wheelInputs: [{ type: 1, id: i, atomType: wheels[1].atoms[i] }],
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
                                    wheelInputs: [{ type: 1, id: i, atomType: wheels[1].atoms[i] }, { type: 1, id: (i + 1) % 6, atomType: wheels[1].atoms[(i + 1) % 6] }],
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
                                    wheelInputs: [{ type: 1, id: i, atomType: wheels[1].atoms[i] }, { type: 1, id: (i + 1) % 6, atomType: wheels[1].atoms[(i + 1) % 6] }],
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
                            wheelInputs: [{ type: 1, id: (i + 5) % 6, atomType: wheels[1].atoms[(i + 5) % 6] }, { type: 1, id: i, atomType: wheels[1].atoms[i] }, { type: 1, id: (i + 1) % 6, atomType: wheels[1].atoms[(i + 1) % 6] }],
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
    });


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