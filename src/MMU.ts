import { Cartrige } from ".";
import { CPU } from "./CPU";

const bootDMG = [
    0x31, 0xFE, 0xFF, 0xAF, 0x21, 0xFF, 0x9F, 0x32, 0xCB, 0x7C, 0x20, 0xFB, 0x21, 0x26, 0xFF, 0x0E,
    0x11, 0x3E, 0x80, 0x32, 0xE2, 0x0C, 0x3E, 0xF3, 0xE2, 0x32, 0x3E, 0x77, 0x77, 0x3E, 0xFC, 0xE0,
    0x47, 0x11, 0x04, 0x01, 0x21, 0x10, 0x80, 0x1A, 0xCD, 0x95, 0x00, 0xCD, 0x96, 0x00, 0x13, 0x7B,
    0xFE, 0x34, 0x20, 0xF3, 0x11, 0xD8, 0x00, 0x06, 0x08, 0x1A, 0x13, 0x22, 0x23, 0x05, 0x20, 0xF9,
    0x3E, 0x19, 0xEA, 0x10, 0x99, 0x21, 0x2F, 0x99, 0x0E, 0x0C, 0x3D, 0x28, 0x08, 0x32, 0x0D, 0x20,
    0xF9, 0x2E, 0x0F, 0x18, 0xF3, 0x67, 0x3E, 0x64, 0x57, 0xE0, 0x42, 0x3E, 0x91, 0xE0, 0x40, 0x04,
    0x1E, 0x02, 0x0E, 0x0C, 0xF0, 0x44, 0xFE, 0x90, 0x20, 0xFA, 0x0D, 0x20, 0xF7, 0x1D, 0x20, 0xF2,
    0x0E, 0x13, 0x24, 0x7C, 0x1E, 0x83, 0xFE, 0x62, 0x28, 0x06, 0x1E, 0xC1, 0xFE, 0x64, 0x20, 0x06,
    0x7B, 0xE2, 0x0C, 0x3E, 0x87, 0xE2, 0xF0, 0x42, 0x90, 0xE0, 0x42, 0x15, 0x20, 0xD2, 0x05, 0x20,
    0x4F, 0x16, 0x20, 0x18, 0xCB, 0x4F, 0x06, 0x04, 0xC5, 0xCB, 0x11, 0x17, 0xC1, 0xCB, 0x11, 0x17,
    0x05, 0x20, 0xF5, 0x22, 0x23, 0x22, 0x23, 0xC9, 0xCE, 0xED, 0x66, 0x66, 0xCC, 0x0D, 0x00, 0x0B,
    0x03, 0x73, 0x00, 0x83, 0x00, 0x0C, 0x00, 0x0D, 0x00, 0x08, 0x11, 0x1F, 0x88, 0x89, 0x00, 0x0E,
    0xDC, 0xCC, 0x6E, 0xE6, 0xDD, 0xDD, 0xD9, 0x99, 0xBB, 0xBB, 0x67, 0x63, 0x6E, 0x0E, 0xEC, 0xCC,
    0xDD, 0xDC, 0x99, 0x9F, 0xBB, 0xB9, 0x33, 0x3E, 0x3C, 0x42, 0xB9, 0xA5, 0xB9, 0xA5, 0x42, 0x3C,
    0x21, 0x04, 0x01, 0x11, 0xA8, 0x00, 0x1A, 0x13, 0xBE, 0x00, 0x00, 0x23, 0x7D, 0xFE, 0x34, 0x20,
    0xF5, 0x06, 0x19, 0x78, 0x86, 0x23, 0x05, 0x20, 0xFB, 0x86, 0x00, 0x00, 0x3E, 0x01, 0xE0, 0x50
];

function AddressInRange(address: number, min: number, max: number) {
    return address >= min && address <= max;
}

export class MMU {
    private cpu: CPU;
    private cartridge: Uint8Array;

    private work_ram: Uint8Array;
    private oam_ram: Uint8Array;
    private high_ram: Uint8Array;

    private disable_boot_rom_switch: number;

