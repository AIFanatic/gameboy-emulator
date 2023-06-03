import { CPU } from "./CPU";

export class ALUInstructions {
    private cpu: CPU;

    constructor(cpu: CPU) {
        this.cpu = cpu;
    }

    public CP(value: number) {
        this.cpu.reg.flags.Z = this.cpu.reg.a == value;
        this.cpu.reg.flags.H = (this.cpu.reg.a & 0xF) < (value & 0xF);
        this.cpu.reg.flags.N = true;
        this.cpu.reg.flags.C = this.cpu.reg.a < value;
    }

    public OR(value: number) {
        this.cpu.reg.a |= value & 0xFF;
        this.cpu.reg.flags.Z = this.cpu.reg.a == 0;
        this.cpu.reg.flags.H = false
        this.cpu.reg.flags.N = false
        this.cpu.reg.flags.C = false
    }

    public XOR(value: number) {
        this.cpu.reg.a ^= value & 0xFF;
        this.cpu.reg.a &= 0xFF;
        this.cpu.reg.flags.Z = this.cpu.reg.a == 0;
        this.cpu.reg.flags.H = false
        this.cpu.reg.flags.N = false
        this.cpu.reg.flags.C = false
    }

    public AND(value: number) {
        this.cpu.reg.a &= value & 0xFF;
        this.cpu.reg.flags.Z = this.cpu.reg.a == 0;
        this.cpu.reg.flags.H = true;
        this.cpu.reg.flags.N = false;
        this.cpu.reg.flags.C = false;
    }

    public SUB(value: number) {
        this.CP(value);
        this.cpu.reg.a = (this.cpu.reg.a - value) & 255;
    }

    public ADD(value: number) {
        const n = (this.cpu.reg.a + value);
        this.cpu.reg.flags.Z = (n & 0xFF) == 0;
        this.cpu.reg.flags.H = (((this.cpu.reg.a&0x0F)+(value&0x0F))&0x10) == 0x10;
        this.cpu.reg.flags.C = n > 0xFF;
        this.cpu.reg.flags.N = false;
        this.cpu.reg.a = n & 0xFF;
    }

    public ADC(value: number) {
        // let n = this.cpu.reg.a + value;
        // if (this.cpu.reg.flags.C) {
        //     n++;
        // }
        // this.cpu.reg.flags.Z = (n & 0xFF) == 0
        // this.cpu.reg.flags.H = (((this.cpu.reg.a&0x0F)+(value&0x0F))&0x10) == 0x10;
        // this.cpu.reg.flags.C = n > 0xFF;
        // this.cpu.reg.flags.N = false;
        // this.cpu.reg.a = n & 0xFF;



		var tempValue = (value & 0xFF);
		var dirtySum = this.cpu.reg.a + tempValue + ((this.cpu.reg.flags.C) ? 1 : 0);
		this.cpu.reg.flags.H = ((this.cpu.reg.a & 0xF) + (tempValue & 0xF) + ((this.cpu.reg.flags.C) ? 1 : 0) > 0xF);
		this.cpu.reg.flags.C = (dirtySum > 0xFF);
		this.cpu.reg.a = dirtySum & 0xFF;
		this.cpu.reg.flags.Z = (this.cpu.reg.a == 0);
		this.cpu.reg.flags.N = false;
    }

    public DEC(value: number, word = false): number {
        value = (value - 1)
        if (word) value = value & 0xFFFF;
        else value = value & 0xFF;
        this.cpu.reg.flags.Z = value == 0;
        this.cpu.reg.flags.N = true;
        this.cpu.reg.flags.H = (value & 0xF) == 0xF;
        return value;
    }

    public INC(value: number, word = false): number {
        // value = (value + 1);
        // if (word) value = value & 0xFFFF;
        // else value = value & 0xFF;
        // this.cpu.reg.flags.Z = value == 0;
        // this.cpu.reg.flags.N = false;
        // this.cpu.reg.flags.H = (value & 0xF) == 0xF;
        // return value;
        value = (value + 1) & 0xFF;
        this.cpu.reg.flags.Z = (value == 0);
        this.cpu.reg.flags.H = ((value & 0xF) == 0);
        this.cpu.reg.flags.N = false;
        return value;
    }

