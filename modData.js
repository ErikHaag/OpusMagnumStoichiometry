/**
 * @typedef {object} ModDependency
 * @prop {Array<string>=} requirements
 * @prop {Array<string>=} incompatiblities
 * @prop {Array<string>=} processFirst
 */

// @ts-check

class ModData {
    static modList = [
        "opus_magnum",
        "de_re_metallica",
        "alchemical_inversions",
        "complicated_elements",
        "extransmutations",
        "false_aether",
        "fanolytics",
        "halving_metallurgy",
        "impetallurgy",
        "magnus_animismus",
        "metal_quintessence",
        "neuvolics",
        "noble_elements",
        "prima_cyclia",
        "prima_materia",
        "reductive_metallurgy",
        "sennmetals",
        "true_animismus",
        "true_salt",
        "uncommon_primes",
        "unstable_elements",
        "vacancy"
    ];

    /** @type {Map<string, ModDependency>} */
    static modDependencies = new Map([
        ["de_re_metallica", { incompatiblities: ["reductive_metallurgy"] }],
        ["extransmutations", { processFirst: ["", "uncommon_primes"] }],
        ["reductive_metallurgy", { incompatiblities: ["de_re_metallica"] }],
        ["halving_metallurgy", { processFirst: ["reductive_metallurgy", "vacancy"] }],
        ["magnus_animismus", { requirements: ["true_animismus"] }],
        ["vacancy", { requirements: ["reductive_metallurgy"] }]
    ]);


    /** @type {Set<string>} */
    static activeMods = new Set();
    /** @type {Set<string>} */
    static activeWheels = new Set();
    /** @type {Set<string>} */
    static activeGlyphs = new Set(["opus_magnum:calcification"]);

    /**
     * @param {string} mod
     */
    static propagateLoad(mod, considerSelf = false) {
        if (ModData.activeMods.has(mod)) {
            return false;
        }
        ModData.activeMods.add(mod)
        let change = considerSelf;
        let dependencies = ModData.modDependencies.get(mod);
        if (dependencies == undefined) {
            return change;
        }
        for (let incomp of dependencies.incompatiblities ?? []) {
            change = ModData.propagateUnload(incomp, true) || change;
        }
        for (let req of dependencies.requirements ?? []) {
            change = ModData.propagateLoad(req, true) || change;
        }
        return change;
    }

    /**
     * @param {string} mod
     */
    static propagateUnload(mod, considerSelf = false) {
        if (!ModData.activeMods.delete(mod)) {
            return false;
        }
        let change = considerSelf;
        for (let m of ModData.activeMods) {
            let dependencies = ModData.modDependencies.get(m);
            if (dependencies == undefined) {
                continue;
            }
            if (dependencies.requirements?.includes(mod) ?? false) {
                change = ModData.propagateUnload(m, true) || change;
            }
        }
        return change;
    }

    /** @type {Set<string>} */
    static usableAtomTypes = new Set();
    /** @type {Array<Wheel>} */
    static usableWheels = [];
    /** @type {Array<Glyph>} */
    static usableGlyphs = [];

    /**
     * @param {string} id
     */
    static getGlyphFromId(id) {
        return ModData.usableGlyphs.find((g) => g.id == id);
    }

    /**
     * @param {string} id
     */
    static getWheelFromId(id) {
        return ModData.usableWheels.find((w) => w.id == id);
    }

