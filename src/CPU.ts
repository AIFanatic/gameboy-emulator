import { ALUInstructions } from "./ALUInstructions";
import { CBInstruction, CBOpcodeInstructions } from "./CBOpcodeInstructions";
import { Memory } from "./Memory";
import { Instruction, OpcodeInstructions } from "./OpcodeInstructions";
import { OpcodeTicks } from "./Opcodes";
import { Registers } from "./Registers";

// Utility functions
var Util = {
    // Add to the first argument the properties of all other arguments
    extend: function(target /*, source1, source2, etc. */) {
        var sources = Array.prototype.slice.call(arguments);
        for (var i in sources) {
            var source = sources[i];
            for (var name in source) {
                target[name] = source[name];
            }
        }

        return target;
    },
    testFlag: function(p, cc) {
        var test=1;
        var mask=0x10;
        if (cc=='NZ'||cc=='NC') test=0;
        if (cc=='NZ'||cc=='Z')  mask=0x80;
        return (test && p.r.F&mask) || (!test && !(p.r.F&mask));
    },
    getRegAddr: function(p, r1, r2) {return Util.makeword(p.r[r1], p.r[r2]);},

    // make a 16 bits word from 2 bytes
    makeword: function(b1, b2) {return (b1 << 8) + b2;},

    // return the integer signed value of a given byte
    getSignedValue: function(v) {return v & 0x80 ? v-256 : v;},

    // extract a bit from a byte
    readBit: function(byte, index) {
        return (byte >> index) & 1;
    }
};


export class CPU {
    public _stopped: boolean;

    public get stopped(): boolean {
        return this._stopped;
    }

    public set stopped(value: boolean) {
        console.warn("stop triggered");
        if (this.reg) {
            console.log(`PC: 0x${this.reg.pc.toString(16)}`);
        }
        this._stopped = value;
    }

    private isHalted: boolean;

    public mem: Memory;
    public reg: Registers;
    public readonly alu: ALUInstructions;
    private readonly ops: Instruction;
    public readonly cbops: CBInstruction;

    public gbcMode: boolean = false;

    public ticks: number;

    private IME = true;

    public static INTERRUPTS = {
        VBLANK: 0,
        LCDC:   1,
        TIMER:  2,
        SERIAL: 3,
        HILO:   4
    };

    constructor(memory: Memory) {
        this.stopped = false;
        this.mem = memory;
        this.reg = new Registers();
        this.ops = new OpcodeInstructions(this).instructions;
        this.cbops = new CBOpcodeInstructions(this).instructions;
        this.alu = new ALUInstructions(this);
    }

    public reset() {
        this.reg.sp = 0xfffe;
        this.reg.pc = 0x0100;

        this.reg.flags.Z = false;
        this.reg.flags.H = false;
        this.reg.flags.C = false;
        this.reg.flags.N = false;

        this.ticks = 0;
        this.isHalted = false;
    }

    public nextByte(): number {
        const b = this.mem.readByte(this.reg.pc);
        this.reg.pc++;
        return b;
    }

    public nextWord(): number {
        const b = this.mem.readWord(this.reg.pc);
        this.reg.pc+=2;
        return b;
    }

    public nextRelative(): number {
        const b = this.nextByte();
        return (this.reg.pc + (b & 0x7F) - (b & 0x80)) & 0xFFFF;
    }

    public pushWord(value: number) {
        this.reg.sp -= 2;
        this.writeWord(this.reg.sp, value);
    }

    public popWord(): number {
        const value = this.mem.readWord(this.reg.sp);
        this.reg.sp += 2;
        return value;
    }

    public writeWord(address: number, value: number) {
        this.mem.writeWord(address, value);
    }

    public step() {
        if (!this.isHalted && !this.stopped) {
            const instruction = this.nextByte();
            // console.log(instruction)
            this.ops[instruction]();

            this.ticks += (OpcodeTicks[instruction]);
        }
        else {
            this.ticks += 4;
        }
    }



    public halt = function() {
        this.isHalted = true;
    };

    public unhalt = function() {
        this.isHalted = false;
    };

    // Look for interrupt flags
    public checkInterrupt() {
        if (!this.IME) {
            return;
        }
        for (var i = 0; i < 5; i++) {
            var IFval = this.mem.rb(0xFF0F);
            if (Util.readBit(IFval, i) && this.isInterruptEnable(i)) {
                IFval &= (0xFF - (1<<i));
                this.mem.wb(0xFF0F, IFval);
                this.disableInterrupts();
                this.ticks += 4; // 20 clocks to serve interrupt, with 16 for RSTn
                
                if (i == 0) this.rst(0x40);
                else if (i == 1) this.rst(0x48);
                else if (i == 2) this.rst(0x50);
                else if (i == 3) this.rst(0x58);
                else if (i == 4) this.rst(0x60);
                
                // CPU.interruptRoutines[i](this);
                // public interruptRoutines = {
                //     0: function(p){GameboyJS.cpuOps.RSTn(p, 0x40);},
                //     1: function(p){GameboyJS.cpuOps.RSTn(p, 0x48);},
                //     2: function(p){GameboyJS.cpuOps.RSTn(p, 0x50);},
                //     3: function(p){GameboyJS.cpuOps.RSTn(p, 0x58);},
                //     4: function(p){GameboyJS.cpuOps.RSTn(p, 0x60);}
                // };
                break;
            }
        }
    };

    private rst(value: number) {
        this.pushWord(this.reg.pc);
        this.reg.pc = value;
    }

    public RSTInst(value: number) {
        // p.wr('sp', p.r.sp-1);
        this.reg.sp--;
        // p.memory.wb(p.r.sp,p.r.pc>>8);
        this.mem.writeByte(this.reg.sp, this.reg.pc >> 8);
        // p.wr('sp', p.r.sp-1);
        this.reg.sp--;
        // p.memory.wb(p.r.sp,p.r.pc&0xFF);
        this.mem.writeByte(this.reg.sp, this.reg.pc & 0xFF);
        // p.r.pc=n;
        this.reg.pc = value;
        // p.clock.c+=16;
        this.ticks += 16;
    }

    // Set an interrupt flag
    public requestInterrupt(type) {
        var IFval = this.mem.rb(0xFF0F);
        IFval |= (1 << type)
        this.mem.wb(0xFF0F, IFval) ;
        this.unhalt();
    };

    private isInterruptEnable(type) {
        return Util.readBit(this.mem.rb(0xFFFF), type) != 0;
    };

    public enableInterrupts() {
        this.IME = true;
    };

    public disableInterrupts() {
        this.IME = false;
    };

    public getIME(): boolean {
        return this.IME;
    }
}