    constructor(cpu: CPU, cartridge: Cartrige) {
        this.cpu = cpu;
        this.cartridge = cartridge.buffer.getData();

        this.work_ram = new Uint8Array(0x8000);
        this.oam_ram = new Uint8Array(0xA0);
        this.high_ram = new Uint8Array(0x80);
    }

    public read(address: number): number {
        if (AddressInRange(address, 0x0, 0x7FFF)) {
            if (AddressInRange(address, 0x0, 0xFF) && this.boot_rom_active()) {
                return bootDMG[address];
            }
            return this.cartridge[address];
        }
    
        /* VRAM */
        if (AddressInRange(address, 0x8000, 0x9FFF)) {
            return gb.video.read(address - 0x8000);
        }
    
        /* External (cartridge) RAM */
        if (AddressInRange(address, 0xA000, 0xBFFF)) {
            return this.cartridge[address];
        }
    
        /* Internal work RAM */
        if (AddressInRange(address, 0xC000, 0xDFFF)) {
            return this.work_ram[address - 0xC000];
        }
    
        if (AddressInRange(address, 0xE000, 0xFDFF)) {
            /* log_warn("Attempting to read from mirrored work RAM"); */
            return this.read(address - 0x2000);
        }
    
        /* OAM */
        if (AddressInRange(address, 0xFE00, 0xFE9F)) {
            return this.oam_ram[address - 0xFE00];
        }
    
        if (AddressInRange(address, 0xFEA0, 0xFEFF)) {
            console.warn("Attempting to read from unusable memory 0x%x", address);
            return 0xFF;
        }
    
        /* Mapped IO */
        if (AddressInRange(address, 0xFF00, 0xFF7F)) {
            return this.read_io(address);
        }
    
        /* Zero Page ram */
        if (AddressInRange(address, 0xFF80, 0xFFFE)) {
            return this.high_ram[address - 0xFF80];
        }
    
        /* Interrupt Enable register */
        if (address == 0xFFFF) {
            return gb.cpu.interrupt_enabled.value();
        }
    
        throw Error("Attempted to read from unmapped memory address 0x%X" + address);
    }