    static reset() {
        ModData.usableAtomTypes.clear();
        ModData.usableWheels = [];
        ModData.usableGlyphs = [];
        ModData.installOpusMagnum();
        let toLoad = Array.from(ModData.activeMods.values());
        outer: while (toLoad.length > 0) {
            /** @type {string} */
            // @ts-ignore
            let mod = toLoad.shift();
            let dependencies = ModData.modDependencies.get(mod);
            if (dependencies != undefined) {
                let mustBeLoaded = (dependencies.requirements ?? []).concat(dependencies.processFirst ?? []);
                for (let m of mustBeLoaded) {
                    if (toLoad.includes(m)) {
                        toLoad.push(mod);
                        continue outer;
                    }
                }
            }
            const installMod = `install${Utilities.snakeToTitle(mod).replaceAll(" ", "")}`;
            // @ts-ignore
            const installFunction = ModData[installMod];
            if (typeof (installFunction) == 'function') {
                installFunction();
            } else {
                console.error(`No function exists: \"${installMod}\"`);
            }
        }
        for (let g of ModData.usableGlyphs) {
            g.cleanup();
        }

        // discard any glyph with no transmutation attached
        o: for (let i = 0; i < ModData.usableGlyphs.length; i++) {
            if (ModData.usableGlyphs[i].transmutations.length != 0) {
                continue;
            }
            let search = ModData.usableGlyphs[i].id;
            for (let j of ModData.usableGlyphs) {
                for (let k of j.transmutations) {
                    if (k.otherGlyphs.includes(search)) {
                        continue o;
                    }
                }
            }
            ModData.usableGlyphs.splice(i--, 1);
        }

        for (let reagent of OMSC.reagents) {
            for (let [k, v] of reagent.atoms.entries()) {
                if (v == 0n || !ModData.usableAtomTypes.has(k)) {
                    reagent.atoms.delete(k);
                }
            }
        }
        for (let product of OMSC.products) {
            for (let [k, v] of product.atoms.entries()) {
                if (v == 0n || !ModData.usableAtomTypes.has(k)) {
                    product.atoms.delete(k);
                }
            }
        }
        let ids = ModData.usableGlyphs.map(g => g.id);
        for (let g of ModData.activeGlyphs) {
            if (!ids.includes(g)) {
                ModData.activeGlyphs.delete(g);
            }
        }
        ids = ModData.usableWheels.map(w => w.id);
        for (let w of ModData.activeWheels) {
            if (!ids.includes(w)) {
                ModData.activeWheels.delete(w);
            }
        }
    }

    static installOpusMagnum() {
        const addedAtoms = AtomType.atomTypes.filter(a => a.identifier.namespace == "opus_magnum").map(a => a.toString());
        addedAtoms.forEach(a => ModData.usableAtomTypes.add(a));


        ModData.usableWheels.push(
            new Wheel(
                "opus_magnum",
                "berlo",
                "Van Berlo's Wheel",
                "By using Van Berlo's Wheel with the glyph of duplication, salt can be turned into any of the four cardinal elements.",
                ["opus_magnum:water", "opus_magnum:salt", "opus_magnum:earth", "opus_magnum:fire", "opus_magnum:salt", "opus_magnum:air"],
                true
            )
        );


        let bonding = new Glyph(
            "opus_magnum",
            "bonder",
            "Glyph of Bonding",
            "The glyph of bonding creates a single bond."
        );

        ModData.usableGlyphs.push(bonding);


        let multibonding = new Glyph(
            "opus_magnum",
            "multibonder",
            "Glyph of Multibonding",
            "The glyph of multibonding can create up to three bonds at once."
        );

        ModData.usableGlyphs.push(multibonding);

        let triplexbonder = new Glyph(
            "opus_magnum",
            "triplex_bonder",
            "Glyph of Triplex Bonding",
            "The glyph of triplex bonding creates 3 special bonds that; when overlaid, create a complete triplex bond"
        );

        ModData.usableGlyphs.push(triplexbonder);

        const cardinals = ["opus_magnum:air", "opus_magnum:earth", "opus_magnum:fire", "opus_magnum:water"];

        let calcification = new Glyph(
            "opus_magnum",
            "calcification",
            "Glyph of Calcification",
            "The glyph of calcification transmutes any of the four cardinals elements into salt."
        );

        calcification.appendTransmutations(
            cardinals.map(e => new Transmutation([e], ["opus_magnum:salt"]))
        )

        ModData.usableGlyphs.push(calcification);


        let duplication = new Glyph(
            "opus_magnum",
            "duplication",
            "Glyph of Duplication",
            "The glyph of duplication imbues salt with the essence of an existing cardinal."
        );

        duplication.appendTransmutations(
            cardinals.map(e => new Transmutation(
                [e, "opus_magnum:salt"],
                [e, e]
            ))
        );

        for (let i = 0; i < 6; i++) {
            duplication.appendTransmutations(
                cardinals.map(e => new Transmutation(["opus_magnum:salt"],
                    [e],
                    [
                        new WheelTransmutation("opus_magnum:berlo", [i], [e], [e])
                    ]
                ))
            );
        }

        ModData.usableGlyphs.push(duplication);


        const metals = ["opus_magnum:lead", "opus_magnum:tin", "opus_magnum:iron", "opus_magnum:copper", "opus_magnum:silver", "opus_magnum:gold"];

        let projection = new Glyph(
            "opus_magnum",
            "projection",
            "Glyph of Projection",
            "The glyph of projection consumes an atom of quicksilver to promote a metal to its next higher form."
        );

        for (let i = 0; i < 5; i++) {
            projection.appendTransmutations(
                new Transmutation(
                    ["opus_magnum:quicksilver", metals[i]],
                    [metals[i + 1]]
                )
            )
        }

        ModData.usableGlyphs.push(projection);


        let purification = new Glyph(
            "opus_magnum",
            "purification",
            "Glyph of Purification",
            "The glyph of purification transmutes two atoms of the same metal into a single atom of their next higher form."
        );

        for (let i = 0; i < 5; i++) {
            purification.appendTransmutations(
                new Transmutation(
                    [metals[i], metals[i]],
                    [metals[i + 1]]
                )
            );
        }

        ModData.usableGlyphs.push(purification);


        let animismus = new Glyph(
            "opus_magnum",
            "animismus",
            "Glyph of Animismus",
            "The glyph of animismus transmutes two atoms of salt into one atom of vitae and one atom of mors."
        )

        animismus.appendTransmutations(
            new Transmutation(
                ["opus_magnum:salt", "opus_magnum:salt"],
                ["opus_magnum:mors", "opus_magnum:vitae"]
            )
        )

        ModData.usableGlyphs.push(animismus);


        let disposal = new Glyph(
            "opus_magnum",
            "disposal",
            "Glyph of Disposal",
            "The glyph of disposal removes unneeded atoms from the board."
        );

        disposal.appendTransmutations(addedAtoms.map((a) => new Transmutation([a], [])));

        ModData.usableGlyphs.push(disposal);

        let wasteChain = new Glyph(
            "opus_magnum",
            "waste_chain",
            "Waste Chain",
            "Waste chaining pushes atoms out of reach."
        );

        wasteChain.appendTransmutations(addedAtoms.flatMap((a) => ["opus_magnum:bonder", "opus_magnum:multibonder"].map((b) => new Transmutation([a], [], [], [b]))));

        ModData.usableGlyphs.push(wasteChain);

        let unification = new Glyph(
            "opus_magnum",
            "unification",
            "Glyph of Unification",
            "The glyph of unification transmutes the four cardinal elements into quintessence"
        );

        unification.appendTransmutations(new Transmutation(
            cardinals,
            ["opus_magnum:quintessence"]
        ));

        ModData.usableGlyphs.push(unification);


        let dispersion = new Glyph(
            "opus_magnum",
            "dispersion",
            "Glyph of Dispersion",
            "The glyph of dispersion transmutes an atom of quintessence into the four cardinals."
        )

        dispersion.appendTransmutations(new Transmutation(
            ["opus_magnum:quintessence"],
            cardinals
        ));

        ModData.usableGlyphs.push(dispersion);
    }

