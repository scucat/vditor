import {isCtrl} from "../util/compatibility";
import {focusEvent, hotkeyEvent, selectEvent} from "../util/editorCommenEvent";
import {setRangeByWbr} from "../wysiwyg/setRangeByWbr";
import {expandMarker} from "./expandMarker";
import {processAfterRender} from "./process";

class IR {
    public element: HTMLElement;
    public composingLock: boolean = false;

    constructor(vditor: IVditor) {
        const divElement = document.createElement("div");
        divElement.className = "vditor-ir";

        divElement.innerHTML = `<pre class="vditor-reset" placeholder="${vditor.options.placeholder}"
 contenteditable="true" spellcheck="false"></pre>`;

        this.element = divElement.firstElementChild as HTMLPreElement;

        if (vditor.currentMode !== "ir") {
            this.element.parentElement.style.display = "none";
        }

        this.bindEvent(vditor);

        document.execCommand("DefaultParagraphSeparator", false, "p");

        focusEvent(vditor, this.element);
        hotkeyEvent(vditor, this.element);
        selectEvent(vditor, this.element);
    }

    private input(vditor: IVditor, range: Range, event: InputEvent) {
        range.insertNode(document.createElement("wbr"));
        console.log(this.element.innerHTML);
        this.element.innerHTML = vditor.lute.SpinVditorIRDOM(this.element.innerHTML);
        console.log(this.element.innerHTML);
        setRangeByWbr(vditor.ir.element, range);
        processAfterRender(vditor, {
            enableAddUndoStack: true,
            enableHint: true,
            enableInput: true,
        });
    }

    private bindEvent(vditor: IVditor) {
        this.element.addEventListener("compositionend", (event: InputEvent) => {
            this.input(vditor, getSelection().getRangeAt(0).cloneRange(), event);
        });

        this.element.addEventListener("input", (event: InputEvent) => {
            if (this.composingLock) {
                return;
            }
            this.input(vditor, getSelection().getRangeAt(0).cloneRange(), event);
        });

        this.element.addEventListener("click", (event) => {
            // TODO input, image, code
            expandMarker(getSelection().getRangeAt(0), vditor);
        });

        this.element.addEventListener("keyup", (event) => {
            if (event.isComposing || isCtrl(event)) {
                return;
            }
            if (event.key.indexOf("Arrow") > -1) {
                expandMarker(getSelection().getRangeAt(0), vditor);
            }
        });
    }
}

export {IR};
