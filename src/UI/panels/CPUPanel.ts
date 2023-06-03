import { Emulator } from "../..";
import { Opcodes } from "../../Opcodes";
import { Rect } from "../Rect";

// import CPUImageURL from '../assets/cpu.png';
// import CPUImageURL from '../assets/cpu-arch.png';

export class CPUPanel {
    private emulator: Emulator;

    private rect: Rect = {x: 211, y: 265, w: 97, h: 69};

    private locations = {
        OAM: {rows: 27, start: 0xFE00, end: 0xFEA0, title: "OAM"},
        HIGH_RAM: {rows: 15, start: 0xFF80, end: 0xFFFE, title: "HRAM"},
        BIOS: {rows: 15, start: 0xFF80, end: 0xFFFE, title: "HRAM"},
    }

    constructor(emulator: Emulator) {
        this.emulator = emulator;
    }

    private fNum(num: number, padLen: number = 2): string {
        return num.toString(16).toUpperCase().padStart(padLen, "0");
    }

    private drawRegisters(context: CanvasRenderingContext2D, xStart: number, yStart: number) {
        let x = xStart + 10; // 10 to account for align right;
        let y = yStart;
        const ySpacing = 3;

        const reg = this.emulator.cpu.reg;
        // context.font = "2px monospace";
        context.textAlign = "right";
        context.fillText(`PC ${this.fNum(reg.pc, 4)}`, x, y);
        context.fillText(`${Opcodes[this.emulator.mem.memory[reg.pc]]}`, x + 20, y);
        context.fillText(`SP ${this.fNum(reg.sp, 4)}`, x, y+=ySpacing);
        
        context.fillText(`A   ${this.fNum(reg.a, 2)}`, x, y+=ySpacing);
        context.fillText(`B   ${this.fNum(reg.b, 2)}`, x, y+=ySpacing);
        context.fillText(`D   ${this.fNum(reg.b, 2)}`, x, y+=ySpacing);
        context.fillText(`H   ${this.fNum(reg.b, 2)}`, x, y+=ySpacing);

        x = xStart + 30; // Move to second column
        y = yStart + ySpacing; // Offset by 1
        context.fillText(`F   00`, x, y+=ySpacing);
        context.fillText(`C   ${this.fNum(reg.c, 2)}`, x, y+=ySpacing);
        context.fillText(`E   ${this.fNum(reg.e, 2)}`, x, y+=ySpacing);
        context.fillText(`L   ${this.fNum(reg.l, 2)}`, x, y+=ySpacing);
    }

    private drawFlags(context: CanvasRenderingContext2D, yStart: number) {
        let x = 0;
        let y = yStart;
        let xSpacing = (this.rect.w / 2) / 5;

        context.textAlign = "center";

        const reg = this.emulator.cpu.reg;
        context.textAlign = "right";
        context.fillText(`C ${reg.flags.C ? 1 : 0}`, x+=xSpacing, y);
        context.fillText(`H ${reg.flags.H ? 1 : 0}`, x+=xSpacing, y);
        context.fillText(`N ${reg.flags.N ? 1 : 0}`, x+=xSpacing, y);
        context.fillText(`Z ${reg.flags.Z ? 1 : 0}`, x+=xSpacing, y);
    }

    private drawPPU(context: CanvasRenderingContext2D, xStart: number, yStart: number) {
        let x = xStart;
        let y = yStart;
        let ySpacing = 3;

        context.textAlign = "right";

        const mem = this.emulator.mem.memory;
        context.fillText(`LCDC ${this.fNum(mem[0xFF40], 2)}`, x, y+=ySpacing);
        context.fillText(`STAT ${this.fNum(mem[0xFF41], 2)}`, x, y+=ySpacing);
        
        x += 15;
        y = yStart;

        context.fillText(`SCY ${this.fNum(mem[0xFF42], 2)}`, x, y+=ySpacing);
        context.fillText(`SCX ${this.fNum(mem[0xFF43], 2)}`, x, y+=ySpacing);

        x += 15;
        y = yStart;

        context.fillText(`LY ${this.fNum(mem[0xFF44], 2)}`, x, y+=ySpacing);
        context.fillText(`LYC ${this.fNum(mem[0xFF45], 2)}`, x, y+=ySpacing);

        x += 15;
        y = yStart;

        context.fillText(`WY ${this.fNum(mem[0xFF4A], 2)}`, x, y+=ySpacing);
        context.fillText(`WX ${this.fNum(mem[0xFF4B], 2)}`, x, y+=ySpacing);

        x += 15;
        y = yStart;

        context.fillText(`OBP0 ${this.fNum(mem[0xFF48], 2)}`, x, y+=ySpacing);
        context.fillText(`OBP1 ${this.fNum(mem[0xFF49], 2)}`, x, y+=ySpacing);

        x += 15;
        y = yStart;

        context.fillText(`BGP ${this.fNum(mem[0xFF47], 2)}`, x, y+=ySpacing);
    }