    static installDeReMetallica() {
        const metals = ["opus_magnum:lead", "opus_magnum:tin", "opus_magnum:iron", "opus_magnum:copper", "opus_magnum:silver", "opus_magnum:gold"];

        let ravari = new Wheel(
            "de_re_metallica",
            "ravari",
            "Ravari's Wheel",
            "By using Ravari's wheel with the glyph of proliferation, quicksilver can be turned into any of the six metals.",
            [...metals],
            true
        );

        ModData.usableWheels.push(ravari);

        let rejection = new Glyph(
            "de_re_metallica",
            "rejection",
            "Glyph of Rejection",
            "The glyph of rejection extracts an atom of quicksilver from an atom of metal and demotes it to its next lower form."
        );

        for (let i = 1; i < 6; i++) {

            rejection.appendTransmutations(
                new Transmutation(
                    [metals[i]],
                    [metals[i - 1], "opus_magnum:quicksilver"]
                )
            );
        }

        ModData.usableGlyphs.push(rejection);

        let division = new Glyph(
            "de_re_metallica",
            "division",
            "Glyph of Division",
            "The glyph of divison splits an atom of metal into two lower forms according to its metallicity."
        )

        for (let i = 1; i < 6; i++) {
            division.appendTransmutations(new Transmutation(
                [metals[i]],
                [metals[i >> 1], metals[(i - 1) >> 1]]
            ));

        }

        ModData.usableGlyphs.push(division);

        let proliferation = new Glyph(
            "de_re_metallica",
            "proliferationm",
            "Glyph of Proliferation",
            "The glyph of proliferation transmutes an atom of quicksilver into an atom of metal with the same metallicity as an existing metal."
        );

        proliferation.appendTransmutations(
            metals.map((m) => new Transmutation(
                ["opus_magnum:quicksilver", m],
                [m, m]
            )
            )
        )

        for (let i = 0; i < 6; i++) {
            proliferation.appendTransmutations(
                metals.map((m) => new Transmutation(
                    ["opus_magnum:quicksilver"],
                    [m],
                    [
                        new WheelTransmutation(
                            "de_re_metallica:ravari",
                            [i],
                            [m],
                            [m]
                        )
                    ]
                ))
            );
        }

        ModData.usableGlyphs.push(proliferation);
    }