    public read_io(address: number): number {
        switch (address) {
            case 0xFF00:
                return gb.input.get_input();
    
            case 0xFF01:
                return gb.serial.read();
    
            case 0xFF02:
                console.warn("Attempted to read serial transfer control");
                return 0xFF;
    
            case 0xFF03:
                return this.unmapped_io_read(address);
    
            case 0xFF04:
                return gb.timer.get_divider();
    
            case 0xFF05:
                return gb.timer.get_timer();
    
            case 0xFF06:
                return gb.timer.get_timer_modulo();
    
            case 0xFF07:
                return gb.timer.get_timer_control();
    
            case 0xFF08:
            case 0xFF09:
            case 0xFF0A:
            case 0xFF0B:
            case 0xFF0C:
            case 0xFF0D:
            case 0xFF0E:
                return this.unmapped_io_read(address);
    
            case 0xFF0F:
                return gb.cpu.interrupt_flag.value();
    
            /* TODO: Audio - Channel 1: Tone & Sweep */
            case 0xFF10:
            case 0xFF11:
            case 0xFF12:
            case 0xFF13:
            case 0xFF14:
                return 0xFF;
    
            case 0xFF15:
                return this.unmapped_io_read(address);
    
            /* TODO: Audio - Channel 2: Tone */
            case 0xFF16:
            case 0xFF17:
            case 0xFF18:
            case 0xFF19:
                return 0xFF;
    
            /* TODO: Audio - Channel 3: Wave Output */
            case 0xFF1A:
            case 0xFF1B:
            case 0xFF1C:
            case 0xFF1D:
            case 0xFF1E:
            case 0xFF1F:
                return 0xFF;
    
            /* TODO: Audio - Channel 4: Noise */
            case 0xFF20:
            case 0xFF21:
            case 0xFF22:
            case 0xFF23:
                return 0xFF;
    
            /* TODO: Audio - Channel control/ON-OFF/Volume */
            case 0xFF24:
                return 0xFF;
    
            /* TODO: Audio - Selection of sound output terminal */
            case 0xFF25:
                return 0xFF;
    
            /* TODO: Audio - Sound on/off */
            case 0xFF26:
                return 0xFF;
    
            case 0xFF27:
            case 0xFF28:
            case 0xFF29:
            case 0xFF2A:
            case 0xFF2B:
            case 0xFF2C:
            case 0xFF2D:
            case 0xFF2E:
            case 0xFF2F:
                return this.unmapped_io_read(address);
    
            /* TODO: Audio - Wave pattern RAM */
            case 0xFF30:
            case 0xFF31:
            case 0xFF32:
            case 0xFF33:
            case 0xFF34:
            case 0xFF35:
            case 0xFF36:
            case 0xFF37:
            case 0xFF38:
            case 0xFF39:
            case 0xFF3A:
            case 0xFF3B:
            case 0xFF3C:
            case 0xFF3D:
            case 0xFF3E:
            case 0xFF3F:
                return 0xFF;
    
            case 0xFF40:
                return gb.video.control_byte;
    
            case 0xFF41:
                return gb.video.lcd_status.value();
    
            case 0xFF42:
                return gb.video.scroll_y.value();
    
            case 0xFF43:
                return gb.video.scroll_x.value();
    
            case 0xFF44:
                return gb.video.line.value();
    
            case 0xFF45:
                return gb.video.ly_compare.value();
    
            case 0xFF46:
                log_warn("Attempted to read from write-only DMA Transfer/Start Address (0xFF46)");
                return 0xFF;
    
            case 0xFF47:
                return gb.video.bg_palette.value();
    
            case 0xFF48:
                return gb.video.sprite_palette_0.value();
    
            case 0xFF49:
                return gb.video.sprite_palette_1.value();
    
            case 0xFF4A:
                return gb.video.window_y.value();
    
            case 0xFF4B:
                return gb.video.window_x.value();
    
            /* TODO: CGB mode behaviour */
            case 0xFF4C:
                return 0xFF;
    
            case 0xFF4D:
                console.warn("Attempted to read from 'Prepare Speed Switch' register");
                return 0x0;
    
            case 0xFF4E:
            case 0xFF4F:
                return this.unmapped_io_read(address);
    
            /* Disable boot rom switch */
            case 0xFF50:
                return this.disable_boot_rom_switch;
    
            case 0xFF51:
                console.warn("Attempted to read from VRAM DMA Source (hi)");
                return 0xFF;
    
            case 0xFF52:
                console.warn("Attempted to read from VRAM DMA Source (lo)");
                return 0xFF;
    
            case 0xFF53:
                console.warn("Attempted to read from VRAM DMA Destination (hi)");
                return 0xFF;
    
            case 0xFF54:
                console.warn("Attempted to read from VRAM DMA Destination (lo)");
                return 0xFF;
    
            case 0xFF55:
                console.warn("Attempted to read from VRAM DMA Length/Mode/Start");
                return 0xFF;
    
            case 0xFF56:
                console.warn("Attempted to read from infrared port");
                return 0xFF;
    
            case 0xFF57:
            case 0xFF58:
            case 0xFF59:
            case 0xFF5A:
            case 0xFF5B:
            case 0xFF5C:
            case 0xFF5D:
            case 0xFF5E:
            case 0xFF5F:
            case 0xFF60:
            case 0xFF61:
            case 0xFF62:
            case 0xFF63:
            case 0xFF64:
            case 0xFF65:
            case 0xFF66:
            case 0xFF67:
                return this.unmapped_io_read(address);
    
            /* TODO: Background color palette spec/index */
            case 0xFF68:
                console.warn("Attempted to read from CGB background color palette spec/index");
                return 0xFF;
    
            /* TODO: Background color palette data */
            case 0xFF69:
                console.warn("Attempted to read from CGB background color data");
                return 0xFF;
    
            /* TODO: OBJ color palette spec/index */
            case 0xFF6A:
                console.warn("Attempted to read from CGB OBJ color palette spec/index");
                return 0xFF;
    
            /* TODO: OBJ color palette data */
            case 0xFF6B:
                console.warn("Attempted to read from CGB OBJ color palette data");
                return 0xFF;
    
            /* TODO: Object priority mode */
            case 0xFF6C:
                console.warn("Attempted to read from CGB object priority mode");
                return 0xFF;
    
            case 0xFF6D:
            case 0xFF6E:
            case 0xFF6F:
                return this.unmapped_io_read(address);
    
            /* TODO: CGB WRAM bank */
            case 0xFF70:
                console.warn("Attempted to read from CGB WRAM bank");
                return 0xFF;
    
            /* TODO: Some undocumented registers in this range */
            case 0xFF71:
            case 0xFF72:
            case 0xFF73:
            case 0xFF74:
            case 0xFF75:
            case 0xFF76:
            case 0xFF77:
            case 0xFF78:
            case 0xFF79:
            case 0xFF7A:
            case 0xFF7B:
            case 0xFF7C:
            case 0xFF7D:
            case 0xFF7E:
            case 0xFF7F:
                return this.unmapped_io_read(address);
    
            default:
                throw Error("Unmapped IO address: 0x%x" + address);
        }
    }
    
