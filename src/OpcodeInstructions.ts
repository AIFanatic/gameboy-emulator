import { CBOpcodeTicks } from "./CBOpcodes";
import { CPU } from "./CPU";
import { Opcodes, OpcodeTicks } from "./Opcodes";
import { Registers } from "./Registers";

export type Instruction = {[key in Opcodes]: {}};

export class OpcodeInstructions {
    private cpu: CPU;

    public instructions: Instruction = {
        [Opcodes['NOP']] : () => {},
        [Opcodes['LD BC,D16']] : () => {
            this.cpu.reg.c = this.cpu.nextByte();
            this.cpu.reg.b = this.cpu.nextByte();
        },
        [Opcodes['LD [BC],A']] : () => {
            this.cpu.mem.writeByte(this.cpu.reg.bc, this.cpu.reg.a);
        },
        [Opcodes['INC BC']] : () => {
            this.cpu.reg.bc = (this.cpu.reg.bc + 1) & 0xFFFF;
        },
        [Opcodes['INC B']] : () => {
            this.cpu.reg.b = this.cpu.alu.INC(this.cpu.reg.b);

            // this.cpu.reg.b = (this.cpu.reg.b + 1) & 0xFF;
            // this.cpu.reg.flags.Z = (this.cpu.reg.b == 0);
            // this.cpu.reg.flags.H = ((this.cpu.reg.b & 0xF) == 0);
            // this.cpu.reg.flags.N = false;
        },
        [Opcodes['DEC B']] : () => {
            this.cpu.reg.b = this.cpu.alu.DEC(this.cpu.reg.b);
        },
        [Opcodes['LD B,D8']] : () => {
            this.cpu.reg.b = this.cpu.nextByte();
        },
        [Opcodes['RLCA']] : () => {
            this.cpu.reg.a = this.cpu.alu.RLC(this.cpu.reg.a);
            this.cpu.reg.flags.Z = false;
        },
        [Opcodes['LD [A16],SP']] : () => {
            this.cpu.mem.writeWord(this.cpu.nextWord(), this.cpu.reg.sp);
        },
        [Opcodes['ADD HL,BC']] : () => {
            const temp = this.cpu.reg.hl + this.cpu.reg.bc;
            this.cpu.reg.flags.N = false;
            this.cpu.reg.flags.C = temp > 0xFFFF;
            this.cpu.reg.flags.H = ((this.cpu.reg.hl & 0x0FFF) + (this.cpu.reg.bc & 0x0FFF)) > 0x0FFF;
            this.cpu.reg.hl = temp & 0xFFFF;
        },
        [Opcodes['LD A,[BC]' ]]: () => {
            this.cpu.reg.a = this.cpu.mem.readByte(this.cpu.reg.bc);
        },
        [Opcodes['DEC BC']] : () => {
            this.cpu.reg.bc = (this.cpu.reg.bc - 1) & 0xFFFF;
        },
        [Opcodes['INC C']] : () => {
            this.cpu.reg.c = this.cpu.alu.INC(this.cpu.reg.c);
        },
        [Opcodes['DEC C']] : () => {
            this.cpu.reg.c = this.cpu.alu.DEC(this.cpu.reg.c);
        },
        [Opcodes['LD C,D8']] : () => {
            this.cpu.reg.c = this.cpu.nextByte();
        },
        [Opcodes['RRCA']] : () => {
            this.cpu.reg.a = (this.cpu.reg.a >> 1) | ((this.cpu.reg.a & 1) << 7);
            this.cpu.reg.flags.C = (this.cpu.reg.a > 0x7F);
            this.cpu.reg.flags.Z = this.cpu.reg.flags.N = this.cpu.reg.flags.H = false;
        },

        [Opcodes['STOP']] : () => {
            // this.cpu.stopped = true;
            console.log("STOPPED")
            this.cpu.reg.pc ++;
        },
        [Opcodes['LD DE,D16']] : () => {
            this.cpu.reg.e = this.cpu.nextByte();
            this.cpu.reg.d = this.cpu.nextByte();
        },
        [Opcodes['LD [DE],A']] : () => {
            this.cpu.mem.writeByte(this.cpu.reg.de, this.cpu.reg.a);
        },
        [Opcodes['INC DE']] : () => {
            this.cpu.reg.de = (this.cpu.reg.de + 1) & 0xFFFF;
        },
        [Opcodes['INC D']] : () => {
            this.cpu.reg.d = this.cpu.alu.INC(this.cpu.reg.d);
        },
        [Opcodes['DEC D']] : () => {
            this.cpu.reg.d = this.cpu.alu.DEC(this.cpu.reg.d);
        },
        [Opcodes['LD D,D8']] : () => {
            this.cpu.reg.d = this.cpu.nextByte();
        },
        [Opcodes['RLA']] : () => {
            this.cpu.reg.a = this.cpu.alu.RL(this.cpu.reg.a);
            this.cpu.reg.flags.Z = false;
        },
        [Opcodes['JR PC+R8']] : () => {
            let dist = this.cpu.nextByte();
            if(dist>127) dist=-((~dist + 1) & 255);
            // console.warn(`JR PC+R8 ${this.cpu.reg.pc.toString(16)}`);
            this.cpu.reg.pc += dist;
            // console.warn(`JR PC+R8 ${this.cpu.reg.pc.toString(16)}`);
        },
        [Opcodes['ADD HL,DE']] : () => {
            // console.warn("Not sure");
            const a = this.cpu.reg.hl;
            const b = this.cpu.reg.de;
            const temp = a + b;
            this.cpu.reg.flags.N = false;
            this.cpu.reg.flags.C = temp > 0xFFFF;
            this.cpu.reg.flags.H = ((a & 0x0FFF) + (b & 0x0FFF)) > 0x0FFF;
            this.cpu.reg.hl = temp & 0xFFFF;
        },
        [Opcodes['LD A,[DE]' ]]: () => {
            this.cpu.reg.a = this.cpu.mem.readByte(this.cpu.reg.de);
        },
        [Opcodes['DEC DE']] : () => {
            this.cpu.reg.de = (this.cpu.reg.de - 1) & 0xFFFF;
        },
        [Opcodes['INC E']] : () => {
            this.cpu.reg.e = this.cpu.alu.INC(this.cpu.reg.e);
        },
        [Opcodes['DEC E']] : () => {
            this.cpu.reg.e = this.cpu.alu.DEC(this.cpu.reg.e);
        },
        [Opcodes['LD E,D8']] : () => {
            this.cpu.reg.e = this.cpu.nextByte();
        },
        [Opcodes['RRA']] : () => {
            this.cpu.reg.a = this.cpu.alu.RR(this.cpu.reg.a);
            this.cpu.reg.flags.Z = false;
        },

        [Opcodes['JR NZ,PC+R8']] : () => {
            // console.log("Not sure of ticks");
            const o = this.cpu.nextRelative();
            if(!this.cpu.reg.flags.Z) {
                this.cpu.reg.pc = o;
                this.cpu.ticks += 4;
            }
        },
        [Opcodes['LD HL,D16']] : () => {
            this.cpu.reg.l = this.cpu.nextByte();
            this.cpu.reg.h = this.cpu.nextByte();
        },
        [Opcodes['LD [HL+],A']] : () => {
            this.cpu.mem.writeByte(this.cpu.reg.hl, this.cpu.reg.a);
            this.cpu.reg.hl = (this.cpu.reg.hl + 1) & 0xFFFF;
            
        },
        [Opcodes['INC HL']] : () => {
            this.cpu.reg.hl = (this.cpu.reg.hl + 1) & 0xFFFF;
        },
        [Opcodes['INC H']] : () => {
            this.cpu.reg.h = this.cpu.alu.INC(this.cpu.reg.h);
        },
        [Opcodes['DEC H']] : () => {
            this.cpu.reg.h = this.cpu.alu.DEC(this.cpu.reg.h);
        },
        [Opcodes['LD H,D8']] : () => {
            this.cpu.reg.h = this.cpu.nextByte();
        },
        [Opcodes['DAA']] : () => {
            // this.cpu.reg.flags.C = false;
            // if ((this.cpu.reg.a & 0x0F) > 9) {
            //     this.cpu.reg.a += 0x06
            // }
            // if (((this.cpu.reg.a & 0xF0) >> 4) > 9) {
            //     this.cpu.reg.flags.C = true;
            //     this.cpu.reg.a += 0x60
            // }
            // this.cpu.reg.a &= 0xFF;
            // this.cpu.reg.flags.H = false;
            // this.cpu.reg.flags.Z = this.cpu.reg.a == 0x00;


            
            // FSubtract == N
            if (!this.cpu.reg.flags.N) {
                if (this.cpu.reg.flags.C || this.cpu.reg.a > 0x99) {
                    this.cpu.reg.a = (this.cpu.reg.a + 0x60) & 0xFF;
                    this.cpu.reg.flags.C = true;
                }
                if (this.cpu.reg.flags.H || (this.cpu.reg.a & 0xF) > 0x9) {
                    this.cpu.reg.a = (this.cpu.reg.a + 0x06) & 0xFF;
                    this.cpu.reg.flags.H = false;
                }
            }
            else if (this.cpu.reg.flags.C && this.cpu.reg.flags.H) {
                this.cpu.reg.a = (this.cpu.reg.a + 0x9A) & 0xFF;
                this.cpu.reg.flags.H = false;
            }
            else if (this.cpu.reg.flags.C) {
                this.cpu.reg.a = (this.cpu.reg.a + 0xA0) & 0xFF;
            }
            else if (this.cpu.reg.flags.H) {
                this.cpu.reg.a = (this.cpu.reg.a + 0xFA) & 0xFF;
                this.cpu.reg.flags.H = false;
            }
            this.cpu.reg.flags.Z = (this.cpu.reg.a == 0);
        },
        [Opcodes['JR Z,PC+R8']] : () => {
            // console.warn("Not sure of ticks", this.cpu.reg.pc.toString(16), OpcodeTicks[Opcodes['JR Z,PC+R8']])
            let dist = this.cpu.nextByte();
            dist = dist & 0x80 ? dist - 256 : dist;

            if (this.cpu.reg.flags.Z) {
                this.cpu.reg.pc += dist;
                this.cpu.ticks += 4;
            }


            // // console.warn("Not sure of ticks")
            // let dist = this.cpu.nextByte();
            // if(dist > 127) dist=-((~dist + 1) & 255);

            // if (this.cpu.reg.flags.Z) {
            //     this.cpu.reg.pc += dist;
            //     this.cpu.ticks += 12;
            // }
            // else {
            //     this.cpu.ticks += 8;
            // }
        },
        [Opcodes['ADD HL,HL']] : () => {
            // c.addRegs(&c.HL, &c.HL)

            // console.warn("Not sure");
            const a = this.cpu.reg.hl;
            const b = this.cpu.reg.hl;
            const temp = a + b;
            this.cpu.reg.flags.N = false;
            this.cpu.reg.flags.C = temp > 0xFFFF;
            this.cpu.reg.flags.H = ((a & 0x0FFF) + (b & 0x0FFF)) > 0x0FFF;
            this.cpu.reg.hl = temp & 0xFFFF;
        },
        [Opcodes['LD A,[HL+]' ]]: () => {
            // console.log(`LD A,[HL+] ${this.cpu.reg.pc.toString(16)} ${this.cpu.reg.hl.toString(16)} ${this.cpu.mem.readByte(this.cpu.reg.hl)}`)
            this.cpu.reg.a = this.cpu.mem.readByte(this.cpu.reg.hl);
            this.cpu.reg.hl++;
        },
        [Opcodes['DEC HL']] : () => {
            this.cpu.reg.hl = (this.cpu.reg.hl - 1) & 0xFFFF;
        },
        [Opcodes['INC L']] : () => {
            this.cpu.reg.l = this.cpu.alu.INC(this.cpu.reg.l);
        },
        [Opcodes['DEC L']] : () => {
            this.cpu.reg.l = this.cpu.alu.DEC(this.cpu.reg.l);
        },
        [Opcodes['LD L,D8']] : () => {
            this.cpu.reg.l = this.cpu.nextByte();
        },
        [Opcodes['CPL']] : () => {
            // Z80._r.a ^= 255;
            // Z80._r.f = Z80._r.a ? 0 : 0x80;
            // Z80._r.m = 1;
            // this.cpu.reg.a ^= this.cpu.reg.a;
            // this.cpu.reg.a = ~this.cpu.reg.a;
            // this.cpu.reg.flags.N = true;
            // this.cpu.reg.flags.H = true;
            // this.cpu.reg.a ^= this.cpu.reg.a;

            this.cpu.reg.a = ~this.cpu.reg.a & 0xff;
            this.cpu.reg.flags.N = true;
            this.cpu.reg.flags.H = true;
            // FLAGS_SET(FLAGS_NEGATIVE | FLAGS_HALFCARRY); 
        },

        [Opcodes['JR NC,PC+R8']] : () => {
            let dist = this.cpu.nextByte();
            dist = dist & 0x80 ? dist-256 : dist;

            if (!this.cpu.reg.flags.C) {
                // console.warn("Not sure");
                this.cpu.reg.pc += dist;
                this.cpu.ticks += 4;
            }
        },
        [Opcodes['LD SP,D16']] : () => {
            this.cpu.reg.sp = this.cpu.nextWord();
        },
        [Opcodes['LD [HL-],A']] : () => {
            this.cpu.mem.writeByte(this.cpu.reg.hl, this.cpu.reg.a);
            this.cpu.reg.hl--;
        },
        [Opcodes['INC SP']] : () => {
            this.cpu.reg.sp = (this.cpu.reg.sp + 1) & 0xFFFF;
        },
        [Opcodes['INC [HL]' ]]: () => {
            // this.cpu.mem.writeByte(this.cpu.reg.hl, this.cpu.alu.INC(this.cpu.mem.readWord(this.cpu.reg.hl)));
            this.cpu.mem.writeByte(this.cpu.reg.hl, this.cpu.alu.INC(this.cpu.mem.readWord(this.cpu.reg.hl)));
        },
        [Opcodes['DEC [HL]' ]]: () => {
            this.cpu.mem.writeByte(this.cpu.reg.hl, this.cpu.alu.DEC(this.cpu.mem.readWord(this.cpu.reg.hl)));
        },
        [Opcodes['LD [HL],D8']] : () => {
            this.cpu.mem.writeByte(this.cpu.reg.hl, this.cpu.nextByte());
        },
        [Opcodes['SCF']] : () => {
            this.cpu.reg.flags.C = true;
            this.cpu.reg.flags.N = this.cpu.reg.flags.H = false;
        },
        [Opcodes['JR C,PC+R8']] : () => {
            let dist = this.cpu.nextByte();
            dist = dist & 0x80 ? dist-256 : dist;
            if (this.cpu.reg.flags.C) {
                this.cpu.reg.pc += dist;
                this.cpu.ticks += 4;
            }
        },
        [Opcodes['ADD HL,SP']] : () => {
            // const a = this.cpu.reg.hl;
            // const b = this.cpu.reg.sp;
            // const temp = a + b;
            // this.cpu.reg.flags.N = false;
            // this.cpu.reg.flags.C = temp > 0xFFFF;
            // this.cpu.reg.flags.H = ((a & 0x0FFF) + (b & 0x0FFF)) > 0x0FFF;
            // this.cpu.reg.hl = temp & 0xFFFF;

            const dirtySum = this.cpu.reg.hl + this.cpu.reg.sp;
            this.cpu.reg.flags.H = ((this.cpu.reg.hl & 0xFFF) > (dirtySum & 0xFFF));
            this.cpu.reg.flags.C = (dirtySum > 0xFFFF);
            this.cpu.reg.hl = dirtySum & 0xFFFF;
            this.cpu.reg.flags.N = false;
        },
        [Opcodes['LD A,[HL-]' ]]: () => {
            this.cpu.reg.a = this.cpu.mem.readByte(this.cpu.reg.hl);
            this.cpu.reg.hl--;
        },
        [Opcodes['DEC SP']] : () => {
            this.cpu.reg.sp = (this.cpu.reg.sp - 1) & 0xFFFF;
        },
        [Opcodes['INC A']] : () => {
            this.cpu.reg.a = this.cpu.alu.INC(this.cpu.reg.a);
        },
        [Opcodes['DEC A']] : () => {
            this.cpu.reg.a = this.cpu.alu.DEC(this.cpu.reg.a);
        },
        [Opcodes['LD A,D8']] : () => {
            this.cpu.reg.a = this.cpu.nextByte();
        },
        [Opcodes['CCF']] : () => {
            this.cpu.reg.flags.C = !this.cpu.reg.flags.C;
            this.cpu.reg.flags.N = this.cpu.reg.flags.H = false;
        },

        [Opcodes['LD B,B']] : () => {},
        [Opcodes['LD B,C']] : () => {
            this.cpu.reg.b = this.cpu.reg.c;
        },
        [Opcodes['LD B,D']] : () => {
            this.cpu.reg.b = this.cpu.reg.d;
        },
        [Opcodes['LD B,E']] : () => {
            this.cpu.reg.b = this.cpu.reg.e;
        },
        [Opcodes['LD B,H']] : () => {
            this.cpu.reg.b = this.cpu.reg.h;
        },
        [Opcodes['LD B,L']] : () => {
            this.cpu.reg.b = this.cpu.reg.l;
        },
        [Opcodes['LD B,[HL]' ]]: () => {
            this.cpu.reg.b = this.cpu.mem.readByte(this.cpu.reg.hl);
        },
        [Opcodes['LD B,A']] : () => {
            this.cpu.reg.b = this.cpu.reg.a;
        },
        [Opcodes['LD C,B']] : () => {
            this.cpu.reg.c = this.cpu.reg.b;
        },
        [Opcodes['LD C,C']] : () => {
            this.cpu.reg.c = this.cpu.reg.c;
        },
        [Opcodes['LD C,D']] : () => {
            this.cpu.reg.c = this.cpu.reg.d;
        },
        [Opcodes['LD C,E']] : () => {
            this.cpu.reg.c = this.cpu.reg.e;
        },
        [Opcodes['LD C,H']] : () => {
            this.cpu.reg.c = this.cpu.reg.h;
        },
        [Opcodes['LD C,L']] : () => {
            this.cpu.reg.c = this.cpu.reg.l;
        },
        [Opcodes['LD C,[HL]' ]]: () => {
            this.cpu.reg.c = this.cpu.mem.readByte(this.cpu.reg.hl);
        },
        [Opcodes['LD C,A']] : () => {
            this.cpu.reg.c = this.cpu.reg.a;
        },

        [Opcodes['LD D,B']] : () => {
            this.cpu.reg.d = this.cpu.reg.b;
        },
        [Opcodes['LD D,C']] : () => {
            this.cpu.reg.d = this.cpu.reg.c;
        },
        [Opcodes['LD D,D']] : () => {},
        [Opcodes['LD D,E']] : () => {
            this.cpu.reg.d = this.cpu.reg.e;
        },
        [Opcodes['LD D,H']] : () => {
            this.cpu.reg.d = this.cpu.reg.h;
        },
        [Opcodes['LD D,L']] : () => {
            this.cpu.reg.d = this.cpu.reg.l;
        },
        [Opcodes['LD D,[HL]' ]]: () => {
            this.cpu.reg.d = this.cpu.mem.readByte(this.cpu.reg.hl);
        },
        [Opcodes['LD D,A']] : () => {
            this.cpu.reg.d = this.cpu.reg.a;
        },
        [Opcodes['LD E,B']] : () => {
            this.cpu.reg.e = this.cpu.reg.b;
        },
        [Opcodes['LD E,C']] : () => {
            this.cpu.reg.e = this.cpu.reg.c;
        },
        [Opcodes['LD E,D']] : () => {
            this.cpu.reg.e = this.cpu.reg.d;
        },
        [Opcodes['LD E,E']] : () => {},
        [Opcodes['LD E,H']] : () => {
            this.cpu.reg.e = this.cpu.reg.h;
        },
        [Opcodes['LD E,L']] : () => {
            this.cpu.reg.e = this.cpu.reg.l;
        },
        [Opcodes['LD E,[HL]' ]]: () => {
            this.cpu.reg.e = this.cpu.mem.readByte(this.cpu.reg.hl);
        },
        [Opcodes['LD E,A']] : () => {
            this.cpu.reg.e = this.cpu.reg.a;
        },

        [Opcodes['LD H,B']] : () => {
            this.cpu.reg.h = this.cpu.reg.b;
        },
        [Opcodes['LD H,C']] : () => {
            this.cpu.reg.h = this.cpu.reg.c;
        },
        [Opcodes['LD H,D']] : () => {
            this.cpu.reg.h = this.cpu.reg.d;
        },
        [Opcodes['LD H,E']] : () => {
            this.cpu.reg.h = this.cpu.reg.e;
        },
        [Opcodes['LD H,H']] : () => {},
        [Opcodes['LD H,L']] : () => {
            this.cpu.reg.h = this.cpu.reg.l;
        },
        [Opcodes['LD H,[HL]' ]]: () => {
            this.cpu.reg.h = this.cpu.mem.readByte(this.cpu.reg.hl);
        },
        [Opcodes['LD H,A']] : () => {
            this.cpu.reg.h = this.cpu.reg.a;
        },
        [Opcodes['LD L,B']] : () => {
            this.cpu.reg.l = this.cpu.reg.b;
        },
        [Opcodes['LD L,C']] : () => {
            this.cpu.reg.l = this.cpu.reg.c;
        },
        [Opcodes['LD L,D']] : () => {
            this.cpu.reg.l = this.cpu.reg.d;
        },
        [Opcodes['LD L,E']] : () => {
            this.cpu.reg.l = this.cpu.reg.e;
        },
        [Opcodes['LD L,H']] : () => {
            this.cpu.reg.l = this.cpu.reg.h;
        },
        [Opcodes['LD L,L']] : () => {},
        [Opcodes['LD L,[HL]' ]]: () => {
            this.cpu.reg.l = this.cpu.mem.readByte(this.cpu.reg.hl);
        },
        [Opcodes['LD L,A']] : () => {
            this.cpu.reg.l = this.cpu.reg.a;
        },

        [Opcodes['LD [HL],B']] : () => {
            this.cpu.mem.writeByte(this.cpu.reg.hl, this.cpu.reg.b);
        },
        [Opcodes['LD [HL],C']] : () => {
            this.cpu.mem.writeByte(this.cpu.reg.hl, this.cpu.reg.c);
        },
        [Opcodes['LD [HL],D']] : () => {
            this.cpu.mem.writeByte(this.cpu.reg.hl, this.cpu.reg.d);
        },
        [Opcodes['LD [HL],E']] : () => {
            this.cpu.mem.writeByte(this.cpu.reg.hl, this.cpu.reg.e);
        },
        [Opcodes['LD [HL],H']] : () => {
            this.cpu.mem.writeByte(this.cpu.reg.hl, this.cpu.reg.h);
        },
        [Opcodes['LD [HL],L']] : () => {
            this.cpu.mem.writeByte(this.cpu.reg.hl, this.cpu.reg.l);
        },
        [Opcodes['HALT']] : () => {
            this.cpu.halt();
        },
        [Opcodes['LD [HL],A']] : () => {
            this.cpu.mem.writeByte(this.cpu.reg.hl, this.cpu.reg.a);
        },
        [Opcodes['LD A,B']] : () => {
            this.cpu.reg.a = this.cpu.reg.b;
        },
        [Opcodes['LD A,C']] : () => {
            this.cpu.reg.a = this.cpu.reg.c;
        },
        [Opcodes['LD A,D']] : () => {
            this.cpu.reg.a = this.cpu.reg.d;
        },
        [Opcodes['LD A,E']] : () => {
            this.cpu.reg.a = this.cpu.reg.e;
        },
        [Opcodes['LD A,H']] : () => {
            this.cpu.reg.a = this.cpu.reg.h;
        },
        [Opcodes['LD A,L']] : () => {
            this.cpu.reg.a = this.cpu.reg.l;
        },
        [Opcodes['LD A,[HL]' ]]: () => {
            this.cpu.reg.a = this.cpu.mem.readByte(this.cpu.reg.hl);
        },
        [Opcodes['LD A,A']] : () => {},

        [Opcodes['ADD B']] : () => {
            this.cpu.alu.ADD(this.cpu.reg.b);
        },
        [Opcodes['ADD C']] : () => {
            this.cpu.alu.ADD(this.cpu.reg.c);
        },
        [Opcodes['ADD D']] : () => {
            this.cpu.alu.ADD(this.cpu.reg.d);
        },
        [Opcodes['ADD E']] : () => {
            this.cpu.alu.ADD(this.cpu.reg.e);
        },
        [Opcodes['ADD H']] : () => {
            this.cpu.alu.ADD(this.cpu.reg.h);
        },
        [Opcodes['ADD L']] : () => {
            this.cpu.alu.ADD(this.cpu.reg.l);
        },
        [Opcodes['ADD [HL]' ]]: () => {
            this.cpu.alu.ADD(this.cpu.mem.readByte(this.cpu.reg.hl));
        },
        [Opcodes['ADD A']] : () => {
            this.cpu.alu.ADD(this.cpu.reg.a);
        },
        [Opcodes['ADC B']] : () => {
            this.cpu.alu.ADC(this.cpu.reg.b);
        },
        [Opcodes['ADC C']] : () => {
            this.cpu.alu.ADC(this.cpu.reg.c);
        },
        [Opcodes['ADC D']] : () => {
            this.cpu.alu.ADC(this.cpu.reg.d);
        },
        [Opcodes['ADC E']] : () => {
            this.cpu.alu.ADC(this.cpu.reg.e);
        },
        [Opcodes['ADC H']] : () => {
            this.cpu.alu.ADC(this.cpu.reg.h);
        },
        [Opcodes['ADC L']] : () => {
            this.cpu.alu.ADC(this.cpu.reg.l);
        },
        [Opcodes['ADC [HL]' ]]: () => {
            this.cpu.alu.ADC(this.cpu.mem.readByte(this.cpu.reg.hl));
        },
        [Opcodes['ADC A']] : () => {
            this.cpu.alu.ADC(this.cpu.reg.a);
        },

        [Opcodes['SUB B']] : () => {
            this.cpu.alu.SUB(this.cpu.reg.b);
        },
        [Opcodes['SUB C']] : () => {
            this.cpu.alu.SUB(this.cpu.reg.c);
        },
        [Opcodes['SUB D']] : () => {
            this.cpu.alu.SUB(this.cpu.reg.d);
        },
        [Opcodes['SUB E']] : () => {
            this.cpu.alu.SUB(this.cpu.reg.e);
        },
        [Opcodes['SUB H']] : () => {
            this.cpu.alu.SUB(this.cpu.reg.h);
        },
        [Opcodes['SUB L']] : () => {
            this.cpu.alu.SUB(this.cpu.reg.l);
        },
        [Opcodes['SUB [HL]' ]]: () => {
            this.cpu.alu.SUB(this.cpu.mem.readByte(this.cpu.reg.hl));
        },
        [Opcodes['SUB A']] : () => {
            this.cpu.alu.SUB(this.cpu.reg.a);
        },
        [Opcodes['SBC B']] : () => {
            this.cpu.alu.SBC(this.cpu.reg.b);
        },
        [Opcodes['SBC C']] : () => {
            this.cpu.alu.SBC(this.cpu.reg.c);
        },
        [Opcodes['SBC D']] : () => {
            this.cpu.alu.SBC(this.cpu.reg.d);
        },
        [Opcodes['SBC E']] : () => {
            this.cpu.alu.SBC(this.cpu.reg.e);
        },
        [Opcodes['SBC H']] : () => {
            this.cpu.alu.SBC(this.cpu.reg.h);
        },
        [Opcodes['SBC L']] : () => {
            this.cpu.alu.SBC(this.cpu.reg.l);
        },
        [Opcodes['SBC [HL]' ]]: () => {
            this.cpu.alu.SBC(this.cpu.mem.readByte(this.cpu.reg.hl));
        },
        [Opcodes['SBC A']] : () => {
            this.cpu.alu.SBC(this.cpu.reg.a);
        },

        [Opcodes['AND B']] : () => {
            this.cpu.alu.AND(this.cpu.reg.b);
        },
        [Opcodes['AND C']] : () => {
            this.cpu.alu.AND(this.cpu.reg.c);
        },
        [Opcodes['AND D']] : () => {
            this.cpu.alu.AND(this.cpu.reg.d);
        },
        [Opcodes['AND E']] : () => {
            this.cpu.alu.AND(this.cpu.reg.e);
        },
        [Opcodes['AND H']] : () => {
            this.cpu.alu.AND(this.cpu.reg.h);
        },
        [Opcodes['AND L']] : () => {
            this.cpu.alu.AND(this.cpu.reg.l);
        },
        [Opcodes['AND [HL]' ]]: () => {
            this.cpu.alu.AND(this.cpu.mem.readByte(this.cpu.reg.hl));
        },
        [Opcodes['AND A']] : () => {
            this.cpu.alu.AND(this.cpu.reg.a);
        },
        [Opcodes['XOR B']] : () => {
            this.cpu.alu.XOR(this.cpu.reg.b);
        },
        [Opcodes['XOR C']] : () => {
            this.cpu.alu.XOR(this.cpu.reg.c);
        },
        [Opcodes['XOR D']] : () => {
            this.cpu.alu.XOR(this.cpu.reg.d);
        },
        [Opcodes['XOR E']] : () => {
            this.cpu.alu.XOR(this.cpu.reg.e);
        },
        [Opcodes['XOR H']] : () => {
            this.cpu.alu.XOR(this.cpu.reg.h);
        },
        [Opcodes['XOR L']] : () => {
            this.cpu.alu.XOR(this.cpu.reg.l);
        },
        [Opcodes['XOR [HL]' ]]: () => {
            // Z80._r.a^=MMU.rb((Z80._r.h<<8)+Z80._r.l);
            // Z80._r.a&=255;
            // Z80._r.f=Z80._r.a?0:0x80;
            // Z80._r.m=2;

            // parentObj.registerA ^= parentObj.memoryReader[parentObj.registersHL](parentObj, parentObj.registersHL);
            // parentObj.FZero = (parentObj.registerA == 0);
            // parentObj.FSubtract = parentObj.FHalfCarry = parentObj.FCarry = false;
            this.cpu.alu.XOR(this.cpu.mem.readByte(this.cpu.reg.hl));
        },
        [Opcodes['XOR A']] : () => {
            this.cpu.alu.XOR(this.cpu.reg.a);
        },

        [Opcodes['OR B']] : () => {
            this.cpu.alu.OR(this.cpu.reg.b);
        },
        [Opcodes['OR C']] : () => {
            this.cpu.alu.OR(this.cpu.reg.c);
        },
        [Opcodes['OR D']] : () => {
            this.cpu.alu.OR(this.cpu.reg.d);
        },
        [Opcodes['OR E']] : () => {
            this.cpu.alu.OR(this.cpu.reg.e);
        },
        [Opcodes['OR H']] : () => {
            this.cpu.alu.OR(this.cpu.reg.h);
        },
        [Opcodes['OR L']] : () => {
            this.cpu.alu.OR(this.cpu.reg.l);
        },
        [Opcodes['OR [HL]' ]]: () => {
            this.cpu.alu.OR(this.cpu.mem.readByte(this.cpu.reg.hl));
        },
        [Opcodes['OR A']] : () => {
            this.cpu.alu.OR(this.cpu.reg.a);
        },
        [Opcodes['CP B']] : () => {
            this.cpu.alu.CP(this.cpu.reg.b);
        },
        [Opcodes['CP C']] : () => {
            this.cpu.alu.CP(this.cpu.reg.c);
        },
        [Opcodes['CP D']] : () => {
            this.cpu.alu.CP(this.cpu.reg.d);
        },
        [Opcodes['CP E']] : () => {
            this.cpu.alu.CP(this.cpu.reg.e);
        },
        [Opcodes['CP H']] : () => {
            this.cpu.alu.CP(this.cpu.reg.h);
        },
        [Opcodes['CP L']] : () => {
            this.cpu.alu.CP(this.cpu.reg.l);
        },
        [Opcodes['CP [HL]' ]]: () => {
            this.cpu.alu.CP(this.cpu.mem.readByte(this.cpu.reg.hl));
        },
        [Opcodes['CP A']] : () => {
            this.cpu.alu.CP(this.cpu.reg.a);
        },

        [Opcodes['RET NZ']] : () => {
            if (!this.cpu.reg.flags.Z) {
                this.cpu.reg.pc = this.cpu.popWord();
                this.cpu.ticks += 12;
            }
        },
        [Opcodes['POP BC']] : () => {
            this.cpu.reg.bc = this.cpu.popWord();
        },
        [Opcodes['JP NZ,A16']] : () => {
            const address = this.cpu.nextWord();

            if (!this.cpu.reg.flags.Z) {
                this.cpu.reg.pc = address;
                this.cpu.ticks += 4;
            }
        },
        [Opcodes['JP A16']] : () => {
            this.cpu.reg.pc = this.cpu.nextWord();
        },
        [Opcodes['CALL NZ,A16']] : () => {
            const dest = this.cpu.nextWord();
            if(!this.cpu.reg.flags.Z) {
                this.cpu.pushWord(this.cpu.reg.pc);
                this.cpu.reg.pc = dest;
                this.cpu.ticks += 12;
            }
        },
        [Opcodes['PUSH BC']] : () => {
            this.cpu.pushWord(this.cpu.reg.bc);
        },
        [Opcodes['ADD D8']] : () => {
            this.cpu.alu.ADD(this.cpu.nextByte());
        },
        [Opcodes['RST $00']] : () => {
            this.cpu.pushWord(this.cpu.reg.pc);
            this.cpu.reg.pc = 0x00;
        },
        [Opcodes['RET Z']] : () => {
            if (this.cpu.reg.flags.Z) {
                this.cpu.reg.pc = this.cpu.popWord();
                this.cpu.ticks += 12;
            }
        },
        [Opcodes['RET']] : () => {
            // p.r.pc = p.memory.rb(p.r.sp);
            // p.wr('sp', p.r.sp+1);
            // p.r.pc += p.memory.rb(p.r.sp)<<8;
            // p.wr('sp', p.r.sp+1);
            // p.clock.c += 16;},

            // this.cpu.reg.pc = this.cpu.popWord();

            this.cpu.reg.pc = this.cpu.mem.readByte(this.cpu.reg.sp);
            this.cpu.reg.sp += 1;
            this.cpu.reg.pc += this.cpu.mem.readByte(this.cpu.reg.sp) << 8;
            this.cpu.reg.sp += 1;

            // p.r.pc = p.memory.rb(p.r.sp);
            // p.wr('sp', p.r.sp+1);
            // p.r.pc+=p.memory.rb(p.r.sp)<<8;
            // p.wr('sp', p.r.sp+1);
            // p.clock.c += 16;},

        },
        [Opcodes['JP Z,A16']] : () => {
            const address = this.cpu.nextWord();
            if (this.cpu.reg.flags.Z) {
                this.cpu.reg.pc = address;
                this.cpu.ticks += 4;
            }
        },
        [Opcodes['CBPREFIX']] : () => {
            const b = this.cpu.nextByte();
            try {
                this.cpu.ticks += CBOpcodeTicks[b];
                this.cpu.cbops[b]();
            } catch (error) {
                console.error(`CBPREFIX ${this.cpu.reg.pc.toString(16)} ${b.toString(16)}`);
            }
        },
        [Opcodes['CALL Z,A16']] : () => {
            // if(this.cpu.reg.flags.Z) {
            //     const dest = this.cpu.nextWord();
            //     this.cpu.pushWord(this.cpu.reg.pc);
            //     this.cpu.reg.pc = dest;
            //     this.cpu.ticks += 12;
            // }

            if (this.cpu.reg.flags.Z) {
                this.cpu.reg.sp = this.cpu.reg.sp - 1;
                this.cpu.mem.writeByte(this.cpu.reg.sp, ((this.cpu.reg.pc + 2) & 0xFF00) >> 8);
                this.cpu.reg.sp = this.cpu.reg.sp - 1;
                this.cpu.mem.writeByte(this.cpu.reg.sp, (this.cpu.reg.pc+2) & 0x00FF);
                var j = this.cpu.mem.readByte(this.cpu.reg.pc) + (this.cpu.mem.readByte(this.cpu.reg.pc + 1) << 8);
                this.cpu.reg.pc = j;
                this.cpu.ticks += 12;
            } else {
                this.cpu.reg.pc += 2;
            }
            // p.clock.c+=12;
        },
        [Opcodes['CALL A16']] : () => {
            // const address = this.cpu.nextWord();
            // this.cpu.pushWord(this.cpu.reg.pc);
            // this.cpu.reg.pc = address;


            // p.wr('sp', p.r.sp - 1);
            this.cpu.reg.sp--;

            // p.memory.wb(p.r.sp, ((p.r.pc+2)&0xFF00)>>8);
            this.cpu.mem.writeByte(this.cpu.reg.sp, ((this.cpu.reg.pc+2) & 0xFF00) >> 8);

            // p.wr('sp', p.r.sp - 1);
            this.cpu.reg.sp--;

            // p.memory.wb(p.r.sp, (p.r.pc+2)&0x00FF);
            this.cpu.mem.writeByte(this.cpu.reg.sp, (this.cpu.reg.pc + 2) & 0x00FF);

            // var j=p.memory.rb(p.r.pc)+(p.memory.rb(p.r.pc+1)<<8);
            const j = this.cpu.mem.readByte(this.cpu.reg.pc) + (this.cpu.mem.readByte(this.cpu.reg.pc + 1) << 8);
            
            // p.r.pc=j;
            this.cpu.reg.pc = j;




            // var temp_pc = (this.cpu.mem.readByte((this.cpu.reg.pc + 1) & 0xFFFF) << 8) | parentObj.memoryReader[this.cpu.reg.pc](parentObj, this.cpu.reg.pc);
            // this.cpu.reg.pc = (this.cpu.reg.pc + 2) & 0xFFFF;
            // this.cpu.reg.sp = (this.cpu.reg.sp - 1) & 0xFFFF;
            // parentObj.memoryWriter[this.cpu.reg.sp](parentObj, this.cpu.reg.sp, this.cpu.reg.pc >> 8);
            // this.cpu.reg.sp = (this.cpu.reg.sp - 1) & 0xFFFF;
            // parentObj.memoryWriter[this.cpu.reg.sp](parentObj, this.cpu.reg.sp, this.cpu.reg.pc & 0xFF);
            // this.cpu.reg.pc = temp_pc;
        },
        [Opcodes['ADC D8']] : () => {
            this.cpu.alu.ADC(this.cpu.nextByte());
        },
        [Opcodes['RST $08']] : () => {
            this.cpu.pushWord(this.cpu.reg.pc);
            this.cpu.reg.pc = 0x08;
        },

        [Opcodes['RET NC']] : () => {
            if (!this.cpu.reg.flags.C) {
                this.cpu.reg.pc = this.cpu.popWord();
                this.cpu.ticks += 12;
            }
        },
        [Opcodes['POP DE']] : () => {
            this.cpu.reg.de = this.cpu.popWord();
        },
        [Opcodes['JP NC,A16']] : () => {
            const dest = this.cpu.nextWord();
            if (!this.cpu.reg.flags.C) {
                this.cpu.reg.pc = dest;
                this.cpu.ticks += 4;
            }
        },
        [Opcodes['DB $D3']] : () => {throw Error("Not implemented")},
        [Opcodes['CALL NC,A16']] : () => {
            // if(!this.cpu.reg.flags.C) {
            //     const dest = this.cpu.nextWord();
            //     this.cpu.pushWord(this.cpu.reg.pc);
            //     this.cpu.reg.pc = dest;
            //     this.cpu.ticks += 12;
            // }
            // else {
            //     this.cpu.ticks += 12;
            // }

           if (!this.cpu.reg.flags.C) {
                this.cpu.reg.sp = this.cpu.reg.sp - 1;
                this.cpu.mem.writeByte(this.cpu.reg.sp, ((this.cpu.reg.pc + 2) & 0xFF00) >> 8);
                this.cpu.reg.sp = this.cpu.reg.sp - 1;
                this.cpu.mem.writeByte(this.cpu.reg.sp, (this.cpu.reg.pc+2) & 0x00FF);
                var j = this.cpu.mem.readByte(this.cpu.reg.pc) + (this.cpu.mem.readByte(this.cpu.reg.pc + 1) << 8);
                this.cpu.reg.pc = j;
                this.cpu.ticks += 12;
            } else {
                this.cpu.reg.pc += 2;
            } 
        },
        [Opcodes['PUSH DE']] : () => {
            this.cpu.pushWord(this.cpu.reg.de);
        },
        [Opcodes['SUB D8']] : () => {
            this.cpu.alu.SUB(this.cpu.nextByte());
        },
        [Opcodes['RST $10']] : () => {
            this.cpu.pushWord(this.cpu.reg.pc);
            this.cpu.reg.pc = 0x10;
        },
        [Opcodes['RET C']] : () => {
            if (this.cpu.reg.flags.C) {
                this.cpu.reg.pc = this.cpu.popWord();
                this.cpu.ticks += 12;
            }
        },
        [Opcodes['RETI']] : () => {
            // this.cpu.interrupts.master = 1;
            this.cpu.enableInterrupts();
            this.cpu.reg.pc = this.cpu.mem.rw(this.cpu.reg.sp);
            this.cpu.reg.sp += 2;
        },
        [Opcodes['JP C,A16']] : () => {
            const address = this.cpu.nextWord();
            if (this.cpu.reg.flags.C) {
                this.cpu.reg.pc = address;
                this.cpu.ticks += 4;
            }
        },
        [Opcodes['DB $DB']] : () => {throw Error("Not implemented")},
        [Opcodes['CALL C,A16']] : () => {
            if (this.cpu.reg.flags.C) {
                this.cpu.reg.sp = this.cpu.reg.sp - 1;
                this.cpu.mem.writeByte(this.cpu.reg.sp, ((this.cpu.reg.pc + 2) & 0xFF00) >> 8);
                this.cpu.reg.sp = this.cpu.reg.sp - 1;
                this.cpu.mem.writeByte(this.cpu.reg.sp, (this.cpu.reg.pc+2) & 0x00FF);
                var j = this.cpu.mem.readByte(this.cpu.reg.pc) + (this.cpu.mem.readByte(this.cpu.reg.pc + 1) << 8);
                this.cpu.reg.pc = j;
                this.cpu.ticks += 12;
            } else {
                this.cpu.reg.pc += 2;
            } 
        },
        [Opcodes['DB $DD']] : () => {throw Error("Not implemented")},
        [Opcodes['SBC D8']] : () => {
            // this.cpu.alu.SBC(this.cpu.nextByte());
            var temp_var = this.cpu.nextByte();
            // this.cpu.reg.pc = (this.cpu.reg.pc + 1) & 0xFFFF;
            var dirtySum = this.cpu.reg.a - temp_var - ((this.cpu.reg.flags.C) ? 1 : 0);
            this.cpu.reg.flags.H = ((this.cpu.reg.a & 0xF) - (temp_var & 0xF) - ((this.cpu.reg.flags.C) ? 1 : 0) < 0);
            this.cpu.reg.flags.C = (dirtySum < 0);
            this.cpu.reg.a = dirtySum & 0xFF;
            this.cpu.reg.flags.Z = (this.cpu.reg.a == 0);
            this.cpu.reg.flags.N = true;
        },
        [Opcodes['RST $18']] : () => {
            this.cpu.pushWord(this.cpu.reg.pc);
            this.cpu.reg.pc = 0x18;
        },

        [Opcodes['LDH [A8],A']] : () => {
            const v = this.cpu.nextByte();
            // console.log("LDH [A8],A", (0xFF00 + v).toString(16));
            
            this.cpu.mem.writeByte(0xFF00 + v, this.cpu.reg.a);
        },
        [Opcodes['POP HL']] : () => {
            // p.wr(r2, p.memory.rb(p.r.sp));
            const w = this.cpu.mem.readWord(this.cpu.reg.sp);
            // console.log(`POP HL: ${this.cpu.reg.sp.toString(16)} ${w.toString(16)}`);
            this.cpu.reg.l = this.cpu.mem.readByte(this.cpu.reg.sp) & 0xFF;
            
            // p.wr('sp', p.r.sp+1);
            this.cpu.reg.sp++;

            // p.wr(r1, p.memory.rb(p.r.sp));
            this.cpu.reg.h = this.cpu.mem.readByte(this.cpu.reg.sp) & 0xFF;
            
            // p.wr('sp', p.r.sp+1);
            this.cpu.reg.sp++;
        },
        [Opcodes['LD [C],A']] : () => {
            this.cpu.mem.writeByte(0xFF00 + this.cpu.reg.c, this.cpu.reg.a);
        },
        [Opcodes['DB $E3']] : () => {throw Error("Not implemented")},
        [Opcodes['DB $E4']] : () => {
            console.warn("unknown")
        },
        [Opcodes['PUSH HL']] : () => {
            this.cpu.pushWord(this.cpu.reg.hl);
        },
        [Opcodes['AND D8']] : () => {
            this.cpu.alu.AND(this.cpu.nextByte());
        },
        [Opcodes['RST $20']] : () => {
            this.cpu.pushWord(this.cpu.reg.pc);
            this.cpu.reg.pc = 0x20;
        },
        [Opcodes['ADD SP,R8']] : () => {
            var v = this.cpu.nextByte();
            v = v & 0x80 ? v-256 : v; // signed

            this.cpu.reg.flags.C = ((this.cpu.reg.sp&0xFF) + (v&0xFF)) > 0xFF;
            this.cpu.reg.flags.H = (this.cpu.reg.sp & 0xF) + (v&0xF) > 0xF;
            this.cpu.reg.flags.Z = this.cpu.reg.flags.N = false;

            this.cpu.reg.sp = (this.cpu.reg.sp + v) & 0xFFFF;
        },
        [Opcodes['JP HL']] : () => {
            this.cpu.reg.pc = this.cpu.reg.hl;
        },
        [Opcodes['LD [A16],A']] : () => {
            this.cpu.mem.writeByte(this.cpu.nextWord(), this.cpu.reg.a);
        },
        [Opcodes['DB $EB']] : () => {
            this.cpu.stopped = true;
            console.log(this.cpu.reg.pc.toString(16));
            console.warn("Unknown")
        },
        [Opcodes['DB $EC']] : () => {
            this.cpu.stopped = true;
            console.log(this.cpu.reg.pc.toString(16));
            console.warn("Unknown")
        },
        [Opcodes['DB $ED']] : () => {
            this.cpu.stopped = true;
            console.log(this.cpu.reg.pc.toString(16));
            console.warn("Unknown")
        },
        [Opcodes['XOR D8']] : () => {
            this.cpu.alu.XOR(this.cpu.nextByte());
        },
        [Opcodes['RST $28']] : () => {
            this.cpu.pushWord(this.cpu.reg.pc);
            this.cpu.reg.pc = 0x28;
        },

        [Opcodes['LDH A,[A8]' ]]: () => {
            this.cpu.reg.a = this.cpu.mem.readByte(0xFF00 + this.cpu.nextByte());
        },
        [Opcodes['POP AF']] : () => {
            const val = this.cpu.popWord();
            this.cpu.reg.a = ((val & 0xFF00) >> 8); //getUpper
            this.cpu.reg.flags.Z = (val&(1<<7)) != 0;
            this.cpu.reg.flags.N = (val&(1<<6)) != 0;
            this.cpu.reg.flags.H = (val&(1<<5)) != 0;
            this.cpu.reg.flags.C = (val&(1<<4)) != 0;
        },
        [Opcodes['LD A,[C]' ]]: () => {
            this.cpu.reg.a = this.cpu.mem.readByte(this.cpu.reg.c + 0xFF00);
        },
        [Opcodes['DI']] : () => {
            // this.cpu.interrupts.master = 0;
            this.cpu.disableInterrupts();
        },
        [Opcodes['DB $F4']] : () => {throw Error("Not implemented")},
        [Opcodes['PUSH AF']] : () => {
            // GetAF
            let val = this.cpu.reg.a << 8;
            if (this.cpu.reg.flags.Z) {
                val |= (1 << 7)
            }
            if (this.cpu.reg.flags.N) {
                val |= (1 << 6)
            }
            if (this.cpu.reg.flags.H) {
                val |= (1 << 5)
            }
            if (this.cpu.reg.flags.C) {
                val |= (1 << 4)
            }

            this.cpu.pushWord(val);
        },
        [Opcodes['OR D8']] : () => {
            this.cpu.alu.OR(this.cpu.nextByte());
        },
        [Opcodes['RST $30']] : () => {
            this.cpu.pushWord(this.cpu.reg.pc);
            this.cpu.reg.pc = 0x30;
        },
        [Opcodes['LD HL,SP+R8']] : () => {
            var rel = this.cpu.nextByte();
            rel = rel & 0x80 ? rel-256 : rel; // signed
            const val = (this.cpu.reg.sp + rel) & 0xFFFF;

            this.cpu.reg.flags.C = (this.cpu.reg.sp & 0xFF) + (rel & 0xFF) > 0xFF;
            this.cpu.reg.flags.H = (this.cpu.reg.sp & 0xF) + (rel & 0xF) > 0xF;
            this.cpu.reg.flags.Z = this.cpu.reg.flags.N = false;

            this.cpu.reg.hl = val;
        },
        [Opcodes['LD SP,HL']] : () => {
            this.cpu.reg.sp = this.cpu.reg.hl;
        },
        [Opcodes['LD A,[A16]' ]]: () => {
            this.cpu.reg.a = this.cpu.mem.readByte(this.cpu.nextWord());
        },
        [Opcodes['EI']] : () => {
            // this.cpu.interrupts.master = 1;
            this.cpu.enableInterrupts();
        },
        [Opcodes['DB $FC']] : () => {
            console.warn("DB $FC not implemented");
        },
        [Opcodes['DB $FD']] : () => {throw Error("Not implemented")},
        [Opcodes['CP D8']] : () => {
            this.cpu.alu.CP(this.cpu.nextByte());
        },
        [Opcodes['RST $38']] : () => {
            this.cpu.pushWord(this.cpu.reg.pc);
            this.cpu.reg.pc = 0x38;
        },
    }

    constructor(cpu: CPU) {
        this.cpu = cpu;
    }

}