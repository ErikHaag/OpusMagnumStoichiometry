let transformationTable = [];

let allowedTransformations = new Set(["Glyph of Calcification"]);

{

    const metallicity = [
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

    const quicksilverMetallicity = [
        "quicklime",
        "quickcopper",
        "quicksilver"
    ];

    const fusionList = [
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

    const projectionMap = new Map([
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

    const purificationMap = new Map([
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

    const rejectionMap = new Map([
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

    const depositionMap = new Map([
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

    const shearingMap = new Map([
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

    const halfPromotionMap = new Map([
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

    const osmosisMap = new Map([
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

    const cardinalsList = ["air", "earth", "fire", "water"];
    const crystalinesList = ["aerolith", "ignistal", "mistaline", "pyrolite", "terramarine", "vaporine"];
    const metalsList = ["vaca", "lead", "wolfram", "tin", "vulcan", "iron", "nickel", "copper", "zinc", "silver", "sednum", "gold", "osmium"];
    const noblesList = ["alpha", "beta", "gamma"];

    function wheelInput(wheelType, index) {
        return { type: wheelType, id: index, atomType: wheels[wheelType].atoms[index] };
    }

    transformationTable.push(
        /* Vanilla */ {
            name: "Glyph of Calcification",
            groups: ["Calcify cardinal"],
            transforms: () => {
                let t = [];
                for (const c of cardinalsList) {
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
                for (const c of cardinalsList) {
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
                        let p = wheels[wheelTypeTable.berlo.type].atoms.indexOf(c);
                        t.push({
                            inputs: ["salt"],
                            wheelInputs: [wheelInput(wheelTypeTable.berlo.type, p)],
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
                if ((activeWheels & wheelTypeTable.soria.flag) != 0n) {
                    for (let i = 0; i < 6; i++) {
                        let soriaM = quicksilverMetallicity.indexOf(wheels[wheelTypeTable.soria.type].atoms[i]);
                        if (soriaM == -1) {
                            continue;
                        }
                        let promoteS = quicksilverMetallicity[soriaM + 2];
                        if (promoteS) {
                            t.push({
                                inputs: ["quicksilver"],
                                wheelInputs: [wheelInput(wheelTypeTable.soria.type, i)],
                                outputs: [],
                                wheelOutputs: [promoteS],
                                group: 1
                            });
                        }
                    }
                }
                if ((activeWheels & wheelTypeTable.ravari.flag) != 0n) {
                    for (let i = 0; i < 6; i++) {
                        let promote = projectionMap.get(wheels[wheelTypeTable.ravari.type].atoms[i]);
                        if (promote) {
                            t.push({
                                inputs: ["quicksilver"],
                                wheelInputs: [wheelInput(wheelTypeTable.ravari.type, i)],
                                outputs: [],
                                wheelOutputs: [promote],
                                group: 2
                            });
                        }
                    }
                }
            }
            if ((atoms.get("quickcopper") ?? 0) >= 1) {
                for (const [base, promote] of halfPromotionMap.entries()) {
                    if ((atoms.get(base) ?? 0) >= 1) {
                        t.push({
                            inputs: ["quickcopper", base],
                            wheelInputs: null,
                            outputs: [promote],
                            wheelOutputs: null,
                            group: 3
                        });
                    }
                }
                if ((activeWheels & wheelTypeTable.soria.flag) != 0n) {
                    for (let i = 0; i < 6; i++) {
                        let promoteM = quicksilverMetallicity.indexOf(wheels[wheelTypeTable.soria.type].atoms[i]);
                        if (promoteM == -1) {
                            continue;
                        }
                        let promote = quicksilverMetallicity[promoteM + 1];
                        if (promote) {
                            t.push({
                                inputs: ["quickcopper"],
                                wheelInputs: [wheelInput(wheelTypeTable.soria.type, i)],
                                outputs: [],
                                wheelOutputs: [promote],
                                group: 4
                            });
                        }
                    }
                }
                if ((activeWheels & wheelTypeTable.ravari.flag) != 0n) {
                    for (let i = 0; i < 6; i++) {
                        let promote = halfPromotionMap.get(wheels[wheelTypeTable.ravari.type].atoms[i]);
                        if (promote) {
                            t.push({
                                inputs: ["quickcopper"],
                                wheelInputs: [wheelInput(wheelTypeTable.ravari.type, i)],
                                outputs: [],
                                wheelOutputs: [promote],
                                group: 5
                            });
                        }
                    }
                }
            }
            if ((activeWheels & wheelTypeTable.soria.flag) != 0n) {
                for (const [base, hPromote] of halfPromotionMap.entries()) {
                    if ((atoms.get(base) ?? 0) >= 1) {
                        let promote = projectionMap.get(base);
                        for (let i = 0; i < 6; i++) {
                            if (wheels[wheelTypeTable.soria.type].atoms[i] == "quickcopper") {
                                t.push({
                                    inputs: [base],
                                    wheelInputs: [wheelInput(wheelTypeTable.soria.type, i)],
                                    outputs: [hPromote],
                                    wheelOutputs: ["quicklime"],
                                    group: 6
                                });
                            } else if (promote && wheels[wheelTypeTable.soria.type].atoms[i] == "quicksilver") {
                                t.push({
                                    inputs: [base],
                                    wheelInputs: [wheelInput(wheelTypeTable.soria.type, i)],
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
                for (const [base, promote] of projectionMap.entries()) {
                    if ((atoms.get(base) ?? 0) >= 1) {
                        for (let i = 0; i < 6; i++) {
                            let demote = rejectionMap.get(wheels[wheelTypeTable.ravari.type].atoms[i]);
                            if (demote == "vaca") {
                                continue;
                            }
                            if (demote) {
                                t.push({
                                    inputs: [base],
                                    wheelInputs: [wheelInput(wheelTypeTable.ravari.type, i)],
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
                        let sourceM = quicksilverMetallicity.indexOf(wheels[wheelTypeTable.soria.type].atoms[i]);
                        let destinationM = quicksilverMetallicity.indexOf(wheels[wheelTypeTable.soria.type].atoms[(i + dir) % 6]);
                        if (sourceM <= 0 || destinationM == -1) {
                            continue;
                        }
                        let destination = quicksilverMetallicity[sourceM + destinationM];
                        if (destination) {
                            t.push({
                                inputs: [],
                                wheelInputs: [wheelInput(wheelTypeTable.soria.type, i), wheelInput(wheelTypeTable.soria.type, (i + dir) % 6)],
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
                        let demote = rejectionMap.get(wheels[wheelTypeTable.ravari.type].atoms[i]);
                        if (demote == "vaca" || demote == "beryl") {
                            continue;
                        }
                        let promote = projectionMap.get(wheels[wheelTypeTable.ravari.type].atoms[(i + dir) % 6]);
                        if (promote && demote) {
                            t.push({
                                inputs: [],
                                wheelInputs: [wheelInput(wheelTypeTable.ravari.type, i), wheelInput(wheelTypeTable.ravari.type, (i + dir) % 6)],
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
                        let promote = projectionMap.get(base);
                        let hPromote = halfPromotionMap.get(base);
                        for (let j = 0; j < 6; j++) {
                            let quix = wheels[wheelTypeTable.soria.type].atoms[j];
                            if (quix == "quicklime") {
                                continue;
                            }
                            if (quix == "quickcopper") {
                                if (hPromote) {
                                    t.push({
                                        inputs: [],
                                        wheelInputs: [wheelInput(wheelTypeTable.soria.type, j), wheelInput(wheelTypeTable.ravari.type, i)],
                                        outputs: [],
                                        wheelOutputs: ["quicklime", hPromote],
                                        group: 10
                                    });
                                }
                            } else if (quix == "quicksilver") {
                                if (promote) {
                                    t.push({
                                        inputs: [],
                                        wheelInputs: [wheelInput(wheelTypeTable.soria.type, j), wheelInput(wheelTypeTable.ravari.type, i)],
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
                            let demote = rejectionMap.get(wheels[wheelTypeTable.ravari.type].atoms[j]);
                            if (!demote) {
                                continue;
                            }
                            if (demote == "vaca" || demote == "beryl") {
                                continue;
                            }
                            t.push({
                                inputs: [],
                                wheelInputs: [wheelInput(wheelTypeTable.ravari.type, j), wheelInput(wheelTypeTable.soria.type, i)],
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
            for (let [base, promote] of purificationMap) {

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
        groups: ["Wheelless", "Herriman's wheel captures vitae", "Herriman's wheel captures mors"],
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
                    let vitate = vitaeAbsorbitionMap.get(wheels[wheelTypeTable.herriman.type].atoms[i]);
                    if (vitate) {
                        t.push({
                            inputs: ["salt"],
                            wheelInputs: [wheelInput(wheelTypeTable.herriman.type, i)],
                            outputs: ["mors"],
                            wheelOutputs: [vitate],
                            group: 1
                        });
                    }
                }
                for (let i = 0; i < 6; i++) {
                    let morate = morsAbsorbitionMap.get(wheels[wheelTypeTable.herriman.type].atoms[i]);
                    if (morate) {
                        t.push({
                            inputs: ["salt"],
                            wheelInputs: [wheelInput(wheelTypeTable.herriman.type, i)],
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
    }, /* Complicated Elements */ {
        name: "Glyph of Fusion",
        groups: ["Fuse"],
        transforms: () => {
            let t = [];
            for (const [target, project, output] of fusionList) {
                if ((atoms.get(target) ?? 0) >= 1 && (atoms.get(project) ?? 0) >= 1) {
                    t.push({
                        inputs: [target, project],
                        wheelInputs: null,
                        outputs: [output],
                        wheelOutputs: null,
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
            for (const c of crystalinesList) {
                if ((atoms.get(c) ?? 0) >= 1) {
                    t.push({
                        inputs: [c],
                        wheelInputs: null,
                        outputs: ["quicklime"],
                        wheelOutputs: null,
                        group: 0
                    });
                }
            }
            return t;
        }
    }, /* Halving Metallurgy */ {
        name: "Glyph of Halves",
        groups: ["Half project metals with quicksilver", "Half project Soria's wheel and metal with quicksilver", "Half project Ravari's wheel and metal with quicksilver", "Half project Soria's wheel and Ravari's wheel with quicksilver",
            "Half project metals with Soria's wheel", "Half project metals with Ravari's wheel", "Half project metal and Ravari's wheel from Soria's Wheel", "Half project metal and Soria's wheel from Ravari's Wheel",
            "Half project metal from Soria's wheel transfer", "Half project metal from Ravari's wheel transfer", "Half project Ravari's from Soria's wheel transfer", "Half project Soria's from Ravari's wheel transfer",
            "Distribute quicksilver around Soria's wheel", "Distribute quicksilver around Ravari's wheel"],
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
                if ((activeWheels & wheelTypeTable.soria.flag) != 0n) {
                    for (let i = 0; i < 6; i++) {
                        let soriaM = quicksilverMetallicity.indexOf(wheels[wheelTypeTable.soria.type].atoms[i]);
                        if (soriaM == -1) {
                            continue;
                        }
                        let promoteS = quicksilverMetallicity[soriaM + 1];
                        if (promoteS) {
                            for (const [baseF, promoteF] of halfPromotionMap.entries()) {
                                if ((atoms.get(baseF) ?? 0) >= 1) {
                                    t.push({
                                        inputs: ["quicksilver", baseF],
                                        wheelInputs: [wheelInput(wheelTypeTable.soria.type, i)],
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
                        let promoteR = halfPromotionMap.get(wheels[wheelTypeTable.ravari.type].atoms[i]);
                        if (promoteR) {
                            for (const [baseF, promoteF] of halfPromotionMap.entries()) {
                                if ((atoms.get(baseF) ?? 0) >= 1) {
                                    t.push({
                                        inputs: ["quicksilver", baseF],
                                        wheelInputs: [wheelInput(wheelTypeTable.ravari.type, i)],
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
                            let soriaM = quicksilverMetallicity.indexOf(wheels[wheelTypeTable.soria.type].atoms[i]);
                            if (soriaM == -1) {
                                continue;
                            }
                            let promoteS = quicksilverMetallicity[soriaM + 1];
                            if (promoteS) {
                                for (let j = 0; j < 6; j++) {
                                    let promoteR = halfPromotionMap.get(wheels[wheelTypeTable.ravari.type].atoms[j]);
                                    if (promoteR) {
                                        t.push({
                                            inputs: ["quicksilver"],
                                            wheelInputs: [wheelInput(wheelTypeTable.soria.type, i), wheelInput(wheelTypeTable.ravari.type, j)],
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
                            let promoteJ = halfPromotionMap.get(baseJ);
                            if ((atoms.get(baseJ) ?? 0) <= 0) {
                                continue;
                            }
                            if ((atoms.get(baseJ) ?? 0) >= 2) {
                                t.push({
                                    inputs: [baseJ, baseJ],
                                    wheelInputs: [wheelInput(wheelTypeTable.soria.type, i)],
                                    outputs: [promoteJ, promoteJ],
                                    wheelOutputs: ["quicklime"],
                                    group: 4
                                });
                            }
                            for (let k = j + 1; k < halfPromotable.length; k++) {
                                let baseK = halfPromotable[k];
                                let promoteK = halfPromotionMap.get(baseK);
                                if ((atoms.get(baseK) ?? 0) >= 1) {
                                    t.push({
                                        inputs: [baseJ, baseK],
                                        wheelInputs: [wheelInput(wheelTypeTable.soria.type, i)],
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
                    let demoteR = rejectionMap.get(wheels[wheelTypeTable.ravari.type].atoms[i]);
                    if (demoteR) {
                        if (metallicity.indexOf(demoteR) <= 1) {
                            continue;
                        }
                        for (let j = 0; j < halfPromotable.length; j++) {
                            let baseJ = halfPromotable[j];
                            let promoteJ = halfPromotionMap.get(baseJ);
                            if ((atoms.get(baseJ) ?? 0) <= 0) {
                                continue;
                            }
                            if ((atoms.get(baseJ) ?? 0) >= 2) {
                                t.push({
                                    inputs: [baseJ, baseJ],
                                    wheelInputs: [wheelInput(wheelTypeTable.ravari.type, i)],
                                    outputs: [promoteJ, promoteJ],
                                    wheelOutputs: [demoteR],
                                    group: 5
                                });
                            }
                            for (let k = j + 1; k < halfPromotable.length; k++) {
                                let baseK = halfPromotable[k];
                                let promoteK = halfPromotionMap.get(baseK);
                                if ((atoms.get(baseK) ?? 0) >= 1) {
                                    t.push({
                                        inputs: [baseJ, baseK],
                                        wheelInputs: [wheelInput(wheelTypeTable.ravari.type, i)],
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
                            let promoteR = halfPromotionMap.get(wheels[wheelTypeTable.ravari.type].atoms[j]);
                            if (promoteR) {
                                for (const [base, project] in halfPromotionMap.entries()) {
                                    if ((atoms.get(base) ?? 0) >= 1n) {
                                        t.push({
                                            inputs: [base],
                                            wheelInputs: [wheelInput(wheelTypeTable.soria.type, i), wheelInput(wheelTypeTable.ravari.type, j)],
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
                        let rejectW = rejectionMap.get(wheels[wheelTypeTable.ravari.type].atoms[i]);
                        if (rejectW) {
                            for (let j = 0; j < 6; j++) {
                                let soriaM = quicksilverMetallicity.indexOf(wheels[wheelTypeTable.soria.type].atoms[j]);
                                if (soriaM == -1) {
                                    continue;
                                }
                                let promoteS = quicksilverMetallicity[soriaM + 1];
                                if (promoteS) {
                                    for (const [base, project] in halfPromotionMap.entries()) {
                                        if ((atoms.get(base) ?? 0) >= 1n) {
                                            t.push({
                                                inputs: [base],
                                                wheelInputs: [wheelInput(wheelTypeTable.ravari.type, i), wheelInput(wheelTypeTable.soria.type, j)],
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
                        let soriaM = quicksilverMetallicity.indexOf(wheels[wheelTypeTable.soria.type].atoms[(i + dir) % 6]);
                        if (soriaM == -1) {
                            continue;
                        }
                        let promoteS = quicksilverMetallicity[soriaM + 1];
                        if (promoteS) {
                            for (const [base, promote] in halfPromotionMap.entries()) {
                                if ((atoms.get(base) ?? 0) >= 1n) {
                                    t.push({
                                        inputs: [base],
                                        wheelInputs: [wheelInput(wheelTypeTable.soria.type, i), wheelInput(wheelTypeTable.soria.type, (i + dir) % 6)],
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
                        let demoteR = rejectionMap.get(wheels[wheelTypeTable.ravari.type].atoms[i]);
                        if (demoteR == "vaca" || demoteR == "beryl") {
                            continue;
                        }
                        let promoteR = halfPromotionMap.get(wheels[wheelTypeTable.ravari.type].atoms[(i + dir) % 6]);
                        if (demoteR && promoteR) {
                            for (const [baseF, promoteF] of halfPromotionMap.entries()) {
                                if ((atoms.get(baseF) ?? 0) >= 1) {
                                    t.push({
                                        inputs: [baseF],
                                        wheelInputs: [wheelInput(wheelTypeTable.ravari.type, i), wheelInput(wheelTypeTable.ravari.type, (i + dir) % 6)],
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
                            let soriaM = quicksilverMetallicity.indexOf(wheels[wheelTypeTable.soria.type].atoms[(i + dir) % 6]);
                            if (soriaM == -1) {
                                continue;
                            }
                            let promoteS = quicksilverMetallicity[soriaM + 1];
                            if (promoteS) {
                                for (let j = 0; j < 6; j++) {
                                    let promoteR = halfPromotionMap.get(wheels[wheelTypeTable.ravari.type].atoms[j]);
                                    if (promoteR) {
                                        t.push({
                                            inputs: [],
                                            wheelInputs: [wheelInput(wheelTypeTable.soria.type, i), wheelInput(wheelTypeTable.soria.type, (i + dir) % 6), wheelInput(wheelTypeTable.ravari.type, j)],
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
                            let demoteR = rejectionMap.get(wheels[wheelTypeTable.ravari.type].atoms[i]);
                            if (demoteR == "vaca" || demoteR == "beryl") {
                                continue;
                            }
                            let promoteR = halfPromotionMap.get(wheels[wheelTypeTable.ravari.type].atoms[(i + dir) % 6]);
                            if (demoteR && promoteR) {
                                for (let j = 0; j < 6; j++) {
                                    if (wheels[wheelTypeTable.soria.type].atoms[i] != "quicksilver") {
                                        continue;
                                    }
                                    let soriaM = quicksilverMetallicity.indexOf(wheels[wheelTypeTable.soria.type].atoms[j]);
                                    if (soriaM == -1) {
                                        continue;
                                    }
                                    let promoteS = quicksilverMetallicity[soriaM + 1];
                                    if (promoteS) {
                                        t.push({
                                            inputs: [],
                                            wheelInputs: [wheelInput(wheelTypeTable.ravari.type, i), wheelInput(wheelTypeTable.ravari.type, (i + dir) % 6), wheelInput(wheelTypeTable.soria.type, j)],
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
                    let soriaBM = quicksilverMetallicity.indexOf(wheels[wheelTypeTable.soria.type].atoms[(i + 5) % 6]);
                    let soriaFM = quicksilverMetallicity.indexOf(wheels[wheelTypeTable.soria.type].atoms[(i + 1) % 6]);
                    if (soriaBM == -1 || soriaFM == -1) {
                        continue;
                    }
                    let promoteB = quicksilverMetallicity[soriaBM + 1];
                    let promoteF = quicksilverMetallicity[soriaFM + 1];
                    if (promoteB && promoteF) {
                        t.push({
                            inputs: [],
                            wheelInputs: [wheelInput(wheelTypeTable.soria.type, i), wheelInput(wheelTypeTable.soria.type, (i + 5) % 6), wheelInput(wheelTypeTable.soria.type, (i + 1) % 6)],
                            outputs: [],
                            wheelOutputs: ["quicklime", promoteB, promoteF],
                            group: 12
                        });
                    }
                }
            }
            if ((activeWheels & wheelTypeTable.ravari.flag) != 0n) {
                for (let i = 0; i < 6; i++) {
                    let demote = rejectionMap.get(wheels[wheelTypeTable.ravari.type].atoms[i]);
                    if (demote == "vaca" || demote == "beryl") {
                        continue;
                    }
                    let promoteB = halfPromotionMap.get(wheels[wheelTypeTable.ravari.type].atoms[(i + 5) % 6]);
                    let promoteF = halfPromotionMap.get(wheels[wheelTypeTable.ravari.type].atoms[(i + 1) % 6]);
                    if (demote && promoteB && promoteF) {
                        t.push({
                            inputs: [],
                            wheelInputs: [wheelInput(wheelTypeTable.ravari.type, i), wheelInput(wheelTypeTable.ravari.type, (i + 5) % 6), wheelInput(wheelTypeTable.ravari.type, (i + 1) % 6)],
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
            if ((atoms.get("quicksilver") ?? 0) >= 6) {
                for (const [aT, c] of atoms.entries()) {
                    if (aT != "quicksilver" && c >= 1) {
                        t.push({
                            inputs: ["quicksilver", "quicksilver", "quicksilver", "quicksilver", "quicksilver", "quicksilver", aT],
                            wheelInputs: null,
                            outputs: ["quicksilver", "quicksilver", "quicksilver", "quicksilver", "quicksilver", aT],
                            wheelOutputs: null,
                            group: 0
                        });
                    }
                }
            }
            if ((atoms.get("quicksilver") ?? 0) >= 7) {
                t.push({
                    inputs: ["quicksilver", "quicksilver", "quicksilver", "quicksilver", "quicksilver", "quicksilver", "quicksilver"],
                    wheelInputs: null,
                    outputs: ["quicksilver", "quicksilver", "quicksilver", "quicksilver", "quicksilver", "quicksilver"],
                    wheelOutputs: null,
                    group: 0
                });
            }
            if ((activeWheels & wheelTypeTable.soria.flag) != 0n) {
                for (let i = 0; i < 6; i++) {
                    if (wheels[wheelTypeTable.soria.type].atoms[i] != "quicksilver") {
                        continue;
                    }
                    t.push({
                        inputs: [],
                        wheelInputs: [wheelInput(wheelTypeTable.soria.type, i)],
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
            for (const [base, promote] of projectionMap) {
                if ((atoms.get(base) ?? 0) >= 2) {
                    for (const [bM, b] of metallicity.entries()) {
                        if ((atoms.get(b) ?? 0) <= (b == base ? 2 : 0)) {
                            continue;
                        }
                        let remainder = bM + (metallicity.indexOf(base) - 2);
                        let newBowl = metallicity[remainder];
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
                                wheelInputs: null,
                                outputs: [promote, newBowl],
                                wheelOutputs: null,
                                group: 0,
                                requires: BWTM
                            });
                        }
                    }
                }
            }
            if ((activeWheels & wheelTypeTable.ravari.flag) != 0n) {
                for (const [base, promote] of projectionMap) {
                    if ((atoms.get(base) ?? 0) >= 2) {
                        for (let i = 0; i < 6; i++) {
                            const b = wheels[wheelTypeTable.ravari.type].atoms[i];
                            const bM = metallicity.indexOf(b);
                            let remainder = bM + (metallicity.indexOf(base) - 2);
                            let newBowl = metallicity[remainder];
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
            for (const [bowl, [newBowl, output]] of shearingMap.entries()) {
                if ((atoms.get(bowl) ?? 0) >= 1) {
                    let BWTM = [];
                    if (output == "vaca") {
                        if (!allowedTransformations.has("Glyph of Extraction")) {
                            continue;
                        }
                        BWTM.push("Glyph of Extraction");
                    }
                    t.push({
                        inputs: [bowl],
                        wheelInputs: null,
                        outputs: [newBowl, output],
                        wheelOutputs: null,
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
                        wheelInputs: [wheelInput(wheelTypeTable.soria.type, i)],
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
            if ((atoms.get("quickcopper") ?? 0) >= 1) {
                for (const [base, demote] of osmosisMap) {
                    if ((atoms.get(base) ?? 0) >= 1) {
                        let BWTM = [];
                        if (demote == "vaca") {
                            if (!allowedTransformations.has("Glyph of Extraction")) {
                                continue;
                            }
                            BWTM.push("Glyph of Extraction");
                        }
                        t.push({
                            inputs: ["quickcopper", base],
                            wheelInputs: null,
                            outputs: ["quicksilver", demote],
                            wheelOutputs: null,
                            group: 0,
                            requires: BWTM
                        });
                    }
                }
                if ((activeWheels & wheelTypeTable.ravari.flag) != 0n) {
                    for (let i = 0; i < 6; i++) {
                        let demote = osmosisMap.get(wheels[wheelTypeTable.ravari.type].atoms[i]);
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
                                wheelInputs: [wheelInput(wheelTypeTable.ravari.type, i)],
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
                    for (const [base, demote] of osmosisMap) {
                        if ((atoms.get(base) ?? 0) >= 1) {
                            let BWTM = [];
                            if (demote == "vaca") {
                                if (!allowedTransformations.has("Glyph of Extraction")) {
                                    continue;
                                }
                                BWTM.push("Glyph of Extraction");
                            }
                            t.push({
                                inputs: [base],
                                wheelInputs: [wheelInput(wheelTypeTable.soria.type, i)],
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
                            let demote = osmosisMap.get(wheels[wheelTypeTable.ravari.type].atoms[j]);
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
                                    wheelInputs: [wheelInput(wheelTypeTable.soria.type, i), wheelInput(wheelTypeTable.ravari.type, j)],
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
                                wheelInputs: [wheelInput(wheelTypeTable.soria.type, i), wheelInput(wheelTypeTable.soria.type, (i + dir) % 6)],
                                outputs: [],
                                wheelOutputs: ["quickcopper", "quickcopper"],
                                group: 4
                            });
                        } else if (wheels[wheelTypeTable.soria.type].atoms[i] == "quickcopper" && wheels[wheelTypeTable.soria.type].atoms[(i + dir) % 6] == "quickcopper") {
                            t.push({
                                inputs: [],
                                wheelInputs: [wheelInput(wheelTypeTable.soria.type, i), wheelInput(wheelTypeTable.soria.type, (i + dir) % 6)],
                                outputs: [],
                                wheelOutputs: ["quicklime", "quicksilver"],
                                group: 4
                            });
                        }
                    }
                }
            }
            if ((atoms.get("quicksilver") ?? 0) >= 1) {
                if ((atoms.get("quicklime") ?? 0) >= 1) {
                    t.push({
                        inputs: ["quicksilver", "quicklime"],
                        wheelInputs: null,
                        outputs: ["quickcopper", "quickcopper"],
                        wheelOutputs: null,
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
                            wheelInputs: [wheelInput(wheelTypeTable.soria.type, i)],
                            outputs: ["quickcopper"],
                            wheelOutputs: ["quickcopper"],
                            group: 6
                        });
                    }
                }
            }
            if ((activeWheels & wheelTypeTable.soria.flag) != 0n) {
                if ((atoms.get("quicklime") ?? 0) >= 1) {
                    for (let i = 0; i < 6; i++) {
                        if (wheels[wheelTypeTable.soria.type].atoms[i] != "quicksilver") {
                            continue;
                        }
                        t.push({
                            inputs: ["quicklime"],
                            wheelInputs: [wheelInput(wheelTypeTable.soria.type, i)],
                            outputs: ["quickcopper"],
                            wheelOutputs: ["quickcopper"],
                            group: 7
                        });
                    }
                }
            }

            return t;
        }
    },/* Noble Elements */ {
        name: "Glyph of Coronation",
        groups: ["Coronate"],
        transforms: () => {
            let t = [];
            for (const a of noblesList) {
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
                ;
                for (const n of noblesList) {
                    if ((atoms.get(n) ?? 0) >= 1) {
                        for (let j = 0; j < 2; j++) {
                            let aJ = noblesList[j];
                            for (let k = j + 1; k < 3; k++) {
                                let aK = noblesList[k];
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
    }, /* Reductive Metallurgy */ {
        name: "Glyph of Rejection",
        groups: ["Reject metal", "Reject metal into Ravari's wheel", "Reject Ravari's wheel", "Transfer around Ravari's wheel"],
        transforms: () => {
            let t = [];
            for (const [base, demote] of rejectionMap) {
                let BWTM = [];
                if (demote == "vaca") {
                    if (!allowedTransformations.has("Glyph of Extraction")) {
                        continue;
                    }
                    BWTM.push("Glyph of Extraction");
                }
                if ((atoms.get(base) ?? 0) >= 1) {
                    t.push({
                        inputs: [base],
                        wheelInputs: null,
                        outputs: ["quicksilver", demote],
                        wheelOutputs: null,
                        group: 0,
                        requires: BWTM
                    });
                }
            }
            if ((activeWheels & wheelTypeTable.ravari.flag) != 0n) {
                for (let i = 0; i < 6; i++) {
                    let promote = projectionMap.get(wheels[wheelTypeTable.ravari.type].atoms[i]);
                    if (promote) {
                        for (const [base, demote] of rejectionMap) {
                            let BWTM = [];
                            if (demote == "vaca") {
                                if (!allowedTransformations.has("Glyph of Extraction")) {
                                    continue;
                                }
                                BWTM.push("Glyph of Extraction");
                            }
                            if ((atoms.get(base) ?? 0) >= 1) {
                                t.push({
                                    inputs: [base],
                                    wheelInputs: [wheelInput(wheelTypeTable.ravari.type, i)],
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
                    let demote = rejectionMap.get(wheels[wheelTypeTable.ravari.type].atoms[i]);
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
                            wheelInputs: [wheelInput(wheelTypeTable.ravari.type, i)],
                            outputs: ["quicksilver"],
                            wheelOutputs: [demote],
                            group: 2,
                            requires: BWTM
                        });
                    }
                }
                for (const dir of [1, 5]) {
                    for (let i = 0; i < 6; i++) {
                        let demote = rejectionMap.get(wheels[wheelTypeTable.ravari.type].atoms[i]);
                        let BWTM = [];
                        if (demote == "vaca") {
                            if (!allowedTransformations.has("Glyph of Extraction")) {
                                continue;
                            }
                            BWTM.push("Glyph of Extraction");
                        }
                        let promote = projectionMap.get(wheels[wheelTypeTable.ravari.type].atoms[(i + dir) % 6]);
                        if (promote && demote) {
                            t.push({
                                inputs: [],
                                wheelInputs: [wheelInput(wheelTypeTable.ravari.type, i), wheelInput(wheelTypeTable.ravari.type, (i + dir) % 6)],
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
            for (const [base, split] of depositionMap.entries()) {
                let BWTM = [];
                if (base == "lead") {
                    if (!allowedTransformations.has("Glyph of Extraction")) {
                        continue;
                    }
                    BWTM.push("Glyph of Extraction");
                }
                if ((atoms.get(base) ?? 0) >= 1) {
                    t.push({
                        inputs: [base],
                        wheelInputs: null,
                        outputs: split,
                        wheelOutputs: null,
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
            if ((atoms.get("quicksilver") ?? 0) >= 1) {
                for (const m of metalsList) {
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
                            wheelInputs: [wheelInput(wheelTypeTable.ravari.type, i)],
                            outputs: [wheels[wheelTypeTable.ravari.type].atoms[i]],
                            wheelOutputs: [wheels[wheelTypeTable.ravari.type].atoms[i]],
                            group: 1
                        });
                    }
                }
            }
            if ((activeWheels & wheelTypeTable.ravari.flag) != 0n) {
                for (let i = 0; i < 6; i++) {
                    let demote = rejectionMap.get(wheels[wheelTypeTable.ravari.type].atoms[i]);
                    if (demote == "vaca") {
                        continue;
                    }
                    if (demote) {
                        for (const m of metalsList) {
                            if ((atoms.get(m) ?? 0) >= 1) {
                                t.push({
                                    inputs: [m],
                                    wheelInputs: [wheelInput(wheelTypeTable.ravari.type, i)],
                                    outputs: [m, m],
                                    wheelOutputs: [demote],
                                    group: 2
                                });
                            }
                        }
                    }
                }
                for (const dir in [, 5]) {
                    for (let i = 0; i < 6; i++) {
                        let demote = rejectionMap.get(wheels[wheelTypeTable.ravari.type].atoms[i]);
                        if (demote == "vaca") {
                            continue;
                        }
                        if (demote) {
                            t.push({
                                inputs: [],
                                wheelInputs: [wheelInput(wheelTypeTable.ravari.type, i), wheelInput(wheelTypeTable.ravari.type, (i + dir) % 6)],
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
    }, /* True Animismus */ {
        name: "Glyph of Disproportion",
        groups: ["Wheelless", "Herriman's wheel captures dilute", "Herriman's wheel captures potent"],
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
                for (const dir of [1, 5]) {
                    for (let i = 0; i < 6; i++) {
                        for (const [equals, divided] of disproportionMap.entries()) {
                            if ((atoms.get(equals) ?? 0) >= 1) {
                                let wheelDilute = strengthToAnimismusMap.get(animismusToStrengthMap.get(wheels[wheelTypeTable.herriman.type].atoms[i]) - animismusToStrengthMap.get(equals));
                                let wheelConcentrate = strengthToAnimismusMap.get(animismusToStrengthMap.get(wheels[wheelTypeTable.herriman.type].atoms[(i + dir) % 6]) + animismusToStrengthMap.get(divided[1]));
                                if (wheelDilute && wheelConcentrate) {
                                    t.push({
                                        inputs: [equals],
                                        wheelInputs: [wheelInput(wheelTypeTable.herriman.type, i), wheelInput(wheelTypeTable.herriman.type, (i + dir) % 6)],
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
                        for (const [equals, divided] of disproportionMap.entries()) {
                            if ((atoms.get(equals) ?? 0) >= 1) {
                                let wheelDilute = strengthToAnimismusMap.get(animismusToStrengthMap.get(wheels[wheelTypeTable.herriman.type].atoms[i]) - animismusToStrengthMap.get(equals));
                                let wheelConcentrate = strengthToAnimismusMap.get(animismusToStrengthMap.get(wheels[wheelTypeTable.herriman.type].atoms[(i + dir) % 6]) + animismusToStrengthMap.get(divided[0]));
                                if (wheelDilute && wheelConcentrate) {
                                    t.push({
                                        inputs: [equals],
                                        wheelInputs: [wheelInput(wheelTypeTable.herriman.type, i), wheelInput(wheelTypeTable.herriman.type, (i + dir) % 6)],
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
        groups: ["Transfer between atoms", "Concentrate Herriman's wheel", "Dilute Herriman's wheel", "Distribute around Herriman's wheel"],
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
                    let strength = animismusToStrengthMap.get(wheels[wheelTypeTable.herriman.type].atoms[i]);
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
                                wheelInputs: [wheelInput(wheelTypeTable.herriman.type, i)],
                                outputs: [dilute],
                                wheelOutputs: [concentrate],
                                group: 1
                            });
                        }
                    }
                }
                for (let i = 0; i < 6; i++) {
                    let strength = animismusToStrengthMap.get(wheels[wheelTypeTable.herriman.type].atoms[i]);
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
                                wheelInputs: [wheelInput(wheelTypeTable.herriman.type, i)],
                                outputs: [concentrate],
                                wheelOutputs: [dilute],
                                group: 2
                            });
                        }
                    }
                }
                for (const dir of [1, 5]) {
                    for (let i = 0; i < 6; i++) {
                        let toDiluteStrength = animismusToStrengthMap.get(wheels[wheelTypeTable.herriman.type].atoms[i]);
                        let toConcentrateStrength = animismusToStrengthMap.get(wheels[wheelTypeTable.herriman.type].atoms[(i + dir) % 6]);
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
                            wheelInputs: [wheelInput(wheelTypeTable.herriman.type, i), wheelInput(wheelTypeTable.herriman.type, (i + dir) % 6)],
                            outputs: [],
                            wheelOutputs: [dilute, concentrate],
                            group: 3
                        });
                    }
                }
            }
            return t;
        }
    }, /* Unstable Elements */ {
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
    }, /* Vacancy */ {
        name: "Glyph of Hollowing",
        groups: ["Dude, you need to dust in here"],
        transforms: () => {
            let t = [];
            t.push({
                inputs: [],
                wheelInputs: null,
                outputs: ["vaca"],
                wheelOutputs: null,
                group: 0
            });
            if ((atoms.get("vaca") ?? 0) >= 1) {
                t.push({
                    inputs: ["vaca"],
                    wheelInputs: null,
                    outputs: [],
                    wheelOutputs: null,
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