    private drawRamImage(context: CanvasRenderingContext2D, x: number, y: number, rows: number, source: number[], startAddr: number, endArr: number) {
        const size = 1.5;
        const m = context.getTransform();
        const prevColor = context.fillStyle;
        context.translate(x, y);

        let xi = 0;
        let yi = 0;
        for (let addr = startAddr; addr <= endArr; addr+=3) {
            const r = source[addr + 0] | 0;
            const g = source[addr + 1] | 0;
            const b = source[addr + 2] | 0;

            if (r != 0 || g != 0 || b != 0) {
                const color = `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
                // const color = "#ff0000";

                context.fillStyle = color;
                context.fillRect(xi, yi, size, size);
            }

            xi+=size;

            if (xi % (rows * size) == 0) {
                yi+=size;
                xi=0;
            }
        }
        context.setTransform(m);
        context.fillStyle = prevColor;
    }

    private divider(context: CanvasRenderingContext2D, startX: number, startY: number, endX: number, endY: number) {
        context.beginPath();
        context.moveTo(startX, startY);
        context.lineTo(endX, endY);
        context.stroke();
        context.closePath();
    }

    public tickDebugger(context: CanvasRenderingContext2D, scaleFactor: number) {
        context.save();

        context.translate(this.rect.x, this.rect.y);

        context.strokeStyle = "#222222";
        context.strokeRect(0, 0, this.rect.w, this.rect.h);



        context.lineWidth = 0.4;

        // CPU
        context.strokeRect(0, 0, 44, 59);

        context.fillStyle = "white";
        context.font = "3px monospace";
        context.textAlign = "center";
        context.fillText("CPU Core", 21, 3);

        this.drawRegisters(context, 6, 7);

        // Flags
        this.drawFlags(context, 30);
        this.divider(context, 0, 38, 44, 38);

        // RAM
        context.textAlign = "center";
        context.fillText("RAM", 22, 41);
        this.drawRamImage(context, 1, 43, 27, this.emulator.mem.memory, this.locations.HIGH_RAM.start, this.locations.HIGH_RAM.end);
        this.divider(context, 0, 48, 44, 48);

        // ROM
        context.textAlign = "center";
        context.fillText("ROM", 22, 51);
        this.drawRamImage(context, 1, 53, 27, this.emulator.mem.BIOS, 0x0, 0x100);

        // LCD Controller
        context.textAlign = "center";
        context.strokeRect(0, this.rect.h - 10, this.rect.w, 10);
        context.fillText("LCD Controller", 48, 62);
        this.drawPPU(context, 18, 62);

        // Port and Divider
        this.divider(context, 44, 10, this.rect.w, 10);
        this.divider(context, 70, 0, 70, 10);
        
        context.textAlign = "center";
        context.fillText("Port", 57, 3);
        context.fillText(`P1 ${(~(-this.emulator.input.getState() - 1)).toString(2).padStart(8, "0")}`, 57, 7);

        context.fillText("Divider", 84, 3);
        context.fillText(`DIV ${this.fNum(this.emulator.mem.memory[0xFF04], 2)}`, 84, 7);

        // SIO / Timer
        this.divider(context, 44, 22, this.rect.w, 22);
        this.divider(context, 70, 10, 70, 22);

        context.fillText("SIO", 57, 13);
        context.fillText(`SB ${this.fNum(this.emulator.mem.memory[0xFF01], 2)}`, 57, 17);
        context.fillText(`SC ${this.fNum(this.emulator.mem.memory[0xFF03], 2)}`, 57, 19.5);

        context.fillText("Timer", 84, 13);
        context.fillText(`TIMA ${this.fNum(this.emulator.mem.memory[0xFF05], 2)}`, 84, 16);
        context.fillText(`TMA ${this.fNum(this.emulator.mem.memory[0xFF06], 2)}`, 84, 18.5);
        context.fillText(`TAC ${this.fNum(this.emulator.mem.memory[0xFF07], 2)}`, 84, 21);

        // Interrupt contoller
        this.divider(context, 44, 38, this.rect.w, 38);
        context.fillText("Interrupt Controller", 70, 25);
        // context.fillText(`IME ${this.fNum(this.emulator.cpu.getIME() ? 1 : 0, 2)}`, 57, 28);
        
        context.textAlign = "right";
        const interruptFlag = this.emulator.mem.memory[0xFFFF];
        context.fillText(`IME ${this.fNum((this.emulator.cpu.getIME() ? 1 :0) & 1, 2)}`, 64, 29);
        context.fillText(`VBLANK ${this.fNum((interruptFlag >> 0) & 1, 2)}`, 64, 32);
        context.fillText(`STAT ${this.fNum((interruptFlag >> 1) & 1, 2)}`, 64, 35);

        context.fillText(`Timer ${this.fNum((interruptFlag >> 2) & 1, 2)}`, 94, 29);
        context.fillText(`Serial ${this.fNum((interruptFlag >> 3) & 1, 2)}`, 94, 32);
        context.fillText(`Joypad ${this.fNum((interruptFlag >> 4) & 1, 2)}`, 94, 35);

        // DMA Controller
        context.textAlign = "center";
        this.divider(context, 44, 48, this.rect.w, 48);
        context.fillText("DMA Controller", 70, 41);

        // OAM
        context.fillText("OAM Memory", 70, 51);
        this.drawRamImage(context, 50, 53, this.locations.OAM.rows, this.emulator.mem.memory, this.locations.OAM.start, this.locations.OAM.end);

        context.restore();
    }
}