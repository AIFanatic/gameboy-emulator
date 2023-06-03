import { ExternalRam } from "./ExternalRam";
import { Memory } from "./Memory";

export enum MBCMode {
    ROM,
    RAM
};

export enum MBCType {
    MBC0,
    MBC1,
    MBC3,
    MBC5
};

export class MBC {
    public type: MBCType;
    
    protected memory: Memory;
    protected romBankNumber: number;
    protected mode: MBCMode;
    protected ramEnabled: boolean;

    constructor(memory: Memory) {
        this.romBankNumber = 0;
        this.memory = memory;
        this.mode = MBCMode.ROM;
    }

    public static getMbcInstance(memory, type): MBC {
        var instance;
        switch (type) {
            case 0x00:
                instance = new MBC0(memory);
                break;
            case 0x01: case 0x02: case 0x03:
                instance = new MBC1(memory);
                break;
            case 0x0F: case 0x10: case 0x11: case 0x12: case 0x13:
                instance = new MBC3(memory);
                break;
            case 0x19: case 0x1A: case 0x1B: case 0x1C: case 0x1D: case 0x1E:
                instance = new MBC5(memory);
                break;
            default:
                throw Error(`MBC type ${type} not supported`);
        }
    
        return instance;
    };

    public readRam(addr: number): number {
        return 0;
    };

    public loadRam(game, size: number) {
    };

    public manageWrite(addr: number, value: number) {
    };
}

class MBC0 extends MBC {
    constructor(memory: Memory) {
        super(memory);
        this.type = MBCType.MBC0;
    }
}

class MBC1 extends MBC {
    private extRam: ExternalRam;

    constructor(memory: Memory) {
        super(memory);
        this.type = MBCType.MBC1;
        this.romBankNumber = 1;
        this.ramEnabled = true;
        this.extRam = new ExternalRam();
    }

    public manageWrite(addr: number, value: number) {
        switch (addr & 0xF000) {
            case 0x0000: case 0x1000: // enable RAM
                this.ramEnabled = (value & 0x0A) ? true : false;
                if (this.ramEnabled) {
                    this.extRam.saveRamData();
                }
                break;
            case 0x2000: case 0x3000: // ROM bank number lower 5 bits
                value &= 0x1F;
                if (value == 0) value = 1;
                var mask = this.mode ? 0 : 0xE0;
                this.romBankNumber = (this.romBankNumber & mask) +value;
                this.memory._romoffs = this.romBankNumber * 0x4000;
                break;
            case 0x4000: case 0x5000: // RAM bank or high bits ROM
                value &= 0x03;
                if (this.mode == 0) { // ROM upper bits
                    this.romBankNumber = (this.romBankNumber&0x1F) | (value << 5);
                    this.memory._romoffs = this.romBankNumber * 0x4000;
                } else { // RAM bank
                    this.extRam.setRamBank(value);
                }
                break;
            case 0x6000: case 0x7000: // ROM / RAM mode
                this.mode = value & 1;
                break;
            case 0xA000: case 0xB000:
                this.extRam.manageWrite(addr - 0xA000, value);
                break;
        }
    };

    public readRam(addr: number) {
        return this.extRam.manageRead(addr - 0xA000);
    };

    public loadRam(game, size) {
        this.extRam.loadRam(game, size);
    };
}

class MBC3 extends MBC {
    private extRam: ExternalRam;

    constructor(memory: Memory) {
        super(memory);
        this.type = MBCType.MBC3;
        this.romBankNumber = 1;
        this.ramEnabled = true;
        this.extRam = new ExternalRam();
    }

    public loadRam(game, size: number) {
        this.extRam.loadRam(game, size);
    };

    public manageWrite(addr: number, value: number) {
        switch (addr & 0xF000) {
            case 0x0000: case 0x1000: // enable RAM
                this.ramEnabled = (value & 0x0A) ? true : false;
                if (this.ramEnabled) {
                    this.extRam.saveRamData();
                }
                break;
            case 0x2000: case 0x3000: // ROM bank number
                value &= 0x7F;
                if (value == 0) value = 1;
                this.romBankNumber = value;
                this.memory._romoffs = this.romBankNumber * 0x4000;
                break;
            case 0x4000: case 0x5000: // RAM bank
                this.extRam.setRamBank(value);
                break;
            case 0x6000: case 0x7000: // Latch clock data
                break;
            case 0xA000: case 0xB000:
                this.extRam.manageWrite(addr - 0xA000, value);
                break;
        }
    };

    public readRam(addr: number) {
        return this.extRam.manageRead(addr - 0xA000);
    };
}

const MBC5 = MBC3;