    public RR(value: number): number {
        const oldcarry = this.cpu.reg.flags.C
        this.cpu.reg.flags.C = (value & 0x1) == 0x1;
        this.cpu.reg.flags.H = false
        this.cpu.reg.flags.N = false
        value >>= 1
        if (oldcarry) {
            value |= (1 << 7)
        }
        this.cpu.reg.flags.Z = value == 0
        return value
    }

    public RRC(value: number): number {
        this.cpu.reg.flags.C = (value & 0x1) == 0x1;
        this.cpu.reg.flags.H = false;
        this.cpu.reg.flags.N = false;
        value >>= 1;
        if (this.cpu.reg.flags.C) {
            value |= (1 << 7);
        }
        this.cpu.reg.flags.Z = value == 0;
        return value;
    }

    public RLC(value: number): number {
        this.cpu.reg.flags.C = (value & (1 << 7)) == (1 << 7);
        this.cpu.reg.flags.H = false;
        this.cpu.reg.flags.N = false;
        value <<= 1;
        if (this.cpu.reg.flags.C) {
            value |= 0x1;
        }
        value = value & 0xFF;
        this.cpu.reg.flags.Z = value == 0;
        return value;
    }

    public RL(value: number): number {
        // const oldcarry = this.cpu.reg.flags.C;
        // this.cpu.reg.flags.C = (value & (1 << 7)) == (1 << 7);
        // this.cpu.reg.flags.H = false;
        // this.cpu.reg.flags.N = false;
        // value <<= 1;
        // if (oldcarry) {
        //     value |= 0x1;
        // }
        // this.cpu.reg.flags.Z = value == 0;
        // return value;

        var newFCarry = (value > 0x7F);
        value = ((value << 1) & 0xFF) | ((this.cpu.reg.flags.C) ? 1 : 0);
        this.cpu.reg.flags.C = newFCarry;
        this.cpu.reg.flags.H = this.cpu.reg.flags.N = false;
        this.cpu.reg.flags.Z = (value == 0);
        return value;
    }

    public BIT(value: number, b: number) {
		this.cpu.reg.flags.H = true;
		this.cpu.reg.flags.N = false;
		this.cpu.reg.flags.Z = ((value & b) == 0);
    }

    public SBC(b: number) {
        // this.cpu.reg.flags.H = (this.cpu.reg.a&0xF - b&0xF) < 0;
        // this.cpu.reg.flags.C = (this.cpu.reg.a - b - 1) < 0;
        // this.cpu.reg.flags.N = true;
        // this.cpu.reg.a -= b;
        // this.cpu.reg.a--;
        // this.cpu.reg.flags.Z = this.cpu.reg.a == 0;

        var dirtySum = this.cpu.reg.a - b - ((this.cpu.reg.flags.C) ? 1 : 0);
        this.cpu.reg.flags.H = ((this.cpu.reg.a & 0xF) - (b & 0xF) - ((this.cpu.reg.flags.C) ? 1 : 0) < 0);
        this.cpu.reg.flags.C = (dirtySum < 0);
        this.cpu.reg.a = dirtySum & 0xFF;
        this.cpu.reg.flags.Z = (this.cpu.reg.a == 0);
        this.cpu.reg.flags.N = true;
    }

    public SLA(value: number): number {
        this.cpu.reg.flags.C = (value > 0x7F);
		value = (value << 1) & 0xFF;
		this.cpu.reg.flags.H = this.cpu.reg.flags.N = false;
		this.cpu.reg.flags.Z = (value == 0);
        return value;
    }

    public SRL(value: number): number {
        this.cpu.reg.flags.C = (value & 0x1) != 0;
        value >>= 1;
        this.cpu.reg.flags.Z = value == 0;
        this.cpu.reg.flags.H = false;
        this.cpu.reg.flags.N = false;
        return value
    }

    public SRA(value: number): number {
		this.cpu.reg.flags.C = ((value & 0x01) == 0x01);
		value = (value & 0x80) | (value >> 1);
		this.cpu.reg.flags.H = this.cpu.reg.flags.N = false;
		this.cpu.reg.flags.Z = (value == 0);
        return value;
    }

    // Not ALU
    public SWAP(val: number): number {
        this.cpu.reg.flags.Z = val == 0;
        this.cpu.reg.flags.N = false;
        this.cpu.reg.flags.H = false;
        this.cpu.reg.flags.C = false;
        return ((val & 0xF) << 4) | ((val & 0xF0) >> 4);
    }
}