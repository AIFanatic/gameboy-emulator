import { Emulator } from "../..";
import { MBCMode, MBCType } from "../../MBC";
import { Rect } from "../Rect";

enum CartType {
    MBC0,
    MBC1,
    MBC3,
    MBC5
};

export class CartridgePanel {
    private emulator: Emulator;
    private romRect: Rect = {x: 273, y: -37, w: 57.5, h: 72.5};
    private mbcRect: Rect = {x: 167, y: -59, w: 34, h: 30};
    private sramRect: Rect = {x: 172, y: -9.2, w: 35.9, h: 72.2};

    private batteryArc = {x: 301, y: -86, r: 25.5};

    private romImage: ImageBitmap;
    private extRamImage: ImageBitmap;
    private cartType: CartType;

    constructor(emulator: Emulator) {
        this.emulator = emulator;

        console.log(this.emulator)

        // Create rom image, only needed once
        setTimeout(() => {
            const romLength = this.emulator.mem.rom.length;
            console.log(romLength)
            const len = Math.round(Math.sqrt(romLength));
            console.log(len, len / 2, len * 2)
            const romImageData = this.getImageForRange(Math.ceil(len / 2), Math.ceil(len * 2), 0, romLength, this.emulator.mem.rom);
            
            console.log(romImageData, len)

            createImageBitmap(romImageData).then(ib => {
                const cartType = this.emulator.mem.rom[0x147];
                if (cartType == 0x00) this.cartType = CartType.MBC0;
                else if (cartType >= 0x01 && cartType <= 0x03) this.cartType = CartType.MBC1;
                else if (cartType >= 0x0F && cartType <= 0x13) this.cartType = CartType.MBC3;
                else if (cartType >= 0x19 && cartType <= 0x1E) this.cartType = CartType.MBC5;

                this.romImage = ib;
            });
        }, 1000);

        // Create external ram image, written during gameplay, update 1/s
        setInterval(() => {
            if (!this.emulator.mem.mbc.extRam) return;
            if (this.emulator.mem.mbc.extRam.extRam.length == 0) return;

            const extRamLength = this.emulator.mem.mbc.extRam.extRam.length;
            const len = Math.round(Math.sqrt(extRamLength));
            const extRamImage = this.getImageForRange(Math.ceil(len / 2), Math.ceil(len * 2), 0, extRamLength, this.emulator.mem.mbc.extRam.extRam);

            createImageBitmap(extRamImage).then(ib => {
                this.extRamImage = ib;
            });
        }, 1000);
    }

    private getImageForRange(imgWidth: number, imgHeight: number, startRange: number, endRange: number, source: number[] | Uint8Array): ImageData {
        const data = new Uint8ClampedArray(imgWidth * imgHeight * 4)
        const romImageData = new ImageData(data, imgWidth, imgHeight);
        for (let addr = startRange; addr <= data.length; addr+=4) {
            const r = source[addr + 0];
            const g = source[addr + 1];
            const b = source[addr + 2];
            const a = source[addr + 3];

            // const r = Math.floor(Math.random() * 255);
            // const g = Math.floor(Math.random() * 255);
            // const b = Math.floor(Math.random() * 255);
            // const a = 255;

            data[addr + 0] = r;
            data[addr + 1] = g;
            data[addr + 2] = b;
            data[addr + 3] = a;
        }
        return romImageData;
    }

    private romLenToHeight(len: number): number {
        // romLen - romHeight
        // len - x

        const ratio = (len * this.romRect.h) / this.emulator.mem.rom.length;
        // console.log(this.emulator.mem.rom.length, this.romRect.h, len, ratio);

        return ratio;
    }

    private fNum(num: number, padLen: number = 2): string {
        return num.toString(16).toUpperCase().padStart(padLen, "0");
    }

    public tickDebugger(context: CanvasRenderingContext2D, scaleFactor: number) {
        context.save();
        if (this.romImage) {
            context.translate(this.romRect.x, this.romRect.y);
            context.drawImage(this.romImage, 0, 0, this.romRect.w, this.romRect.h * 4);

            context.fillStyle = "#ff0000a0";
            const y = this.romLenToHeight(this.emulator.mem._romoffs); // Y offset from current rom bank
            const romOffsetWOffset = this.romLenToHeight(0x4000); // Banks are 0x4000 in size
            context.fillRect(0, y, this.romRect.w, romOffsetWOffset);


            context.translate(-this.romRect.x, -this.romRect.y);
        }

        // MBC
        if (this.cartType != CartType.MBC0) {
            context.fillStyle = "black";
            context.translate(this.mbcRect.x, this.mbcRect.y);
            context.fillRect(0, 0, this.mbcRect.w, this.mbcRect.h);
            context.translate(-this.mbcRect.x, -this.mbcRect.y);

            if (this.cartType == CartType.MBC3 || this.cartType == CartType.MBC5) {
                // SRAM
                // context.strokeStyle = "blue";
                context.translate(this.sramRect.x, this.sramRect.y);
                context.fillRect(0, 0, this.sramRect.w, this.sramRect.h);
                if (this.extRamImage) {
                    context.drawImage(this.extRamImage, 0, 0, this.sramRect.w, this.sramRect.h);
                }
                context.translate(-this.sramRect.x, -this.sramRect.y);
                
                // Battery
                context.save();
                context.translate(this.batteryArc.x, this.batteryArc.y);
                context.scale(1.2, 1);
                context.beginPath();
                context.arc(0, 0, this.batteryArc.r, 0, 2 * Math.PI);
                context.fill();
                context.closePath();

                context.fillStyle = "white";
                context.textAlign = "center";
                context.textBaseline = "middle"
                context.font = "10px monospace"
                context.fillText("CR2032", 0, 0);
                context.translate(-this.batteryArc.x, -this.batteryArc.y);
                context.restore();
                
            }
            
            // MBC Info
            const tX = 33;
            context.fillStyle = "white";
            context.font = "3px monospace";
            context.textAlign = "right";
            context.translate(this.mbcRect.x, this.mbcRect.y);
            // Manual alignment ftw
            context.fillText(`Type          ${MBCType[this.emulator.mem.mbc.type]}`, tX, 5);
            context.fillText(`ROM Bank        ${this.fNum(this.emulator.mem.mbc.romBankNumber)}`, tX, 10);
            context.fillText(`ROM Offset  ${this.fNum(this.emulator.mem._romoffs, 6)}`, tX, 15);
            context.fillText(`Mode           ${MBCMode[this.emulator.mem.mbc.mode]}`, tX, 20);
            context.fillText(`RAM Enabled   ${this.emulator.mem.mbc.ramEnabled}`, tX, 25);
            context.translate(-this.mbcRect.x, -this.mbcRect.y);
    
            context.restore();
        }

    }
}