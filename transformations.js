let transformationTable = [];

let transformationTableHeaders = [];

let allowedTransformations = new Set(["Glyph of Calcification"]);

let moddedTransformIndex = -1;

let modTableInUse = "old"

class AlchemicalLookups {
    static atomTypeAvailibleInOld(at) {
        return ["trueVitae", "redVitae", "vitae", "salt", "mors", "greyMors", "trueMors", "air", "earth", "fire", "water", "aerolith", "ignistal", "mistaline", "pyrolite", "terramarine", "vaprorine", "quintessence", "quicklime", "quickcopper", "quicksilver", "vaca", "beryl", "lead", "wolfram", "tin", "vulcan", "iron", "nickel", "copper", "zinc", "silver", "sednum", "gold", "osmium", "frixon", "zephiron", "gelaron", "mitrum", "iridium", "azulum", "taceum", "hestium", "nobilis", "alpha", "beta", "gamma", "uranium", "aether"].indexOf(at) != -1;
    }

    static atomTypeAvailibleInDRM(at) {
        return ["vitae", "salt", "mors", "air", "earth", "fire", "water", "quintessence", "quicksilver", "quicksilver", "lead", "tin", "iron", "copper", "silver", "gold"].indexOf(at) != -1;
    }

    static metallicity = [
        "vaca",
        "beryl",
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
        "osmium"
    ];

    static quicksilverMetallicity = [
        "quicklime",
        "quickcopper",
        "quicksilver"
    ];

    static fusionList = [
        ["air", "earth", "aerolith"],
        ["air", "fire", "ignistal"],
        ["air", "water", "mistaline"],
        ["earth", "fire", "pyrolite"],
        ["earth", "water", "terramarine"],
        ["fire", "water", "vaprorine"],
        ["aerolith", "vaprorine", "quintessence"],
        ["ignistal", "terramarine", "quintessence"],
        ["mistaline", "pyrolite", "quintessence"]
    ];

