import { CPU } from "./CPU";
import { Memory } from "./Memory";

enum GPUMode {
    HBLANK = 0,
    VBLANK = 1,
    OAM = 2,
    VRAM = 3
};

enum GPURegisters {
    LCDC = 0xFF40,
    STAT = 0xFF41,
    SCY  = 0xFF42,
    SCX  = 0xFF43,
    LY   = 0xFF44,
    LYC  = 0xFF45,
    BGP  = 0xFF47,
    OBP0 = 0xFF48,
    OBP1 = 0xFF49,
    WY   = 0xFF4A,
    WX   = 0xFF4B,
};

enum LCDControlRegisters {
    BG_WINDOW_ENABLE = (1 << 0),
    OBJ_ENABLE = (1 << 1),
    OBJ_SIZE = (1 << 2),
    BG_TILEMAP_AREA = (1 << 3),
    BG_WINDOW_TILEDATA_AREA = (1 << 4),
    WINDOW_ENABLE = (1 << 5),
    WINDOW_TILEMAP_AREA = (1 << 6),
    LCD_ENABLE = (1 << 7),
};

enum LCDStatusRegisters {
    LYC_EQUAL_LY_INTERRUPT = (1 << 0),
    OAM_INTERRUPT = (1 << 1),
    VBLANK_INTERRUPT = (1 << 2),
    HBLANK_INTERRUPT = (1 << 3),
    LYC_EQUAL_LY = (1 << 4),
    MODE = (1 << 5)
};

export class GPU {
    private static PALLETE = [
        { r: 0xff, g: 0xff, b: 0xff }, // WHITE
        { r: 0xaa, g: 0xaa, b: 0xaa }, // LITE GRAY
        { r: 0x55, g: 0x55, b: 0x55 }, // DARK GRAY
        { r: 0x00, g: 0x00, b: 0x00 }  // BLACK
    ];

    private pxMap = new Uint8Array (160 * 144);

    private cpu: CPU;
    private mem: Memory;

    private _line = 0;
    private _modeclock = 0;
    private _mode: GPUMode = GPUMode.OAM;

    public screenData: ImageData;
    public winImageData: ImageData;
    public bgImageData: ImageData;
    public spriteImageData: ImageData;

    constructor(cpu: CPU, memory: Memory) {
        this.cpu = cpu;
        this.mem = memory;

        this.screenData = new ImageData(160, 144);
        this.winImageData = new ImageData(160, 144);
        this.bgImageData = new ImageData(160, 144);
        this.spriteImageData = new ImageData(160, 144);
    }

    public step(clockElapsed) {
        this._modeclock += clockElapsed;
        var vblank = false;

        switch (this._mode) {
            case GPUMode.HBLANK:
                if (this._modeclock >= 204) {
                    this._line++;
                    this.updateLY();
                    if (this._line == 144) {
                        this.setMode(GPUMode.VBLANK);
                        vblank = true;
                        this.cpu.requestInterrupt(CPU.INTERRUPTS.VBLANK);

                    } else {
                        // this._mode = GPUMode.OAM;
                        this.setMode(GPUMode.OAM);
                    }
                    this._modeclock -= 204;
                }
                break;

            case GPUMode.VBLANK:
                if (this._modeclock >= 456) {
                    this._line++;

                    if (this._line == 155) {
                        this._line = 0;

                        this.screenData = new ImageData(160, 144);
                        this.winImageData = new ImageData(160, 144);
                        this.bgImageData = new ImageData(160, 144);
                        this.spriteImageData = new ImageData(160, 144);
                        
                        // this._mode = GPUMode.OAM;
                        this.setMode(GPUMode.OAM);

                    }

                    this.updateLY();
                    this._modeclock -= 456;
                }

                break;

            case GPUMode.OAM:
                if (this._modeclock >= 80) {
                    this.setMode(GPUMode.VRAM);
                    this._modeclock -= 80;
                }
                break;

            case GPUMode.VRAM:
                if (this._modeclock >= 172) {
                    this.draw();
                    this.setMode(GPUMode.HBLANK);
                    this._modeclock -= 172;
                }
                break;
        }

        return vblank;
    };

