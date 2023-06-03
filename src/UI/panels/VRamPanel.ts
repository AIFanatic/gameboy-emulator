import { Emulator } from "../..";
import { Rect } from "../Rect";

export class VRamPanel {
    private emulator: Emulator;

    private rect: Rect = {x: 130, y: 281, w: 47, h: 80};

    private vramImageData: ImageData;
    private vramImageBitmap: ImageBitmap;

    private cw = 16 * 8;
    private ch = 24 * 8;

    constructor(emulator: Emulator) {
        this.emulator = emulator;

        this.vramImageData = new ImageData(this.cw, this.ch);

        setInterval(() => {
            this.getTiles();
        }, 1000);
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
        const tileData = this.emulator.mem.memory.slice(tileAddress, tileAddress + 16);

        const cw = this.cw / 8;
        const ch = this.ch / 8;

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
    }

    private getTiles() {
        this.vramImageData = new ImageData(this.cw, this.ch);
        let xDraw = 0;
        let yDraw = 0;

        
        const VRAM_START = 0x8000;

        let tileNum = 0;

        const cw = this.cw / 8;
        const ch = this.ch / 8;

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

        createImageBitmap(this.vramImageData).then(b => {
            this.vramImageBitmap = b;
        })
    }

    public tickDebugger(context: CanvasRenderingContext2D, scaleFactor: number) {
        context.save();

        // context.strokeStyle = "blue";
        // context.strokeRect(this.rect.x, this.rect.y, this.rect.w, this.rect.h);

        context.translate(this.rect.x, this.rect.y);
        
        // VRAM
        if (this.vramImageBitmap) {
            // const m = context.getTransform();
            context.scale(0.375, 0.415);
            context.drawImage(this.vramImageBitmap, 0, 0);
            // context.setTransform(m);
        }

        context.restore();
    }
}