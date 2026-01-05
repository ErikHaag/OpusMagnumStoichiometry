const helpButton = document.getElementById("help");
const helpBox = document.getElementById("helpBox");
const [helpText, closeHelp, nextHelp] = helpBox.children;


const helpList = [
    {
        id: "help",
        side: "above",
        text: "Welcome to the help box, click 'next' to take a tour, hit 'close' at any time to stop."
    },
    {
        id: "help",
        side: "above",
        text: "Let's do a quick overview, there are 4 sections to be concerned with."
    },
    {
        id: "reagentsField",
        side: "above",
        text: "This is the reagents section, reagents are the inputs for doing alchemy."
    },
    {
        id: "productsField",
        side: "above",
        text: "This is the products section, products are the desired outputs."
    },
    {
        id: "settingsField",
        side: "above",
        text: "This is the settings section, it specifies what glyphs are available, and some additional controls."
    },
    {
        id: "plannerField",
        side: "above",
        text: "This is the alchemy planner, use it to create sequences of transmutations, unfettered by arm programming and layout."
    },
    {
        id: "collapseSettings",
        side: "adjacent",
        text: "You can collapse the first 3 sections individually using these buttons."
    },
    {
        id: "addReagent",
        side: "above",
        text: "When you click this button..."
    },
    {
        type: "click",
        id: "addReagent"
    },
    {
        get id() {
            return "molecule_reagent_" + (reagents.length - 1).toFixed(0);
        },
        side: "above",
        text: "a new reagent is created."
    },
    {
        get id() {
            return "name_reagent_" + (reagents.length - 1).toFixed(0);
        },
        side: "under",
        text: "You can change the name"
    },
    {
        get id() {
            return "air_reagent_" + (reagents.length - 1).toFixed(0);
        },
        side: "under",
        text: "and the various atoms present in this molecule, but we don't account for bonds"
    },
    {
        get id() {
            return "remove_reagent_" + (reagents.length - 1).toFixed(0);
        },
        side: "under",
        text: "Click this button to remove it."
    },
    {
        type: "click",
        get id() {
            return "remove_reagent_" + (reagents.length - 1).toFixed(0);
        }  
    },
    {
        id: "productsField",
        side: "above",
        text: "The products section behaves the same way."
    },
    {
        id: "settingsField",
        side: "above",
        text: "Atoms require help to transmute, these helpers are in the form of glyphs and wheels."
    },
    {
        id: "toggle_glyph_0",
        side: "above",
        text: "This column has glyphs"
    },
    {
        id: "toggle_wheel_0",
        side: "above",
        text: "and this column has wheels."
    },
    {
        id: "darkMode",
        side: "above",
        text: "Dark mode, proxy symbols, saving, and loading are present here."  
    },
    {
        id: "plannerField",
        side: "above",
        text: "Once you've configured everything above, you can use this interface to sequence the transmutations."
    },
    {
        id: "timeline",
        side: "above",
        text: "When you see a \"↱\" in front of the step index, it means the events on and after that point can repeat indefinitely, and output every product at least once"
    },
    {
        id: "help",
        side: "under",
        text: "Goodbye!"
    }
];

let helpListIndex = -1n;
let helpElement;
let helpElementChanged = false;

helpButton.addEventListener("click", () => {
    if (helpListIndex == -1n) {
        permitUserInteraction = false;
        helpListIndex = 0n;
        if (reagentsTray.style.display == "none") {
            clickHandler(document.getElementById("collapseReagents"));
        }
        if (settingsTray.style.display == "none") {
            clickHandler(document.getElementById("collapseSettings"));
        }
        updateHelpBox();
    }
});

closeHelp.addEventListener("click", () => {
    endHelp();
});

nextHelp.addEventListener("click", () => {
    resetHelpElement();
    helpListIndex++;
    updateHelpBox();
});

document.addEventListener("scroll", updateHelpBoxPosition, true);

function resetHelpElement() {
    if (helpElement) {
        helpElement.style.border = "";
        helpElement = undefined;
    }
    document.body.insertAdjacentElement("afterbegin", helpBox);
}

function endHelp() {
    if (7n <= helpListIndex && helpListIndex <= 11n) {
        clickHandler(document.getElementById("remove_reagent_" + (reagents.length - 1).toFixed(0)));
    }
    helpListIndex = -1n;
    helpBox.hidden = true;
    resetHelpElement();

    permitUserInteraction = true;
}

function updateHelpBox() {
    exit: while (true) {
        let info = helpList[helpListIndex];
        if (info == undefined) {
            endHelp();
            return;
        }
        helpElement = document.getElementById(info.id);
        switch (info.type ?? "text") {
            case "click":
                clickHandler(helpElement);
                break;
            case "text":
                helpElement.insertAdjacentElement("beforebegin", helpBox);
                helpText.innerText = info.text;
                helpBox.hidden = false;
                helpElement.style.border = "5px red solid";
                helpElement.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                    inline: "center"
                });
                updateHelpBoxPosition();
                break exit;
            default:
                break exit;
        }
        helpListIndex++;
    }
}

function updateHelpBoxPosition() {
    let info = helpList[helpListIndex];
    if (!info) {
        return;
    }
    if ((info.type ?? "text") != "text") {
        return;
    }
    let helpBoxBounds = helpBox.getBoundingClientRect();
    let helpElementBounds = helpElement.getBoundingClientRect();
    let x = 0;
    let y = 0;
    switch (info.side) {
        case "above":
            x = helpElementBounds.left;
            y = helpElementBounds.top - helpBoxBounds.height;
            break;
        case "under":
            x = helpElementBounds.left;
            y = helpElementBounds.bottom;
            break;
        case "adjacent":
            x = helpElementBounds.right;
            y = helpElementBounds.top;
            break;
        default:
            break;
    }
    helpBox.style.left = window.scrollX + x + "px";
    helpBox.style.top = window.scrollY + y + "px";
}