    private readBit(byte, index): number {
        return (byte >> index) & 1;
    }

    private updateLY() {
        this.mem.memory[GPURegisters.LY] = this._line;
        var STAT = this.mem.memory[GPURegisters.STAT];
        if (this._line == this.mem.memory[GPURegisters.LYC]) {
            this.mem.memory[GPURegisters.STAT], STAT | (1 << 2);
            if (STAT & (1 << 6)) {
                this.cpu.requestInterrupt(CPU.INTERRUPTS.LCDC);
            }
        } else {
            this.mem.memory[GPURegisters.STAT] = STAT & (0xFF - (1 << 2));
        }
    };

    private setMode(mode: GPUMode) {
        this._mode = mode;
        var newSTAT = this.mem.memory[GPURegisters.STAT];
        newSTAT &= 0xFC;
        newSTAT |= mode;
        this.mem.memory[GPURegisters.STAT] = newSTAT;
    
        if (mode < 3) {
            if (newSTAT & (1 << (3+mode))) {
                this.cpu.requestInterrupt(CPU.INTERRUPTS.LCDC);
            }
        }
    };

    private draw() {
        const lcdc = this.mem.memory[GPURegisters.LCDC];
        const lcdon = (lcdc & LCDControlRegisters.LCD_ENABLE) ? 1 : 0;

        if (lcdon) {
            this.renderLine();
            this.drawSprites(lcdc, this._line);
        }
    }

    private renderLine() {
        const lcdc = this.mem.memory[GPURegisters.LCDC];
        const WindowTileMap = ((lcdc >> 6) & 1) == 1;
        const WindowEnabled = ((lcdc >> 5) & 1) == 1;
        const tileSelect =    ((lcdc >> 4) & 1) == 1;
        const BgTileMap =     ((lcdc >> 3) & 1) == 1;
        const BgEnabled =     ((lcdc >> 0) & 1) == 1;

        const BgPalette = this.get_palette(GPURegisters.BGP);

        const SCX = this.mem.memory[GPURegisters.SCX];
        const SCY = this.mem.memory[GPURegisters.SCY];

        const WX = this.mem.memory[GPURegisters.WX];
        const WY = this.mem.memory[GPURegisters.WY];
        const winx = WX - 7;



        

        const ly = this._line;

        // RENDER TILES
        // the display is 166x144
        for (let lx = 0; lx < 160; lx++) {
            if (BgEnabled) {
                const realX = (lx + SCX) & 0xFF;
                const realY = (ly + SCY) & 0xFF;
                const color = this.GetTileColor(realX, realY, BgTileMap, tileSelect);
                const pixelIndex = this.PutPixel (lx, ly, BgPalette[color], this.bgImageData);
                this.PutPixel (lx, ly, BgPalette[color], this.screenData);
                this.pxMap [pixelIndex] = color;

            }
            
            if (WindowEnabled) {
                if (ly >= WY && lx >= winx) {
                    const realX = lx - winx;
                    const realY = ly - WY;
                    const color = this.GetTileColor(realX, realY, WindowTileMap, tileSelect);
                    const pixelIndex = this.PutPixel (lx, ly, BgPalette[color], this.winImageData);
                    this.PutPixel (lx, ly, BgPalette[color], this.screenData);
                    this.pxMap [pixelIndex] = color;
                }
            }
        }
    }

