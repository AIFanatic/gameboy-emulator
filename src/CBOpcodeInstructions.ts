import { CPU } from "./CPU";
import { CBOpcodes } from "./CBOpcodes";
import { Registers } from "./Registers";

export type CBInstruction = {[key in CBOpcodes]: {}};

export class CBOpcodeInstructions {
    private cpu: CPU;

    public instructions: CBInstruction = {

        [CBOpcodes["RLC B"]] : () => {
            this.cpu.reg.b = this.cpu.alu.RLC(this.cpu.reg.b);
        },
        [CBOpcodes["RLC C"]] : () => {
            this.cpu.reg.c = this.cpu.alu.RLC(this.cpu.reg.c);
        },
        [CBOpcodes["RLC D"]] : () => {
            this.cpu.reg.d = this.cpu.alu.RLC(this.cpu.reg.d);
        },
        [CBOpcodes["RLC E"]] : () => {
            this.cpu.reg.e = this.cpu.alu.RLC(this.cpu.reg.e);
        },
        [CBOpcodes["RLC H"]] : () => {
            this.cpu.reg.h = this.cpu.alu.RLC(this.cpu.reg.h);
        },
        [CBOpcodes["RLC L"]] : () => {
            // this.cpu.reg.l = this.cpu.alu.RLC(this.cpu.reg.l);

            this.cpu.reg.flags.C = ((this.cpu.reg.hl & 0x80) == 0x80);
            this.cpu.reg.hl = (this.cpu.reg.hl & 0xFF00) | ((this.cpu.reg.hl << 1) & 0xFF) | ((this.cpu.reg.flags.C) ? 1 : 0);
            this.cpu.reg.flags.H = this.cpu.reg.flags.N = false;
            this.cpu.reg.flags.Z = ((this.cpu.reg.hl & 0xFF) == 0);

        },
        [CBOpcodes["RLC (HL)"]] : () => {
            // c.Memory.Write(c.HL, c.rlc(c.Memory.Read(c.HL)))
            this.cpu.mem.writeByte(this.cpu.reg.hl, this.cpu.alu.RLC(this.cpu.mem.readByte(this.cpu.reg.hl)));
        },
        [CBOpcodes["RLC A"]] : () => {
            this.cpu.reg.a = this.cpu.alu.RLC(this.cpu.reg.a);
        },
        [CBOpcodes["RRC B"]] : () => {
            this.cpu.reg.b = this.cpu.alu.RRC(this.cpu.reg.b);
        },
        [CBOpcodes["RRC C"]] : () => {
            this.cpu.reg.c = this.cpu.alu.RRC(this.cpu.reg.c);
        },
        [CBOpcodes["RRC D"]] : () => {
            this.cpu.reg.d = this.cpu.alu.RRC(this.cpu.reg.d);
        },
        [CBOpcodes["RRC E"]] : () => {
            this.cpu.reg.e = this.cpu.alu.RRC(this.cpu.reg.e);
        },
        [CBOpcodes["RRC H"]] : () => {
            this.cpu.reg.h = this.cpu.alu.RRC(this.cpu.reg.h);
        },
        [CBOpcodes["RRC L"]] : () => {
            this.cpu.reg.l = this.cpu.alu.RRC(this.cpu.reg.l);
        },
        [CBOpcodes["RRC (HL)"]] : () => {
            this.cpu.mem.writeByte(this.cpu.reg.hl, this.cpu.alu.RRC(this.cpu.mem.readByte(this.cpu.reg.hl)));
        },
        [CBOpcodes["RRC A"]] : () => {
            this.cpu.reg.a = this.cpu.alu.RRC(this.cpu.reg.a);
        },
        [CBOpcodes["RL B"]] : () => {
            this.cpu.reg.b = this.cpu.alu.RL(this.cpu.reg.b);
        },
        [CBOpcodes["RL C"]] : () => {
            this.cpu.reg.c = this.cpu.alu.RL(this.cpu.reg.c);
        },
        [CBOpcodes["RL D"]] : () => {
            this.cpu.reg.d = this.cpu.alu.RL(this.cpu.reg.d);
        },
        [CBOpcodes["RL E"]] : () => {
            this.cpu.reg.e = this.cpu.alu.RL(this.cpu.reg.e);
        },
        [CBOpcodes["RL H"]] : () => {
            this.cpu.reg.h = this.cpu.alu.RL(this.cpu.reg.h);
        },
        [CBOpcodes["RL L"]] : () => {
            this.cpu.reg.l = this.cpu.alu.RL(this.cpu.reg.l);
        },
        [CBOpcodes["RL (HL)"]] : () => {
            this.cpu.mem.writeByte(this.cpu.reg.hl, this.cpu.alu.RL(this.cpu.mem.readByte(this.cpu.reg.hl)));
        },
        [CBOpcodes["RL A"]] : () => {
            this.cpu.reg.a = this.cpu.alu.RL(this.cpu.reg.a);
        },
        [CBOpcodes["RR B"]] : () => {
            this.cpu.reg.b = this.cpu.alu.RR(this.cpu.reg.b);
        },
        [CBOpcodes["RR C"]] : () => {
            this.cpu.reg.c = this.cpu.alu.RR(this.cpu.reg.c);
        },
        [CBOpcodes["RR D"]] : () => {
            this.cpu.reg.d = this.cpu.alu.RR(this.cpu.reg.d);
        },
        [CBOpcodes["RR E"]] : () => {
            this.cpu.reg.e = this.cpu.alu.RR(this.cpu.reg.e);
        },
        [CBOpcodes["RR H"]] : () => {
            this.cpu.reg.h = this.cpu.alu.RR(this.cpu.reg.h);
        },
        [CBOpcodes["RR L"]] : () => {
            this.cpu.reg.l = this.cpu.alu.RR(this.cpu.reg.l);
        },
        [CBOpcodes["RR (HL)"]] : () => {
            this.cpu.mem.writeByte(this.cpu.reg.hl, this.cpu.alu.RR(this.cpu.mem.readByte(this.cpu.reg.hl)));
        },
        [CBOpcodes["RR A"]] : () => {
            this.cpu.reg.a = this.cpu.alu.RR(this.cpu.reg.a);
        },
        [CBOpcodes["SLA B"]] : () => {
            this.cpu.reg.b = this.cpu.alu.SLA(this.cpu.reg.b);
        },
        [CBOpcodes["SLA C"]] : () => {
            this.cpu.reg.c = this.cpu.alu.SLA(this.cpu.reg.c);
        },
        [CBOpcodes["SLA D"]] : () => {
            this.cpu.reg.d = this.cpu.alu.SLA(this.cpu.reg.d);
        },
        [CBOpcodes["SLA E"]] : () => {
            this.cpu.reg.e = this.cpu.alu.SLA(this.cpu.reg.e);
        },
        [CBOpcodes["SLA H"]] : () => {
            this.cpu.reg.h = this.cpu.alu.SLA(this.cpu.reg.h);
        },
        [CBOpcodes["SLA L"]] : () => {
            this.cpu.reg.l = this.cpu.alu.SLA(this.cpu.reg.l);
        },
        [CBOpcodes["SLA (HL)"]] : () => {
            this.cpu.mem.writeByte(this.cpu.reg.hl, this.cpu.alu.SLA(this.cpu.mem.readByte(this.cpu.reg.hl)));
        },
        [CBOpcodes["SLA A"]] : () => {
            this.cpu.reg.a = this.cpu.alu.SLA(this.cpu.reg.a);
        },
        [CBOpcodes["SRA B"]] : () => {
            this.cpu.reg.b = this.cpu.alu.SRA(this.cpu.reg.b);
        },
        [CBOpcodes["SRA C"]] : () => {
            this.cpu.reg.c = this.cpu.alu.SRA(this.cpu.reg.c);
        },
        [CBOpcodes["SRA D"]] : () => {
            this.cpu.reg.d = this.cpu.alu.SRA(this.cpu.reg.d);            
        },
        [CBOpcodes["SRA E"]] : () => {
            this.cpu.reg.e = this.cpu.alu.SRA(this.cpu.reg.e);
        },
        [CBOpcodes["SRA H"]] : () => {
            this.cpu.reg.h = this.cpu.alu.SRA(this.cpu.reg.h);
        },
        [CBOpcodes["SRA L"]] : () => {
            this.cpu.reg.l = this.cpu.alu.SRA(this.cpu.reg.l);
        },
        [CBOpcodes["SRA (HL)"]] : () => {
            this.cpu.mem.writeByte(this.cpu.reg.hl, this.cpu.alu.SRA(this.cpu.mem.readByte(this.cpu.reg.hl)));
        },
        [CBOpcodes["SRA A"]] : () => {
            this.cpu.reg.a = this.cpu.alu.SRA(this.cpu.reg.a);
        },
        [CBOpcodes["SWAP B"]] : () => {
            this.cpu.reg.b = this.cpu.alu.SWAP(this.cpu.reg.b);
        },
        [CBOpcodes["SWAP C"]] : () => {
            this.cpu.reg.c = this.cpu.alu.SWAP(this.cpu.reg.c);
        },
        [CBOpcodes["SWAP D"]] : () => {
            this.cpu.reg.d = this.cpu.alu.SWAP(this.cpu.reg.d);
        },
        [CBOpcodes["SWAP E"]] : () => {
            this.cpu.reg.e = this.cpu.alu.SWAP(this.cpu.reg.e);
        },
        [CBOpcodes["SWAP H"]] : () => {
            this.cpu.reg.h = this.cpu.alu.SWAP(this.cpu.reg.h);
        },
        [CBOpcodes["SWAP L"]] : () => {
            // this.cpu.reg.l = this.cpu.alu.SWAP(this.cpu.reg.l);
            
            this.cpu.reg.hl = (this.cpu.reg.hl & 0xFF00) | ((this.cpu.reg.hl & 0xF) << 4) | ((this.cpu.reg.hl & 0xF0) >> 4);
            this.cpu.reg.flags.Z = ((this.cpu.reg.hl & 0xFF) == 0);
            this.cpu.reg.flags.C = this.cpu.reg.flags.H = this.cpu.reg.flags.N = false;
        },
        [CBOpcodes["SWAP (HL)"]] : () => {
            this.cpu.mem.writeByte(this.cpu.reg.hl, this.cpu.alu.SWAP(this.cpu.mem.readByte(this.cpu.reg.hl)));
        },
        [CBOpcodes["SWAP A"]] : () => {
            this.cpu.reg.a = this.cpu.alu.SWAP(this.cpu.reg.a);
        },
        [CBOpcodes["SRL B"]] : () => {
            this.cpu.reg.b = this.cpu.alu.SRL(this.cpu.reg.b);
        },
        [CBOpcodes["SRL C"]] : () => {
            this.cpu.reg.c = this.cpu.alu.SRL(this.cpu.reg.c);
        },
        [CBOpcodes["SRL D"]] : () => {
            this.cpu.reg.d = this.cpu.alu.SRL(this.cpu.reg.d);
        },
        [CBOpcodes["SRL E"]] : () => {
            this.cpu.reg.e = this.cpu.alu.SRL(this.cpu.reg.e);
        },
        [CBOpcodes["SRL H"]] : () => {
            this.cpu.reg.h = this.cpu.alu.SRL(this.cpu.reg.h);
        },
        [CBOpcodes["SRL L"]] : () => {
            this.cpu.reg.l = this.cpu.alu.SRL(this.cpu.reg.l);
        },
        [CBOpcodes["SRL (HL)"]] : () => {
            this.cpu.mem.writeByte(this.cpu.reg.hl, this.cpu.alu.SRL(this.cpu.mem.readByte(this.cpu.reg.hl)));
        },
        [CBOpcodes["SRL A"]] : () => {
            this.cpu.reg.a = this.cpu.alu.SRL(this.cpu.reg.a);
        },
        [CBOpcodes["BIT 0, B"]] : () => {
            this.cpu.alu.BIT(this.cpu.reg.b, 0x01);
        },
        [CBOpcodes["BIT 0, C"]] : () => {
            this.cpu.alu.BIT(this.cpu.reg.c, 0x01);
        },
        [CBOpcodes["BIT 0, D"]] : () => {
            this.cpu.alu.BIT(this.cpu.reg.d, 0x01);
        },
        [CBOpcodes["BIT 0, E"]] : () => {
            this.cpu.alu.BIT(this.cpu.reg.e, 0x01);
        },
        [CBOpcodes["BIT 0, H"]] : () => {
            this.cpu.alu.BIT(this.cpu.reg.h, 0x01);
        },
        [CBOpcodes["BIT 0, L"]] : () => {
            this.cpu.alu.BIT(this.cpu.reg.l, 0x01);
        },
        [CBOpcodes["BIT 0, (HL)"]] : () => {
            this.cpu.alu.BIT(this.cpu.mem.readByte(this.cpu.reg.hl), 0x01);
        },
        [CBOpcodes["BIT 0, A"]] : () => {
            this.cpu.alu.BIT(this.cpu.reg.a, 0x01);
        },
        [CBOpcodes["BIT 1, B"]] : () => {
            this.cpu.alu.BIT(this.cpu.reg.b, 0x02);
        },
        [CBOpcodes["BIT 1, C"]] : () => {
            this.cpu.alu.BIT(this.cpu.reg.c, 0x02);
        },
        [CBOpcodes["BIT 1, D"]] : () => {
            this.cpu.alu.BIT(this.cpu.reg.d, 0x02);
        },
        [CBOpcodes["BIT 1, E"]] : () => {
            this.cpu.alu.BIT(this.cpu.reg.e, 0x02);
        },
        [CBOpcodes["BIT 1, H"]] : () => {
            this.cpu.alu.BIT(this.cpu.reg.h, 0x02);
        },
        [CBOpcodes["BIT 1, L"]] : () => {
            this.cpu.alu.BIT(this.cpu.reg.l, 0x02);
        },
        [CBOpcodes["BIT 1, (HL)"]] : () => {
            this.cpu.alu.BIT(this.cpu.mem.readByte(this.cpu.reg.hl), 0x02);
        },
        [CBOpcodes["BIT 1, A"]] : () => {
            this.cpu.alu.BIT(this.cpu.reg.a, 0x02);
        },
        [CBOpcodes["BIT 2, B"]] : () => {
            this.cpu.alu.BIT(this.cpu.reg.b, 0x04);
        },
        [CBOpcodes["BIT 2, C"]] : () => {
            this.cpu.alu.BIT(this.cpu.reg.c, 0x04);
        },
        [CBOpcodes["BIT 2, D"]] : () => {
            this.cpu.alu.BIT(this.cpu.reg.d, 0x04);
        },
        [CBOpcodes["BIT 2, E"]] : () => {
            this.cpu.alu.BIT(this.cpu.reg.e, 0x04);
        },
        [CBOpcodes["BIT 2, H"]] : () => {
            this.cpu.alu.BIT(this.cpu.reg.h, 0x04);
        },
        [CBOpcodes["BIT 2, L"]] : () => {
            this.cpu.alu.BIT(this.cpu.reg.l, 0x04);
        },
        [CBOpcodes["BIT 2, (HL)"]] : () => {
            this.cpu.alu.BIT(this.cpu.mem.readByte(this.cpu.reg.hl), 0x04);
        },
        [CBOpcodes["BIT 2, A"]] : () => {
            this.cpu.alu.BIT(this.cpu.reg.a, 0x04);
        },
        [CBOpcodes["BIT 3, B"]] : () => {
            this.cpu.alu.BIT(this.cpu.reg.b, 0x08);
        },
        [CBOpcodes["BIT 3, C"]] : () => {
            this.cpu.alu.BIT(this.cpu.reg.c, 0x08);
        },
        [CBOpcodes["BIT 3, D"]] : () => {
            this.cpu.alu.BIT(this.cpu.reg.d, 0x08);
        },
        [CBOpcodes["BIT 3, E"]] : () => {
            this.cpu.alu.BIT(this.cpu.reg.e, 0x08);
        },
        [CBOpcodes["BIT 3, H"]] : () => {
            this.cpu.alu.BIT(this.cpu.reg.h, 0x08);
        },
        [CBOpcodes["BIT 3, L"]] : () => {
            this.cpu.alu.BIT(this.cpu.reg.l, 0x08);
        },
        [CBOpcodes["BIT 3, (HL)"]] : () => {
            this.cpu.alu.BIT(this.cpu.mem.readByte(this.cpu.reg.hl), 0x08);
        },
        [CBOpcodes["BIT 3, A"]] : () => {
            this.cpu.alu.BIT(this.cpu.reg.a, 0x08);
        },
        [CBOpcodes["BIT 4, B"]] : () => {
            this.cpu.alu.BIT(this.cpu.reg.b, 0x10);
        },
        [CBOpcodes["BIT 4, C"]] : () => {
            this.cpu.alu.BIT(this.cpu.reg.c, 0x10);
        },
        [CBOpcodes["BIT 4, D"]] : () => {
            this.cpu.alu.BIT(this.cpu.reg.d, 0x10);
        },
        [CBOpcodes["BIT 4, E"]] : () => {
            this.cpu.alu.BIT(this.cpu.reg.e, 0x10);
        },
        [CBOpcodes["BIT 4, H"]] : () => {
            this.cpu.alu.BIT(this.cpu.reg.h, 0x10);
        },
        [CBOpcodes["BIT 4, L"]] : () => {
            this.cpu.alu.BIT(this.cpu.reg.l, 0x10);
        },
        [CBOpcodes["BIT 4, (HL)"]] : () => {
            this.cpu.alu.BIT(this.cpu.mem.readByte(this.cpu.reg.hl), 0x10);
        },
        [CBOpcodes["BIT 4, A"]] : () => {
            this.cpu.alu.BIT(this.cpu.reg.a, 0x10);
        },
        [CBOpcodes["BIT 5, B"]] : () => {
            this.cpu.alu.BIT(this.cpu.reg.b, 0x20);
        },
        [CBOpcodes["BIT 5, C"]] : () => {
            this.cpu.alu.BIT(this.cpu.reg.c, 0x20);
        },
        [CBOpcodes["BIT 5, D"]] : () => {
            this.cpu.alu.BIT(this.cpu.reg.d, 0x20);
        },
        [CBOpcodes["BIT 5, E"]] : () => {
            this.cpu.alu.BIT(this.cpu.reg.e, 0x20);
        },
        [CBOpcodes["BIT 5, H"]] : () => {
            this.cpu.alu.BIT(this.cpu.reg.h, 0x20);
        },
        [CBOpcodes["BIT 5, L"]] : () => {
            this.cpu.alu.BIT(this.cpu.reg.l, 0x20);
        },
        [CBOpcodes["BIT 5, (HL)"]] : () => {
            this.cpu.alu.BIT(this.cpu.mem.readByte(this.cpu.reg.hl), 0x20);
        },
        [CBOpcodes["BIT 5, A"]] : () => {
            this.cpu.alu.BIT(this.cpu.reg.a, 0x20);
        },
        [CBOpcodes["BIT 6, H"]] : () => {
            this.cpu.alu.BIT(this.cpu.reg.h, 0x40);
        },
        [CBOpcodes["BIT 6, L"]] : () => {
            this.cpu.alu.BIT(this.cpu.reg.l, 0x40);
        },
        [CBOpcodes["BIT 6, B"]] : () => {
            this.cpu.alu.BIT(this.cpu.reg.b, 0x40);
        },
        [CBOpcodes["BIT 6, C"]] : () => {
            this.cpu.alu.BIT(this.cpu.reg.c, 0x40);
        },
        [CBOpcodes["BIT 6, D"]] : () => {
            this.cpu.alu.BIT(this.cpu.reg.d, 0x40);
        },
        [CBOpcodes["BIT 6, E"]] : () => {
            this.cpu.alu.BIT(this.cpu.reg.e, 0x40);
        },
        [CBOpcodes["BIT 6, H"]] : () => {
            this.cpu.alu.BIT(this.cpu.reg.h, 0x40);
        },
        [CBOpcodes["BIT 6, L"]] : () => {
            this.cpu.alu.BIT(this.cpu.reg.l, 0x40);
        },
        [CBOpcodes["BIT 6, (HL)"]] : () => {
            this.cpu.alu.BIT(this.cpu.mem.readByte(this.cpu.reg.hl), 0x40);
        },
        [CBOpcodes["BIT 6, A"]] : () => {
            this.cpu.alu.BIT(this.cpu.reg.a, 0x40);
        },
        [CBOpcodes["BIT 7, B"]] : () => {
            this.cpu.alu.BIT(this.cpu.reg.b, 0x80);
        },
        [CBOpcodes["BIT 7, C"]] : () => {
            this.cpu.alu.BIT(this.cpu.reg.c, 0x80);
        },
        [CBOpcodes["BIT 7, D"]] : () => {
            this.cpu.alu.BIT(this.cpu.reg.d, 0x80);
        },
        [CBOpcodes["BIT 7, E"]] : () => {
            this.cpu.alu.BIT(this.cpu.reg.e, 0x80);
        },
        [CBOpcodes["BIT 7, H"]] : () => {
            this.cpu.alu.BIT(this.cpu.reg.h, 0x80);
        },
        [CBOpcodes["BIT 7, L"]] : () => {
            this.cpu.alu.BIT(this.cpu.reg.l, 0x80);
        },
        [CBOpcodes["BIT 7, (HL)"]] : () => {
            this.cpu.alu.BIT(this.cpu.mem.readByte(this.cpu.reg.hl), 0x80);
        },
        [CBOpcodes["BIT 7, A"]] : () => {
            this.cpu.alu.BIT(this.cpu.reg.a, 0x80);
        },
        [CBOpcodes["RES 0, B"]] : () => {
            this.cpu.reg.b &= 0xFE;
        },
        [CBOpcodes["RES 0, C"]] : () => {
            this.cpu.reg.c &= 0xFE;
        },
        [CBOpcodes["RES 0, D"]] : () => {
            this.cpu.reg.d &= 0xFE;
        },
        [CBOpcodes["RES 0, E"]] : () => {
            this.cpu.reg.e &= 0xFE;
        },
        [CBOpcodes["RES 0, H"]] : () => {
            this.cpu.reg.h &= 0xFE;
        },
        [CBOpcodes["RES 0, L"]] : () => {
            this.cpu.reg.l &= 0xFE;
        },
        [CBOpcodes["RES 0, (HL)"]] : () => {
            this.cpu.mem.writeByte(this.cpu.reg.hl, (this.cpu.mem.readByte(this.cpu.reg.hl) & 0xFE));
        },
        [CBOpcodes["RES 0, A"]] : () => {
            this.cpu.reg.a &= 0xFE;
        },
        [CBOpcodes["RES 1, B"]] : () => {
            this.cpu.reg.b &= 0xFD;
        },
        [CBOpcodes["RES 1, C"]] : () => {
            this.cpu.reg.c &= 0xFD;
        },
        [CBOpcodes["RES 1, D"]] : () => {
            this.cpu.reg.d &= 0xFD;
        },
        [CBOpcodes["RES 1, E"]] : () => {
            this.cpu.reg.e &= 0xFD;
        },
        [CBOpcodes["RES 1, H"]] : () => {
            this.cpu.reg.h &= 0xFD;
        },
        [CBOpcodes["RES 1, L"]] : () => {
            this.cpu.reg.l &= 0xFD;
        },
        [CBOpcodes["RES 1, (HL)"]] : () => {
            this.cpu.mem.writeByte(this.cpu.reg.hl, (this.cpu.mem.readByte(this.cpu.reg.hl) & 0xFD));
        },
        [CBOpcodes["RES 1, A"]] : () => {
            this.cpu.reg.a &= 0xFD;
        },
        [CBOpcodes["RES 2, B"]] : () => {
            this.cpu.reg.b &= 0xFB;
        },
        [CBOpcodes["RES 2, C"]] : () => {
            this.cpu.reg.c &= 0xFB;
        },
        [CBOpcodes["RES 2, D"]] : () => {
            this.cpu.reg.d &= 0xFB;
        },
        [CBOpcodes["RES 2, E"]] : () => {
            this.cpu.reg.e &= 0xFB;
        },
        [CBOpcodes["RES 2, H"]] : () => {
            this.cpu.reg.h &= 0xFB;
        },
        [CBOpcodes["RES 2, L"]] : () => {
            this.cpu.reg.l &= 0xFB;
        },
        [CBOpcodes["RES 2, (HL)"]] : () => {
            this.cpu.mem.writeByte(this.cpu.reg.hl, (this.cpu.mem.readByte(this.cpu.reg.hl) & 0xFB));
        },
        [CBOpcodes["RES 2, A"]] : () => {
            this.cpu.reg.a &= 0xFB;
        },
        [CBOpcodes["RES 3, B"]] : () => {
            this.cpu.reg.b &= 0xF7;
        },
        [CBOpcodes["RES 3, C"]] : () => {
            this.cpu.reg.c &= 0xF7;
        },
        [CBOpcodes["RES 3, D"]] : () => {
            this.cpu.reg.d &= 0xF7;
        },
        [CBOpcodes["RES 3, E"]] : () => {
            this.cpu.reg.e &= 0xF7;
        },
        [CBOpcodes["RES 3, H"]] : () => {
            this.cpu.reg.h &= 0xF7;
        },
        [CBOpcodes["RES 3, L"]] : () => {
            this.cpu.reg.l &= 0xF7;
        },
        [CBOpcodes["RES 3, (HL)"]] : () => {
            this.cpu.mem.writeByte(this.cpu.reg.hl, (this.cpu.mem.readByte(this.cpu.reg.hl) & 0xF7));
        },
        [CBOpcodes["RES 3, A"]] : () => {
            this.cpu.reg.a &= 0xF7;
        },
        [CBOpcodes["RES 4, B"]] : () => {
            this.cpu.reg.b &= 0xEF;
        },
        [CBOpcodes["RES 4, C"]] : () => {
            this.cpu.reg.c &= 0xEF;
        },
        [CBOpcodes["RES 4, D"]] : () => {
            this.cpu.reg.d &= 0xEF;
        },
        [CBOpcodes["RES 4, E"]] : () => {
            this.cpu.reg.e &= 0xEF;
        },
        [CBOpcodes["RES 4, H"]] : () => {
            this.cpu.reg.h &= 0xEF;
        },
        [CBOpcodes["RES 4, L"]] : () => {
            this.cpu.reg.l &= 0xEF;
        },
        [CBOpcodes["RES 4, (HL)"]] : () => {
            this.cpu.mem.writeByte(this.cpu.reg.hl, (this.cpu.mem.readByte(this.cpu.reg.hl) & 0xEF));
        },
        [CBOpcodes["RES 4, A"]] : () => {
            this.cpu.reg.a &= 0xEF;
        },
        [CBOpcodes["RES 5, B"]] : () => {
            this.cpu.reg.b &= 0xDF;
        },
        [CBOpcodes["RES 5, C"]] : () => {
            this.cpu.reg.c &= 0xDF;
        },
        [CBOpcodes["RES 5, D"]] : () => {
            this.cpu.reg.d &= 0xDF;
        },
        [CBOpcodes["RES 5, E"]] : () => {
            this.cpu.reg.e &= 0xDF;
        },
        [CBOpcodes["RES 5, H"]] : () => {
            this.cpu.reg.h &= 0xDF;
        },
        [CBOpcodes["RES 5, L"]] : () => {
            this.cpu.reg.l &= 0xDF;
        },
        [CBOpcodes["RES 5, (HL)"]] : () => {
            this.cpu.mem.writeByte(this.cpu.reg.hl, (this.cpu.mem.readByte(this.cpu.reg.hl) & 0xDF));
        },
        [CBOpcodes["RES 5, A"]] : () => {
            this.cpu.reg.a &= 0xDF;
        },
        [CBOpcodes["RES 6, B"]] : () => {
            this.cpu.reg.b &= 0xBF;
        },
        [CBOpcodes["RES 6, C"]] : () => {
            this.cpu.reg.c &= 0xBF;
        },
        [CBOpcodes["RES 6, D"]] : () => {
            this.cpu.reg.d &= 0xBF;
        },
        [CBOpcodes["RES 6, E"]] : () => {
            this.cpu.reg.e &= 0xBF;
        },
        [CBOpcodes["RES 6, H"]] : () => {
            this.cpu.reg.h &= 0xBF;
        },
        [CBOpcodes["RES 6, L"]] : () => {
            this.cpu.reg.l &= 0xBF;
        },
        [CBOpcodes["RES 6, (HL)"]] : () => {
            this.cpu.mem.writeByte(this.cpu.reg.hl, (this.cpu.mem.readByte(this.cpu.reg.hl) & 0xBF));
        },
        [CBOpcodes["RES 6, A"]] : () => {
            this.cpu.reg.a &= 0xBF;
        },
        [CBOpcodes["RES 7, B"]] : () => {
            this.cpu.reg.b &= 0x7F;
        },
        [CBOpcodes["RES 7, C"]] : () => {
            this.cpu.reg.c &= 0x7F;
        },
        [CBOpcodes["RES 7, D"]] : () => {
            this.cpu.reg.d &= 0x7F;
        },
        [CBOpcodes["RES 7, E"]] : () => {
            this.cpu.reg.e &= 0x7F;
        },
        [CBOpcodes["RES 7, H"]] : () => {
            this.cpu.reg.h &= 0x7F;
        },
        [CBOpcodes["RES 7, L"]] : () => {
            this.cpu.reg.l &= 0x7F;
        },
        [CBOpcodes["RES 7, (HL)"]] : () => {
            this.cpu.mem.writeByte(this.cpu.reg.hl, (this.cpu.mem.readByte(this.cpu.reg.hl) & 0x7F));
        },
        [CBOpcodes["RES 7, A"]] : () => {
            this.cpu.reg.a &= 0x7F;
        },
        [CBOpcodes["SET 0, B"]] : () => {
            this.cpu.reg.b |= 0x01;
        },
        [CBOpcodes["SET 0, C"]] : () => {
            this.cpu.reg.c |= 0x01;
        },
        [CBOpcodes["SET 0, D"]] : () => {
            this.cpu.reg.d |= 0x01;
        },
        [CBOpcodes["SET 0, E"]] : () => {
            this.cpu.reg.e |= 0x01;
        },
        [CBOpcodes["SET 0, H"]] : () => {
            this.cpu.reg.h |= 0x01;
        },
        [CBOpcodes["SET 0, L"]] : () => {
            this.cpu.reg.l |= 0x01;
        },
        [CBOpcodes["SET 0, (HL)"]] : () => {
            this.cpu.mem.writeByte(this.cpu.reg.hl, (this.cpu.mem.readByte(this.cpu.reg.hl) | 0x01));
        },
        [CBOpcodes["SET 0, A"]] : () => {
            this.cpu.reg.a |= 0x01;
        },
        [CBOpcodes["SET 1, B"]] : () => {
            this.cpu.reg.b |= 0x02;
        },
        [CBOpcodes["SET 1, C"]] : () => {
            this.cpu.reg.c |= 0x02;
        },
        [CBOpcodes["SET 1, D"]] : () => {
            this.cpu.reg.d |= 0x02;
        },
        [CBOpcodes["SET 1, E"]] : () => {
            this.cpu.reg.e |= 0x02;
        },
        [CBOpcodes["SET 1, H"]] : () => {
            this.cpu.reg.h |= 0x02;
        },
        [CBOpcodes["SET 1, L"]] : () => {
            this.cpu.reg.l |= 0x02;
        },
        [CBOpcodes["SET 1, (HL)"]] : () => {
            this.cpu.mem.writeByte(this.cpu.reg.hl, (this.cpu.mem.readByte(this.cpu.reg.hl) | 0x02));
        },
        [CBOpcodes["SET 1, A"]] : () => {
            this.cpu.reg.a |= 0x02;
        },
        [CBOpcodes["SET 2, B"]] : () => {
            this.cpu.reg.b |= 0x04;
        },
        [CBOpcodes["SET 2, C"]] : () => {
            this.cpu.reg.c |= 0x04;
        },
        [CBOpcodes["SET 2, D"]] : () => {
            this.cpu.reg.d |= 0x04;
        },
        [CBOpcodes["SET 2, E"]] : () => {
            this.cpu.reg.e |= 0x04;
        },
        [CBOpcodes["SET 2, H"]] : () => {
            this.cpu.reg.h |= 0x04;
        },
        [CBOpcodes["SET 2, L"]] : () => {
            this.cpu.reg.l |= 0x04;
        },
        [CBOpcodes["SET 2, (HL)"]] : () => {
            this.cpu.mem.writeByte(this.cpu.reg.hl, (this.cpu.mem.readByte(this.cpu.reg.hl) | 0x04));
        },
        [CBOpcodes["SET 2, A"]] : () => {
            this.cpu.reg.a |= 0x04;
        },
        [CBOpcodes["SET 3, B"]] : () => {
            this.cpu.reg.b |= 0x08;
        },
        [CBOpcodes["SET 3, C"]] : () => {
            this.cpu.reg.c |= 0x08;
        },
        [CBOpcodes["SET 3, D"]] : () => {
            this.cpu.reg.d |= 0x08;
        },
        [CBOpcodes["SET 3, E"]] : () => {
            this.cpu.reg.e |= 0x08;
        },
        [CBOpcodes["SET 3, H"]] : () => {
            this.cpu.reg.h |= 0x08;
        },
        [CBOpcodes["SET 3, L"]] : () => {
            this.cpu.reg.l |= 0x08;
        },
        [CBOpcodes["SET 3, (HL)"]] : () => {
            this.cpu.mem.writeByte(this.cpu.reg.hl, (this.cpu.mem.readByte(this.cpu.reg.hl) | 0x08));
        },
        [CBOpcodes["SET 3, A"]] : () => {
            this.cpu.reg.a |= 0x08;
        },
        [CBOpcodes["SET 4, B"]] : () => {
            this.cpu.reg.b |= 0x10;
        },
        [CBOpcodes["SET 4, C"]] : () => {
            this.cpu.reg.c |= 0x10;
        },
        [CBOpcodes["SET 4, D"]] : () => {
            this.cpu.reg.d |= 0x10;
        },
        [CBOpcodes["SET 4, E"]] : () => {
            this.cpu.reg.e |= 0x10;
        },
        [CBOpcodes["SET 4, H"]] : () => {
            this.cpu.reg.h |= 0x10;
        },
        [CBOpcodes["SET 4, L"]] : () => {
            this.cpu.reg.l |= 0x10;
        },
        [CBOpcodes["SET 4, (HL)"]] : () => {
            this.cpu.mem.writeByte(this.cpu.reg.hl, (this.cpu.mem.readByte(this.cpu.reg.hl) | 0x10));
        },
        [CBOpcodes["SET 4, A"]] : () => {
            this.cpu.reg.a |= 0x10;
        },
        [CBOpcodes["SET 5, B"]] : () => {
            this.cpu.reg.b |= 0x20;
        },
        [CBOpcodes["SET 5, C"]] : () => {
            this.cpu.reg.c |= 0x20;
        },
        [CBOpcodes["SET 5, D"]] : () => {
            this.cpu.reg.d |= 0x20;
        },
        [CBOpcodes["SET 5, E"]] : () => {
            this.cpu.reg.e |= 0x20;
        },
        [CBOpcodes["SET 5, H"]] : () => {
            this.cpu.reg.h |= 0x20;
        },
        [CBOpcodes["SET 5, L"]] : () => {
            this.cpu.reg.l |= 0x20;
        },
        [CBOpcodes["SET 5, (HL)"]] : () => {
            this.cpu.mem.writeByte(this.cpu.reg.hl, (this.cpu.mem.readByte(this.cpu.reg.hl) | 0x20));
        },
        [CBOpcodes["SET 5, A"]] : () => {
            this.cpu.reg.a |= 0x20;
        },
        [CBOpcodes["SET 6, B"]] : () => {
            this.cpu.reg.b |= 0x40;
        },
        [CBOpcodes["SET 6, C"]] : () => {
            this.cpu.reg.c |= 0x40;
        },
        [CBOpcodes["SET 6, D"]] : () => {
            this.cpu.reg.d |= 0x40;
        },
        [CBOpcodes["SET 6, E"]] : () => {
            this.cpu.reg.e |= 0x40;
        },
        [CBOpcodes["SET 6, H"]] : () => {
            this.cpu.reg.h |= 0x40;
        },
        [CBOpcodes["SET 6, L"]] : () => {
            this.cpu.reg.l |= 0x40;
        },
        [CBOpcodes["SET 6, (HL)"]] : () => {
            this.cpu.mem.writeByte(this.cpu.reg.hl, (this.cpu.mem.readByte(this.cpu.reg.hl) | 0x40));
        },
        [CBOpcodes["SET 6, A"]] : () => {
            this.cpu.reg.a |= 0x40;
        },
        [CBOpcodes["SET 7, B"]] : () => {
            this.cpu.reg.b |= 0x80;
        },
        [CBOpcodes["SET 7, C"]] : () => {
            this.cpu.reg.c |= 0x80;
        },
        [CBOpcodes["SET 7, D"]] : () => {
            this.cpu.reg.d |= 0x80;
        },
        [CBOpcodes["SET 7, E"]] : () => {
            this.cpu.reg.e |= 0x80;
        },
        [CBOpcodes["SET 7, H"]] : () => {
            this.cpu.reg.h |= 0x80;
        },
        [CBOpcodes["SET 7, L"]] : () => {
            this.cpu.reg.l |= 0x80;
        },
        [CBOpcodes["SET 7, (HL)"]] : () => {
            this.cpu.mem.writeByte(this.cpu.reg.hl, (this.cpu.mem.readByte(this.cpu.reg.hl) | 0x80));
        },
        [CBOpcodes["SET 7, A"]] : () => {
            this.cpu.reg.a |= 0x80;
        },
    }

    constructor(cpu: CPU) {
        this.cpu = cpu;
    }

}