// @ts-check

class ModData {
    static modList = [
        "opus_magnum",
        // "de_re_metallica",
        // "alchemical_inversions",
        // "complicated_elements",
        // "extransmutations",
        // "false_aether",
        // "fanolytics",
        // "halving_metallurgy",
        // "impetallurgy",
        // "magnus_animismus",
        // "metal_quintessence",
        // "neuvolics",
        // "noble_elements",
        // "prima_cyclia",
        // "prima_materia",
        "reductive_metallurgy",
        // "sennmetals",
        // "true_animismus",
        // "true_salt",
        // "uncommon_primes",
        // "unstable_elements",
        // "vacancy"
    ];

    /** @type {Set<string>} */
    static atomTypes = new Set();
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
        ModData.atomTypes.clear();
        ModData.wheels = [];
        ModData.glyphs = [];
    }

    static installOpusMagnum() {
        AtomType.atomTypes.filter(a => a.namespace == "opus_magnum").forEach(a => ModData.atomTypes.add(a.toString()));


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
            ...cardinals.map(e => new Transmutation([e], ["opus_magnum:salt"]).setVanilla())
        )
        ModData.glyphs.push(calcification);

        let duplication = new Glyph(
            "opus_magnum",
            "duplication",
            "Glyph of Duplication",
            "The glyph of duplication imbues salt with the essence of an existing cardinal."
        );
        duplication.transmutations.push(
            ...cardinals.map(e => new Transmutation(
                [e, "opus_magnum:salt"],
                [e, e]
            ).setVanilla())
        );
        for (let i = 0; i < 6; i++) {
            duplication.transmutations.push(
                ...cardinals.map(e => new Transmutation(["opus_magnum:salt"],
                    [e],
                    [
                        new WheelTransmutation("opus_magnum:berlo", [i], [e], [e])
                    ]
                ).setVanilla())
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
            projection.transmutations.push(
                new Transmutation(
                    ["opus_magnum:quicksilver", metals[i]],
                    [metals[i + 1]]
                ).setVanilla()
            )
        }

        ModData.glyphs.push(projection);
    }

}