    static installAlchemicalInversions() {

        const addedAtoms = AtomType.atomTypes.filter((a) => a.identifier.namespace == "alchemical_inversions").map(a => a.toString());
        addedAtoms.forEach((a) => ModData.usableAtomTypes.add(a));

        const antimetals = ["anti_gold", "anti_silver", "anti_copper", "anti_iron", "anti_tin", "anti_lead"].map((s) => `alchemical_inversions:${s}`);

        let projection = ModData.getGlyphFromId("opus_magnum:projection");
        if (projection != undefined) {
            for (let i = 0; i < 5; i++) {
                projection.appendTransmutations(new Transmutation(
                    ["opus_magnum:quicksilver", antimetals[i]],
                    [antimetals[i + 1]]
                ));
            }
        }

        let purification = ModData.getGlyphFromId("opus_magnum:purification");
        if (purification != undefined) {
            for (let i = 0; i < 5; i++) {
                purification.appendTransmutations(new Transmutation(
                    [antimetals[i], antimetals[i]],
                    [antimetals[i + 1]]
                ));
            }
            purification.appendTransmutations(new Transmutation(
                ["alchemical_inversions:yttrium", "alchemical_inversions:yttrium"],
                ["opus_magnum:lead"]
            ));
        }

        let disposal = ModData.getGlyphFromId("opus_magnum:disposal");
        if (disposal != undefined) {
            disposal.appendTransmutations(addedAtoms.map(a => new Transmutation(
                [a],
                []
            )));
        }

        let wasteChain = ModData.getGlyphFromId("opus_magnum:waste_chain");
        if (wasteChain != undefined) {
            wasteChain.appendTransmutations(addedAtoms.flatMap((a) => ["opus_magnum:bonder", "opus_magnum:multibonder"].map((b) => new Transmutation([a], [], [], [b]))));
        }

        let recession = new Glyph(
            "alchemical_inversions",
            "recession",
            "Glyph of Recession",
            "The glyph of recession takes in two metals and redistributes their metallicity. rendering them as close to equivalent as possible."
        )

        const metals = antimetals.concat(["alchemical_inversions:yttrium", "opus_magnum:lead", "opus_magnum:tin", "opus_magnum:iron", "opus_magnum:copper", "opus_magnum:silver", "opus_magnum:gold"])

        for (let i = 0; i < 13; i++) {
            for (let j = i; j < 13; j++) {
                let sum = i + j;
                let outputL = sum >> 1;
                let outputG = (sum + 1) >> 1;
                if (outputL == 6 || outputG == 6) {
                    // diverge from yttrium
                    outputL--;
                    outputG++;
                }
                recession.appendTransmutations(new Transmutation(
                    [metals[i], metals[j]],
                    [metals[outputL], metals[outputG]]
                ));
            }
        }

        ModData.usableGlyphs.push(recession);

        let conglomeration = new Glyph(
            "alchemical_inversions",
            "conglomeration",
            "Glyph of Conglomeration",
            "The glyph of conglomeration transmutes one atom of vitae and one atom of mors into one atom of tenebrivex."
        );

        conglomeration.appendTransmutations(new Transmutation(
            ["opus_magnum:mors", "opus_magnum:vitae"],
            ["alchemical_inversions:tenebrivex"]
        ))

        ModData.usableGlyphs.push(conglomeration);

        let transposal = new Glyph(
            "alchemical_inversions",
            "transposal",
            "Glyph of Trasposal",
            "The glyph of transposal consumes an atom of tenebrivex to invert a compatible atom."
        );

        const cardinalTransposals = ["opus_magnum:mors", "opus_magnum:earth", "opus_magnum:water", "opus_magnum:salt", "alchemical_inversions:tenebrivex", "opus_magnum:fire", "opus_magnum:air", "opus_magnum:vitae"];

        for (let i = 0; i <= 12; i++) {
            transposal.appendTransmutations(new Transmutation(
                ["alchemical_inversions:tenebrivex", metals[i]],
                [metals[12 - i]]
            ));
        }

        for (let i = 0; i <= 7; i++) {
            transposal.appendTransmutations(new Transmutation(
                ["alchemical_inversions:tenebrivex", cardinalTransposals[i]],
                [cardinalTransposals[7 - i]]
            ));
        }

        ModData.usableGlyphs.push(transposal);

        let corrosion = new Glyph(
            "alchemical_inversions",
            "corrosion",
            "Glyph of Corrosion",
            "The glyph of corrosion consumes a normal metal and an antimetal to create a single atom with their combined metallicity."
        );

        for (let i = 0; i <= 6; i++) {
            for (let j = 0; j <= 6; j++) {
                corrosion.appendTransmutations(new Transmutation(
                    [metals[6 - i], metals[j + 6]],
                    [metals[12 + j - i]]
                ))
            }
        }

        ModData.usableGlyphs.push(corrosion);


        let concatenation = new Glyph(
            "alchemical_inversions",
            "concatenation",
            "Glyph of Concatenation",
            "The glyph of concatenation takes in a yttrium atom and a bonded metal pair, outputting their sum."
        )

        let now = new Date();
        if (now.getMonth() == 2 && now.getDay() == 4) {
            // March 5th
            concatenation.description += "\nYou're a kitty!";
        }

        for (let i = 0; i <= 12; i++) {
            for (let j = i; j <= 12; j++) {
                let sum = i + j - 6;
                if (sum < 0 || 12 < sum) {
                    continue;
                }
                concatenation.appendTransmutations(["opus_magnum:bonder", "opus_magnum:multibonder"].map(b => new Transmutation(
                    ["alchemical_inversions:yttrium", metals[i], metals[j]],
                    [metals[sum]],
                    [],
                    [b]
                )))
            }
        }

        ModData.usableGlyphs.push(concatenation);
    }

