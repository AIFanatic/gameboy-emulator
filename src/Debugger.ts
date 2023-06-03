import { Emulator } from ".";
import { CPU } from "./CPU";
import { GPU } from "./GPU";
import { Opcodes } from "./Opcodes";

interface DebuggerInstructions {
    address: number;
    instruction: number;
    operand: number;
};

export class Debugger {
    private logsIndex = 0;
    private logs = new Array(1000);

    private element: HTMLDivElement;
    
    private emulator: Emulator;
    private cpu: CPU;
    private gpu: GPU;

    private instructions: DebuggerInstructions[];
    private registerElement: HTMLSpanElement;

    private previousInstructionElement: HTMLLIElement;
    private instructionElements: Map<number, HTMLLIElement>;
    private runButton: HTMLButtonElement;

    private breakpoints: number[];


    private vramContext: CanvasRenderingContext2D;
    private vramImageData: ImageData;

    constructor(element: HTMLDivElement, emulator: Emulator) {
        this.element = element;
        this.emulator = emulator;
        this.cpu = this.emulator.cpu;
        this.gpu = this.emulator.gpu;
        this.instructions = [];
        this.instructionElements = new Map();
        this.breakpoints = [];

        this.createRegisterElements();
        this.createControlButtons();

        this.buildInstructionsList();
        this.createInstructionElements();

        const vramCanvas = document.createElement("canvas");
        vramCanvas.style.imageRendering = "pixelated";
        vramCanvas.width = 16 * 8;
        vramCanvas.height = 24 * 8;
        this.vramContext = vramCanvas.getContext("2d");
        this.vramImageData = new ImageData(vramCanvas.width, vramCanvas.height);

        element.appendChild(vramCanvas);

        setInterval(() => {
            this.stepVram();
        }, 1000);
    }

    private buildInstructionsList() {
        const startPC = this.cpu.reg.pc;

        this.cpu.reg.pc = 0

        for (let i = this.cpu.reg.pc; i <= this.cpu.mem.memory.length + startPC; i++) {
            const currentPC = this.cpu.reg.pc;
            const instruction = this.cpu.nextByte();

            if (!instruction) continue;
            
            const instructionText = Opcodes[instruction];
            if (!instructionText) {
                throw Error("Instruction not found");
            }
            let operand = null;
            if (instructionText.includes("A8")) operand = this.cpu.nextByte();
            else if (instructionText.includes("D8")) operand = this.cpu.nextByte();
            else if (instructionText.includes("R8")) operand = this.cpu.nextByte();
            
            else if (instructionText.includes("A16")) operand = this.cpu.nextWord();
            else if (instructionText.includes("D16")) operand = this.cpu.nextWord()

            this.instructions.push({
                address: currentPC,
                instruction: instruction,
                operand: operand
            });
        }

        this.cpu.reg.pc = startPC;
    }

    private createInstructionElements() {
        const ul = document.createElement("ul");
        ul.style.fontFamily = "monospace";
        ul.style.listStyle = "none";
        ul.style.maxHeight = "500px";
        ul.style.overflow = "auto";
        for (let instruction of this.instructions) {
            let opcode = Opcodes[instruction.instruction];
            const address = instruction.address.toString(16);
            const operand = instruction.operand ? "0x" + instruction.operand.toString(16) : "";

            if (opcode.includes("A8")) opcode = opcode.replace("A8", operand);
            else if (opcode.includes("D8")) opcode = opcode.replace("D8", operand);
            else if (opcode.includes("R8")) opcode = opcode.replace("R8", operand);
            else if (opcode.includes("A16")) opcode = opcode.replace("A16", operand);
            else if (opcode.includes("D16")) opcode = opcode.replace("D16", operand);

            const li = document.createElement("li");
            li.id = address;
            li.textContent = `0x${address}: ${opcode} (${instruction.instruction}, ${operand})`;
            ul.appendChild(li);

            this.instructionElements.set(instruction.address, li);
        }
        this.element.appendChild(ul);
    }

    private createRegisterElements() {
        this.registerElement = document.createElement("span");

        this.registerElement.id = "registers";

        const container = document.createElement("div");
        container.appendChild(this.registerElement);
        this.element.appendChild(container);
    }

