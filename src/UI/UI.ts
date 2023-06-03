import { Emulator } from "..";
import { DebuggerPanel } from "./panels/DebuggerPanel";
import { EmulatorPanel } from "./panels/EmulatorPanel";
import { Resizer } from "./panels/Resizer";
import "./ui.css";

export class UI {
    private emulator: Emulator;
    private container: HTMLDivElement;
    private element: HTMLDivElement;

    private emulatorPanel: EmulatorPanel;
    private debuggerPanel: DebuggerPanel;

    constructor(emulator: Emulator, container: HTMLDivElement) {
        this.emulator = emulator;
        this.container = container;
        
        this.element = document.createElement("div");
        this.element.classList.add("container");
        
        this.container.appendChild(this.element);

        this.emulatorPanel = new EmulatorPanel(this.emulator, this.element);
        const emulatorPanelResizer = new Resizer(this.element, "horizontal");

        this.debuggerPanel = new DebuggerPanel(this.emulator, this.element);
    }

    public instructionStep() {
        this.debuggerPanel.tickEmulator();
    }

    public vblankStep() {
        this.emulatorPanel.vblankStep();
    }
}