    public unmapped_io_read(address: number): number {
        console.warn("Attempting to read from unused IO address 0x%x", address);
        return 0xFF;
    }


    public write(address: number, byte: number) {
        if (AddressInRange(address, 0x0000, 0x7FFF)) {
            this.cartridge[address] = byte;
            return;
        }

        /* VRAM */
        if (AddressInRange(address, 0x8000, 0x9FFF)) {
            gb.video.write(address.value() - 0x8000, byte);
            return;
        }

        /* External (cartridge) RAM */
        if (AddressInRange(address, 0xA000, 0xBFFF)) {
            this.cartridge[address] = byte;
            return;
        }

        /* Internal work RAM */
        if (AddressInRange(address, 0xC000, 0xDFFF)) {
            this.work_ram[address - 0xC000] = byte;
            return;
        }

        /* Mirrored RAM */
        if (AddressInRange(address, 0xE000, 0xFDFF)) {
            console.warn("Attempting to write to mirrored work RAM");
            this.write(address - 0x2000, byte);
            return;
        }

        /* OAM */
        if (AddressInRange(address, 0xFE00, 0xFE9F)) {
            this.oam_ram[address - 0xFE00] = byte;
            return;
        }

        if (AddressInRange(address, 0xFEA0, 0xFEFF)) {
            console.warn("Attempting to write to unusable memory 0x%x - 0x%x", address.value(), byte);
            return;
        }

        /* Mapped IO */
        if (AddressInRange(address, 0xFF00, 0xFF7F)) {
            this.write_io(address, byte);
            return;
        }

        /* Zero Page ram */
        if (AddressInRange(address, 0xFF80, 0xFFFE)) {
            this.high_ram[address - 0xFF80] = byte;
            return;
        }

        /* Interrupt Enable register */
        if (address == 0xFFFF) {
            this.cpu.interrupt_enabled.set(byte);
            return;
        }

        throw Error("Attempted to write to unmapped memory address 0x%X" + address);
    }