    private createControlButtons() {
        const container = document.createElement("div");
        
        const runButton = document.createElement("button");
        runButton.textContent = "Pause";

        runButton.addEventListener("click", event => {
            if (this.cpu.stopped) {
                runButton.textContent = "Pause";
                this.cpu.stopped = false;
                for (let i = 0; i < 0x100; i++) {
                    this.cpu.step();
                    this.gpu.step();
                    this.step();
                }
            }
            else {
                runButton.textContent = "Run";
                this.cpu.stopped = true;
            }
        })

        const stepButton = document.createElement("button");
        stepButton.textContent = "Step";

        stepButton.addEventListener("click", event => {
            if (!this.cpu.stopped) return;

            this.cpu.stopped = false;
            this.emulator.step();
            this.debug();
            this.cpu.stopped = true;
        })

        const gotoPCButton = document.createElement("button");
        gotoPCButton.textContent = "Goto PC";

        gotoPCButton.addEventListener("click", event => {
            const element = document.getElementById(this.cpu.reg.pc.toString());
            element.scrollIntoView();
            // this.element.querySelector("ul").scrollTop = element.offsetTop - this.element.offsetTop;
        })

        container.appendChild(runButton);
        container.appendChild(stepButton);
        container.appendChild(gotoPCButton);
        this.element.appendChild(container);

        this.runButton = runButton;
    }

    public addBreakpoint(address: number) {
        if (this.breakpoints.includes(address)) return;

        this.breakpoints.push(address);
    }

    private debug() {
        this.registerElement.innerText = `
        Clock: ${this.cpu.ticks}
        GPU SL: 0x${this.gpu.line.toString(16)}
        Registers:
            A: 0x${this.cpu.reg.a.toString(16)}
            B: 0x${this.cpu.reg.b.toString(16)}, C: 0x${this.cpu.reg.c.toString(16)}
            D: 0x${this.cpu.reg.d.toString(16)}, E: 0x${this.cpu.reg.e.toString(16)}
            H: 0x${this.cpu.reg.h.toString(16)}, L: 0x${this.cpu.reg.l.toString(16)}
            SP: 0x${this.cpu.reg.sp.toString(16)}, PC: 0x${this.cpu.reg.pc.toString(16)}
            Flags: C: ${this.cpu.reg.flags.C ? 1: 0}, H: ${this.cpu.reg.flags.H ? 1: 0}, N: ${this.cpu.reg.flags.N ? 1: 0}, Z: ${this.cpu.reg.flags.Z ? 1: 0}}
        `

        const currentInstructionElement = this.instructionElements.get(this.cpu.reg.pc);
        if (currentInstructionElement) {
            currentInstructionElement.style.color = "red";

            if (this.previousInstructionElement) {
                this.previousInstructionElement.style.color = "";
            }

            this.previousInstructionElement = currentInstructionElement;
        }
    }

    private verboseDebug() {
        const A = this.cpu.reg.a.toString(16).padStart(2, '0').toUpperCase();
        const B = this.cpu.reg.b.toString(16).padStart(2, '0').toUpperCase();
        const C = this.cpu.reg.c.toString(16).padStart(2, '0').toUpperCase();
        const D = this.cpu.reg.d.toString(16).padStart(2, '0').toUpperCase();
        const E = this.cpu.reg.e.toString(16).padStart(2, '0').toUpperCase();
        const H = this.cpu.reg.h.toString(16).padStart(2, '0').toUpperCase();
        const L = this.cpu.reg.l.toString(16).padStart(2, '0').toUpperCase();
        const SP = this.cpu.reg.sp.toString(16).padStart(4, '0').toUpperCase();

        const PC = this.cpu.reg.pc.toString(16).padStart(4, '0').toUpperCase();
        
        const ipc = this.cpu.reg.pc;
        const PCMEM1 = this.cpu.mem.readByte(ipc+0).toString(16).padStart(2, '0').toUpperCase();
        const PCMEM2 = this.cpu.mem.readByte(ipc+1).toString(16).padStart(2, '0').toUpperCase();
        const PCMEM3 = this.cpu.mem.readByte(ipc+2).toString(16).padStart(2, '0').toUpperCase();
        const PCMEM4 = this.cpu.mem.readByte(ipc+3).toString(16).padStart(2, '0').toUpperCase();
        const PCMEM = `${PCMEM1},${PCMEM2},${PCMEM3},${PCMEM4}`;

        const LY = this.cpu.mem.readByte(0xff44).toString(16).padStart(2, '0').toUpperCase();
        const ff00 = this.cpu.mem.readByte(0xff00).toString(16).padStart(2, '0').toUpperCase();
        
        const clock = this.cpu.ticks;

        const instructionText = Opcodes[this.cpu.mem.readByte(this.cpu.reg.pc)];

        console.log(`A:${A} B:${B} C:${C} D:${D} E:${E} H:${H} L:${L} SP:${SP} PC:${PC} PCMEM:${PCMEM} LY:${LY} FF00:${ff00} c:${clock} ${instructionText}`);
    }

