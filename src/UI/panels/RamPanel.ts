import { Emulator } from "../..";
import { Rect } from "../Rect";

export class RamPanel {
    private emulator: Emulator;

    private rect: Rect = {x: 112.7, y: 188.2, w: 81, h: 47};

    constructor(emulator: Emulator) {
        this.emulator = emulator;
    }

    public tickDebugger(context: CanvasRenderingContext2D, scaleFactor: number) {
        context.save();

        context.translate(this.rect.x, this.rect.y);
        context.scale(1, 1.3)

        let x = 0;
        let y = 0;
        const ram = this.emulator.mem.memory;
        for (let addr = 0xC000; addr < 0xDFFF; addr+=3) {
            
            const r = ram[addr + 0];
            const g = ram[addr + 1];
            const b = ram[addr + 2];

            if (r != 0 || g != 0 || b != 0) {
                const color = `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;

                context.fillStyle = color;
                context.fillRect(x, y, 1, 1);
            }

            x++;

            if (x % (this.rect.w) == 0) {
                y++;
                x=0;
            }
        }
        context.restore();
    }
}