    static installComplicatedElements() {
        const addedAtoms = AtomType.atomTypes.filter(a => a.identifier.namespace == "complicated_elements").map(a => a.toString());
        addedAtoms.push("halving_metallurgy:quicklime");
        addedAtoms.forEach(a => ModData.usableAtomTypes.add(a));

        let disposal = ModData.getGlyphFromId("opus_magnum:disposal");
        if (disposal != undefined) {
            disposal.appendTransmutations(addedAtoms.map(a => new Transmutation(
                [a],
                []
            )));
        }

        let wasteChain = ModData.getGlyphFromId("opus_magnum:waste_chain");
        if (wasteChain != undefined) {
            wasteChain.appendTransmutations(addedAtoms.flatMap((a) => ["opus_magnum:bonder", "opus_magnum:multibonder"].map((b) => new Transmutation([a], [], [], [b]))));
        }

        const cardinals = ["opus_magnum:air", "opus_magnum:earth", "opus_magnum:fire", "opus_magnum:water"];
        const crystallines = ["complicated_elements:aerolith", "complicated_elements:ignistal", "complicated_elements:mistaline", "complicated_elements:pyrolite", "complicated_elements:terramarine", "complicated_elements:vaprorine"];

        let fusion = new Glyph(
            "complicated_elements",
            "fusion",
            "Glyph of Fusion",
            "The glyph of fusion accepts two atoms and produces a crystal atom based on their types."
        );

        let k = 0;
        for (let i = 0; i < 3; i++) {
            for (let j = i + 1; j < 4; j++) {
                fusion.appendTransmutations(new Transmutation(
                    [cardinals[i], cardinals[j]],
                    [crystallines[k]]
                ));
                k++;
            }
        }

        for (let i = 0; i < 3; i++) {
            fusion.appendTransmutations(new Transmutation(
                [crystallines[i], crystallines[5 - i]],
                ["opus_magnum:quintessence"]
            ));
        }

        ModData.usableGlyphs.push(fusion);

        let erosion = new Glyph(
            "complicated_elements",
            "erosion",
            "Glyph of Erosion",
            "The glyph of erosion erodes a crystal atom into quicklime."
        );

        erosion.appendTransmutations(crystallines.map(c => new Transmutation(
            [c],
            ["halving_metallurgy:quicklime"]
        )));

        ModData.usableGlyphs.push(erosion);
    }