    private verboseDebugRet(): string {
        const A = this.cpu.reg.a.toString(16).padStart(2, '0').toUpperCase();
        const B = this.cpu.reg.b.toString(16).padStart(2, '0').toUpperCase();
        const C = this.cpu.reg.c.toString(16).padStart(2, '0').toUpperCase();
        const D = this.cpu.reg.d.toString(16).padStart(2, '0').toUpperCase();
        const E = this.cpu.reg.e.toString(16).padStart(2, '0').toUpperCase();
        const H = this.cpu.reg.h.toString(16).padStart(2, '0').toUpperCase();
        const L = this.cpu.reg.l.toString(16).padStart(2, '0').toUpperCase();
        const SP = this.cpu.reg.sp.toString(16).padStart(4, '0').toUpperCase();

        const PC = this.cpu.reg.pc.toString(16).padStart(4, '0').toUpperCase();
        
        const ipc = this.cpu.reg.pc;
        const PCMEM1 = this.cpu.mem.readByte(ipc+0).toString(16).padStart(2, '0').toUpperCase();
        const PCMEM2 = this.cpu.mem.readByte(ipc+1).toString(16).padStart(2, '0').toUpperCase();
        const PCMEM3 = this.cpu.mem.readByte(ipc+2).toString(16).padStart(2, '0').toUpperCase();
        const PCMEM4 = this.cpu.mem.readByte(ipc+3).toString(16).padStart(2, '0').toUpperCase();
        const PCMEM = `${PCMEM1},${PCMEM2},${PCMEM3},${PCMEM4}`;

        const LY = this.cpu.mem.readByte(0xff44).toString(16).padStart(2, '0').toUpperCase();
        const ff00 = this.cpu.mem.readByte(0xff00).toString(16).padStart(2, '0').toUpperCase();
        
        const clock = this.cpu.ticks;

        return `A:${A} B:${B} C:${C} D:${D} E:${E} H:${H} L:${L} SP:${SP} PC:${PC} PCMEM:${PCMEM} LY:${LY} FF00:${ff00} c:${clock}`;
    }

    private displayTile(index: number, xDraw, yDraw) {
        const VRAM_START = 0x8000;
        const VRAM_END = 0x9800;

        const palette = [
            [255, 255, 255, 255],
            [192, 192, 192, 255],
            [96, 96, 96, 255],
            [0, 0, 0, 255]
        ];

        const tileAddress = VRAM_START + (index * 16);
        const tileData = this.cpu.mem.memory.slice(tileAddress, tileAddress + 16);

        const cw = this.vramContext.canvas.width / 8;
        const ch = this.vramContext.canvas.height / 8;

        let buffer = [];
        for (let i = 0; i < tileData.length; i+=2) {
            const lsb = tileData[i + 0];
            const msb = tileData[i + 1];

            for (let x = 0; x < 8; x++) {
                var mask = (1 << (7-x));

                const hi = ((lsb & mask) >> (7-x)); // (lsb >> (7 - x)) & 1;
                const lo = ((msb & mask) >> (7-x))*2; // (msb >> (7 - x)) & 1;


                const paletteNumber = hi + lo;

                // const paletteNumber = (hi << 1) + lo;

                const color = palette[paletteNumber];


                const xa = xDraw + (x);
                const ya = yDraw + (i/2);
                let cIndex = (ya * (cw * 8) + xa) * 4;
                this.vramImageData.data[cIndex + 0] = color[0];
                this.vramImageData.data[cIndex + 1] = color[1];
                this.vramImageData.data[cIndex + 2] = color[2];
                this.vramImageData.data[cIndex + 3] = color[3];

                buffer.push(color);
            }
        }

        this.vramContext.putImageData(this.vramImageData, 0, 0);

        return [];
    }

