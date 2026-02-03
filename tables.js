const atomSectionTable = [
    { type: "section", name: "Opus Magnum" },
    { type: "atom", name: "salt" },
    { type: "atom", name: "air" },
    { type: "atom", name: "earth" },
    { type: "atom", name: "fire" },
    { type: "atom", name: "water" },
    { type: "atom", name: "quintessence" },
    { type: "atom", name: "mors" },
    { type: "atom", name: "vitae" },
    { type: "atom", name: "quicksilver" },
    { type: "atom", name: "lead" },
    { type: "atom", name: "tin" },
    { type: "atom", name: "iron" },
    { type: "atom", name: "copper" },
    { type: "atom", name: "silver" },
    { type: "atom", name: "gold" },
    { type: "section", name: "Complicated Elements" },
    { type: "atom", name: "aerolith" },
    { type: "atom", name: "ignistal" },
    { type: "atom", name: "mistaline" },
    { type: "atom", name: "pyrolite" },
    { type: "atom", name: "terramarine" },
    { type: "atom", name: "vaprorine" },
    { type: "section", name: "Halving Metallurgy" },
    { type: "atom", name: "quicklime" },
    { type: "atom", name: "quickcopper" },
    { type: "atom", name: "beryl" },
    { type: "atom", name: "wolfram" },
    { type: "atom", name: "vulcan" },
    { type: "atom", name: "nickel" },
    { type: "atom", name: "zinc" },
    { type: "atom", name: "sednum" },
    { type: "atom", name: "osmium" },
    { type: "section", name: "Noble Elements" },
    { type: "atom", name: "nobilis" },
    { type: "atom", name: "alpha" },
    { type: "atom", name: "beta" },
    { type: "atom", name: "gamma" },
    { type: "section", name: "True Animismus" },
    { type: "atom", name: "greyMors" },
    { type: "atom", name: "redVitae" },
    { type: "atom", name: "trueMors" },
    { type: "atom", name: "trueVitae" },
    { type: "section", name: "Unstable Elements" },
    { type: "atom", name: "aether" },
    { type: "atom", name: "uranium" },
    { type: "section", name: "Vacancy" },
    { type: "atom", name: "vaca" }
];

const moddedAtomIndex = atomSectionTable.findIndex((e) => e.type == "section" && e.name != "Opus Magnum");

// display ordering
const atomTypes = [
    "trueMors",
    "greyMors",
    "mors",
    "salt",
    "vitae",
    "redVitae",
    "trueVitae",
    "air",
    "earth",
    "fire",
    "water",
    "aerolith",
    "ignistal",
    "mistaline",
    "pyrolite",
    "terramarine",
    "vaprorine",
    "quintessence",
    "quicklime",
    "quickcopper",
    "quicksilver",
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
    "osmium",
    "nobilis",
    "alpha",
    "beta",
    "gamma",
    "uranium",
    "aether"
];

const atomTypesSVGNames = atomTypes.map((s) => s.replace(/([a-z])([A-Z])/g, (s, a, b) => a + "_" + b.toLowerCase()));

const initialWheelTable = [
    {
        name: "Van Berlo's Wheel",
        atoms: ["water", "salt", "earth", "fire", "salt", "air"]
    },
    {
        name: "Soria's Wheel",
        atoms: ["quicksilver", "quickcopper", "quicksilver", "quickcopper", "quicksilver", "quickcopper"]
    },
    {
        name: "Ravari's Wheel",
        atoms: ["lead", "tin", "iron", "copper", "silver", "gold"]
    },
    {
        name: "Herriman's Wheel",
        atoms: ["trueVitae", "redVitae", "vitae", "mors", "greyMors", "trueMors"]
    }
];

let wheelTypeTable = {};

{
    let wTT = new Map();
    let nameRegex = /(\w+?)(?:'s)? Wheel$/;
    
    let i = 0;
    let f = 1n;
    for (const w of initialWheelTable) {
        let n = nameRegex.exec(w.name);
        wTT.set(n[1].toLowerCase(), {type: i, flag: f});
        i++;
        f <<= 1n;
    }
    wheelTypeTable = Object.fromEntries(wTT);
}