    public write_io(address: number, byte: number) {
        switch (address) {
            case 0xFF00:
                gb.input.write(byte);
                return;

            case 0xFF01:
                /* Serial data transfer (SB) */
                gb.serial.write(byte);
                return;

            case 0xFF02:
                /* Serial data transfer (SB) */
                gb.serial.write_control(byte);
                return;

            case 0xFF03:
                return this.unmapped_io_write(address, byte);

            case 0xFF04:
                gb.timer.reset_divider();
                return;

            case 0xFF05:
                /* TODO: Time control */
                console.warn("Wrote to timer counter");
                return;

            case 0xFF06:
                gb.timer.set_timer_modulo(byte);
                return;

            case 0xFF07:
                gb.timer.set_timer_control(byte);
                return;

            case 0xFF08:
            case 0xFF09:
            case 0xFF0A:
            case 0xFF0B:
            case 0xFF0C:
            case 0xFF0D:
            case 0xFF0E:
                return this.unmapped_io_write(address, byte);

            case 0xFF0F:
                gb.cpu.interrupt_flag.set(byte);
                return;

            /* TODO: Audio - Channel 1: Tone & Sweep */
            case 0xFF10:
            case 0xFF11:
            case 0xFF12:
            case 0xFF13:
            case 0xFF14:
                return;

            case 0xFF15:
                return this.unmapped_io_write(address, byte);

            /* TODO: Audio - Channel 2: Tone */
            case 0xFF16:
            case 0xFF17:
            case 0xFF18:
            case 0xFF19:
                return;

            /* TODO: Audio - Channel 3: Wave Output */
            case 0xFF1A:
            case 0xFF1B:
            case 0xFF1C:
            case 0xFF1D:
            case 0xFF1E:
                return;

            case 0xFF1F:
                return this.unmapped_io_write(address, byte);

            /* TODO: Audio - Channel 4: Noise */
            case 0xFF20:
            case 0xFF21:
            case 0xFF22:
            case 0xFF23:
                return;

            /* TODO: Audio - Channel control/ON-OFF/Volume */
            case 0xFF24:
                return;

            /* TODO: Audio - Selection of sound output terminal */
            case 0xFF25:
                return;

            /* TODO: Audio - Sound on/off */
            case 0xFF26:
                console.warn("Wrote to sound on/off address 0x%x - 0x%x", address, byte);
                return;

            case 0xFF27:
            case 0xFF28:
            case 0xFF29:
            case 0xFF2A:
            case 0xFF2B:
            case 0xFF2C:
            case 0xFF2D:
            case 0xFF2E:
            case 0xFF2F:
                return this.unmapped_io_write(address, byte);

            /* TODO: Audio - Wave pattern RAM */
            case 0xFF30:
            case 0xFF31:
            case 0xFF32:
            case 0xFF33:
            case 0xFF34:
            case 0xFF35:
            case 0xFF36:
            case 0xFF37:
            case 0xFF38:
            case 0xFF39:
            case 0xFF3A:
            case 0xFF3B:
            case 0xFF3C:
            case 0xFF3D:
            case 0xFF3E:
            case 0xFF3F:
                return;

            /* Switch on LCD */
            case 0xFF40:
                gb.video.control_byte = byte;
                return;

            case 0xFF41:
                gb.video.lcd_status.set(byte);
                return;

            /* Vertical Scroll Register */
            case 0xFF42:
                gb.video.scroll_y.set(byte);
                return;

            /* Horizontal Scroll Register */
            case 0xFF43:
                gb.video.scroll_x.set(byte);
                return;

            /* LY - Line Y coordinate */
            case 0xFF44:
                /* "Writing will reset the counter */
                gb.video.line.set(0x0);
                return;

            case 0xFF45:
                gb.video.ly_compare.set(byte);
                return;

            case 0xFF46:
                this.dma_transfer(byte);
                return;

            case 0xFF47:
                gb.video.bg_palette.set(byte);
                console.log("Set video palette: 0x%x", byte);
                return;

            case 0xFF48:
                gb.video.sprite_palette_0.set(byte);
                console.log("Set sprite palette 0: 0x%x", byte);
                return;

            case 0xFF49:
                gb.video.sprite_palette_1.set(byte);
                console.log("Set sprite palette 1: 0x%x", byte);
                return;

            case 0xFF4A:
                gb.video.window_y.set(byte);
                return;

            case 0xFF4B:
                gb.video.window_x.set(byte);
                return;

            /* TODO: CGB mode behaviour */
            case 0xFF4C:
                return;

            case 0xFF4D:
                console.warn("Attempted to write to 'Prepare Speed Switch' register");
                return;

            case 0xFF4E:
            case 0xFF4F:
                return this.unmapped_io_write(address, byte);

            /* Disable boot rom switch */
            case 0xFF50:
                this.disable_boot_rom_switch = byte;
                console.log("Boot rom was disabled");
                return;

            case 0xFF51:
                console.warn("Attempted to write to VRAM DMA Source (hi)");
                return;

            case 0xFF52:
                console.warn("Attempted to write to VRAM DMA Source (lo)");
                return;

            case 0xFF53:
                console.warn("Attempted to write to VRAM DMA Destination (hi)");
                return;

            case 0xFF54:
                console.warn("Attempted to write to VRAM DMA Destination (lo)");
                return;

            case 0xFF55:
                console.warn("Attempted to write to VRAM DMA Length/Mode/Start");
                return;

            case 0xFF56:
                console.warn("Attempted to write to infrared port");
                return;

            case 0xFF57:
            case 0xFF58:
            case 0xFF59:
            case 0xFF5A:
            case 0xFF5B:
            case 0xFF5C:
            case 0xFF5D:
            case 0xFF5E:
            case 0xFF5F:
            case 0xFF60:
            case 0xFF61:
            case 0xFF62:
            case 0xFF63:
            case 0xFF64:
            case 0xFF65:
            case 0xFF66:
            case 0xFF67:
                return this.unmapped_io_write(address, byte);

            /* TODO: Background color palette spec/index */
            case 0xFF68:
                console.warn("Attempted to write to CGB background color palette spec/index");
                return;

            /* TODO: Background color palette data */
            case 0xFF69:
                console.warn("Attempted to write to CGB background color data");
                return;

            /* TODO: OBJ color palette spec/index */
            case 0xFF6A:
                console.warn("Attempted to write to CGB OBJ color palette spec/index");
                return;

            /* TODO: OBJ color palette data */
            case 0xFF6B:
                console.warn("Attempted to write to CGB OBJ color palette data");
                return;

            /* TODO: Object priority mode */
            case 0xFF6C:
                console.warn("Attempted to write to CGB object priority mode");
                return;

            case 0xFF6D:
            case 0xFF6E:
            case 0xFF6F:
                return this.unmapped_io_write(address, byte);

            /* TODO: CGB WRAM bank */
            case 0xFF70:
                console.warn("Attempted to write to CGB WRAM bank");
                return;

            /* TODO: Some undocumented registers in this range */
            case 0xFF71:
            case 0xFF72:
            case 0xFF73:
            case 0xFF74:
            case 0xFF75:
            case 0xFF76:
            case 0xFF77:
            case 0xFF78:
            case 0xFF79:
            case 0xFF7A:
            case 0xFF7B:
            case 0xFF7C:
            case 0xFF7D:
            case 0xFF7E:
            case 0xFF7F:
                return this.unmapped_io_write(address, byte);

            default:
                throw Error("Unmapped IO address: 0x%x", address);
        }
    }

    public unmapped_io_write(address: number, byte: number) {
        console.warn("Attempting to write to unused IO address 0x%x - 0x%x", address, byte);
    }

    public boot_rom_active(): boolean { return this.read(0xFF50) != 0x1; }

    public dma_transfer(byte: number) {
        const start_address = byte * 0x100;

        for (let i = 0x0; i <= 0x9F; i++) {
            const from_address = start_address + i;
            const to_address = 0xFE00 + i;

            const value_at_address = this.read(from_address);
            this.write(to_address, value_at_address);
        }
    }

    public readByte(address: number): number {
        return this.read(address);
    }

    public readWord(address: number): number {
        return this.readByte(address) + (this.readByte(address + 1) << 8); 
    }

    public writeByte(address: number, value: number) {
        this.write(address, value);
    }

    public writeWord(address, value) {
        this.writeByte(address, value & 255); this.writeByte(address + 1, value >> 8);
    }

    public dump(from: number, to: number) {
        for (let i = from; i < to; i++) {
            console.log(`0x${i.toString(16)}: 0x${this.read(i).toString(16)}`);
        }
    }
}