    private getTile() {
        this.vramImageData = new ImageData(this.vramContext.canvas.width, this.vramContext.canvas.height);
        let xDraw = 0;
        let yDraw = 0;

        
        const VRAM_START = 0x8000;

        let tileNum = 0;

        const cw = this.vramContext.canvas.width / 8;
        const ch = this.vramContext.canvas.height / 8;

        for (let y = 0; y < ch; y++) {
            for (let x = 0; x < cw; x++) {
                const tileAddress = VRAM_START + (tileNum * 16);

                this.displayTile(tileNum, xDraw + x, yDraw + y);
                xDraw += 7;
                tileNum++;
            }

            yDraw += 7;
            xDraw = 0;
        }
    }
    private stepVram() {
        return;
        const VRAM_START = 0x8000;
        const VRAM_END = 0x9800;

        const palette = [
            [255, 255, 255, 255],
            [192, 192, 192, 255],
            [96, 96, 96, 255],
            [0, 0, 0, 255]
        ];

        window.sprites = [];

        // TODO: Store tiles
        for (let i = VRAM_START, j = 0; i < VRAM_END; i+=16, j++) {


            const tileIndex = i;
            const tileData: number[] = this.cpu.mem.memory.slice(tileIndex, tileIndex + 16);

            let line = 0;
            for (let ia = 0, j = 0; ia < tileData.length; ia+=2, j++) {
                const lsb = tileData[ia + 0];
                const msb = tileData[ia + 1];

                for (let x = 0; x < 8; x++) {
                    const hi = (lsb >> (7 - x)) & 1;
                    const lo = (msb >> (7 - x)) & 1;

                    const paletteNumber = hi | lo;
                    const color = palette[paletteNumber];

                    // if (lsb != 0) {
                    //     console.log(x, lsb.toString(16), msb.toString(16), lsb.toString(2), msb.toString(2), hi.toString(2), lo.toString(2), paletteNumber, color)
                    //     debugger
                    // }

                    const yc = line * j;
                    const xc = x * j;
                    let canvasIndex = 4 * (this.vramContext.canvas.width * yc + xc);
                    this.vramImageData.data[canvasIndex + 0] = color[0];
                    this.vramImageData.data[canvasIndex + 1] = color[1];
                    this.vramImageData.data[canvasIndex + 2] = color[2];
                    this.vramImageData.data[canvasIndex + 3] = color[3];

                    // console.log(i, i / 2, yc, xc, canvasIndex)
                    // debugger
                    // console.log(line, x)
                }

                if (ia != 0 && ia % 2 == 0) {
                    line++;
                    // console.log(line)
                }

                // const hi = tileData[i] & 1;
                // const lo = tileData[i] >> 7;
                // const paletteNumber = hi | lo;
                // const color = palette[paletteNumber];
                
                // this.vramImageData.data[j + 0] = color[0];
                // this.vramImageData.data[j + 1] = color[1];
                // this.vramImageData.data[j + 2] = color[2];
                // this.vramImageData.data[j + 3] = color[3];
                // if (tileData[i] != 0) {
                //     console.log(tileData[i], hi, lo, paletteNumber, color)
                //     debugger
                // }
            }

            window.sprites[j] = tileData;
        }

        this.vramContext.putImageData(this.vramImageData, 0, 0);
    }
    public step() {
        if (this.cpu.stopped) {
            this.debug();
        }

        for (let breakpoint of this.breakpoints) {
            if (this.cpu.reg.pc == breakpoint) {
                this.cpu.stopped = true;
                this.runButton.textContent = "Run";

                this.debug();
            }
        }

        // this.verboseDebug();

        // const entry = this.verboseDebugRet();
        // this.logs[this.logsIndex] = entry;

        // this.logsIndex++;

        // if (this.logsIndex == this.logs.length) {
        //     this.logsIndex = 0;
        // }
    }
}