    private GetTileColor(x: number, y: number, tileMap: boolean, tileSelect: boolean): number {
        var mapbase = tileMap ? 0x9c00 : 0x9800;
        var tiledatabase = tileSelect ? 0x8000 : 0x9000;

        var mapindy = mapbase + (y >> 3) * 32;

        var mapind = mapindy + (x >> 3);    // (x / 8) Background tile map
        var patind = this.mem.memory[mapind]; // Get tile index at map

        // Calculate tile data address

        if (!tileSelect)
            patind = patind << 24 >> 24; // Complement tile index in 0x8800 mode

        const sub_ly = y & 7;
        var addr =
            tiledatabase + (patind << 4)    // (tile index * 16) Each tile is 16 bytes
            + (sub_ly * 2);           // (sub_ly * 2) Each line of a tile is 2 bytes

        // Get tile line data
        var lobyte = this.mem.memory[addr ++];
        var hibyte = this.mem.memory[addr];

        const color = this.GetColorIndex(hibyte, lobyte, x);
        return color;
    }

    private GetColorIndex(msb: number, lsb: number, bitPos: number): number {
        // Mix and draw current tile line pixel
        var bitmask = 1 << ((bitPos ^ 7) & 7);
        var nib = ((msb & bitmask) ? 2 : 0) | ((lsb & bitmask) ? 1 : 0);
        return nib;
    }

    private getTile(dataStart, index, size = 16) {
        const s = dataStart + index * size;
        return this.mem.memory.slice(s, s + size);
    }

    // Write a line of a tile (8 pixels) into a buffer array
    private parseTile(tileData, line, xflip?, yflip?) {
        xflip = xflip | 0;
        yflip = yflip | 0;
        var l = yflip ? 7 - line : line;
        var byteIndex = l * 2;
        var b1 = tileData[byteIndex++];
        var b2 = tileData[byteIndex++];

        let buf = new Array();

        var offset = 8;
        for (var pixel = 0; pixel < 8; pixel++) {
            offset--;
            var mask = (1 << offset);
            var colorValue = ((b1 & mask) >> offset) + ((b2 & mask) >> offset)*2;
            var p = xflip ? offset : pixel;
            buf[p] = colorValue;
        }
        return buf;
    };
    
    private PutPixel(x, y, color, imageData: ImageData) {
        var ind = (y * 160 + x);
        var pind = ind * 4;

        if (color == 255) color = 0;
        else if (color == 192) color = 1;
        else if (color == 96) color = 2;
        else if (color == 0) color = 3;
        var pal = GPU.PALLETE[color];

        // console.log(color)
        imageData.data[pind] = pal.r;
        imageData.data[pind + 1] = pal.g;
        imageData.data[pind + 2] = pal.b;
        imageData.data[pind + 3] = 0xff; // Full opacity

        return ind; // Don't let it go to waste <3
    };

    private getSprite(spriteId, height) {
        let spriteAddress = 0xFE00 + (spriteId * 4);
        let spriteY = this.mem.memory[(spriteAddress) - 16]; // Offset for display window.
        let spriteX = this.mem.memory[(spriteAddress + 1) - 8]; // Offset for display window.
        let tileId = this.mem.memory[(spriteAddress + 2)];
        let attributes = this.mem.memory[(spriteAddress + 3)];

        // TODO: Get sprite priority.

        let pixels = new Array();
        let tileAddress = 0x8000 + (tileId * 16);

        for (let y = 0; y < height; y++) {
            pixels[y] = [];

            let lb = this.mem.memory[(tileAddress + (y * 2))];
            let hb = this.mem.memory[(tileAddress + (y * 2) + 1)];
            for (let x = 0; x < 8; x++) {
                let l = lb & (1 << (7 - x)) ? 1 : 0;
                let h = hb & (1 << (7 - x)) ? 1 : 0;
                let color = (h << 1) + l;

                pixels[y][x] = color;
            }
        }

        return {
            id: spriteId,
            address: spriteAddress,
            tileId: tileId,
            x: spriteX,
            y: spriteY,
            xFlip: !!(attributes & 0x20),
            yFlip: !!(attributes & 0x40),
            pixels: pixels,
            palette: attributes & 0x10 ? this.mem.memory[0xFF49] : this.mem.memory[0xFF48],
            paletteId: attributes & 0x10,
            priority: attributes >> 7
        };
    }