    static installExtransmutations() {
        ModData.usableAtomTypes.add("extransmutations:ichor");

        let disposal = ModData.getGlyphFromId("opus_magnum:disposal");
        if (disposal != undefined) {
            disposal.appendTransmutations(new Transmutation(
                ["extransmutations:ichor"],
                []
            ));
        }
        // no waste chaining
        


    }

    static installReductiveMetallurgy() {
        const metals = ["opus_magnum:lead", "opus_magnum:tin", "opus_magnum:iron", "opus_magnum:copper", "opus_magnum:silver", "opus_magnum:gold"];

        let ravari = new Wheel(
            "reductive_metallurgy",
            "ravari",
            "Ravari's Wheel",
            "By using Ravari's wheel with the glyphs of projection and rejection, quicksilver can be charged and discharged.",
            [...metals],
            false
        );

        ModData.usableWheels.push(ravari);

        let projection = ModData.getGlyphFromId("opus_magnum:projection");
        if (projection != undefined) {
            for (let i = 0; i < 6; i++) {
                for (let j = 0; j < 5; j++) {
                    projection.appendTransmutations(
                        new Transmutation(
                            ["opus_magnum:quicksilver"],
                            [],
                            [
                                new WheelTransmutation(
                                    "reductive_metallurgy:ravari",
                                    [i],
                                    [metals[j]],
                                    [metals[j + 1]]
                                )
                            ]
                        )

                    );
                }
            }
        }

        let rejection = new Glyph(
            "reductive_metallurgy",
            "rejection",
            "Glyph of Rejection",
            "The glyph of rejection extracts quicksilver to demote an atom of metal to a lower form."
        );

        for (let i = 1; i < 6; i++) {
            rejection.appendTransmutations(
                new Transmutation(
                    [metals[i]],
                    [metals[i - 1], "opus_magnum:quicksilver"]
                )
            )
        }

        for (let i = 0; i < 6; i++) {
            for (let j = 1; j < 6; j++) {
                rejection.appendTransmutations(
                    new Transmutation(
                        [],
                        ["opus_magnum:quicksilver"],
                        [new WheelTransmutation(
                            "reductive_metallurgy:ravari",
                            [i],
                            [metals[j]],
                            [metals[j - 1]]
                        )]
                    )
                )
            }
        }

        ModData.usableGlyphs.push(rejection);

        let deposition = new Glyph(
            "reductive_metallurgy",
            "deposition",
            "Glyph of Deposition",
            "The glyph of deposition can separate an atom of metal into two atoms of lower form."
        );

        for (let i = 1; i < 6; i++) {

            deposition.appendTransmutations(new Transmutation(
                [metals[i]],
                [metals[i >> 1], metals[(i - 1) >> 1]]
            ));
        }

        ModData.usableGlyphs.push(deposition);

        let proliferation = new Glyph(
            "reductive_metallurgy",
            "proliferation",
            "Glyph of Proliferation",
            "The glyph of proliferation consumes quicksilver to proliferate one metal from another."
        );

        for (let metal of metals) {
            proliferation.appendTransmutations(new Transmutation(
                ["opus_magnum:quicksilver", metal],
                [metal, metal]
            ));
        }

        for (let i = 0; i < 6; i++) {
            for (let j = 0; j < 6; j++) {
                proliferation.appendTransmutations(new Transmutation(
                    ["opus_magnum:quicksilver"],
                    [metals[j]],
                    [
                        new WheelTransmutation(
                            "reductive_metallurgy:ravari",
                            [i],
                            [metals[j]],
                            [metals[j]]
                        )
                    ]
                ));
            }
        }

        for (let i = 0; i < 6; i++) {
            for (let j = 0; j < 6; j++) {
                for (let k = 1; k < 6; k++) {
                    proliferation.appendTransmutations(
                        [1, 5].map(l => new Transmutation(
                            [],
                            [metals[j]],
                            [
                                new WheelTransmutation(
                                    "reductive_metallurgy:ravari",
                                    [i, (i + l) % 6],
                                    [metals[j], metals[k]],
                                    [metals[j], metals[k - 1]]
                                )
                            ]
                        )
                        ));
                }
            }
        }

        ModData.usableGlyphs.push(proliferation);
    }
}