    static projectionMap = new Map([
        ["vaca", "lead"],
        ["beryl", "wolfram"],
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

    static purificationMap = new Map([
        ["vaca", "vaca"],
        ["beryl", "lead"],
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

    static rejectionMap = new Map([
        ["lead", "vaca"],
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

    static depositionMap = new Map([
        ["lead", ["lead", "vaca"]],
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

    static shearingMap = new Map([
        ["quicksilver", ["quickcopper", "quickcopper"]],
        ["vaca", ["vaca", "vaca"]],
        ["beryl", ["beryl", "vaca"]],
        ["tin", ["lead", "lead"]],
        ["vulcan", ["wolfram", "lead"]],
        ["iron", ["wolfram", "wolfram"]],
        ["nickel", ["tin", "wolfram"]],
        ["copper", ["tin", "tin"]],
        ["zinc", ["vulcan", "tin"]],
        ["silver", ["vulcan", "vulcan"]],
        ["sednum", ["iron", "vulcan"]],
        ["gold", ["iron", "iron"]],
        ["osmium", ["nickel", "iron"]]
    ]);

    static halfPromotionMap = new Map([
        ["vaca", "beryl"],
        ["beryl", "lead"],
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

    static osmosisMap = new Map([
        ["beryl", "vaca"],
        ["lead", "beryl"],
        ["wolfram", "lead"],
        ["tin", "wolfram"],
        ["vulcan", "tin"],
        ["iron", "vulcan"],
        ["nickel", "iron"],
        ["copper", "nickel"],
        ["zinc", "copper"],
        ["silver", "zinc"],
        ["sednum", "silver"],
        ["gold", "sednum"],
        ["osmium", "gold"]
    ]);

    static vitaeAbsorbitionMap = new Map([
        ["trueMors", "greyMors"],
        ["greyMors", "mors"],
        ["mors", "salt"],
        ["salt", "vitae"],
        ["vitae", "redVitae"],
        ["redVitae", "trueVitae"]
    ]);

    static morsAbsorbitionMap = new Map([
        ["greyMors", "trueMors"],
        ["mors", "greyMors"],
        ["salt", "mors"],
        ["vitae", "salt"],
        ["redVitae", "vitae"],
        ["trueVitae", "redVitae"]
    ]);

    static disproportionMap = new Map([
        ["greyMors", ["trueMors", "mors"]],
        ["mors", ["greyMors", "salt"]],
        ["vitae", ["redVitae", "salt"]],
        ["redVitae", ["trueVitae", "vitae"]],
    ]);

    static animismusToStrengthMap = new Map([
        ["trueMors", -3],
        ["greyMors", -2],
        ["mors", -1],
        ["salt", 0],
        ["vitae", 1],
        ["redVitae", 2],
        ["trueVitae", 3]
    ]);

    static strengthToAnimismusMap = new Map([
        [-3, "trueMors"],
        [-2, "greyMors"],
        [-1, "mors"],
        [0, "salt"],
        [1, "vitae"],
        [2, "redVitae"],
        [3, "trueVitae"]
    ]);

    static cardinalsList = ["air", "earth", "fire", "water"];

    static crystalinesList = ["aerolith", "ignistal", "mistaline", "pyrolite", "terramarine", "vaporine"];

    static metalsList = ["vaca", "lead", "wolfram", "tin", "vulcan", "iron", "nickel", "copper", "zinc", "silver", "sednum", "gold", "osmium"];

    static neumetalsList = ["hestium", "azulum", "taceum", "mitrum", "iridium"];

    static noblesList = ["alpha", "beta", "gamma"];
}

function useOldMods() {
    function wheelInput(w, index) {
        return { type: w.type, id: index, atomType: wheels[w.type].atoms[index] };
    }

    modTableInUse = "old";

    // Vanilla
    transformationTableHeaders[transformationTable.length] = "Opus Magnum";
    transformationTable.push({
        name: "Glyph of Calcification",
        groups: ["Calcify cardinal"],
        transforms: () => {
            let t = [];
            for (const c of AlchemicalLookups.cardinalsList) {
                if ((atoms.get(c) ?? 0n) >= 1n) {
                    t.push({
                        inputs: [c],
                        outputs: ["salt"],
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
            if ((atoms.get("salt") ?? 0n) >= 1n) {
                for (const c of AlchemicalLookups.cardinalsList) {
                    if ((atoms.get(c) ?? 0n) >= 1n) {
                        t.push({
                            inputs: [c, "salt"],
                            outputs: [c, c],
                            group: 0
                        });
                    }
                }
                if ((activeWheels & wheelTypeTable.berlo.flag) != 0) {
                    for (const c of ["air", "earth", "fire", "water"]) {
                        let p = wheels[wheelTypeTable.berlo.type].atoms.indexOf(c);
                        t.push({
                            inputs: ["salt"],
                            wheelInputs: [wheelInput(wheelTypeTable.berlo, p)],
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
        groups: ["Project metal with quicksilver", "Project Soria's Wheel with quicksilver", "Project Ravari's wheel with quicksilver",
            "Project metal with quickcopper", "Project Soria's wheel with quickcopper", "Project Ravari's wheel with quickcopper",
            "Project metal from Soria's Wheel", "Project metal from Ravari's wheel",
            "Transfer quicksilver/quickcopper around Soria's wheel", "Transfer quicksilver around Ravari's wheel",
            "Transfer quicksilver/quickcopper from Soria's wheel to Ravari's wheel", "Transfer quicksilver from Ravari's Wheel to Soria's wheel"],
        transforms: () => {
            let t = [];
            if ((atoms.get("quicksilver") ?? 0n) >= 1n) {
                for (const [base, promote] of AlchemicalLookups.projectionMap.entries()) {
                    if ((atoms.get(base) ?? 0n) >= 1n) {
                        t.push({
                            inputs: ["quicksilver", base],
                            outputs: [promote],
                            group: 0
                        });
                    }
                }
                if ((activeWheels & wheelTypeTable.soria.flag) != 0n) {
                    for (let i = 0; i < 6; i++) {
                        let soriaM = AlchemicalLookups.quicksilverMetallicity.indexOf(wheels[wheelTypeTable.soria.type].atoms[i]);
                        if (soriaM == -1) {
                            continue;
                        }
                        let promoteS = AlchemicalLookups.quicksilverMetallicity[soriaM + 2];
                        if (promoteS) {
                            t.push({
                                inputs: ["quicksilver"],
                                wheelInputs: [wheelInput(wheelTypeTable.soria, i)],
                                outputs: [],
                                wheelOutputs: [promoteS],
                                group: 1
                            });
                        }
                    }
                }
                if ((activeWheels & wheelTypeTable.ravari.flag) != 0n) {
                    for (let i = 0; i < 6; i++) {
                        let promote = AlchemicalLookups.projectionMap.get(wheels[wheelTypeTable.ravari.type].atoms[i]);
                        if (promote) {
                            t.push({
                                inputs: ["quicksilver"],
                                wheelInputs: [wheelInput(wheelTypeTable.ravari, i)],
                                outputs: [],
                                wheelOutputs: [promote],
                                group: 2
                            });
                        }
                    }
                }
            }
            if ((atoms.get("quickcopper") ?? 0n) >= 1n) {
                for (const [base, promote] of AlchemicalLookups.halfPromotionMap.entries()) {
                    if ((atoms.get(base) ?? 0n) >= 1n) {
                        t.push({
                            inputs: ["quickcopper", base],
                            outputs: [promote],
                            group: 3
                        });
                    }
                }
                if ((activeWheels & wheelTypeTable.soria.flag) != 0n) {
                    for (let i = 0; i < 6; i++) {
                        let promoteM = AlchemicalLookups.quicksilverMetallicity.indexOf(wheels[wheelTypeTable.soria.type].atoms[i]);
                        if (promoteM == -1) {
                            continue;
                        }
                        let promote = AlchemicalLookups.quicksilverMetallicity[promoteM + 1];
                        if (promote) {
                            t.push({
                                inputs: ["quickcopper"],
                                wheelInputs: [wheelInput(wheelTypeTable.soria, i)],
                                outputs: [],
                                wheelOutputs: [promote],
                                group: 4
                            });
                        }
                    }
                }
                if ((activeWheels & wheelTypeTable.ravari.flag) != 0n) {
                    for (let i = 0; i < 6; i++) {
                        let promote = AlchemicalLookups.halfPromotionMap.get(wheels[wheelTypeTable.ravari.type].atoms[i]);
                        if (promote) {
                            t.push({
                                inputs: ["quickcopper"],
                                wheelInputs: [wheelInput(wheelTypeTable.ravari, i)],
                                outputs: [],
                                wheelOutputs: [promote],
                                group: 5
                            });
                        }
                    }
                }
            }
            if ((activeWheels & wheelTypeTable.soria.flag) != 0n) {
                for (const [base, hPromote] of AlchemicalLookups.halfPromotionMap.entries()) {
                    if ((atoms.get(base) ?? 0n) >= 1n) {
                        let promote = AlchemicalLookups.projectionMap.get(base);
                        for (let i = 0; i < 6; i++) {
                            if (wheels[wheelTypeTable.soria.type].atoms[i] == "quickcopper") {
                                t.push({
                                    inputs: [base],
                                    wheelInputs: [wheelInput(wheelTypeTable.soria, i)],
                                    outputs: [hPromote],
                                    wheelOutputs: ["quicklime"],
                                    group: 6
                                });
                            } else if (promote && wheels[wheelTypeTable.soria.type].atoms[i] == "quicksilver") {
                                t.push({
                                    inputs: [base],
                                    wheelInputs: [wheelInput(wheelTypeTable.soria, i)],
                                    outputs: [promote],
                                    wheelOutputs: ["quicklime"],
                                    group: 6
                                });
                            }
                        }
                    }
                }
            }
            if ((activeWheels & wheelTypeTable.ravari.flag) != 0n) {
                for (const [base, promote] of AlchemicalLookups.projectionMap.entries()) {
                    if ((atoms.get(base) ?? 0n) >= 1n) {
                        for (let i = 0; i < 6; i++) {
                            let demote = AlchemicalLookups.rejectionMap.get(wheels[wheelTypeTable.ravari.type].atoms[i]);
                            if (demote == "vaca") {
                                continue;
                            }
                            if (demote) {
                                t.push({
                                    inputs: [base],
                                    wheelInputs: [wheelInput(wheelTypeTable.ravari, i)],
                                    outputs: [promote],
                                    wheelOutputs: [demote],
                                    group: 7
                                });
                            }
                        }
                    }
                }
            }
            if ((activeWheels & wheelTypeTable.soria.flag) != 0n) {
                for (const dir of [1, 5]) {
                    for (let i = 0; i < 6; i++) {
                        let sourceM = AlchemicalLookups.quicksilverMetallicity.indexOf(wheels[wheelTypeTable.soria.type].atoms[i]);
                        let destinationM = AlchemicalLookups.quicksilverMetallicity.indexOf(wheels[wheelTypeTable.soria.type].atoms[(i + dir) % 6]);
                        if (sourceM <= 0 || destinationM == -1) {
                            continue;
                        }
                        let destination = AlchemicalLookups.quicksilverMetallicity[sourceM + destinationM];
                        if (destination) {
                            t.push({
                                inputs: [],
                                wheelInputs: [wheelInput(wheelTypeTable.soria, i), wheelInput(wheelTypeTable.soria, (i + dir) % 6)],
                                outputs: [],
                                wheelOutputs: ["quicklime", destination],
                                group: 8
                            });
                        }
                    }
                }
            }
            if ((activeWheels & wheelTypeTable.ravari.flag) != 0n) {
                for (const dir of [1, 5]) {
                    for (let i = 0; i < 6; i++) {
                        let demote = AlchemicalLookups.rejectionMap.get(wheels[wheelTypeTable.ravari.type].atoms[i]);
                        if (demote == "vaca" || demote == "beryl") {
                            continue;
                        }
                        let promote = AlchemicalLookups.projectionMap.get(wheels[wheelTypeTable.ravari.type].atoms[(i + dir) % 6]);
                        if (promote && demote) {
                            t.push({
                                inputs: [],
                                wheelInputs: [wheelInput(wheelTypeTable.ravari, i), wheelInput(wheelTypeTable.ravari, (i + dir) % 6)],
                                outputs: [],
                                wheelOutputs: [demote, promote],
                                group: 9
                            });
                        }
                    }
                }
                if ((activeWheels & wheelTypeTable.soria.flag) != 0n) {
                    for (let i = 0; i < 6; i++) {
                        let base = wheels[wheelTypeTable.ravari.type].atoms[i];
                        let promote = AlchemicalLookups.projectionMap.get(base);
                        let hPromote = AlchemicalLookups.halfPromotionMap.get(base);
                        for (let j = 0; j < 6; j++) {
                            let quix = wheels[wheelTypeTable.soria.type].atoms[j];
                            if (quix == "quicklime") {
                                continue;
                            }
                            if (quix == "quickcopper") {
                                if (hPromote) {
                                    t.push({
                                        inputs: [],
                                        wheelInputs: [wheelInput(wheelTypeTable.soria, j), wheelInput(wheelTypeTable.ravari, i)],
                                        outputs: [],
                                        wheelOutputs: ["quicklime", hPromote],
                                        group: 10
                                    });
                                }
                            } else if (quix == "quicksilver") {
                                if (promote) {
                                    t.push({
                                        inputs: [],
                                        wheelInputs: [wheelInput(wheelTypeTable.soria, j), wheelInput(wheelTypeTable.ravari, i)],
                                        outputs: [],
                                        wheelOutputs: ["quicklime", promote],
                                        group: 10
                                    });
                                }
                            }
                        }
                    }

                    for (let i = 0; i < 6; i++) {
                        if (wheels[wheelTypeTable.soria.type].atoms[i] != "quicklime") {
                            continue;
                        }
                        for (let j = 0; j < 6; j++) {
                            let demote = AlchemicalLookups.rejectionMap.get(wheels[wheelTypeTable.ravari.type].atoms[j]);
                            if (!demote) {
                                continue;
                            }
                            if (demote == "vaca" || demote == "beryl") {
                                continue;
                            }
                            t.push({
                                inputs: [],
                                wheelInputs: [wheelInput(wheelTypeTable.ravari, j), wheelInput(wheelTypeTable.soria, i)],
                                outputs: [],
                                wheelOutputs: [demote, "quicksilver"],
                                group: 11
                            });
                        }
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
            for (let [base, promote] of AlchemicalLookups.purificationMap) {

                if ((atoms.get(base) ?? 0n) >= 2n) {
                    t.push({
                        inputs: [base, base],
                        outputs: [promote],
                        group: 0
                    });
                }
            }
            return t;
        }
    }, {
        name: "Glyph of Animismus",
        groups: ["Wheelless", "Herriman's wheel captures vitae", "Herriman's wheel captures mors"],
        transforms: () => {
            let t = [];
            if ((atoms.get("salt") ?? 0n) >= 2n) {
                t.push({
                    inputs: ["salt", "salt"],
                    outputs: ["mors", "vitae"],
                    group: 0
                });
            }
            if ((atoms.get("salt") ?? 0n) >= 1n && (activeWheels & wheelTypeTable.herriman.flag) != 0n) {
                for (let i = 0; i < 6; i++) {
                    let vitate = AlchemicalLookups.vitaeAbsorbitionMap.get(wheels[wheelTypeTable.herriman.type].atoms[i]);
                    if (vitate) {
                        t.push({
                            inputs: ["salt"],
                            wheelInputs: [wheelInput(wheelTypeTable.herriman, i)],
                            outputs: ["mors"],
                            wheelOutputs: [vitate],
                            group: 1
                        });
                    }
                }
                for (let i = 0; i < 6; i++) {
                    let morate = AlchemicalLookups.morsAbsorbitionMap.get(wheels[wheelTypeTable.herriman.type].atoms[i]);
                    if (morate) {
                        t.push({
                            inputs: ["salt"],
                            wheelInputs: [wheelInput(wheelTypeTable.herriman, i)],
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
                        outputs: [],
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
                if ((atoms.get(c) ?? 0n) <= 0n) {
                    valid = false;
                    break;
                }
            }
            if (valid) {
                return [{
                    inputs: ["air", "earth", "fire", "water"],
                    outputs: ["quintessence"],
                    group: 0
                }];
            }
            return [];
        }
    }, {
        name: "Glyph of Dispersion",
        groups: ["Disperse"],
        transforms: () => {
            if ((atoms.get("quintessence") ?? 0n) >= 1n) {
                return [{
                    inputs: ["quintessence"],
                    outputs: ["air", "earth", "fire", "water"],
                    group: 0
                }];
            }
            return [];
        }
    });

    moddedTransformIndex = transformationTable.length;

    // Complicated Elements
    transformationTableHeaders[transformationTable.length] = "Complicated Elements";
    transformationTable.push({
        name: "Glyph of Fusion",
        groups: ["Fuse"],
        transforms: () => {
            let t = [];
            for (const [target, project, output] of AlchemicalLookups.fusionList) {
                if ((atoms.get(target) ?? 0n) >= 1n && (atoms.get(project) ?? 0n) >= 1n) {
                    t.push({
                        inputs: [target, project],
                        outputs: [output],
                        group: 0
                    });
                }
            }
            return t;
        }
    }, {
        name: "Glyph of Erosion",
        groups: ["Erode"],
        transforms: () => {
            let t = [];
            for (const c of AlchemicalLookups.crystalinesList) {
                if ((atoms.get(c) ?? 0n) >= 1n) {
                    t.push({
                        inputs: [c],
                        outputs: ["quicklime"],
                        group: 0
                    });
                }
            }
            return t;
        }
    });

    // Halving Metallurgy
    transformationTableHeaders[transformationTable.length] = "Halving Metallurgy";
    transformationTable.push({
        name: "Glyph of Halves",
        groups: ["Half project metals with quicksilver", "Half project Soria's wheel and metal with quicksilver", "Half project Ravari's wheel and metal with quicksilver", "Half project Soria's wheel and Ravari's wheel with quicksilver",
            "Half project metals with Soria's wheel", "Half project metals with Ravari's wheel", "Half project metal and Ravari's wheel from Soria's Wheel", "Half project metal and Soria's wheel from Ravari's Wheel",
            "Half project metal from Soria's wheel transfer", "Half project metal from Ravari's wheel transfer", "Half project Ravari's from Soria's wheel transfer", "Half project Soria's from Ravari's wheel transfer",
            "Distribute quicksilver around Soria's wheel", "Distribute quicksilver around Ravari's wheel"],
        transforms: () => {
            let t = [];
            let halfPromotable = Array.from(AlchemicalLookups.halfPromotionMap.keys());
            if ((atoms.get("quicksilver") ?? 0n) >= 1n) {
                for (let i = 0; i < halfPromotable.length; i++) {
                    let baseI = halfPromotable[i];
                    let promoteI = AlchemicalLookups.halfPromotionMap.get(baseI);
                    if ((atoms.get(baseI) ?? 0n) <= 0n) {
                        continue;
                    }
                    if ((atoms.get(baseI) ?? 0n) >= 2n) {
                        t.push({
                            inputs: ["quicksilver", baseI, baseI],
                            outputs: [promoteI, promoteI],
                            group: 0
                        });
                    }
                    for (let j = i + 1; j < halfPromotable.length; j++) {
                        let baseJ = halfPromotable[j];
                        let promoteJ = AlchemicalLookups.halfPromotionMap.get(baseJ);
                        if ((atoms.get(baseJ) ?? 0n) >= 1n) {
                            t.push({
                                inputs: ["quicksilver", baseI, baseJ],
                                outputs: [promoteI, promoteJ],
                                group: 0
                            });
                        }
                    }
                }
                if ((activeWheels & wheelTypeTable.soria.flag) != 0n) {
                    for (let i = 0; i < 6; i++) {
                        let soriaM = AlchemicalLookups.quicksilverMetallicity.indexOf(wheels[wheelTypeTable.soria.type].atoms[i]);
                        if (soriaM == -1) {
                            continue;
                        }
                        let promoteS = AlchemicalLookups.quicksilverMetallicity[soriaM + 1];
                        if (promoteS) {
                            for (const [baseF, promoteF] of AlchemicalLookups.halfPromotionMap.entries()) {
                                if ((atoms.get(baseF) ?? 0n) >= 1n) {
                                    t.push({
                                        inputs: ["quicksilver", baseF],
                                        wheelInputs: [wheelInput(wheelTypeTable.soria, i)],
                                        outputs: [promoteF],
                                        wheelOutputs: [promoteS],
                                        group: 1
                                    });
                                }
                            }
                        }
                    }
                }
                if ((activeWheels & wheelTypeTable.ravari.flag) != 0n) {
                    for (let i = 0; i < 6; i++) {
                        let promoteR = AlchemicalLookups.halfPromotionMap.get(wheels[wheelTypeTable.ravari.type].atoms[i]);
                        if (promoteR) {
                            for (const [baseF, promoteF] of AlchemicalLookups.halfPromotionMap.entries()) {
                                if ((atoms.get(baseF) ?? 0n) >= 1n) {
                                    t.push({
                                        inputs: ["quicksilver", baseF],
                                        wheelInputs: [wheelInput(wheelTypeTable.ravari, i)],
                                        outputs: [promoteF],
                                        wheelOutputs: [promoteR],
                                        group: 2
                                    });
                                }
                            }
                        }
                    }
                    if ((activeWheels & wheelTypeTable.soria.flag) != 0n) {
                        for (let i = 0; i < 6; i++) {
                            let soriaM = AlchemicalLookups.quicksilverMetallicity.indexOf(wheels[wheelTypeTable.soria.type].atoms[i]);
                            if (soriaM == -1) {
                                continue;
                            }
                            let promoteS = AlchemicalLookups.quicksilverMetallicity[soriaM + 1];
                            if (promoteS) {
                                for (let j = 0; j < 6; j++) {
                                    let promoteR = AlchemicalLookups.halfPromotionMap.get(wheels[wheelTypeTable.ravari.type].atoms[j]);
                                    if (promoteR) {
                                        t.push({
                                            inputs: ["quicksilver"],
                                            wheelInputs: [wheelInput(wheelTypeTable.soria, i), wheelInput(wheelTypeTable.ravari, j)],
                                            outputs: [],
                                            wheelOutputs: [promoteS, promoteR],
                                            group: 3
                                        });
                                    }
                                }
                            }
                        }
                    }
                }
            }
            if ((activeWheels & wheelTypeTable.soria.flag) != 0n) {
                for (let i = 0; i < 6; i++) {
                    if (wheels[wheelTypeTable.soria.type].atoms[i] == "quicksilver") {
                        for (let j = 0; j < halfPromotable.length; j++) {
                            let baseJ = halfPromotable[j];
                            let promoteJ = AlchemicalLookups.halfPromotionMap.get(baseJ);
                            if ((atoms.get(baseJ) ?? 0n) <= 0n) {
                                continue;
                            }
                            if ((atoms.get(baseJ) ?? 0n) >= 2n) {
                                t.push({
                                    inputs: [baseJ, baseJ],
                                    wheelInputs: [wheelInput(wheelTypeTable.soria, i)],
                                    outputs: [promoteJ, promoteJ],
                                    wheelOutputs: ["quicklime"],
                                    group: 4
                                });
                            }
                            for (let k = j + 1; k < halfPromotable.length; k++) {
                                let baseK = halfPromotable[k];
                                let promoteK = AlchemicalLookups.halfPromotionMap.get(baseK);
                                if ((atoms.get(baseK) ?? 0n) >= 1n) {
                                    t.push({
                                        inputs: [baseJ, baseK],
                                        wheelInputs: [wheelInput(wheelTypeTable.soria, i)],
                                        outputs: [promoteJ, promoteK],
                                        wheelOutputs: ["quicklime"],
                                        group: 4
                                    });
                                }
                            }
                        }
                    }
                }
            }
            if ((activeWheels & wheelTypeTable.ravari.flag) != 0n) {
                for (let i = 0; i < 6; i++) {
                    let demoteR = AlchemicalLookups.rejectionMap.get(wheels[wheelTypeTable.ravari.type].atoms[i]);
                    if (demoteR) {
                        if (AlchemicalLookups.metallicity.indexOf(demoteR) <= 1) {
                            continue;
                        }
                        for (let j = 0; j < halfPromotable.length; j++) {
                            let baseJ = halfPromotable[j];
                            let promoteJ = AlchemicalLookups.halfPromotionMap.get(baseJ);
                            if ((atoms.get(baseJ) ?? 0n) <= 0n) {
                                continue;
                            }
                            if ((atoms.get(baseJ) ?? 0n) >= 2n) {
                                t.push({
                                    inputs: [baseJ, baseJ],
                                    wheelInputs: [wheelInput(wheelTypeTable.ravari, i)],
                                    outputs: [promoteJ, promoteJ],
                                    wheelOutputs: [demoteR],
                                    group: 5
                                });
                            }
                            for (let k = j + 1; k < halfPromotable.length; k++) {
                                let baseK = halfPromotable[k];
                                let promoteK = AlchemicalLookups.halfPromotionMap.get(baseK);
                                if ((atoms.get(baseK) ?? 0n) >= 1n) {
                                    t.push({
                                        inputs: [baseJ, baseK],
                                        wheelInputs: [wheelInput(wheelTypeTable.ravari, i)],
                                        outputs: [promoteJ, promoteK],
                                        wheelOutputs: [demoteR],
                                        group: 5
                                    });
                                }
                            }
                        }
                    }
                }
                if ((activeWheels & wheelTypeTable.soria.flag) != 0n) {
                    for (let i = 0; i < 6; i++) {
                        if (wheels[wheelTypeTable.soria.type].atoms[i] != "quicksilver") {
                            continue;
                        }
                        for (let j = 0; j < 6; j++) {
                            let promoteR = AlchemicalLookups.halfPromotionMap.get(wheels[wheelTypeTable.ravari.type].atoms[j]);
                            if (promoteR) {
                                for (const [base, project] in AlchemicalLookups.halfPromotionMap.entries()) {
                                    if ((atoms.get(base) ?? 0n) >= 1n) {
                                        t.push({
                                            inputs: [base],
                                            wheelInputs: [wheelInput(wheelTypeTable.soria, i), wheelInput(wheelTypeTable.ravari, j)],
                                            outputs: [project],
                                            wheelOutputs: ["quicklime", promoteR],
                                            group: 6
                                        });
                                    }
                                }
                            }
                        }
                    }
                    for (let i = 0; i < 6; i++) {
                        let rejectW = AlchemicalLookups.rejectionMap.get(wheels[wheelTypeTable.ravari.type].atoms[i]);
                        if (rejectW) {
                            for (let j = 0; j < 6; j++) {
                                let soriaM = AlchemicalLookups.quicksilverMetallicity.indexOf(wheels[wheelTypeTable.soria.type].atoms[j]);
                                if (soriaM == -1) {
                                    continue;
                                }
                                let promoteS = AlchemicalLookups.quicksilverMetallicity[soriaM + 1];
                                if (promoteS) {
                                    for (const [base, project] in AlchemicalLookups.halfPromotionMap.entries()) {
                                        if ((atoms.get(base) ?? 0n) >= 1n) {
                                            t.push({
                                                inputs: [base],
                                                wheelInputs: [wheelInput(wheelTypeTable.ravari, i), wheelInput(wheelTypeTable.soria, j)],
                                                outputs: [project],
                                                wheelOutputs: [rejectW, promoteS],
                                                group: 7
                                            });
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
            if ((activeWheels & wheelTypeTable.soria.flag) != 0n) {
                for (const dir of [1, 5]) {
                    for (let i = 0; i < 6; i++) {
                        if (wheels[wheelTypeTable.soria.type].atoms[i] != "quicksilver") {
                            continue;
                        }
                        let soriaM = AlchemicalLookups.quicksilverMetallicity.indexOf(wheels[wheelTypeTable.soria.type].atoms[(i + dir) % 6]);
                        if (soriaM == -1) {
                            continue;
                        }
                        let promoteS = AlchemicalLookups.quicksilverMetallicity[soriaM + 1];
                        if (promoteS) {
                            for (const [base, promote] in AlchemicalLookups.halfPromotionMap.entries()) {
                                if ((atoms.get(base) ?? 0n) >= 1n) {
                                    t.push({
                                        inputs: [base],
                                        wheelInputs: [wheelInput(wheelTypeTable.soria, i), wheelInput(wheelTypeTable.soria, (i + dir) % 6)],
                                        outputs: [promote],
                                        wheelOutputs: ["quicklime", promoteS],
                                        group: 8
                                    });
                                }
                            }
                        }
                    }
                }
            }
            if ((activeWheels & wheelTypeTable.ravari.flag) != 0n) {
                for (const dir of [1, 5]) {
                    for (let i = 0; i < 6; i++) {
                        let demoteR = AlchemicalLookups.rejectionMap.get(wheels[wheelTypeTable.ravari.type].atoms[i]);
                        if (demoteR == "vaca" || demoteR == "beryl") {
                            continue;
                        }
                        let promoteR = AlchemicalLookups.halfPromotionMap.get(wheels[wheelTypeTable.ravari.type].atoms[(i + dir) % 6]);
                        if (demoteR && promoteR) {
                            for (const [baseF, promoteF] of AlchemicalLookups.halfPromotionMap.entries()) {
                                if ((atoms.get(baseF) ?? 0n) >= 1n) {
                                    t.push({
                                        inputs: [baseF],
                                        wheelInputs: [wheelInput(wheelTypeTable.ravari, i), wheelInput(wheelTypeTable.ravari, (i + dir) % 6)],
                                        outputs: [promoteF],
                                        wheelOutputs: [demoteR, promoteR],
                                        group: 9
                                    });
                                }
                            }
                        }
                    }
                }
                if ((activeWheels & wheelTypeTable.soria.flag) != 0n) {
                    for (const dir of [1, 5]) {
                        for (let i = 0; i < 6; i++) {
                            if (wheels[wheelTypeTable.soria.type].atoms[i] != "quicksilver") {
                                continue;
                            }
                            let soriaM = AlchemicalLookups.quicksilverMetallicity.indexOf(wheels[wheelTypeTable.soria.type].atoms[(i + dir) % 6]);
                            if (soriaM == -1) {
                                continue;
                            }
                            let promoteS = AlchemicalLookups.quicksilverMetallicity[soriaM + 1];
                            if (promoteS) {
                                for (let j = 0; j < 6; j++) {
                                    let promoteR = AlchemicalLookups.halfPromotionMap.get(wheels[wheelTypeTable.ravari.type].atoms[j]);
                                    if (promoteR) {
                                        t.push({
                                            inputs: [],
                                            wheelInputs: [wheelInput(wheelTypeTable.soria, i), wheelInput(wheelTypeTable.soria, (i + dir) % 6), wheelInput(wheelTypeTable.ravari, j)],
                                            outputs: [],
                                            wheelOutputs: ["quicklime", promoteS, promoteR],
                                            group: 10
                                        });
                                    }
                                }
                            }
                        }
                    }
                    for (const dir of [1, 5]) {
                        for (let i = 0; i < 6; i++) {
                            let demoteR = AlchemicalLookups.rejectionMap.get(wheels[wheelTypeTable.ravari.type].atoms[i]);
                            if (demoteR == "vaca" || demoteR == "beryl") {
                                continue;
                            }
                            let promoteR = AlchemicalLookups.halfPromotionMap.get(wheels[wheelTypeTable.ravari.type].atoms[(i + dir) % 6]);
                            if (demoteR && promoteR) {
                                for (let j = 0; j < 6; j++) {
                                    if (wheels[wheelTypeTable.soria.type].atoms[i] != "quicksilver") {
                                        continue;
                                    }
                                    let soriaM = AlchemicalLookups.quicksilverMetallicity.indexOf(wheels[wheelTypeTable.soria.type].atoms[j]);
                                    if (soriaM == -1) {
                                        continue;
                                    }
                                    let promoteS = AlchemicalLookups.quicksilverMetallicity[soriaM + 1];
                                    if (promoteS) {
                                        t.push({
                                            inputs: [],
                                            wheelInputs: [wheelInput(wheelTypeTable.ravari, i), wheelInput(wheelTypeTable.ravari, (i + dir) % 6), wheelInput(wheelTypeTable.soria, j)],
                                            outputs: [],
                                            wheelOutputs: [demoteR, promoteR, promoteS],
                                            group: 11
                                        });
                                    }
                                }
                            }
                        }
                    }
                }
            }
            if ((activeWheels & wheelTypeTable.soria.flag) != 0n) {
                for (let i = 0; i < 6; i++) {
                    if (wheels[wheelTypeTable.soria.type].atoms[i] != "quicksilver") {
                        continue;
                    }
                    let soriaBM = AlchemicalLookups.quicksilverMetallicity.indexOf(wheels[wheelTypeTable.soria.type].atoms[(i + 5) % 6]);
                    let soriaFM = AlchemicalLookups.quicksilverMetallicity.indexOf(wheels[wheelTypeTable.soria.type].atoms[(i + 1) % 6]);
                    if (soriaBM == -1 || soriaFM == -1) {
                        continue;
                    }
                    let promoteB = AlchemicalLookups.quicksilverMetallicity[soriaBM + 1];
                    let promoteF = AlchemicalLookups.quicksilverMetallicity[soriaFM + 1];
                    if (promoteB && promoteF) {
                        t.push({
                            inputs: [],
                            wheelInputs: [wheelInput(wheelTypeTable.soria, i), wheelInput(wheelTypeTable.soria, (i + 5) % 6), wheelInput(wheelTypeTable.soria, (i + 1) % 6)],
                            outputs: [],
                            wheelOutputs: ["quicklime", promoteB, promoteF],
                            group: 12
                        });
                    }
                }
            }
            if ((activeWheels & wheelTypeTable.ravari.flag) != 0n) {
                for (let i = 0; i < 6; i++) {
                    let demote = AlchemicalLookups.rejectionMap.get(wheels[wheelTypeTable.ravari.type].atoms[i]);
                    if (demote == "vaca" || demote == "beryl") {
                        continue;
                    }
                    let promoteB = AlchemicalLookups.halfPromotionMap.get(wheels[wheelTypeTable.ravari.type].atoms[(i + 5) % 6]);
                    let promoteF = AlchemicalLookups.halfPromotionMap.get(wheels[wheelTypeTable.ravari.type].atoms[(i + 1) % 6]);
                    if (demote && promoteB && promoteF) {
                        t.push({
                            inputs: [],
                            wheelInputs: [wheelInput(wheelTypeTable.ravari, i), wheelInput(wheelTypeTable.ravari, (i + 5) % 6), wheelInput(wheelTypeTable.ravari, (i + 1) % 6)],
                            outputs: [],
                            wheelOutputs: [demote, promoteB, promoteF],
                            group: 13
                        });
                    }
                }
            }
            return t;
        }
    }, {
        name: "Quicksilver Sump",
        groups: ["Drain quicksilver", "Drain Soria's wheel"],
        transforms: () => {
            let t = [];
            if ((atoms.get("quicksilver") ?? 0n) >= 6n) {
                for (const [aT, c] of atoms.entries()) {
                    if (c >= (aT == "quicksilver") ? 7n : 1n) {
                        t.push({
                            inputs: ["quicksilver", "quicksilver", "quicksilver", "quicksilver", "quicksilver", "quicksilver", aT],
                            outputs: ["quicksilver", "quicksilver", "quicksilver", "quicksilver", "quicksilver", aT],
                            group: 0
                        });
                    }
                }
            }
            if ((activeWheels & wheelTypeTable.soria.flag) != 0n) {
                for (let i = 0; i < 6; i++) {
                    if (wheels[wheelTypeTable.soria.type].atoms[i] != "quicksilver") {
                        continue;
                    }
                    t.push({
                        inputs: [],
                        wheelInputs: [wheelInput(wheelTypeTable.soria, i)],
                        outputs: ["quicksilver"],
                        wheelOutputs: ["quicklime"],
                        group: 1
                    });
                }
            }
            return t;
        }
    }, {
        name: "Glyph of Remission",
        groups: ["Project metal", "Project Ravari's wheel"],
        transforms: () => {
            let t = [];
            for (const [base, promote] of AlchemicalLookups.projectionMap) {
                if ((atoms.get(base) ?? 0n) >= 2n) {
                    for (const [bM, b] of AlchemicalLookups.metallicity.entries()) {
                        if ((atoms.get(b) ?? 0n) <= (b == base ? 2n : 0n)) {
                            continue;
                        }
                        let remainder = bM + (AlchemicalLookups.metallicity.indexOf(base) - 2);
                        let newBowl = AlchemicalLookups.metallicity[remainder];
                        if (newBowl) {
                            let BWTM = [];
                            if (newBowl == "vaca") {
                                if (!allowedTransformations.has("Glyph of Extraction")) {
                                    continue;
                                }
                                BWTM.push("Glyph of Extraction");
                            }
                            t.push({
                                inputs: [base, base, b],
                                outputs: [promote, newBowl],
                                group: 0,
                                requires: BWTM
                            });
                        }
                    }
                }
            }
            if ((activeWheels & wheelTypeTable.ravari.flag) != 0n) {
                for (const [base, promote] of AlchemicalLookups.projectionMap) {
                    if ((atoms.get(base) ?? 0n) >= 2n) {
                        for (let i = 0; i < 6; i++) {
                            const b = wheels[wheelTypeTable.ravari.type].atoms[i];
                            const bM = AlchemicalLookups.metallicity.indexOf(b);
                            let remainder = bM + (AlchemicalLookups.metallicity.indexOf(base) - 2);
                            let newBowl = AlchemicalLookups.metallicity[remainder];
                            if (newBowl) {
                                let BWTM = [];
                                if (newBowl == "vaca") {
                                    if (!allowedTransformations.has("Glyph of Extraction")) {
                                        continue;
                                    }
                                    BWTM.push("Glyph of Extraction");
                                }
                                t.push({
                                    inputs: [base, base],
                                    wheelInputs: [{ type: wheelTypeTable.ravari.type, id: i, atomType: b }],
                                    outputs: [promote],
                                    wheelOutputs: [newBowl],
                                    group: 1,
                                    requires: BWTM
                                });
                            }
                        }
                    }
                }
            }
            return t;
        }
    }, {
        name: "Glyph of Shearing",
        groups: ["Shear metal", "Shear Soria's wheel"],
        transforms: () => {
            let t = [];
            for (const [bowl, [newBowl, output]] of AlchemicalLookups.shearingMap.entries()) {
                if ((atoms.get(bowl) ?? 0n) >= 1n) {
                    let BWTM = [];
                    if (output == "vaca") {
                        if (!allowedTransformations.has("Glyph of Extraction")) {
                            continue;
                        }
                        BWTM.push("Glyph of Extraction");
                    }
                    t.push({
                        inputs: [bowl],
                        outputs: [newBowl, output],
                        group: 0,
                        requires: BWTM
                    });
                }
            }
            if ((activeWheels & wheelTypeTable.soria.flag) != 0n) {
                for (let i = 0; i < 6; i++) {
                    if (wheels[wheelTypeTable.soria.type].atoms[i] != "quicksilver") {
                        continue;
                    }
                    t.push({
                        inputs: [],
                        wheelInputs: [wheelInput(wheelTypeTable.soria, i)],
                        outputs: ["quickcopper"],
                        wheelOutputs: ["quickcopper"],
                        group: 1
                    });
                }
            }
            return t;
        }
    }, {
        name: "Glyph of Osmosis",
        groups: ["Absorb quickcopper from metal", "Absorb quickcopper from Ravari's wheel",
            "Absorb quickcopper from metal with Soria's wheel", "Absorb quickcopper from Ravari's wheel with Soria's wheel",
            "Transfer quickcopper around Soria's wheel",
            "Concentrate quicklime", "Concentrate quicklime on Soria's wheel", "Concentrate quicklime from Soria's wheel"],
        transforms: () => {
            let t = [];
            if ((atoms.get("quickcopper") ?? 0n) >= 1n) {
                for (const [base, demote] of AlchemicalLookups.osmosisMap) {
                    if ((atoms.get(base) ?? 0n) >= 1n) {
                        let BWTM = [];
                        if (demote == "vaca") {
                            if (!allowedTransformations.has("Glyph of Extraction")) {
                                continue;
                            }
                            BWTM.push("Glyph of Extraction");
                        }
                        t.push({
                            inputs: ["quickcopper", base],
                            outputs: ["quicksilver", demote],
                            group: 0,
                            requires: BWTM
                        });
                    }
                }
                if ((activeWheels & wheelTypeTable.ravari.flag) != 0n) {
                    for (let i = 0; i < 6; i++) {
                        let demote = AlchemicalLookups.osmosisMap.get(wheels[wheelTypeTable.ravari.type].atoms[i]);
                        if (demote) {
                            let BWTM = [];
                            if (demote == "vaca") {
                                if (!allowedTransformations.has("Glyph of Extraction")) {
                                    continue;
                                }
                                BWTM.push("Glyph of Extraction");
                            }
                            t.push({
                                inputs: ["quickcopper"],
                                wheelInputs: [wheelInput(wheelTypeTable.ravari, i)],
                                outputs: ["quicksilver"],
                                wheelOutputs: [demote],
                                group: 1,
                                requires: BWTM
                            });
                        }
                    }
                }
            }
            if ((activeWheels & wheelTypeTable.soria.flag) != 0n) {
                for (let i = 0; i < 6; i++) {
                    if (wheels[wheelTypeTable.soria.type].atoms[i] != "quickcopper") {
                        continue;
                    }
                    if ((atoms.get("quickcopper") ?? 0n) >= 1n) {
                        t.push({
                            inputs: ["quickcopper"],
                            wheelInputs: [wheelInput(wheelTypeTable.soria, i)],
                            outputs: ["quicklime"],
                            wheelOutputs: ["quicksilver"],
                            group: 2
                        });
                    }

                    for (const [base, demote] of AlchemicalLookups.osmosisMap) {
                        if ((atoms.get(base) ?? 0n) >= 1n) {
                            let BWTM = [];
                            if (demote == "vaca") {
                                if (!allowedTransformations.has("Glyph of Extraction")) {
                                    continue;
                                }
                                BWTM.push("Glyph of Extraction");
                            }
                            t.push({
                                inputs: [base],
                                wheelInputs: [wheelInput(wheelTypeTable.soria, i)],
                                outputs: [demote],
                                wheelOutputs: ["quicksilver"],
                                group: 2,
                                requires: BWTM
                            });
                        }
                    }
                }
                if ((activeWheels & wheelTypeTable.ravari.flag) != 0n) {
                    for (let i = 0; i < 6; i++) {
                        if (wheels[wheelTypeTable.soria.type].atoms[i] != "quickcopper") {
                            continue;
                        }
                        for (let j = 0; j < 6; j++) {
                            let demote = AlchemicalLookups.osmosisMap.get(wheels[wheelTypeTable.ravari.type].atoms[j]);
                            if (demote) {
                                let BWTM = [];
                                if (demote == "vaca") {
                                    if (!allowedTransformations.has("Glyph of Extraction")) {
                                        continue;
                                    }
                                    BWTM.push("Glyph of Extraction");
                                }
                                t.push({
                                    inputs: [],
                                    wheelInputs: [wheelInput(wheelTypeTable.soria, i), wheelInput(wheelTypeTable.ravari, j)],
                                    outputs: [],
                                    wheelOutputs: ["quicksilver", demote],
                                    group: 3,
                                    requires: BWTM
                                });
                            }
                        }
                    }
                }
                for (const dir of [1, 5]) {
                    for (let i = 0; i < 6; i++) {
                        if (wheels[wheelTypeTable.soria.type].atoms[i] == "quicksilver" && wheels[wheelTypeTable.soria.type].atoms[(i + dir) % 6] == "quicklime") {
                            t.push({
                                inputs: [],
                                wheelInputs: [wheelInput(wheelTypeTable.soria, i), wheelInput(wheelTypeTable.soria, (i + dir) % 6)],
                                outputs: [],
                                wheelOutputs: ["quickcopper", "quickcopper"],
                                group: 4
                            });
                        } else if (wheels[wheelTypeTable.soria.type].atoms[i] == "quickcopper" && wheels[wheelTypeTable.soria.type].atoms[(i + dir) % 6] == "quickcopper") {
                            t.push({
                                inputs: [],
                                wheelInputs: [wheelInput(wheelTypeTable.soria, i), wheelInput(wheelTypeTable.soria, (i + dir) % 6)],
                                outputs: [],
                                wheelOutputs: ["quicklime", "quicksilver"],
                                group: 4
                            });
                        }
                    }
                }
            }
            if ((atoms.get("quicksilver") ?? 0n) >= 1n) {
                if ((atoms.get("quicklime") ?? 0n) >= 1n) {
                    t.push({
                        inputs: ["quicksilver", "quicklime"],
                        outputs: ["quickcopper", "quickcopper"],
                        group: 5
                    });
                }
                if ((activeWheels & wheelTypeTable.soria.flag) != 0n) {
                    for (let i = 0; i < 6; i++) {
                        if (wheels[wheelTypeTable.soria.type].atoms[i] != "quicklime") {
                            continue;
                        }
                        t.push({
                            inputs: ["quicksilver"],
                            wheelInputs: [wheelInput(wheelTypeTable.soria, i)],
                            outputs: ["quickcopper"],
                            wheelOutputs: ["quickcopper"],
                            group: 6
                        });
                    }
                }
            }
            if ((activeWheels & wheelTypeTable.soria.flag) != 0n) {
                if ((atoms.get("quicklime") ?? 0n) >= 1n) {
                    for (let i = 0; i < 6; i++) {
                        if (wheels[wheelTypeTable.soria.type].atoms[i] != "quicksilver") {
                            continue;
                        }
                        t.push({
                            inputs: ["quicklime"],
                            wheelInputs: [wheelInput(wheelTypeTable.soria, i)],
                            outputs: ["quickcopper"],
                            wheelOutputs: ["quickcopper"],
                            group: 7
                        });
                    }
                }
            }

            return t;
        }
    });

    // Neuvolics
    transformationTableHeaders[transformationTable.length] = "Neuvolics";
    transformationTable.push({
        name: "Glyph of Separation",
        groups: ["Divide"],
        transforms: () => {
            if ((atoms.get("zephiron") ?? 0n) >= 1n) {
                return [{
                    inputs: ["zephiron"],
                    outputs: ["frixon", "gelaron"],
                    group: 0
                }];
            }
            return [];
        }
    }, {
        name: "Glyph of Fixation",
        groups: ["Fix"],
        transforms: () => {
            let t = [];
            if ((atoms.get("frixon") ?? 0n) >= 2n) {
                for (let i = 0; i < 5; i++) {
                    let base = AlchemicalLookups.neumetalsList[i];
                    if ((atoms.get(base) ?? 0n) >= 1n) {
                        t.push({
                            inputs: ["frixon", "frixon", base],
                            outputs: ["zephiron", AlchemicalLookups.neumetalsList[(i + 1) % 5]],
                            group: 0
                        });
                    }
                }
            }
            if ((atoms.get("gelaron") ?? 0n) >= 2n) {
                for (let i = 0; i < 5; i++) {
                    let base = AlchemicalLookups.neumetalsList[i];
                    if ((atoms.get(base) ?? 0n) >= 1n) {
                        t.push({
                            inputs: ["gelaron", "gelaron", base],
                            outputs: ["zephiron", AlchemicalLookups.neumetalsList[(i + 4) % 5]],
                            group: 0
                        });
                    }
                }
            }

            return t;
        }
    });
    // Noble Elements
    transformationTableHeaders[transformationTable.length] = "Noble Elements";
    transformationTable.push({
        name: "Glyph of Coronation",
        groups: ["Coronate"],
        transforms: () => {
            let t = [];
            for (const a of AlchemicalLookups.noblesList) {
                if ((atoms.get(a) ?? 0n) >= 1n) {
                    t.push({
                        inputs: [a],
                        outputs: ["nobilis"],
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
            if ((atoms.get("nobilis") ?? 0n) >= 1n) {
                ;
                for (const n of AlchemicalLookups.noblesList) {
                    if ((atoms.get(n) ?? 0n) >= 1n) {
                        for (let j = 0; j < 2; j++) {
                            let aJ = AlchemicalLookups.noblesList[j];
                            for (let k = j + 1; k < 3; k++) {
                                let aK = AlchemicalLookups.noblesList[k];
                                t.push({
                                    inputs: ["nobilis", n],
                                    outputs: [aJ, aK],
                                    group: 0
                                })
                            }
                        }
                    }
                }
            }
            return t;
        }
    });

    // Reductive Metallurgy
    transformationTableHeaders[transformationTable.length] = "Reductive Metallurgy";
    transformationTable.push({
        name: "Glyph of Rejection",
        groups: ["Reject metal", "Reject metal into Ravari's wheel", "Reject Ravari's wheel", "Transfer around Ravari's wheel"],
        transforms: () => {
            let t = [];
            for (const [base, demote] of AlchemicalLookups.rejectionMap) {
                let BWTM = [];
                if (demote == "vaca") {
                    if (!allowedTransformations.has("Glyph of Extraction")) {
                        continue;
                    }
                    BWTM.push("Glyph of Extraction");
                }
                if ((atoms.get(base) ?? 0n) >= 1n) {
                    t.push({
                        inputs: [base],
                        outputs: ["quicksilver", demote],
                        group: 0,
                        requires: BWTM
                    });
                }
            }
            if ((activeWheels & wheelTypeTable.ravari.flag) != 0n) {
                for (let i = 0; i < 6; i++) {
                    let promote = AlchemicalLookups.projectionMap.get(wheels[wheelTypeTable.ravari.type].atoms[i]);
                    if (promote) {
                        for (const [base, demote] of AlchemicalLookups.rejectionMap) {
                            let BWTM = [];
                            if (demote == "vaca") {
                                if (!allowedTransformations.has("Glyph of Extraction")) {
                                    continue;
                                }
                                BWTM.push("Glyph of Extraction");
                            }
                            if ((atoms.get(base) ?? 0n) >= 1n) {
                                t.push({
                                    inputs: [base],
                                    wheelInputs: [wheelInput(wheelTypeTable.ravari, i)],
                                    outputs: [demote],
                                    wheelOutputs: [promote],
                                    group: 1,
                                    requires: BWTM
                                });
                            }
                        }
                    }
                }
                for (let i = 0; i < 6; i++) {
                    let demote = AlchemicalLookups.rejectionMap.get(wheels[wheelTypeTable.ravari.type].atoms[i]);
                    let BWTM = [];
                    if (demote == "vaca") {
                        if (!allowedTransformations.has("Glyph of Extraction")) {
                            continue;
                        }
                        BWTM.push("Glyph of Extraction");
                    }
                    if (demote) {
                        t.push({
                            inputs: [],
                            wheelInputs: [wheelInput(wheelTypeTable.ravari, i)],
                            outputs: ["quicksilver"],
                            wheelOutputs: [demote],
                            group: 2,
                            requires: BWTM
                        });
                    }
                }
                for (const dir of [1, 5]) {
                    for (let i = 0; i < 6; i++) {
                        let demote = AlchemicalLookups.rejectionMap.get(wheels[wheelTypeTable.ravari.type].atoms[i]);
                        let BWTM = [];
                        if (demote == "vaca") {
                            if (!allowedTransformations.has("Glyph of Extraction")) {
                                continue;
                            }
                            BWTM.push("Glyph of Extraction");
                        }
                        let promote = AlchemicalLookups.projectionMap.get(wheels[wheelTypeTable.ravari.type].atoms[(i + dir) % 6]);
                        if (promote && demote) {
                            t.push({
                                inputs: [],
                                wheelInputs: [wheelInput(wheelTypeTable.ravari, i), wheelInput(wheelTypeTable.ravari, (i + dir) % 6)],
                                outputs: [],
                                wheelOutputs: [demote, promote],
                                group: 3,
                                requires: BWTM
                            });
                        }
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
            for (const [base, split] of AlchemicalLookups.depositionMap.entries()) {
                let BWTM = [];
                if (base == "lead") {
                    if (!allowedTransformations.has("Glyph of Extraction")) {
                        continue;
                    }
                    BWTM.push("Glyph of Extraction");
                }
                if ((atoms.get(base) ?? 0n) >= 1n) {
                    t.push({
                        inputs: [base],
                        outputs: split,
                        group: 0,
                        requires: BWTM
                    });
                }
            }
            return t;
        }
    }, {
        name: "Glyph of Proliferation",
        groups: ["Clone metal with quicksilver", "Clone from Ravari's wheel with quicksilver", "Clone metal with Ravari's wheel", "Clone with Ravari's wheel"],
        transforms: () => {
            let t = [];
            if ((atoms.get("quicksilver") ?? 0n) >= 1n) {
                for (const m of AlchemicalLookups.metalsList) {
                    if ((atoms.get(m) ?? 0n) >= 1n) {
                        t.push({
                            inputs: ["quicksilver", m],
                            outputs: [m, m],
                            group: 0
                        });
                    }
                }
                if ((activeWheels & wheelTypeTable.ravari.flag) != 0n) {
                    for (let i = 0; i < 6; i++) {
                        t.push({
                            inputs: ["quicksilver"],
                            wheelInputs: [wheelInput(wheelTypeTable.ravari, i)],
                            outputs: [wheels[wheelTypeTable.ravari.type].atoms[i]],
                            wheelOutputs: [wheels[wheelTypeTable.ravari.type].atoms[i]],
                            group: 1
                        });
                    }
                }
            }
            if ((activeWheels & wheelTypeTable.ravari.flag) != 0n) {
                for (let i = 0; i < 6; i++) {
                    let demote = AlchemicalLookups.rejectionMap.get(wheels[wheelTypeTable.ravari.type].atoms[i]);
                    if (demote == "vaca") {
                        continue;
                    }
                    if (demote) {
                        for (const m of AlchemicalLookups.metalsList) {
                            if ((atoms.get(m) ?? 0n) >= 1n) {
                                t.push({
                                    inputs: [m],
                                    wheelInputs: [wheelInput(wheelTypeTable.ravari, i)],
                                    outputs: [m, m],
                                    wheelOutputs: [demote],
                                    group: 2
                                });
                            }
                        }
                    }
                }
                for (const dir of [1, 5]) {
                    for (let i = 0; i < 6; i++) {
                        let demote = AlchemicalLookups.rejectionMap.get(wheels[wheelTypeTable.ravari.type].atoms[i]);
                        if (demote == "vaca") {
                            continue;
                        }
                        if (demote) {
                            t.push({
                                inputs: [],
                                wheelInputs: [wheelInput(wheelTypeTable.ravari, i), wheelInput(wheelTypeTable.ravari, (i + dir) % 6)],
                                outputs: [wheels[wheelTypeTable.ravari.type].atoms[(i + dir) % 6]],
                                wheelOutputs: [demote, wheels[wheelTypeTable.ravari.type].atoms[(i + dir) % 6]],
                                group: 3
                            });
                        }
                    }
                }
            }
            return t;
        }
    });

    // True Animismus
    transformationTableHeaders[transformationTable.length] = "True Animismus";
    transformationTable.push({
        name: "Glyph of Disproportion",
        groups: ["Wheelless", "Herriman's wheel captures dilute", "Herriman's wheel captures potent"],
        transforms: () => {
            let t = [];
            for (const [equals, divided] of AlchemicalLookups.disproportionMap.entries()) {
                if ((atoms.get(equals) ?? 0n) >= 2n) {
                    t.push({
                        inputs: [equals, equals],
                        outputs: divided,
                        group: 0
                    });
                }
            }
            if ((activeWheels & wheelTypeTable.herriman.flag) != 0n) {
                for (const dir of [1, 5]) {
                    for (let i = 0; i < 6; i++) {
                        for (const [equals, divided] of AlchemicalLookups.disproportionMap.entries()) {
                            if ((atoms.get(equals) ?? 0n) >= 1n) {
                                let wheelDilute = AlchemicalLookups.strengthToAnimismusMap.get(AlchemicalLookups.animismusToStrengthMap.get(wheels[wheelTypeTable.herriman.type].atoms[i]) - AlchemicalLookups.animismusToStrengthMap.get(equals));
                                let wheelConcentrate = AlchemicalLookups.strengthToAnimismusMap.get(AlchemicalLookups.animismusToStrengthMap.get(wheels[wheelTypeTable.herriman.type].atoms[(i + dir) % 6]) + AlchemicalLookups.animismusToStrengthMap.get(divided[1]));
                                if (wheelDilute && wheelConcentrate) {
                                    t.push({
                                        inputs: [equals],
                                        wheelInputs: [wheelInput(wheelTypeTable.herriman, i), wheelInput(wheelTypeTable.herriman, (i + dir) % 6)],
                                        outputs: [divided[0]],
                                        wheelOutputs: [wheelDilute, wheelConcentrate],
                                        group: 1
                                    });
                                }
                            }
                        }
                    }
                }
                for (const dir of [1, 5]) {
                    for (let i = 0; i < 6; i++) {
                        for (const [equals, divided] of AlchemicalLookups.disproportionMap.entries()) {
                            if ((atoms.get(equals) ?? 0n) >= 1n) {
                                let wheelDilute = AlchemicalLookups.strengthToAnimismusMap.get(AlchemicalLookups.animismusToStrengthMap.get(wheels[wheelTypeTable.herriman.type].atoms[i]) - AlchemicalLookups.animismusToStrengthMap.get(equals));
                                let wheelConcentrate = AlchemicalLookups.strengthToAnimismusMap.get(AlchemicalLookups.animismusToStrengthMap.get(wheels[wheelTypeTable.herriman.type].atoms[(i + dir) % 6]) + AlchemicalLookups.animismusToStrengthMap.get(divided[0]));
                                if (wheelDilute && wheelConcentrate) {
                                    t.push({
                                        inputs: [equals],
                                        wheelInputs: [wheelInput(wheelTypeTable.herriman, i), wheelInput(wheelTypeTable.herriman, (i + dir) % 6)],
                                        outputs: [divided[1]],
                                        wheelOutputs: [wheelDilute, wheelConcentrate],
                                        group: 2
                                    });
                                }
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
            for (const [s, a] of AlchemicalLookups.strengthToAnimismusMap.entries()) {
                if (s == 0) {
                    continue;
                }
                let inverse = AlchemicalLookups.strengthToAnimismusMap.get(-s);
                if (inverse && (atoms.get(a) ?? 0n) >= 1n) {
                    t.push({
                        inputs: [a],
                        outputs: [inverse],
                        group: 0
                    });
                }
            }
            return t;
        }
    }, {
        name: "Glyph of Infusion",
        groups: ["Transfer between atoms", "Concentrate Herriman's wheel", "Dilute Herriman's wheel", "Distribute around Herriman's wheel"],
        transforms: () => {
            let t = [];
            for (const [toConcentrateStrength, aI] of AlchemicalLookups.strengthToAnimismusMap.entries()) {
                for (const [toDiluteStrength, aJ] of AlchemicalLookups.strengthToAnimismusMap.entries()) {
                    // Is cons. already stronger that dilu.
                    if (Math.abs(toConcentrateStrength) >= Math.abs(toDiluteStrength)) {
                        continue;
                    }
                    // are they in opposition
                    if (toConcentrateStrength < 0 && toDiluteStrength > 0 || toConcentrateStrength > 0 && toDiluteStrength < 0) {
                        continue;
                    }
                    // are they adjacent
                    if (toConcentrateStrength + 1 == toDiluteStrength || toConcentrateStrength - 1 == toDiluteStrength) {
                        continue;
                    }
                    if ((atoms.get(aI) ?? 0n) >= 1 && (atoms.get(aJ) ?? 0n) >= 1) {
                        let concentrateDirection = toDiluteStrength > 0 ? 1 : -1;
                        let dilute = AlchemicalLookups.strengthToAnimismusMap.get(toDiluteStrength - concentrateDirection);
                        let concentrate = AlchemicalLookups.strengthToAnimismusMap.get(toConcentrateStrength + concentrateDirection);
                        t.push({
                            inputs: [aI, aJ],
                            outputs: [dilute, concentrate],
                            group: 0
                        });
                    }
                }
            }
            if ((activeWheels & wheelTypeTable.herriman.flag) != 0n) {
                for (let i = 0; i < 6; i++) {
                    let toConcentrateStrength = AlchemicalLookups.animismusToStrengthMap.get(wheels[wheelTypeTable.herriman.type].atoms[i]);
                    for (const [toDiluteStrength, a] of AlchemicalLookups.strengthToAnimismusMap.entries()) {
                        // is dilu. salt
                        if (toDiluteStrength == 0) {
                            continue;
                        }
                        let concentrateDirection = toDiluteStrength > 0 ? 1 : -1;
                        // is cons. already stronger than dilu
                        if (toDiluteStrength > 0 ? toConcentrateStrength >= toDiluteStrength : toConcentrateStrength <= toDiluteStrength) {
                            continue;
                        }
                        if ((atoms.get(a) ?? 0n) >= 1n) {
                            let concentrate = AlchemicalLookups.strengthToAnimismusMap.get(toConcentrateStrength + concentrateDirection);
                            let dilute = AlchemicalLookups.strengthToAnimismusMap.get(toDiluteStrength - concentrateDirection);
                            t.push({
                                inputs: [a],
                                wheelInputs: [wheelInput(wheelTypeTable.herriman, i)],
                                outputs: [dilute],
                                wheelOutputs: [concentrate],
                                group: 1
                            });
                        }
                    }
                }
                for (let i = 0; i < 6; i++) {
                    let toDiluteStrength = AlchemicalLookups.animismusToStrengthMap.get(wheels[wheelTypeTable.herriman.type].atoms[i]);
                    // is dilu. salt
                    if (toDiluteStrength == 0) {
                        continue;
                    }
                    for (const [toConcentrateStrength, a] of AlchemicalLookups.strengthToAnimismusMap.entries()) {
                        // is cons. stronger than dilu.
                        if (Math.abs(toConcentrateStrength) >= Math.abs(toDiluteStrength)) {
                            continue;
                        }
                        // are they in opposition
                        if (toDiluteStrength < 0 && toConcentrateStrength > 0 || toDiluteStrength > 0 && toConcentrateStrength < 0) {
                            continue;
                        }
                        if ((atoms.get(a) ?? 0n) >= 1n) {
                            let concentrateDirection = toDiluteStrength > 0 ? 1 : -1;
                            let concentrate = AlchemicalLookups.strengthToAnimismusMap.get(toConcentrateStrength + concentrateDirection);
                            let dilute = AlchemicalLookups.strengthToAnimismusMap.get(toDiluteStrength - concentrateDirection);
                            t.push({
                                inputs: [a],
                                wheelInputs: [wheelInput(wheelTypeTable.herriman, i)],
                                outputs: [concentrate],
                                wheelOutputs: [dilute],
                                group: 2
                            });
                        }
                    }
                }
                for (const dir of [1, 5]) {
                    for (let i = 0; i < 6; i++) {
                        let toDiluteStrength = AlchemicalLookups.animismusToStrengthMap.get(wheels[wheelTypeTable.herriman.type].atoms[i]);
                        // is dilu. salt
                        if (toDiluteStrength == 0) {
                            continue;
                        }
                        let toConcentrateStrength = AlchemicalLookups.animismusToStrengthMap.get(wheels[wheelTypeTable.herriman.type].atoms[(i + dir) % 6]);
                        let concentrateDirection = toDiluteStrength > 0 ? 1 : -1;
                        // is cons. stronger than dilu.
                        if (toDiluteStrength > 0 ? toConcentrateStrength >= toDiluteStrength : toConcentrateStrength <= toDiluteStrength) {
                            continue;
                        }
                        if (dir == 5) {
                            // if swapping cons. and dilu. still works
                            if (!(toConcentrateStrength == 0 || (toConcentrateStrength > 0 ? toDiluteStrength >= toConcentrateStrength : toDiluteStrength <= toConcentrateStrength)) ) {
                                continue;
                            }
                        }

                        let dilute = AlchemicalLookups.strengthToAnimismusMap.get(toDiluteStrength - concentrateDirection);
                        let concentrate = AlchemicalLookups.strengthToAnimismusMap.get(toConcentrateStrength + concentrateDirection);
                        t.push({
                            inputs: [],
                            wheelInputs: [wheelInput(wheelTypeTable.herriman, i), wheelInput(wheelTypeTable.herriman, (i + dir) % 6)],
                            outputs: [],
                            wheelOutputs: [dilute, concentrate],
                            group: 3
                        });
                    }
                }
            }
            return t;
        }
    });

    // Unstable Elements
    transformationTableHeaders[transformationTable.length] = "Unstable Elements";
    transformationTable.push({
        name: "Glyph of Irradiation",
        groups: ["Irradiate"],
        transforms: () => {
            if ((atoms.get("quicksilver") ?? 0n) >= 3n && (atoms.get("gold") ?? 0n) >= 1n) {
                return [{
                    inputs: ["quicksilver", "quicksilver", "quicksilver", "gold"],
                    outputs: ["uranium"],
                    group: 0
                }];
            }
            return [];
        }
    }, {
        name: "Glyph of Sublimation",
        groups: ["Sublimate"],
        transforms: () => {
            if ((atoms.get("quintessence") ?? 0n) >= 1n) {
                return [{
                    inputs: ["quintessence"],
                    outputs: ["aether", "aether", "salt", "salt"],
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
            if ((atoms.get("aether") ?? 0n) >= 1n) {
                t.push({
                    inputs: ["aether"],
                    outputs: [],
                    group: 0
                });
            }
            if ((atoms.get("uranium") ?? 0n) >= 1n) {
                t.push({
                    inputs: ["uranium"],
                    outputs: ["lead"],
                    group: 0
                });
            }
            return t;
        }
    });

    // Vacancy
    transformationTableHeaders[transformationTable.length] = "Vacancy";
    transformationTable.push({
        name: "Glyph of Hollowing",
        groups: ["Dude, you need to dust in here"],
        transforms: () => {
            let t = [];
            t.push({
                inputs: [],
                outputs: ["vaca"],
                group: 0
            });
            if ((atoms.get("vaca") ?? 0n) >= 1n) {
                t.push({
                    inputs: ["vaca"],
                    outputs: [],
                    group: 0
                });
            }
            return t;
        }
    }, {
        name: "Glyph of Extraction",
        groups: ["Hey, stop making more dust!"],
        transforms: () => {
            // behavor specified by other glyphs.
            return [];
        }
    });
}

function useNewMods() {
    transformationTable = [];
    transformationTableHeaders = [];
    modTableInUse = "drm";

    // Vanilla
    transformationTableHeaders[transformationTable.length] = "Opus Magnum";
    transformationTable.push({
        name: "Glyph of Calcification",
        groups: ["Calcify cardinal"],
        transforms: () => {
            let t = [];
            for (const c of AlchemicalLookups.cardinalsList) {
                if ((atoms.get(c) ?? 0n) >= 1n) {
                    t.push({
                        inputs: [c],
                        outputs: ["salt"],
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
            if ((atoms.get("salt") ?? 0n) >= 1n) {
                for (const c of AlchemicalLookups.cardinalsList) {
                    if ((atoms.get(c) ?? 0n) >= 1n) {
                        t.push({
                            inputs: [c, "salt"],
                            outputs: [c, c],
                            group: 0
                        });
                    }
                }
                if ((activeWheels & wheelTypeTable.berlo.flag) != 0) {
                    for (const c of ["air", "earth", "fire", "water"]) {
                        let p = wheels[wheelTypeTable.berlo.type].atoms.indexOf(c);
                        t.push({
                            inputs: ["salt"],
                            wheelInputs: [wheelInput(wheelTypeTable.berlo, p)],
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
        groups: ["Project metal with quicksilver"],
        transforms: () => {
            let t = [];
            if ((atoms.get("quicksilver") ?? 0n) >= 1n) {
                for (const [base, promote] of AlchemicalLookups.projectionMap.entries()) {
                    if ((atoms.get(base) ?? 0n) >= 1n) {
                        t.push({
                            inputs: ["quicksilver", base],
                            outputs: [promote],
                            group: 0
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
            for (let [base, promote] of AlchemicalLookups.purificationMap) {
                if ((atoms.get(base) ?? 0n) >= 2n) {
                    t.push({
                        inputs: [base, base],
                        outputs: [promote],
                        group: 0
                    });
                }
            }
            return t;
        }
    }, {
        name: "Glyph of Animismus",
        groups: ["Vivifacate"],
        transforms: () => {
            let t = [];
            if ((atoms.get("salt") ?? 0n) >= 2n) {
                t.push({
                    inputs: ["salt", "salt"],
                    outputs: ["mors", "vitae"],
                    group: 0
                });
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
                        outputs: [],
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
                if ((atoms.get(c) ?? 0n) <= 0n) {
                    valid = false;
                    break;
                }
            }
            if (valid) {
                return [{
                    inputs: ["air", "earth", "fire", "water"],
                    outputs: ["quintessence"],
                    group: 0
                }];
            }
            return [];
        }
    }, {
        name: "Glyph of Dispersion",
        groups: ["Disperse"],
        transforms: () => {
            if ((atoms.get("quintessence") ?? 0n) >= 1n) {
                return [{
                    inputs: ["quintessence"],
                    outputs: ["air", "earth", "fire", "water"],
                    group: 0
                }];
            }
            return [];
        }
    });

    // De Re Metallica
    transformationTableHeaders[transformationTableHeaders] = "De Re Metallica"
    transformationTable.push({
        name: "Glyph of Rejection",
        groups: ["Traumatize metal"],
        transformations: () => {
            let t = [];
            if ((atoms.get("quicksilver") ?? 0n) >= 1n) {
                for (let [m, d] in AlchemicalLookups.rejectionMap) {

                }
            }
            return t;
        }
    })


    moddedTransformIndex = transformationTable.length;

}

useOldMods();