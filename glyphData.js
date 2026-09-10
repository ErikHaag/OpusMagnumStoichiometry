// @ts-check

class GlyphData {
    /** @type {Array<Wheel>} */
    static wheels = [];
    /** @type {Array<Glyph>} */
    static glyphs = [];

    /**
     * @param {string} id
     */
    static getGlyphFromId(id) {
        return GlyphData.glyphs.find((g) => g.id == id);
    }

    /**
     * @param {string} id
     */
    static getWheelFromId(id) {
        return GlyphData.wheels.find((w) => w.id == id);
    }

    static reset() {
        GlyphData.wheels = [];
        GlyphData.glyphs = [];
    }

    static installOpusMagnum() {
        GlyphData.wheels.push(
            new Wheel(
                "opus_magnum",
                "berlo",
                "Van Berlo's Wheel",
                "By using Van Berlo's Wheel with the glyph of duplication, salt can be turned into any of the four cardinal elements.",
                ["opus_magnum:water", "opus_magnum:salt", "opus_magnum:earth", "opus_magnum:fire", "opus_magnum:salt", "opus_magnum:air"],
                true
            )
        );
        let calcification = new Glyph(
            "opus_magnum",
            "calcification",
            "Glyph of Calcification",
            "The glyph of calcification transmutes any of the four cardinals elements into salt."
        );
        calcification.transmutations.push(
            ...["opus_magnum:air", "opus_magnum:earth", "opus_magnum:fire", "opus_magnum:water"]
                .map(e => new Transmutation([e], ["opus_magnum:salt"], []).setVanilla())
        )
        GlyphData.glyphs.push(calcification);

        let duplication = new Glyph(
            "opus_magnum",
            "duplication",
            "Glyph of Duplication",
            "The glyph of duplication imbues salt with the essence of an existing cardinal."
        );
        duplication.transmutations.push(
            ...["opus_magnum:air", "opus_magnum:earth", "opus_magnum:fire", "opus_magnum:water"].map(e => new Transmutation(
                [e, "opus_magnum:salt"],
                [e, e],
                []
            ).setVanilla()),
            ...Array.from({ length: 6 }, (v, i) => ["opus_magnum:air", "opus_magnum:earth", "opus_magnum:fire", "opus_magnum:water"]
                .map(e => new Transmutation(["opus_magnum:salt"],
                    [e],
                    [
                        new WheelTransmutation("opus_magnum:berlo", [i], [e], [e])
                    ]
                ).setVanilla())
            ).flat()
        );
        GlyphData.glyphs.push(duplication);

        
    }

}