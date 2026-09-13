/**
 * @typedef {(prevOption: number, newOption: number, userInput: boolean) => void} TabRowChangeCallback
 */

class TabRow {
    #lastOption = 0;

    /**
     * 
     * @param {Element} rootElement
     * @param {TabRowChangeCallback | null} onChange
     */
    constructor(rootElement, onChange = null) {
        this.rootElement = rootElement;
        this.onChange = onChange;

        this.option = 0;
        let i = 0;
        for (let c of this.rootElement.children) {
            c.setAttribute("data-index", i.toString());
            i++;
        }
        this.#lastOption = i - 1;
        this.update();

        this.rootElement.classList.add("tabRow")
        this.rootElement.addEventListener("click", this);
    }
    
    /**
     * 
     * @param {MouseEvent} e 
     */
    handleEvent(e) {
        /** @type {Element} */
        // @ts-ignore
        let target = e.target;
        let index = target.getAttribute("data-index");
        if (index == null) {
            return;
        }
        this.setOption(Number.parseInt(index,10), true);
    }

    /**
     * 
     * @param {number} index 
     * @param {boolean} userInput 
     */
    setOption(index, userInput = false) {4
        if (Number.isNaN(index)) {
            index = 0;
        }
        [index, this.option] = [this.option, Math.min(Math.max(0, index), this.#lastOption)];
        this.update()
        this.onChange?.(index, this.option, userInput);
    }

    update() {
        for (let c of this.rootElement.children) {
            if (c.getAttribute("data-index") == this.option.toString()) {
                c.classList.add("selected");
            } else {
                c.classList.remove("selected");
            }
        }
    }

}