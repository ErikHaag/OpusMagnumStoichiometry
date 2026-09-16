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
        ["reductive_metallurgy", { incompatiblities: ["de_re_metallica"] }],
        ["halving_metallurgy", { processFirst: ["reductive_metallurgy", "vacancy"] }],
        ["magnus_animismus", { requirements: ["true_animismus"] }],
        ["vacancy", { requirements: ["reductive_metallurgy"] }]
    ]);


    /** @type {Set<string>} */
    static activeMods = new Set();
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
    static activeAtomTypes = new Set();
    /** @type {Array<Wheel>} */
    static wheels = [];
    /** @type {Array<Glyph>} */
    static glyphs = [];

    /**
     * @param {string} id
     */
    static getGlyphFromId(id) {
        return ModData.glyphs.find((g) => g.id == id);
    }

    /**
     * @param {string} id
     */
    static getWheelFromId(id) {
        return ModData.wheels.find((w) => w.id == id);
    }

    static reset() {
        ModData.activeAtomTypes.clear();
        ModData.wheels = [];
        ModData.glyphs = [];
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
            const installMod = "install" + Utilities.snakeToTitle(mod).replaceAll(" ", "");
            // @ts-ignore
            if (typeof(ModData[installMod]) == 'function') {
                // @ts-ignore
                ModData[installMod]();
            } else {
                console.error("No function exists: \"" + installMod + "\"");
            }
        }
        for (let g of ModData.glyphs) {
            g.cleanup();
        }
    }

    static installOpusMagnum() {
        const addedAtoms = AtomType.atomTypes.filter(a => a.namespace == "opus_magnum").map(a => a.toString());
        addedAtoms.forEach(a => ModData.activeAtomTypes.add(a));


        ModData.wheels.push(
            new Wheel(
                "opus_magnum",
                "berlo",
                "Van Berlo's Wheel",
                "By using Van Berlo's Wheel with the glyph of duplication, salt can be turned into any of the four cardinal elements.",
                ["opus_magnum:water", "opus_magnum:salt", "opus_magnum:earth", "opus_magnum:fire", "opus_magnum:salt", "opus_magnum:air"],
                true
            )
        );
        const cardinals = ["opus_magnum:air", "opus_magnum:earth", "opus_magnum:fire", "opus_magnum:water"];

        let calcification = new Glyph(
            "opus_magnum",
            "calcification",
            "Glyph of Calcification",
            "The glyph of calcification transmutes any of the four cardinals elements into salt."
        );
        calcification.transmutations.push(
            ...cardinals.map(e => new Transmutation([e], ["opus_magnum:salt"]))
        )
        ModData.glyphs.push(calcification);

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
        ModData.glyphs.push(duplication);

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

        ModData.glyphs.push(projection);

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
                    [metals[i+1]]
                )
            );
        }

        ModData.glyphs.push(purification);

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

        ModData.glyphs.push(animismus);

        let disposal = new Glyph(
            "opus_magnum",
            "disposal",
            "Glyph of Disposal / Waste chain",
            "The glyph of disposal removes unneeded atoms from the board / Waste chaining pushes atoms out of reach"
        );

        disposal.appendTransmutations(addedAtoms.map((a) => new Transmutation([a], [])));

        ModData.glyphs.push(disposal);

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
        
        ModData.glyphs.push(unification);

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

        ModData.glyphs.push(dispersion);
    }

    static installDeReMetallica() {
    }
}