    private drawSprites(LCDC, line) {
        if (!this.readBit(LCDC, 1)) {
            return;
        }
        var spriteHeight = this.readBit(LCDC, 2) ? 16 : 8;
    
        const OAM_START = 0xFE00;
        const OAM_END = 0xFE9F;

        var sprites = new Array();
        for (var i = OAM_START; i < OAM_END && sprites.length < 10; i += 4) {
            var y = this.mem.memory[i];
            var x = this.mem.memory[i+1];
            var index = this.mem.memory[i+2];
            var flags = this.mem.memory[i+3];
    
            if (y - 16 > line || y - 16 < line - spriteHeight) {
                continue;
            }
            sprites.push({x:x, y:y, index:index, flags:flags})
        }
    
        if (sprites.length == 0) return;

        // console.log("sprites", sprites)
    
        var spriteLineBuffer = new Array(160);

        for (var i = 0; i < sprites.length; i++) {
            var sprite = sprites[i];
            var tileLine = line - sprite.y + 16;
            var paletteNumber = this.readBit(flags, 4);
            var xflip = this.readBit(sprite.flags, 5);
            var yflip = this.readBit(sprite.flags, 6);
            var tileData = this.getTile(0x8000, sprite.index, spriteHeight * 2);
            const tileBuffer = this.parseTile(tileData, tileLine, xflip, yflip);

            this.copySpriteTileLine(spriteLineBuffer, tileBuffer, sprite.x - 8, paletteNumber, sprite);
        }

        // console.log(spriteLineBuffer)

        const objPalette = [
            this.get_palette(GPURegisters.OBP0),
            this.get_palette(GPURegisters.OBP1)
        ]

        var canvasoffs = this._line * 160 * 4;
        for (let i = 0; i < 160; i++) {
            const sc = spriteLineBuffer[i];
            if (!sc) {
                canvasoffs += 4;
                continue;
            }

            const spritePalette = objPalette[spriteLineBuffer[i].palette];
            this.spriteImageData.data[canvasoffs + 0] = spritePalette[sc.color];
            this.spriteImageData.data[canvasoffs + 1] = spritePalette[sc.color];
            this.spriteImageData.data[canvasoffs + 2] = spritePalette[sc.color];
            this.spriteImageData.data[canvasoffs + 3] = 255;


            this.screenData.data[canvasoffs + 0] = spritePalette[sc.color];
            this.screenData.data[canvasoffs + 1] = spritePalette[sc.color];
            this.screenData.data[canvasoffs + 2] = spritePalette[sc.color];
            this.screenData.data[canvasoffs + 3] = 255;

            canvasoffs+=4;
        }

        // this.copySpriteLineToBuffer(spriteLineBuffer, line);






//         var spriteHeight = this.readBit(LCDC, 2) ? 16 : 8;
    
//         const OAM_START = 0xFE00;
//         const OAM_END = 0xFE9F;

//         var sprites = new Array();
//         for (var i = OAM_START; i < OAM_END && sprites.length < 10; i += 4) {
//             var y = this.mem.memory[i];
//             var x = this.mem.memory[i+1];
//             var index = this.mem.memory[i+2];
//             var flags = this.mem.memory[i+3];
    
//             if (y - 16 > line || y - 16 < line - spriteHeight) {
//                 continue;
//             }
//             sprites.push({
//                 x:x, 
//                 y:y, 
//                 index:index, 
//                 flags:flags,
//                 xflip:(flags & 0b00100000) ? true : false,
//                 yflip:(flags & 0b00010000) ? true : false,
//                 behind:(flags & 0b10000000) ? true : false,
//             })
//         }
    
//         if (sprites.length == 0) return;

//         // Sort by x coordinates
//         sprites.sort ((a, b) => {
//             // Make sure its stable
//             if (b.x === a.x)
//                 return -1;
//             return b.x - a.x;
//         });

//         const objPalette = [
//             this.get_palette(GPURegisters.OBP0),
//             this.get_palette(GPURegisters.OBP1)
//         ]


//         for (var i = 0; i < sprites.length; i ++) {
//             var sprite = sprites [i];

//             var row = this._line + 16 - sprite.y;

//             var realY = sprite.y - 16 + row;
//             var realX = sprite.x - 8;

//             // Don't draw offscreen sprites
//             if (realY >= 144) // gbheight
//                 continue;

//             var tile = sprite.tile;
//             var height;

//             // If dubby sprites on set tall tile lsb to 0
//             if (spriteHeight) {
//                 tile &= 0xfe;
//                 height = 15;
//             }
//             else
//                 height = 7;

//             // Calculate address
//             var addr =
//                 (0x8000 + sprite.index * 16) + //[sprite tile index * 16])
//                 (tile << 4) // We dont actually add 0x8000 for more efficient vram reads
//                 // (sprite row * 2) we account for yflip as well
//                 + (sprite.yflip
//                     ? ((row ^ height) & height) << 1
//                     : row << 1);

// //     var tileData = this.getTile(0x8000, sprite.index, spriteHeight * 2);
//             // let addr = 0x8000 + sprite.index * 16;

//             var pxind_y = realY * 160; // gbwidth

//             // Get tile data
//             var lobyte = this.mem.memory[addr ++];
//             var hibyte = this.mem.memory[addr]

//             // Mix and draw all 8 pixels
//             for (var ii = 0; ii < 8; ii ++) {
//                 // Check for horizontal flip
//                 var bitmask = sprite.xflip
//                     ? 1 << (ii & 7)
//                     : 1 << ((ii ^ 7) & 7);

//                 // Get pixel data
//                 var nib =
//                     ((hibyte & bitmask) ? 2 : 0)
//                     | ((lobyte & bitmask) ? 1 : 0);

//                 var sx = realX + ii;
//                 if (
//                     !nib // pixels are transparent
//                     // Don't draw offscreen pixels
//                     || sx >= 160 // gbwidth
//                     || sx < 0
//                     // BG priority thingy
//                     || (sprite.behind && this.pxMap [pxind_y + sx] > 0)
//                 )
//                     continue;

//                 // Mix and draw !
//                 const palette = this.readBit(sprite.flags, 4)
//                 // console.log(objPalette, sprite.palette, nib, sprite, palette);
//                 // debugger;
//                 var px = objPalette[palette][nib];
//                 this.PutPixel (sx, realY, px, this.screenData);
//             }
//             // Next sprite pls !
//         }

    };

    // Copy a tile line from a tileBuffer to a line buffer, at a given x position
    private copySpriteTileLine(lineBuffer, tileBuffer, x, palette, sprite) {
        const behind = (sprite.flags & 0b10000000) ? true : false;
        
        var row = this._line + 16 - sprite.y;
        var realY = sprite.y - 16 + row;
        var pxind_y = realY * 160;

        // copy tile line to buffer
        for (var k = 0; k < 8; k++, x++) {
            if (x < 0 || x >= 160 || tileBuffer[k] == 0) continue;
            if (behind && this.pxMap[pxind_y + x] > 0) continue;

            lineBuffer[x] = {color:tileBuffer[k], palette: palette};
        }
    };

    private get_palette(address: number): number[] {
        const val = this.mem.memory[address];
        let palette = [255, 255, 255, 255];
        for (var i = 0; i < 4; i++) {
            switch ((val >> (i * 2)) & 3) {
                case 0: palette[i] = 255; break;
                case 1: palette[i] = 192; break;
                case 2: palette[i] = 96; break;
                case 3: palette[i] = 0; break;
            }
        }
        return palette;
    }
}