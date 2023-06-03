// src/ALUInstructions.ts
var ALUInstructions = class {
  constructor(cpu) {
    this.cpu = cpu;
  }
  CP(value) {
    this.cpu.reg.flags.Z = this.cpu.reg.a == value;
    this.cpu.reg.flags.H = (this.cpu.reg.a & 15) < (value & 15);
    this.cpu.reg.flags.N = true;
    this.cpu.reg.flags.C = this.cpu.reg.a < value;
  }
  OR(value) {
    this.cpu.reg.a |= value & 255;
    this.cpu.reg.flags.Z = this.cpu.reg.a == 0;
    this.cpu.reg.flags.H = false;
    this.cpu.reg.flags.N = false;
    this.cpu.reg.flags.C = false;
  }
  XOR(value) {
    this.cpu.reg.a ^= value & 255;
    this.cpu.reg.a &= 255;
    this.cpu.reg.flags.Z = this.cpu.reg.a == 0;
    this.cpu.reg.flags.H = false;
    this.cpu.reg.flags.N = false;
    this.cpu.reg.flags.C = false;
  }
  AND(value) {
    this.cpu.reg.a &= value & 255;
    this.cpu.reg.flags.Z = this.cpu.reg.a == 0;
    this.cpu.reg.flags.H = true;
    this.cpu.reg.flags.N = false;
    this.cpu.reg.flags.C = false;
  }
  SUB(value) {
    this.CP(value);
    this.cpu.reg.a = this.cpu.reg.a - value & 255;
  }
  ADD(value) {
    const n = this.cpu.reg.a + value;
    this.cpu.reg.flags.Z = (n & 255) == 0;
    this.cpu.reg.flags.H = ((this.cpu.reg.a & 15) + (value & 15) & 16) == 16;
    this.cpu.reg.flags.C = n > 255;
    this.cpu.reg.flags.N = false;
    this.cpu.reg.a = n & 255;
  }
  ADC(value) {
    var tempValue = value & 255;
    var dirtySum = this.cpu.reg.a + tempValue + (this.cpu.reg.flags.C ? 1 : 0);
    this.cpu.reg.flags.H = (this.cpu.reg.a & 15) + (tempValue & 15) + (this.cpu.reg.flags.C ? 1 : 0) > 15;
    this.cpu.reg.flags.C = dirtySum > 255;
    this.cpu.reg.a = dirtySum & 255;
    this.cpu.reg.flags.Z = this.cpu.reg.a == 0;
    this.cpu.reg.flags.N = false;
  }
  DEC(value, word = false) {
    value = value - 1;
    if (word)
      value = value & 65535;
    else
      value = value & 255;
    this.cpu.reg.flags.Z = value == 0;
    this.cpu.reg.flags.N = true;
    this.cpu.reg.flags.H = (value & 15) == 15;
    return value;
  }
  INC(value, word = false) {
    value = value + 1 & 255;
    this.cpu.reg.flags.Z = value == 0;
    this.cpu.reg.flags.H = (value & 15) == 0;
    this.cpu.reg.flags.N = false;
    return value;
  }
  RR(value) {
    const oldcarry = this.cpu.reg.flags.C;
    this.cpu.reg.flags.C = (value & 1) == 1;
    this.cpu.reg.flags.H = false;
    this.cpu.reg.flags.N = false;
    value >>= 1;
    if (oldcarry) {
      value |= 1 << 7;
    }
    this.cpu.reg.flags.Z = value == 0;
    return value;
  }
  RRC(value) {
    this.cpu.reg.flags.C = (value & 1) == 1;
    this.cpu.reg.flags.H = false;
    this.cpu.reg.flags.N = false;
    value >>= 1;
    if (this.cpu.reg.flags.C) {
      value |= 1 << 7;
    }
    this.cpu.reg.flags.Z = value == 0;
    return value;
  }
  RLC(value) {
    this.cpu.reg.flags.C = (value & 1 << 7) == 1 << 7;
    this.cpu.reg.flags.H = false;
    this.cpu.reg.flags.N = false;
    value <<= 1;
    if (this.cpu.reg.flags.C) {
      value |= 1;
    }
    value = value & 255;
    this.cpu.reg.flags.Z = value == 0;
    return value;
  }
  RL(value) {
    var newFCarry = value > 127;
    value = value << 1 & 255 | (this.cpu.reg.flags.C ? 1 : 0);
    this.cpu.reg.flags.C = newFCarry;
    this.cpu.reg.flags.H = this.cpu.reg.flags.N = false;
    this.cpu.reg.flags.Z = value == 0;
    return value;
  }
  BIT(value, b) {
    this.cpu.reg.flags.H = true;
    this.cpu.reg.flags.N = false;
    this.cpu.reg.flags.Z = (value & b) == 0;
  }
  SBC(b) {
    var dirtySum = this.cpu.reg.a - b - (this.cpu.reg.flags.C ? 1 : 0);
    this.cpu.reg.flags.H = (this.cpu.reg.a & 15) - (b & 15) - (this.cpu.reg.flags.C ? 1 : 0) < 0;
    this.cpu.reg.flags.C = dirtySum < 0;
    this.cpu.reg.a = dirtySum & 255;
    this.cpu.reg.flags.Z = this.cpu.reg.a == 0;
    this.cpu.reg.flags.N = true;
  }
  SLA(value) {
    this.cpu.reg.flags.C = value > 127;
    value = value << 1 & 255;
    this.cpu.reg.flags.H = this.cpu.reg.flags.N = false;
    this.cpu.reg.flags.Z = value == 0;
    return value;
  }
  SRL(value) {
    this.cpu.reg.flags.C = (value & 1) != 0;
    value >>= 1;
    this.cpu.reg.flags.Z = value == 0;
    this.cpu.reg.flags.H = false;
    this.cpu.reg.flags.N = false;
    return value;
  }
  SRA(value) {
    this.cpu.reg.flags.C = (value & 1) == 1;
    value = value & 128 | value >> 1;
    this.cpu.reg.flags.H = this.cpu.reg.flags.N = false;
    this.cpu.reg.flags.Z = value == 0;
    return value;
  }
  // Not ALU
  SWAP(val) {
    this.cpu.reg.flags.Z = val == 0;
    this.cpu.reg.flags.N = false;
    this.cpu.reg.flags.H = false;
    this.cpu.reg.flags.C = false;
    return (val & 15) << 4 | (val & 240) >> 4;
  }
};

// src/CBOpcodes.ts
var CBOpcodeTicks = [
  //Number of machine cycles for each 0xCBXX instruction:
  /*  0, 1, 2, 3, 4, 5,  6, 7,        8, 9, A, B, C, D,  E, F*/
  8,
  8,
  8,
  8,
  8,
  8,
  16,
  8,
  8,
  8,
  8,
  8,
  8,
  8,
  16,
  8,
  //0
  8,
  8,
  8,
  8,
  8,
  8,
  16,
  8,
  8,
  8,
  8,
  8,
  8,
  8,
  16,
  8,
  //1
  8,
  8,
  8,
  8,
  8,
  8,
  16,
  8,
  8,
  8,
  8,
  8,
  8,
  8,
  16,
  8,
  //2
  8,
  8,
  8,
  8,
  8,
  8,
  16,
  8,
  8,
  8,
  8,
  8,
  8,
  8,
  16,
  8,
  //3
  8,
  8,
  8,
  8,
  8,
  8,
  12,
  8,
  8,
  8,
  8,
  8,
  8,
  8,
  12,
  8,
  //4
  8,
  8,
  8,
  8,
  8,
  8,
  12,
  8,
  8,
  8,
  8,
  8,
  8,
  8,
  12,
  8,
  //5
  8,
  8,
  8,
  8,
  8,
  8,
  12,
  8,
  8,
  8,
  8,
  8,
  8,
  8,
  12,
  8,
  //6
  8,
  8,
  8,
  8,
  8,
  8,
  12,
  8,
  8,
  8,
  8,
  8,
  8,
  8,
  12,
  8,
  //7
  8,
  8,
  8,
  8,
  8,
  8,
  16,
  8,
  8,
  8,
  8,
  8,
  8,
  8,
  16,
  8,
  //8
  8,
  8,
  8,
  8,
  8,
  8,
  16,
  8,
  8,
  8,
  8,
  8,
  8,
  8,
  16,
  8,
  //9
  8,
  8,
  8,
  8,
  8,
  8,
  16,
  8,
  8,
  8,
  8,
  8,
  8,
  8,
  16,
  8,
  //A
  8,
  8,
  8,
  8,
  8,
  8,
  16,
  8,
  8,
  8,
  8,
  8,
  8,
  8,
  16,
  8,
  //B
  8,
  8,
  8,
  8,
  8,
  8,
  16,
  8,
  8,
  8,
  8,
  8,
  8,
  8,
  16,
  8,
  //C
  8,
  8,
  8,
  8,
  8,
  8,
  16,
  8,
  8,
  8,
  8,
  8,
  8,
  8,
  16,
  8,
  //D
  8,
  8,
  8,
  8,
  8,
  8,
  16,
  8,
  8,
  8,
  8,
  8,
  8,
  8,
  16,
  8,
  //E
  8,
  8,
  8,
  8,
  8,
  8,
  16,
  8,
  8,
  8,
  8,
  8,
  8,
  8,
  16,
  8
  //F
];

// src/CBOpcodeInstructions.ts
var CBOpcodeInstructions = class {
  constructor(cpu) {
    this.instructions = {
      [0 /* RLC B */]: () => {
        this.cpu.reg.b = this.cpu.alu.RLC(this.cpu.reg.b);
      },
      [1 /* RLC C */]: () => {
        this.cpu.reg.c = this.cpu.alu.RLC(this.cpu.reg.c);
      },
      [2 /* RLC D */]: () => {
        this.cpu.reg.d = this.cpu.alu.RLC(this.cpu.reg.d);
      },
      [3 /* RLC E */]: () => {
        this.cpu.reg.e = this.cpu.alu.RLC(this.cpu.reg.e);
      },
      [4 /* RLC H */]: () => {
        this.cpu.reg.h = this.cpu.alu.RLC(this.cpu.reg.h);
      },
      [5 /* RLC L */]: () => {
        this.cpu.reg.flags.C = (this.cpu.reg.hl & 128) == 128;
        this.cpu.reg.hl = this.cpu.reg.hl & 65280 | this.cpu.reg.hl << 1 & 255 | (this.cpu.reg.flags.C ? 1 : 0);
        this.cpu.reg.flags.H = this.cpu.reg.flags.N = false;
        this.cpu.reg.flags.Z = (this.cpu.reg.hl & 255) == 0;
      },
      [6 /* RLC (HL) */]: () => {
        this.cpu.mem.writeByte(this.cpu.reg.hl, this.cpu.alu.RLC(this.cpu.mem.readByte(this.cpu.reg.hl)));
      },
      [7 /* RLC A */]: () => {
        this.cpu.reg.a = this.cpu.alu.RLC(this.cpu.reg.a);
      },
      [8 /* RRC B */]: () => {
        this.cpu.reg.b = this.cpu.alu.RRC(this.cpu.reg.b);
      },
      [9 /* RRC C */]: () => {
        this.cpu.reg.c = this.cpu.alu.RRC(this.cpu.reg.c);
      },
      [10 /* RRC D */]: () => {
        this.cpu.reg.d = this.cpu.alu.RRC(this.cpu.reg.d);
      },
      [11 /* RRC E */]: () => {
        this.cpu.reg.e = this.cpu.alu.RRC(this.cpu.reg.e);
      },
      [12 /* RRC H */]: () => {
        this.cpu.reg.h = this.cpu.alu.RRC(this.cpu.reg.h);
      },
      [13 /* RRC L */]: () => {
        this.cpu.reg.l = this.cpu.alu.RRC(this.cpu.reg.l);
      },
      [14 /* RRC (HL) */]: () => {
        this.cpu.mem.writeByte(this.cpu.reg.hl, this.cpu.alu.RRC(this.cpu.mem.readByte(this.cpu.reg.hl)));
      },
      [15 /* RRC A */]: () => {
        this.cpu.reg.a = this.cpu.alu.RRC(this.cpu.reg.a);
      },
      [16 /* RL B */]: () => {
        this.cpu.reg.b = this.cpu.alu.RL(this.cpu.reg.b);
      },
      [17 /* RL C */]: () => {
        this.cpu.reg.c = this.cpu.alu.RL(this.cpu.reg.c);
      },
      [18 /* RL D */]: () => {
        this.cpu.reg.d = this.cpu.alu.RL(this.cpu.reg.d);
      },
      [19 /* RL E */]: () => {
        this.cpu.reg.e = this.cpu.alu.RL(this.cpu.reg.e);
      },
      [20 /* RL H */]: () => {
        this.cpu.reg.h = this.cpu.alu.RL(this.cpu.reg.h);
      },
      [21 /* RL L */]: () => {
        this.cpu.reg.l = this.cpu.alu.RL(this.cpu.reg.l);
      },
      [22 /* RL (HL) */]: () => {
        this.cpu.mem.writeByte(this.cpu.reg.hl, this.cpu.alu.RL(this.cpu.mem.readByte(this.cpu.reg.hl)));
      },
      [23 /* RL A */]: () => {
        this.cpu.reg.a = this.cpu.alu.RL(this.cpu.reg.a);
      },
      [24 /* RR B */]: () => {
        this.cpu.reg.b = this.cpu.alu.RR(this.cpu.reg.b);
      },
      [25 /* RR C */]: () => {
        this.cpu.reg.c = this.cpu.alu.RR(this.cpu.reg.c);
      },
      [26 /* RR D */]: () => {
        this.cpu.reg.d = this.cpu.alu.RR(this.cpu.reg.d);
      },
      [27 /* RR E */]: () => {
        this.cpu.reg.e = this.cpu.alu.RR(this.cpu.reg.e);
      },
      [28 /* RR H */]: () => {
        this.cpu.reg.h = this.cpu.alu.RR(this.cpu.reg.h);
      },
      [29 /* RR L */]: () => {
        this.cpu.reg.l = this.cpu.alu.RR(this.cpu.reg.l);
      },
      [30 /* RR (HL) */]: () => {
        this.cpu.mem.writeByte(this.cpu.reg.hl, this.cpu.alu.RR(this.cpu.mem.readByte(this.cpu.reg.hl)));
      },
      [31 /* RR A */]: () => {
        this.cpu.reg.a = this.cpu.alu.RR(this.cpu.reg.a);
      },
      [32 /* SLA B */]: () => {
        this.cpu.reg.b = this.cpu.alu.SLA(this.cpu.reg.b);
      },
      [33 /* SLA C */]: () => {
        this.cpu.reg.c = this.cpu.alu.SLA(this.cpu.reg.c);
      },
      [34 /* SLA D */]: () => {
        this.cpu.reg.d = this.cpu.alu.SLA(this.cpu.reg.d);
      },
      [35 /* SLA E */]: () => {
        this.cpu.reg.e = this.cpu.alu.SLA(this.cpu.reg.e);
      },
      [36 /* SLA H */]: () => {
        this.cpu.reg.h = this.cpu.alu.SLA(this.cpu.reg.h);
      },
      [37 /* SLA L */]: () => {
        this.cpu.reg.l = this.cpu.alu.SLA(this.cpu.reg.l);
      },
      [38 /* SLA (HL) */]: () => {
        this.cpu.mem.writeByte(this.cpu.reg.hl, this.cpu.alu.SLA(this.cpu.mem.readByte(this.cpu.reg.hl)));
      },
      [39 /* SLA A */]: () => {
        this.cpu.reg.a = this.cpu.alu.SLA(this.cpu.reg.a);
      },
      [40 /* SRA B */]: () => {
        this.cpu.reg.b = this.cpu.alu.SRA(this.cpu.reg.b);
      },
      [41 /* SRA C */]: () => {
        this.cpu.reg.c = this.cpu.alu.SRA(this.cpu.reg.c);
      },
      [42 /* SRA D */]: () => {
        this.cpu.reg.d = this.cpu.alu.SRA(this.cpu.reg.d);
      },
      [43 /* SRA E */]: () => {
        this.cpu.reg.e = this.cpu.alu.SRA(this.cpu.reg.e);
      },
      [44 /* SRA H */]: () => {
        this.cpu.reg.h = this.cpu.alu.SRA(this.cpu.reg.h);
      },
      [45 /* SRA L */]: () => {
        this.cpu.reg.l = this.cpu.alu.SRA(this.cpu.reg.l);
      },
      [46 /* SRA (HL) */]: () => {
        this.cpu.mem.writeByte(this.cpu.reg.hl, this.cpu.alu.SRA(this.cpu.mem.readByte(this.cpu.reg.hl)));
      },
      [47 /* SRA A */]: () => {
        this.cpu.reg.a = this.cpu.alu.SRA(this.cpu.reg.a);
      },
      [48 /* SWAP B */]: () => {
        this.cpu.reg.b = this.cpu.alu.SWAP(this.cpu.reg.b);
      },
      [49 /* SWAP C */]: () => {
        this.cpu.reg.c = this.cpu.alu.SWAP(this.cpu.reg.c);
      },
      [50 /* SWAP D */]: () => {
        this.cpu.reg.d = this.cpu.alu.SWAP(this.cpu.reg.d);
      },
      [51 /* SWAP E */]: () => {
        this.cpu.reg.e = this.cpu.alu.SWAP(this.cpu.reg.e);
      },
      [52 /* SWAP H */]: () => {
        this.cpu.reg.h = this.cpu.alu.SWAP(this.cpu.reg.h);
      },
      [53 /* SWAP L */]: () => {
        this.cpu.reg.hl = this.cpu.reg.hl & 65280 | (this.cpu.reg.hl & 15) << 4 | (this.cpu.reg.hl & 240) >> 4;
        this.cpu.reg.flags.Z = (this.cpu.reg.hl & 255) == 0;
        this.cpu.reg.flags.C = this.cpu.reg.flags.H = this.cpu.reg.flags.N = false;
      },
      [54 /* SWAP (HL) */]: () => {
        this.cpu.mem.writeByte(this.cpu.reg.hl, this.cpu.alu.SWAP(this.cpu.mem.readByte(this.cpu.reg.hl)));
      },
      [55 /* SWAP A */]: () => {
        this.cpu.reg.a = this.cpu.alu.SWAP(this.cpu.reg.a);
      },
      [56 /* SRL B */]: () => {
        this.cpu.reg.b = this.cpu.alu.SRL(this.cpu.reg.b);
      },
      [57 /* SRL C */]: () => {
        this.cpu.reg.c = this.cpu.alu.SRL(this.cpu.reg.c);
      },
      [58 /* SRL D */]: () => {
        this.cpu.reg.d = this.cpu.alu.SRL(this.cpu.reg.d);
      },
      [59 /* SRL E */]: () => {
        this.cpu.reg.e = this.cpu.alu.SRL(this.cpu.reg.e);
      },
      [60 /* SRL H */]: () => {
        this.cpu.reg.h = this.cpu.alu.SRL(this.cpu.reg.h);
      },
      [61 /* SRL L */]: () => {
        this.cpu.reg.l = this.cpu.alu.SRL(this.cpu.reg.l);
      },
      [62 /* SRL (HL) */]: () => {
        this.cpu.mem.writeByte(this.cpu.reg.hl, this.cpu.alu.SRL(this.cpu.mem.readByte(this.cpu.reg.hl)));
      },
      [63 /* SRL A */]: () => {
        this.cpu.reg.a = this.cpu.alu.SRL(this.cpu.reg.a);
      },
      [64 /* BIT 0, B */]: () => {
        this.cpu.alu.BIT(this.cpu.reg.b, 1);
      },
      [65 /* BIT 0, C */]: () => {
        this.cpu.alu.BIT(this.cpu.reg.c, 1);
      },
      [66 /* BIT 0, D */]: () => {
        this.cpu.alu.BIT(this.cpu.reg.d, 1);
      },
      [67 /* BIT 0, E */]: () => {
        this.cpu.alu.BIT(this.cpu.reg.e, 1);
      },
      [68 /* BIT 0, H */]: () => {
        this.cpu.alu.BIT(this.cpu.reg.h, 1);
      },
      [69 /* BIT 0, L */]: () => {
        this.cpu.alu.BIT(this.cpu.reg.l, 1);
      },
      [70 /* BIT 0, (HL) */]: () => {
        this.cpu.alu.BIT(this.cpu.mem.readByte(this.cpu.reg.hl), 1);
      },
      [71 /* BIT 0, A */]: () => {
        this.cpu.alu.BIT(this.cpu.reg.a, 1);
      },
      [72 /* BIT 1, B */]: () => {
        this.cpu.alu.BIT(this.cpu.reg.b, 2);
      },
      [73 /* BIT 1, C */]: () => {
        this.cpu.alu.BIT(this.cpu.reg.c, 2);
      },
      [74 /* BIT 1, D */]: () => {
        this.cpu.alu.BIT(this.cpu.reg.d, 2);
      },
      [75 /* BIT 1, E */]: () => {
        this.cpu.alu.BIT(this.cpu.reg.e, 2);
      },
      [76 /* BIT 1, H */]: () => {
        this.cpu.alu.BIT(this.cpu.reg.h, 2);
      },
      [77 /* BIT 1, L */]: () => {
        this.cpu.alu.BIT(this.cpu.reg.l, 2);
      },
      [78 /* BIT 1, (HL) */]: () => {
        this.cpu.alu.BIT(this.cpu.mem.readByte(this.cpu.reg.hl), 2);
      },
      [79 /* BIT 1, A */]: () => {
        this.cpu.alu.BIT(this.cpu.reg.a, 2);
      },
      [80 /* BIT 2, B */]: () => {
        this.cpu.alu.BIT(this.cpu.reg.b, 4);
      },
      [81 /* BIT 2, C */]: () => {
        this.cpu.alu.BIT(this.cpu.reg.c, 4);
      },
      [82 /* BIT 2, D */]: () => {
        this.cpu.alu.BIT(this.cpu.reg.d, 4);
      },
      [83 /* BIT 2, E */]: () => {
        this.cpu.alu.BIT(this.cpu.reg.e, 4);
      },
      [84 /* BIT 2, H */]: () => {
        this.cpu.alu.BIT(this.cpu.reg.h, 4);
      },
      [85 /* BIT 2, L */]: () => {
        this.cpu.alu.BIT(this.cpu.reg.l, 4);
      },
      [86 /* BIT 2, (HL) */]: () => {
        this.cpu.alu.BIT(this.cpu.mem.readByte(this.cpu.reg.hl), 4);
      },
      [87 /* BIT 2, A */]: () => {
        this.cpu.alu.BIT(this.cpu.reg.a, 4);
      },
      [88 /* BIT 3, B */]: () => {
        this.cpu.alu.BIT(this.cpu.reg.b, 8);
      },
      [89 /* BIT 3, C */]: () => {
        this.cpu.alu.BIT(this.cpu.reg.c, 8);
      },
      [90 /* BIT 3, D */]: () => {
        this.cpu.alu.BIT(this.cpu.reg.d, 8);
      },
      [91 /* BIT 3, E */]: () => {
        this.cpu.alu.BIT(this.cpu.reg.e, 8);
      },
      [92 /* BIT 3, H */]: () => {
        this.cpu.alu.BIT(this.cpu.reg.h, 8);
      },
      [93 /* BIT 3, L */]: () => {
        this.cpu.alu.BIT(this.cpu.reg.l, 8);
      },
      [94 /* BIT 3, (HL) */]: () => {
        this.cpu.alu.BIT(this.cpu.mem.readByte(this.cpu.reg.hl), 8);
      },
      [95 /* BIT 3, A */]: () => {
        this.cpu.alu.BIT(this.cpu.reg.a, 8);
      },
      [96 /* BIT 4, B */]: () => {
        this.cpu.alu.BIT(this.cpu.reg.b, 16);
      },
      [97 /* BIT 4, C */]: () => {
        this.cpu.alu.BIT(this.cpu.reg.c, 16);
      },
      [98 /* BIT 4, D */]: () => {
        this.cpu.alu.BIT(this.cpu.reg.d, 16);
      },
      [99 /* BIT 4, E */]: () => {
        this.cpu.alu.BIT(this.cpu.reg.e, 16);
      },
      [100 /* BIT 4, H */]: () => {
        this.cpu.alu.BIT(this.cpu.reg.h, 16);
      },
      [101 /* BIT 4, L */]: () => {
        this.cpu.alu.BIT(this.cpu.reg.l, 16);
      },
      [102 /* BIT 4, (HL) */]: () => {
        this.cpu.alu.BIT(this.cpu.mem.readByte(this.cpu.reg.hl), 16);
      },
      [103 /* BIT 4, A */]: () => {
        this.cpu.alu.BIT(this.cpu.reg.a, 16);
      },
      [104 /* BIT 5, B */]: () => {
        this.cpu.alu.BIT(this.cpu.reg.b, 32);
      },
      [105 /* BIT 5, C */]: () => {
        this.cpu.alu.BIT(this.cpu.reg.c, 32);
      },
      [106 /* BIT 5, D */]: () => {
        this.cpu.alu.BIT(this.cpu.reg.d, 32);
      },
      [107 /* BIT 5, E */]: () => {
        this.cpu.alu.BIT(this.cpu.reg.e, 32);
      },
      [108 /* BIT 5, H */]: () => {
        this.cpu.alu.BIT(this.cpu.reg.h, 32);
      },
      [109 /* BIT 5, L */]: () => {
        this.cpu.alu.BIT(this.cpu.reg.l, 32);
      },
      [110 /* BIT 5, (HL) */]: () => {
        this.cpu.alu.BIT(this.cpu.mem.readByte(this.cpu.reg.hl), 32);
      },
      [111 /* BIT 5, A */]: () => {
        this.cpu.alu.BIT(this.cpu.reg.a, 32);
      },
      [116 /* BIT 6, H */]: () => {
        this.cpu.alu.BIT(this.cpu.reg.h, 64);
      },
      [117 /* BIT 6, L */]: () => {
        this.cpu.alu.BIT(this.cpu.reg.l, 64);
      },
      [112 /* BIT 6, B */]: () => {
        this.cpu.alu.BIT(this.cpu.reg.b, 64);
      },
      [113 /* BIT 6, C */]: () => {
        this.cpu.alu.BIT(this.cpu.reg.c, 64);
      },
      [114 /* BIT 6, D */]: () => {
        this.cpu.alu.BIT(this.cpu.reg.d, 64);
      },
      [115 /* BIT 6, E */]: () => {
        this.cpu.alu.BIT(this.cpu.reg.e, 64);
      },
      [116 /* BIT 6, H */]: () => {
        this.cpu.alu.BIT(this.cpu.reg.h, 64);
      },
      [117 /* BIT 6, L */]: () => {
        this.cpu.alu.BIT(this.cpu.reg.l, 64);
      },
      [118 /* BIT 6, (HL) */]: () => {
        this.cpu.alu.BIT(this.cpu.mem.readByte(this.cpu.reg.hl), 64);
      },
      [119 /* BIT 6, A */]: () => {
        this.cpu.alu.BIT(this.cpu.reg.a, 64);
      },
      [120 /* BIT 7, B */]: () => {
        this.cpu.alu.BIT(this.cpu.reg.b, 128);
      },
      [121 /* BIT 7, C */]: () => {
        this.cpu.alu.BIT(this.cpu.reg.c, 128);
      },
      [122 /* BIT 7, D */]: () => {
        this.cpu.alu.BIT(this.cpu.reg.d, 128);
      },
      [123 /* BIT 7, E */]: () => {
        this.cpu.alu.BIT(this.cpu.reg.e, 128);
      },
      [124 /* BIT 7, H */]: () => {
        this.cpu.alu.BIT(this.cpu.reg.h, 128);
      },
      [125 /* BIT 7, L */]: () => {
        this.cpu.alu.BIT(this.cpu.reg.l, 128);
      },
      [126 /* BIT 7, (HL) */]: () => {
        this.cpu.alu.BIT(this.cpu.mem.readByte(this.cpu.reg.hl), 128);
      },
      [127 /* BIT 7, A */]: () => {
        this.cpu.alu.BIT(this.cpu.reg.a, 128);
      },
      [128 /* RES 0, B */]: () => {
        this.cpu.reg.b &= 254;
      },
      [129 /* RES 0, C */]: () => {
        this.cpu.reg.c &= 254;
      },
      [130 /* RES 0, D */]: () => {
        this.cpu.reg.d &= 254;
      },
      [131 /* RES 0, E */]: () => {
        this.cpu.reg.e &= 254;
      },
      [132 /* RES 0, H */]: () => {
        this.cpu.reg.h &= 254;
      },
      [133 /* RES 0, L */]: () => {
        this.cpu.reg.l &= 254;
      },
      [134 /* RES 0, (HL) */]: () => {
        this.cpu.mem.writeByte(this.cpu.reg.hl, this.cpu.mem.readByte(this.cpu.reg.hl) & 254);
      },
      [135 /* RES 0, A */]: () => {
        this.cpu.reg.a &= 254;
      },
      [136 /* RES 1, B */]: () => {
        this.cpu.reg.b &= 253;
      },
      [137 /* RES 1, C */]: () => {
        this.cpu.reg.c &= 253;
      },
      [138 /* RES 1, D */]: () => {
        this.cpu.reg.d &= 253;
      },
      [139 /* RES 1, E */]: () => {
        this.cpu.reg.e &= 253;
      },
      [140 /* RES 1, H */]: () => {
        this.cpu.reg.h &= 253;
      },
      [141 /* RES 1, L */]: () => {
        this.cpu.reg.l &= 253;
      },
      [142 /* RES 1, (HL) */]: () => {
        this.cpu.mem.writeByte(this.cpu.reg.hl, this.cpu.mem.readByte(this.cpu.reg.hl) & 253);
      },
      [143 /* RES 1, A */]: () => {
        this.cpu.reg.a &= 253;
      },
      [144 /* RES 2, B */]: () => {
        this.cpu.reg.b &= 251;
      },
      [145 /* RES 2, C */]: () => {
        this.cpu.reg.c &= 251;
      },
      [146 /* RES 2, D */]: () => {
        this.cpu.reg.d &= 251;
      },
      [147 /* RES 2, E */]: () => {
        this.cpu.reg.e &= 251;
      },
      [148 /* RES 2, H */]: () => {
        this.cpu.reg.h &= 251;
      },
      [149 /* RES 2, L */]: () => {
        this.cpu.reg.l &= 251;
      },
      [150 /* RES 2, (HL) */]: () => {
        this.cpu.mem.writeByte(this.cpu.reg.hl, this.cpu.mem.readByte(this.cpu.reg.hl) & 251);
      },
      [151 /* RES 2, A */]: () => {
        this.cpu.reg.a &= 251;
      },
      [152 /* RES 3, B */]: () => {
        this.cpu.reg.b &= 247;
      },
      [153 /* RES 3, C */]: () => {
        this.cpu.reg.c &= 247;
      },
      [154 /* RES 3, D */]: () => {
        this.cpu.reg.d &= 247;
      },
      [155 /* RES 3, E */]: () => {
        this.cpu.reg.e &= 247;
      },
      [156 /* RES 3, H */]: () => {
        this.cpu.reg.h &= 247;
      },
      [157 /* RES 3, L */]: () => {
        this.cpu.reg.l &= 247;
      },
      [158 /* RES 3, (HL) */]: () => {
        this.cpu.mem.writeByte(this.cpu.reg.hl, this.cpu.mem.readByte(this.cpu.reg.hl) & 247);
      },
      [159 /* RES 3, A */]: () => {
        this.cpu.reg.a &= 247;
      },
      [160 /* RES 4, B */]: () => {
        this.cpu.reg.b &= 239;
      },
      [161 /* RES 4, C */]: () => {
        this.cpu.reg.c &= 239;
      },
      [162 /* RES 4, D */]: () => {
        this.cpu.reg.d &= 239;
      },
      [163 /* RES 4, E */]: () => {
        this.cpu.reg.e &= 239;
      },
      [164 /* RES 4, H */]: () => {
        this.cpu.reg.h &= 239;
      },
      [165 /* RES 4, L */]: () => {
        this.cpu.reg.l &= 239;
      },
      [166 /* RES 4, (HL) */]: () => {
        this.cpu.mem.writeByte(this.cpu.reg.hl, this.cpu.mem.readByte(this.cpu.reg.hl) & 239);
      },
      [167 /* RES 4, A */]: () => {
        this.cpu.reg.a &= 239;
      },
      [168 /* RES 5, B */]: () => {
        this.cpu.reg.b &= 223;
      },
      [169 /* RES 5, C */]: () => {
        this.cpu.reg.c &= 223;
      },
      [170 /* RES 5, D */]: () => {
        this.cpu.reg.d &= 223;
      },
      [171 /* RES 5, E */]: () => {
        this.cpu.reg.e &= 223;
      },
      [172 /* RES 5, H */]: () => {
        this.cpu.reg.h &= 223;
      },
      [173 /* RES 5, L */]: () => {
        this.cpu.reg.l &= 223;
      },
      [174 /* RES 5, (HL) */]: () => {
        this.cpu.mem.writeByte(this.cpu.reg.hl, this.cpu.mem.readByte(this.cpu.reg.hl) & 223);
      },
      [175 /* RES 5, A */]: () => {
        this.cpu.reg.a &= 223;
      },
      [176 /* RES 6, B */]: () => {
        this.cpu.reg.b &= 191;
      },
      [177 /* RES 6, C */]: () => {
        this.cpu.reg.c &= 191;
      },
      [178 /* RES 6, D */]: () => {
        this.cpu.reg.d &= 191;
      },
      [179 /* RES 6, E */]: () => {
        this.cpu.reg.e &= 191;
      },
      [180 /* RES 6, H */]: () => {
        this.cpu.reg.h &= 191;
      },
      [181 /* RES 6, L */]: () => {
        this.cpu.reg.l &= 191;
      },
      [182 /* RES 6, (HL) */]: () => {
        this.cpu.mem.writeByte(this.cpu.reg.hl, this.cpu.mem.readByte(this.cpu.reg.hl) & 191);
      },
      [183 /* RES 6, A */]: () => {
        this.cpu.reg.a &= 191;
      },
      [184 /* RES 7, B */]: () => {
        this.cpu.reg.b &= 127;
      },
      [185 /* RES 7, C */]: () => {
        this.cpu.reg.c &= 127;
      },
      [186 /* RES 7, D */]: () => {
        this.cpu.reg.d &= 127;
      },
      [187 /* RES 7, E */]: () => {
        this.cpu.reg.e &= 127;
      },
      [188 /* RES 7, H */]: () => {
        this.cpu.reg.h &= 127;
      },
      [189 /* RES 7, L */]: () => {
        this.cpu.reg.l &= 127;
      },
      [190 /* RES 7, (HL) */]: () => {
        this.cpu.mem.writeByte(this.cpu.reg.hl, this.cpu.mem.readByte(this.cpu.reg.hl) & 127);
      },
      [191 /* RES 7, A */]: () => {
        this.cpu.reg.a &= 127;
      },
      [192 /* SET 0, B */]: () => {
        this.cpu.reg.b |= 1;
      },
      [193 /* SET 0, C */]: () => {
        this.cpu.reg.c |= 1;
      },
      [194 /* SET 0, D */]: () => {
        this.cpu.reg.d |= 1;
      },
      [195 /* SET 0, E */]: () => {
        this.cpu.reg.e |= 1;
      },
      [196 /* SET 0, H */]: () => {
        this.cpu.reg.h |= 1;
      },
      [197 /* SET 0, L */]: () => {
        this.cpu.reg.l |= 1;
      },
      [198 /* SET 0, (HL) */]: () => {
        this.cpu.mem.writeByte(this.cpu.reg.hl, this.cpu.mem.readByte(this.cpu.reg.hl) | 1);
      },
      [199 /* SET 0, A */]: () => {
        this.cpu.reg.a |= 1;
      },
      [200 /* SET 1, B */]: () => {
        this.cpu.reg.b |= 2;
      },
      [201 /* SET 1, C */]: () => {
        this.cpu.reg.c |= 2;
      },
      [202 /* SET 1, D */]: () => {
        this.cpu.reg.d |= 2;
      },
      [203 /* SET 1, E */]: () => {
        this.cpu.reg.e |= 2;
      },
      [204 /* SET 1, H */]: () => {
        this.cpu.reg.h |= 2;
      },
      [205 /* SET 1, L */]: () => {
        this.cpu.reg.l |= 2;
      },
      [206 /* SET 1, (HL) */]: () => {
        this.cpu.mem.writeByte(this.cpu.reg.hl, this.cpu.mem.readByte(this.cpu.reg.hl) | 2);
      },
      [207 /* SET 1, A */]: () => {
        this.cpu.reg.a |= 2;
      },
      [208 /* SET 2, B */]: () => {
        this.cpu.reg.b |= 4;
      },
      [209 /* SET 2, C */]: () => {
        this.cpu.reg.c |= 4;
      },
      [210 /* SET 2, D */]: () => {
        this.cpu.reg.d |= 4;
      },
      [211 /* SET 2, E */]: () => {
        this.cpu.reg.e |= 4;
      },
      [212 /* SET 2, H */]: () => {
        this.cpu.reg.h |= 4;
      },
      [213 /* SET 2, L */]: () => {
        this.cpu.reg.l |= 4;
      },
      [214 /* SET 2, (HL) */]: () => {
        this.cpu.mem.writeByte(this.cpu.reg.hl, this.cpu.mem.readByte(this.cpu.reg.hl) | 4);
      },
      [215 /* SET 2, A */]: () => {
        this.cpu.reg.a |= 4;
      },
      [216 /* SET 3, B */]: () => {
        this.cpu.reg.b |= 8;
      },
      [217 /* SET 3, C */]: () => {
        this.cpu.reg.c |= 8;
      },
      [218 /* SET 3, D */]: () => {
        this.cpu.reg.d |= 8;
      },
      [219 /* SET 3, E */]: () => {
        this.cpu.reg.e |= 8;
      },
      [220 /* SET 3, H */]: () => {
        this.cpu.reg.h |= 8;
      },
      [221 /* SET 3, L */]: () => {
        this.cpu.reg.l |= 8;
      },
      [222 /* SET 3, (HL) */]: () => {
        this.cpu.mem.writeByte(this.cpu.reg.hl, this.cpu.mem.readByte(this.cpu.reg.hl) | 8);
      },
      [223 /* SET 3, A */]: () => {
        this.cpu.reg.a |= 8;
      },
      [224 /* SET 4, B */]: () => {
        this.cpu.reg.b |= 16;
      },
      [225 /* SET 4, C */]: () => {
        this.cpu.reg.c |= 16;
      },
      [226 /* SET 4, D */]: () => {
        this.cpu.reg.d |= 16;
      },
      [227 /* SET 4, E */]: () => {
        this.cpu.reg.e |= 16;
      },
      [228 /* SET 4, H */]: () => {
        this.cpu.reg.h |= 16;
      },
      [229 /* SET 4, L */]: () => {
        this.cpu.reg.l |= 16;
      },
      [230 /* SET 4, (HL) */]: () => {
        this.cpu.mem.writeByte(this.cpu.reg.hl, this.cpu.mem.readByte(this.cpu.reg.hl) | 16);
      },
      [231 /* SET 4, A */]: () => {
        this.cpu.reg.a |= 16;
      },
      [232 /* SET 5, B */]: () => {
        this.cpu.reg.b |= 32;
      },
      [233 /* SET 5, C */]: () => {
        this.cpu.reg.c |= 32;
      },
      [234 /* SET 5, D */]: () => {
        this.cpu.reg.d |= 32;
      },
      [235 /* SET 5, E */]: () => {
        this.cpu.reg.e |= 32;
      },
      [236 /* SET 5, H */]: () => {
        this.cpu.reg.h |= 32;
      },
      [237 /* SET 5, L */]: () => {
        this.cpu.reg.l |= 32;
      },
      [238 /* SET 5, (HL) */]: () => {
        this.cpu.mem.writeByte(this.cpu.reg.hl, this.cpu.mem.readByte(this.cpu.reg.hl) | 32);
      },
      [239 /* SET 5, A */]: () => {
        this.cpu.reg.a |= 32;
      },
      [240 /* SET 6, B */]: () => {
        this.cpu.reg.b |= 64;
      },
      [241 /* SET 6, C */]: () => {
        this.cpu.reg.c |= 64;
      },
      [242 /* SET 6, D */]: () => {
        this.cpu.reg.d |= 64;
      },
      [243 /* SET 6, E */]: () => {
        this.cpu.reg.e |= 64;
      },
      [244 /* SET 6, H */]: () => {
        this.cpu.reg.h |= 64;
      },
      [245 /* SET 6, L */]: () => {
        this.cpu.reg.l |= 64;
      },
      [246 /* SET 6, (HL) */]: () => {
        this.cpu.mem.writeByte(this.cpu.reg.hl, this.cpu.mem.readByte(this.cpu.reg.hl) | 64);
      },
      [247 /* SET 6, A */]: () => {
        this.cpu.reg.a |= 64;
      },
      [248 /* SET 7, B */]: () => {
        this.cpu.reg.b |= 128;
      },
      [249 /* SET 7, C */]: () => {
        this.cpu.reg.c |= 128;
      },
      [250 /* SET 7, D */]: () => {
        this.cpu.reg.d |= 128;
      },
      [251 /* SET 7, E */]: () => {
        this.cpu.reg.e |= 128;
      },
      [252 /* SET 7, H */]: () => {
        this.cpu.reg.h |= 128;
      },
      [253 /* SET 7, L */]: () => {
        this.cpu.reg.l |= 128;
      },
      [254 /* SET 7, (HL) */]: () => {
        this.cpu.mem.writeByte(this.cpu.reg.hl, this.cpu.mem.readByte(this.cpu.reg.hl) | 128);
      },
      [255 /* SET 7, A */]: () => {
        this.cpu.reg.a |= 128;
      }
    };
    this.cpu = cpu;
  }
};

// src/Opcodes.ts
var Opcodes = /* @__PURE__ */ ((Opcodes2) => {
  Opcodes2[Opcodes2["NOP"] = 0] = "NOP";
  Opcodes2[Opcodes2["LD BC,D16"] = 1] = "LD BC,D16";
  Opcodes2[Opcodes2["LD [BC],A"] = 2] = "LD [BC],A";
  Opcodes2[Opcodes2["INC BC"] = 3] = "INC BC";
  Opcodes2[Opcodes2["INC B"] = 4] = "INC B";
  Opcodes2[Opcodes2["DEC B"] = 5] = "DEC B";
  Opcodes2[Opcodes2["LD B,D8"] = 6] = "LD B,D8";
  Opcodes2[Opcodes2["RLCA"] = 7] = "RLCA";
  Opcodes2[Opcodes2["LD [A16],SP"] = 8] = "LD [A16],SP";
  Opcodes2[Opcodes2["ADD HL,BC"] = 9] = "ADD HL,BC";
  Opcodes2[Opcodes2["LD A,[BC]"] = 10] = "LD A,[BC]";
  Opcodes2[Opcodes2["DEC BC"] = 11] = "DEC BC";
  Opcodes2[Opcodes2["INC C"] = 12] = "INC C";
  Opcodes2[Opcodes2["DEC C"] = 13] = "DEC C";
  Opcodes2[Opcodes2["LD C,D8"] = 14] = "LD C,D8";
  Opcodes2[Opcodes2["RRCA"] = 15] = "RRCA";
  Opcodes2[Opcodes2["STOP"] = 16] = "STOP";
  Opcodes2[Opcodes2["LD DE,D16"] = 17] = "LD DE,D16";
  Opcodes2[Opcodes2["LD [DE],A"] = 18] = "LD [DE],A";
  Opcodes2[Opcodes2["INC DE"] = 19] = "INC DE";
  Opcodes2[Opcodes2["INC D"] = 20] = "INC D";
  Opcodes2[Opcodes2["DEC D"] = 21] = "DEC D";
  Opcodes2[Opcodes2["LD D,D8"] = 22] = "LD D,D8";
  Opcodes2[Opcodes2["RLA"] = 23] = "RLA";
  Opcodes2[Opcodes2["JR PC+R8"] = 24] = "JR PC+R8";
  Opcodes2[Opcodes2["ADD HL,DE"] = 25] = "ADD HL,DE";
  Opcodes2[Opcodes2["LD A,[DE]"] = 26] = "LD A,[DE]";
  Opcodes2[Opcodes2["DEC DE"] = 27] = "DEC DE";
  Opcodes2[Opcodes2["INC E"] = 28] = "INC E";
  Opcodes2[Opcodes2["DEC E"] = 29] = "DEC E";
  Opcodes2[Opcodes2["LD E,D8"] = 30] = "LD E,D8";
  Opcodes2[Opcodes2["RRA"] = 31] = "RRA";
  Opcodes2[Opcodes2["JR NZ,PC+R8"] = 32] = "JR NZ,PC+R8";
  Opcodes2[Opcodes2["LD HL,D16"] = 33] = "LD HL,D16";
  Opcodes2[Opcodes2["LD [HL+],A"] = 34] = "LD [HL+],A";
  Opcodes2[Opcodes2["INC HL"] = 35] = "INC HL";
  Opcodes2[Opcodes2["INC H"] = 36] = "INC H";
  Opcodes2[Opcodes2["DEC H"] = 37] = "DEC H";
  Opcodes2[Opcodes2["LD H,D8"] = 38] = "LD H,D8";
  Opcodes2[Opcodes2["DAA"] = 39] = "DAA";
  Opcodes2[Opcodes2["JR Z,PC+R8"] = 40] = "JR Z,PC+R8";
  Opcodes2[Opcodes2["ADD HL,HL"] = 41] = "ADD HL,HL";
  Opcodes2[Opcodes2["LD A,[HL+]"] = 42] = "LD A,[HL+]";
  Opcodes2[Opcodes2["DEC HL"] = 43] = "DEC HL";
  Opcodes2[Opcodes2["INC L"] = 44] = "INC L";
  Opcodes2[Opcodes2["DEC L"] = 45] = "DEC L";
  Opcodes2[Opcodes2["LD L,D8"] = 46] = "LD L,D8";
  Opcodes2[Opcodes2["CPL"] = 47] = "CPL";
  Opcodes2[Opcodes2["JR NC,PC+R8"] = 48] = "JR NC,PC+R8";
  Opcodes2[Opcodes2["LD SP,D16"] = 49] = "LD SP,D16";
  Opcodes2[Opcodes2["LD [HL-],A"] = 50] = "LD [HL-],A";
  Opcodes2[Opcodes2["INC SP"] = 51] = "INC SP";
  Opcodes2[Opcodes2["INC [HL]"] = 52] = "INC [HL]";
  Opcodes2[Opcodes2["DEC [HL]"] = 53] = "DEC [HL]";
  Opcodes2[Opcodes2["LD [HL],D8"] = 54] = "LD [HL],D8";
  Opcodes2[Opcodes2["SCF"] = 55] = "SCF";
  Opcodes2[Opcodes2["JR C,PC+R8"] = 56] = "JR C,PC+R8";
  Opcodes2[Opcodes2["ADD HL,SP"] = 57] = "ADD HL,SP";
  Opcodes2[Opcodes2["LD A,[HL-]"] = 58] = "LD A,[HL-]";
  Opcodes2[Opcodes2["DEC SP"] = 59] = "DEC SP";
  Opcodes2[Opcodes2["INC A"] = 60] = "INC A";
  Opcodes2[Opcodes2["DEC A"] = 61] = "DEC A";
  Opcodes2[Opcodes2["LD A,D8"] = 62] = "LD A,D8";
  Opcodes2[Opcodes2["CCF"] = 63] = "CCF";
  Opcodes2[Opcodes2["LD B,B"] = 64] = "LD B,B";
  Opcodes2[Opcodes2["LD B,C"] = 65] = "LD B,C";
  Opcodes2[Opcodes2["LD B,D"] = 66] = "LD B,D";
  Opcodes2[Opcodes2["LD B,E"] = 67] = "LD B,E";
  Opcodes2[Opcodes2["LD B,H"] = 68] = "LD B,H";
  Opcodes2[Opcodes2["LD B,L"] = 69] = "LD B,L";
  Opcodes2[Opcodes2["LD B,[HL]"] = 70] = "LD B,[HL]";
  Opcodes2[Opcodes2["LD B,A"] = 71] = "LD B,A";
  Opcodes2[Opcodes2["LD C,B"] = 72] = "LD C,B";
  Opcodes2[Opcodes2["LD C,C"] = 73] = "LD C,C";
  Opcodes2[Opcodes2["LD C,D"] = 74] = "LD C,D";
  Opcodes2[Opcodes2["LD C,E"] = 75] = "LD C,E";
  Opcodes2[Opcodes2["LD C,H"] = 76] = "LD C,H";
  Opcodes2[Opcodes2["LD C,L"] = 77] = "LD C,L";
  Opcodes2[Opcodes2["LD C,[HL]"] = 78] = "LD C,[HL]";
  Opcodes2[Opcodes2["LD C,A"] = 79] = "LD C,A";
  Opcodes2[Opcodes2["LD D,B"] = 80] = "LD D,B";
  Opcodes2[Opcodes2["LD D,C"] = 81] = "LD D,C";
  Opcodes2[Opcodes2["LD D,D"] = 82] = "LD D,D";
  Opcodes2[Opcodes2["LD D,E"] = 83] = "LD D,E";
  Opcodes2[Opcodes2["LD D,H"] = 84] = "LD D,H";
  Opcodes2[Opcodes2["LD D,L"] = 85] = "LD D,L";
  Opcodes2[Opcodes2["LD D,[HL]"] = 86] = "LD D,[HL]";
  Opcodes2[Opcodes2["LD D,A"] = 87] = "LD D,A";
  Opcodes2[Opcodes2["LD E,B"] = 88] = "LD E,B";
  Opcodes2[Opcodes2["LD E,C"] = 89] = "LD E,C";
  Opcodes2[Opcodes2["LD E,D"] = 90] = "LD E,D";
  Opcodes2[Opcodes2["LD E,E"] = 91] = "LD E,E";
  Opcodes2[Opcodes2["LD E,H"] = 92] = "LD E,H";
  Opcodes2[Opcodes2["LD E,L"] = 93] = "LD E,L";
  Opcodes2[Opcodes2["LD E,[HL]"] = 94] = "LD E,[HL]";
  Opcodes2[Opcodes2["LD E,A"] = 95] = "LD E,A";
  Opcodes2[Opcodes2["LD H,B"] = 96] = "LD H,B";
  Opcodes2[Opcodes2["LD H,C"] = 97] = "LD H,C";
  Opcodes2[Opcodes2["LD H,D"] = 98] = "LD H,D";
  Opcodes2[Opcodes2["LD H,E"] = 99] = "LD H,E";
  Opcodes2[Opcodes2["LD H,H"] = 100] = "LD H,H";
  Opcodes2[Opcodes2["LD H,L"] = 101] = "LD H,L";
  Opcodes2[Opcodes2["LD H,[HL]"] = 102] = "LD H,[HL]";
  Opcodes2[Opcodes2["LD H,A"] = 103] = "LD H,A";
  Opcodes2[Opcodes2["LD L,B"] = 104] = "LD L,B";
  Opcodes2[Opcodes2["LD L,C"] = 105] = "LD L,C";
  Opcodes2[Opcodes2["LD L,D"] = 106] = "LD L,D";
  Opcodes2[Opcodes2["LD L,E"] = 107] = "LD L,E";
  Opcodes2[Opcodes2["LD L,H"] = 108] = "LD L,H";
  Opcodes2[Opcodes2["LD L,L"] = 109] = "LD L,L";
  Opcodes2[Opcodes2["LD L,[HL]"] = 110] = "LD L,[HL]";
  Opcodes2[Opcodes2["LD L,A"] = 111] = "LD L,A";
  Opcodes2[Opcodes2["LD [HL],B"] = 112] = "LD [HL],B";
  Opcodes2[Opcodes2["LD [HL],C"] = 113] = "LD [HL],C";
  Opcodes2[Opcodes2["LD [HL],D"] = 114] = "LD [HL],D";
  Opcodes2[Opcodes2["LD [HL],E"] = 115] = "LD [HL],E";
  Opcodes2[Opcodes2["LD [HL],H"] = 116] = "LD [HL],H";
  Opcodes2[Opcodes2["LD [HL],L"] = 117] = "LD [HL],L";
  Opcodes2[Opcodes2["HALT"] = 118] = "HALT";
  Opcodes2[Opcodes2["LD [HL],A"] = 119] = "LD [HL],A";
  Opcodes2[Opcodes2["LD A,B"] = 120] = "LD A,B";
  Opcodes2[Opcodes2["LD A,C"] = 121] = "LD A,C";
  Opcodes2[Opcodes2["LD A,D"] = 122] = "LD A,D";
  Opcodes2[Opcodes2["LD A,E"] = 123] = "LD A,E";
  Opcodes2[Opcodes2["LD A,H"] = 124] = "LD A,H";
  Opcodes2[Opcodes2["LD A,L"] = 125] = "LD A,L";
  Opcodes2[Opcodes2["LD A,[HL]"] = 126] = "LD A,[HL]";
  Opcodes2[Opcodes2["LD A,A"] = 127] = "LD A,A";
  Opcodes2[Opcodes2["ADD B"] = 128] = "ADD B";
  Opcodes2[Opcodes2["ADD C"] = 129] = "ADD C";
  Opcodes2[Opcodes2["ADD D"] = 130] = "ADD D";
  Opcodes2[Opcodes2["ADD E"] = 131] = "ADD E";
  Opcodes2[Opcodes2["ADD H"] = 132] = "ADD H";
  Opcodes2[Opcodes2["ADD L"] = 133] = "ADD L";
  Opcodes2[Opcodes2["ADD [HL]"] = 134] = "ADD [HL]";
  Opcodes2[Opcodes2["ADD A"] = 135] = "ADD A";
  Opcodes2[Opcodes2["ADC B"] = 136] = "ADC B";
  Opcodes2[Opcodes2["ADC C"] = 137] = "ADC C";
  Opcodes2[Opcodes2["ADC D"] = 138] = "ADC D";
  Opcodes2[Opcodes2["ADC E"] = 139] = "ADC E";
  Opcodes2[Opcodes2["ADC H"] = 140] = "ADC H";
  Opcodes2[Opcodes2["ADC L"] = 141] = "ADC L";
  Opcodes2[Opcodes2["ADC [HL]"] = 142] = "ADC [HL]";
  Opcodes2[Opcodes2["ADC A"] = 143] = "ADC A";
  Opcodes2[Opcodes2["SUB B"] = 144] = "SUB B";
  Opcodes2[Opcodes2["SUB C"] = 145] = "SUB C";
  Opcodes2[Opcodes2["SUB D"] = 146] = "SUB D";
  Opcodes2[Opcodes2["SUB E"] = 147] = "SUB E";
  Opcodes2[Opcodes2["SUB H"] = 148] = "SUB H";
  Opcodes2[Opcodes2["SUB L"] = 149] = "SUB L";
  Opcodes2[Opcodes2["SUB [HL]"] = 150] = "SUB [HL]";
  Opcodes2[Opcodes2["SUB A"] = 151] = "SUB A";
  Opcodes2[Opcodes2["SBC B"] = 152] = "SBC B";
  Opcodes2[Opcodes2["SBC C"] = 153] = "SBC C";
  Opcodes2[Opcodes2["SBC D"] = 154] = "SBC D";
  Opcodes2[Opcodes2["SBC E"] = 155] = "SBC E";
  Opcodes2[Opcodes2["SBC H"] = 156] = "SBC H";
  Opcodes2[Opcodes2["SBC L"] = 157] = "SBC L";
  Opcodes2[Opcodes2["SBC [HL]"] = 158] = "SBC [HL]";
  Opcodes2[Opcodes2["SBC A"] = 159] = "SBC A";
  Opcodes2[Opcodes2["AND B"] = 160] = "AND B";
  Opcodes2[Opcodes2["AND C"] = 161] = "AND C";
  Opcodes2[Opcodes2["AND D"] = 162] = "AND D";
  Opcodes2[Opcodes2["AND E"] = 163] = "AND E";
  Opcodes2[Opcodes2["AND H"] = 164] = "AND H";
  Opcodes2[Opcodes2["AND L"] = 165] = "AND L";
  Opcodes2[Opcodes2["AND [HL]"] = 166] = "AND [HL]";
  Opcodes2[Opcodes2["AND A"] = 167] = "AND A";
  Opcodes2[Opcodes2["XOR B"] = 168] = "XOR B";
  Opcodes2[Opcodes2["XOR C"] = 169] = "XOR C";
  Opcodes2[Opcodes2["XOR D"] = 170] = "XOR D";
  Opcodes2[Opcodes2["XOR E"] = 171] = "XOR E";
  Opcodes2[Opcodes2["XOR H"] = 172] = "XOR H";
  Opcodes2[Opcodes2["XOR L"] = 173] = "XOR L";
  Opcodes2[Opcodes2["XOR [HL]"] = 174] = "XOR [HL]";
  Opcodes2[Opcodes2["XOR A"] = 175] = "XOR A";
  Opcodes2[Opcodes2["OR B"] = 176] = "OR B";
  Opcodes2[Opcodes2["OR C"] = 177] = "OR C";
  Opcodes2[Opcodes2["OR D"] = 178] = "OR D";
  Opcodes2[Opcodes2["OR E"] = 179] = "OR E";
  Opcodes2[Opcodes2["OR H"] = 180] = "OR H";
  Opcodes2[Opcodes2["OR L"] = 181] = "OR L";
  Opcodes2[Opcodes2["OR [HL]"] = 182] = "OR [HL]";
  Opcodes2[Opcodes2["OR A"] = 183] = "OR A";
  Opcodes2[Opcodes2["CP B"] = 184] = "CP B";
  Opcodes2[Opcodes2["CP C"] = 185] = "CP C";
  Opcodes2[Opcodes2["CP D"] = 186] = "CP D";
  Opcodes2[Opcodes2["CP E"] = 187] = "CP E";
  Opcodes2[Opcodes2["CP H"] = 188] = "CP H";
  Opcodes2[Opcodes2["CP L"] = 189] = "CP L";
  Opcodes2[Opcodes2["CP [HL]"] = 190] = "CP [HL]";
  Opcodes2[Opcodes2["CP A"] = 191] = "CP A";
  Opcodes2[Opcodes2["RET NZ"] = 192] = "RET NZ";
  Opcodes2[Opcodes2["POP BC"] = 193] = "POP BC";
  Opcodes2[Opcodes2["JP NZ,A16"] = 194] = "JP NZ,A16";
  Opcodes2[Opcodes2["JP A16"] = 195] = "JP A16";
  Opcodes2[Opcodes2["CALL NZ,A16"] = 196] = "CALL NZ,A16";
  Opcodes2[Opcodes2["PUSH BC"] = 197] = "PUSH BC";
  Opcodes2[Opcodes2["ADD D8"] = 198] = "ADD D8";
  Opcodes2[Opcodes2["RST $00"] = 199] = "RST $00";
  Opcodes2[Opcodes2["RET Z"] = 200] = "RET Z";
  Opcodes2[Opcodes2["RET"] = 201] = "RET";
  Opcodes2[Opcodes2["JP Z,A16"] = 202] = "JP Z,A16";
  Opcodes2[Opcodes2["CBPREFIX"] = 203] = "CBPREFIX";
  Opcodes2[Opcodes2["CALL Z,A16"] = 204] = "CALL Z,A16";
  Opcodes2[Opcodes2["CALL A16"] = 205] = "CALL A16";
  Opcodes2[Opcodes2["ADC D8"] = 206] = "ADC D8";
  Opcodes2[Opcodes2["RST $08"] = 207] = "RST $08";
  Opcodes2[Opcodes2["RET NC"] = 208] = "RET NC";
  Opcodes2[Opcodes2["POP DE"] = 209] = "POP DE";
  Opcodes2[Opcodes2["JP NC,A16"] = 210] = "JP NC,A16";
  Opcodes2[Opcodes2["DB $D3"] = 211] = "DB $D3";
  Opcodes2[Opcodes2["CALL NC,A16"] = 212] = "CALL NC,A16";
  Opcodes2[Opcodes2["PUSH DE"] = 213] = "PUSH DE";
  Opcodes2[Opcodes2["SUB D8"] = 214] = "SUB D8";
  Opcodes2[Opcodes2["RST $10"] = 215] = "RST $10";
  Opcodes2[Opcodes2["RET C"] = 216] = "RET C";
  Opcodes2[Opcodes2["RETI"] = 217] = "RETI";
  Opcodes2[Opcodes2["JP C,A16"] = 218] = "JP C,A16";
  Opcodes2[Opcodes2["DB $DB"] = 219] = "DB $DB";
  Opcodes2[Opcodes2["CALL C,A16"] = 220] = "CALL C,A16";
  Opcodes2[Opcodes2["DB $DD"] = 221] = "DB $DD";
  Opcodes2[Opcodes2["SBC D8"] = 222] = "SBC D8";
  Opcodes2[Opcodes2["RST $18"] = 223] = "RST $18";
  Opcodes2[Opcodes2["LDH [A8],A"] = 224] = "LDH [A8],A";
  Opcodes2[Opcodes2["POP HL"] = 225] = "POP HL";
  Opcodes2[Opcodes2["LD [C],A"] = 226] = "LD [C],A";
  Opcodes2[Opcodes2["DB $E3"] = 227] = "DB $E3";
  Opcodes2[Opcodes2["DB $E4"] = 228] = "DB $E4";
  Opcodes2[Opcodes2["PUSH HL"] = 229] = "PUSH HL";
  Opcodes2[Opcodes2["AND D8"] = 230] = "AND D8";
  Opcodes2[Opcodes2["RST $20"] = 231] = "RST $20";
  Opcodes2[Opcodes2["ADD SP,R8"] = 232] = "ADD SP,R8";
  Opcodes2[Opcodes2["JP HL"] = 233] = "JP HL";
  Opcodes2[Opcodes2["LD [A16],A"] = 234] = "LD [A16],A";
  Opcodes2[Opcodes2["DB $EB"] = 235] = "DB $EB";
  Opcodes2[Opcodes2["DB $EC"] = 236] = "DB $EC";
  Opcodes2[Opcodes2["DB $ED"] = 237] = "DB $ED";
  Opcodes2[Opcodes2["XOR D8"] = 238] = "XOR D8";
  Opcodes2[Opcodes2["RST $28"] = 239] = "RST $28";
  Opcodes2[Opcodes2["LDH A,[A8]"] = 240] = "LDH A,[A8]";
  Opcodes2[Opcodes2["POP AF"] = 241] = "POP AF";
  Opcodes2[Opcodes2["LD A,[C]"] = 242] = "LD A,[C]";
  Opcodes2[Opcodes2["DI"] = 243] = "DI";
  Opcodes2[Opcodes2["DB $F4"] = 244] = "DB $F4";
  Opcodes2[Opcodes2["PUSH AF"] = 245] = "PUSH AF";
  Opcodes2[Opcodes2["OR D8"] = 246] = "OR D8";
  Opcodes2[Opcodes2["RST $30"] = 247] = "RST $30";
  Opcodes2[Opcodes2["LD HL,SP+R8"] = 248] = "LD HL,SP+R8";
  Opcodes2[Opcodes2["LD SP,HL"] = 249] = "LD SP,HL";
  Opcodes2[Opcodes2["LD A,[A16]"] = 250] = "LD A,[A16]";
  Opcodes2[Opcodes2["EI"] = 251] = "EI";
  Opcodes2[Opcodes2["DB $FC"] = 252] = "DB $FC";
  Opcodes2[Opcodes2["DB $FD"] = 253] = "DB $FD";
  Opcodes2[Opcodes2["CP D8"] = 254] = "CP D8";
  Opcodes2[Opcodes2["RST $38"] = 255] = "RST $38";
  return Opcodes2;
})(Opcodes || {});
var OpcodeTicks = [
  /*   0,  1,  2,  3,  4,  5,  6,  7,      8,  9,  A, B,  C,  D, E,  F*/
  4,
  12,
  8,
  8,
  4,
  4,
  8,
  4,
  20,
  8,
  8,
  8,
  4,
  4,
  8,
  4,
  //0
  4,
  12,
  8,
  8,
  4,
  4,
  8,
  4,
  12,
  8,
  8,
  8,
  4,
  4,
  8,
  4,
  //1
  8,
  12,
  8,
  8,
  4,
  4,
  8,
  4,
  8,
  8,
  8,
  8,
  4,
  4,
  8,
  4,
  //2
  8,
  12,
  8,
  8,
  12,
  12,
  12,
  4,
  8,
  8,
  8,
  8,
  4,
  4,
  8,
  4,
  //3
  4,
  4,
  4,
  4,
  4,
  4,
  8,
  4,
  4,
  4,
  4,
  4,
  4,
  4,
  8,
  4,
  //4
  4,
  4,
  4,
  4,
  4,
  4,
  8,
  4,
  4,
  4,
  4,
  4,
  4,
  4,
  8,
  4,
  //5
  4,
  4,
  4,
  4,
  4,
  4,
  8,
  4,
  4,
  4,
  4,
  4,
  4,
  4,
  8,
  4,
  //6
  8,
  8,
  8,
  8,
  8,
  8,
  4,
  8,
  4,
  4,
  4,
  4,
  4,
  4,
  8,
  4,
  //7
  4,
  4,
  4,
  4,
  4,
  4,
  8,
  4,
  4,
  4,
  4,
  4,
  4,
  4,
  8,
  4,
  //8
  4,
  4,
  4,
  4,
  4,
  4,
  8,
  4,
  4,
  4,
  4,
  4,
  4,
  4,
  8,
  4,
  //9
  4,
  4,
  4,
  4,
  4,
  4,
  8,
  4,
  4,
  4,
  4,
  4,
  4,
  4,
  8,
  4,
  //A
  4,
  4,
  4,
  4,
  4,
  4,
  8,
  4,
  4,
  4,
  4,
  4,
  4,
  4,
  8,
  4,
  //B
  8,
  12,
  12,
  16,
  12,
  16,
  8,
  16,
  8,
  16,
  12,
  0,
  12,
  24,
  8,
  16,
  //C
  8,
  12,
  12,
  4,
  12,
  16,
  8,
  16,
  8,
  16,
  12,
  4,
  12,
  4,
  8,
  16,
  //D
  12,
  12,
  8,
  4,
  4,
  16,
  8,
  16,
  16,
  4,
  16,
  4,
  4,
  4,
  8,
  16,
  //E
  12,
  12,
  8,
  4,
  4,
  16,
  8,
  16,
  12,
  8,
  16,
  4,
  0,
  4,
  8,
  16
  //F
  // 2, 6, 4, 4, 2, 2, 4, 4, 10, 4, 4, 4, 2, 2, 4, 4, // 0x0_
  // 2, 6, 4, 4, 2, 2, 4, 4,  4, 4, 4, 4, 2, 2, 4, 4, // 0x1_
  // 0, 6, 4, 4, 2, 2, 4, 2,  0, 4, 4, 4, 2, 2, 4, 2, // 0x2_
  // 4, 6, 4, 4, 6, 6, 6, 2,  0, 4, 4, 4, 2, 2, 4, 2, // 0x3_
  // 2, 2, 2, 2, 2, 2, 4, 2,  2, 2, 2, 2, 2, 2, 4, 2, // 0x4_
  // 2, 2, 2, 2, 2, 2, 4, 2,  2, 2, 2, 2, 2, 2, 4, 2, // 0x5_
  // 2, 2, 2, 2, 2, 2, 4, 2,  2, 2, 2, 2, 2, 2, 4, 2, // 0x6_
  // 4, 4, 4, 4, 4, 4, 2, 4,  2, 2, 2, 2, 2, 2, 4, 2, // 0x7_
  // 2, 2, 2, 2, 2, 2, 4, 2,  2, 2, 2, 2, 2, 2, 4, 2, // 0x8_
  // 2, 2, 2, 2, 2, 2, 4, 2,  2, 2, 2, 2, 2, 2, 4, 2, // 0x9_
  // 2, 2, 2, 2, 2, 2, 4, 2,  2, 2, 2, 2, 2, 2, 4, 2, // 0xa_
  // 2, 2, 2, 2, 2, 2, 4, 2,  2, 2, 2, 2, 2, 2, 4, 2, // 0xb_
  // 0, 6, 0, 6, 0, 8, 4, 8,  0, 2, 0, 0, 0, 6, 4, 8, // 0xc_
  // 0, 6, 0, 0, 0, 8, 4, 8,  0, 8, 0, 0, 0, 0, 4, 8, // 0xd_
  // 6, 6, 4, 0, 0, 8, 4, 8,  8, 2, 8, 0, 0, 0, 4, 8, // 0xe_
  // 6, 6, 4, 2, 0, 8, 4, 8,  6, 4, 8, 2, 0, 0, 4, 8  // 0xf_
];

// src/OpcodeInstructions.ts
var OpcodeInstructions = class {
  constructor(cpu) {
    this.instructions = {
      [0 /* NOP */]: () => {
      },
      [1 /* LD BC,D16 */]: () => {
        this.cpu.reg.c = this.cpu.nextByte();
        this.cpu.reg.b = this.cpu.nextByte();
      },
      [2 /* LD [BC],A */]: () => {
        this.cpu.mem.writeByte(this.cpu.reg.bc, this.cpu.reg.a);
      },
      [3 /* INC BC */]: () => {
        this.cpu.reg.bc = this.cpu.reg.bc + 1 & 65535;
      },
      [4 /* INC B */]: () => {
        this.cpu.reg.b = this.cpu.alu.INC(this.cpu.reg.b);
      },
      [5 /* DEC B */]: () => {
        this.cpu.reg.b = this.cpu.alu.DEC(this.cpu.reg.b);
      },
      [6 /* LD B,D8 */]: () => {
        this.cpu.reg.b = this.cpu.nextByte();
      },
      [7 /* RLCA */]: () => {
        this.cpu.reg.a = this.cpu.alu.RLC(this.cpu.reg.a);
        this.cpu.reg.flags.Z = false;
      },
      [8 /* LD [A16],SP */]: () => {
        this.cpu.mem.writeWord(this.cpu.nextWord(), this.cpu.reg.sp);
      },
      [9 /* ADD HL,BC */]: () => {
        const temp = this.cpu.reg.hl + this.cpu.reg.bc;
        this.cpu.reg.flags.N = false;
        this.cpu.reg.flags.C = temp > 65535;
        this.cpu.reg.flags.H = (this.cpu.reg.hl & 4095) + (this.cpu.reg.bc & 4095) > 4095;
        this.cpu.reg.hl = temp & 65535;
      },
      [10 /* LD A,[BC] */]: () => {
        this.cpu.reg.a = this.cpu.mem.readByte(this.cpu.reg.bc);
      },
      [11 /* DEC BC */]: () => {
        this.cpu.reg.bc = this.cpu.reg.bc - 1 & 65535;
      },
      [12 /* INC C */]: () => {
        this.cpu.reg.c = this.cpu.alu.INC(this.cpu.reg.c);
      },
      [13 /* DEC C */]: () => {
        this.cpu.reg.c = this.cpu.alu.DEC(this.cpu.reg.c);
      },
      [14 /* LD C,D8 */]: () => {
        this.cpu.reg.c = this.cpu.nextByte();
      },
      [15 /* RRCA */]: () => {
        this.cpu.reg.a = this.cpu.reg.a >> 1 | (this.cpu.reg.a & 1) << 7;
        this.cpu.reg.flags.C = this.cpu.reg.a > 127;
        this.cpu.reg.flags.Z = this.cpu.reg.flags.N = this.cpu.reg.flags.H = false;
      },
      [16 /* STOP */]: () => {
        console.log("STOPPED");
        this.cpu.reg.pc++;
      },
      [17 /* LD DE,D16 */]: () => {
        this.cpu.reg.e = this.cpu.nextByte();
        this.cpu.reg.d = this.cpu.nextByte();
      },
      [18 /* LD [DE],A */]: () => {
        this.cpu.mem.writeByte(this.cpu.reg.de, this.cpu.reg.a);
      },
      [19 /* INC DE */]: () => {
        this.cpu.reg.de = this.cpu.reg.de + 1 & 65535;
      },
      [20 /* INC D */]: () => {
        this.cpu.reg.d = this.cpu.alu.INC(this.cpu.reg.d);
      },
      [21 /* DEC D */]: () => {
        this.cpu.reg.d = this.cpu.alu.DEC(this.cpu.reg.d);
      },
      [22 /* LD D,D8 */]: () => {
        this.cpu.reg.d = this.cpu.nextByte();
      },
      [23 /* RLA */]: () => {
        this.cpu.reg.a = this.cpu.alu.RL(this.cpu.reg.a);
        this.cpu.reg.flags.Z = false;
      },
      [24 /* JR PC+R8 */]: () => {
        let dist = this.cpu.nextByte();
        if (dist > 127)
          dist = -(~dist + 1 & 255);
        this.cpu.reg.pc += dist;
      },
      [25 /* ADD HL,DE */]: () => {
        const a = this.cpu.reg.hl;
        const b = this.cpu.reg.de;
        const temp = a + b;
        this.cpu.reg.flags.N = false;
        this.cpu.reg.flags.C = temp > 65535;
        this.cpu.reg.flags.H = (a & 4095) + (b & 4095) > 4095;
        this.cpu.reg.hl = temp & 65535;
      },
      [26 /* LD A,[DE] */]: () => {
        this.cpu.reg.a = this.cpu.mem.readByte(this.cpu.reg.de);
      },
      [27 /* DEC DE */]: () => {
        this.cpu.reg.de = this.cpu.reg.de - 1 & 65535;
      },
      [28 /* INC E */]: () => {
        this.cpu.reg.e = this.cpu.alu.INC(this.cpu.reg.e);
      },
      [29 /* DEC E */]: () => {
        this.cpu.reg.e = this.cpu.alu.DEC(this.cpu.reg.e);
      },
      [30 /* LD E,D8 */]: () => {
        this.cpu.reg.e = this.cpu.nextByte();
      },
      [31 /* RRA */]: () => {
        this.cpu.reg.a = this.cpu.alu.RR(this.cpu.reg.a);
        this.cpu.reg.flags.Z = false;
      },
      [32 /* JR NZ,PC+R8 */]: () => {
        const o = this.cpu.nextRelative();
        if (!this.cpu.reg.flags.Z) {
          this.cpu.reg.pc = o;
          this.cpu.ticks += 4;
        }
      },
      [33 /* LD HL,D16 */]: () => {
        this.cpu.reg.l = this.cpu.nextByte();
        this.cpu.reg.h = this.cpu.nextByte();
      },
      [34 /* LD [HL+],A */]: () => {
        this.cpu.mem.writeByte(this.cpu.reg.hl, this.cpu.reg.a);
        this.cpu.reg.hl = this.cpu.reg.hl + 1 & 65535;
      },
      [35 /* INC HL */]: () => {
        this.cpu.reg.hl = this.cpu.reg.hl + 1 & 65535;
      },
      [36 /* INC H */]: () => {
        this.cpu.reg.h = this.cpu.alu.INC(this.cpu.reg.h);
      },
      [37 /* DEC H */]: () => {
        this.cpu.reg.h = this.cpu.alu.DEC(this.cpu.reg.h);
      },
      [38 /* LD H,D8 */]: () => {
        this.cpu.reg.h = this.cpu.nextByte();
      },
      [39 /* DAA */]: () => {
        if (!this.cpu.reg.flags.N) {
          if (this.cpu.reg.flags.C || this.cpu.reg.a > 153) {
            this.cpu.reg.a = this.cpu.reg.a + 96 & 255;
            this.cpu.reg.flags.C = true;
          }
          if (this.cpu.reg.flags.H || (this.cpu.reg.a & 15) > 9) {
            this.cpu.reg.a = this.cpu.reg.a + 6 & 255;
            this.cpu.reg.flags.H = false;
          }
        } else if (this.cpu.reg.flags.C && this.cpu.reg.flags.H) {
          this.cpu.reg.a = this.cpu.reg.a + 154 & 255;
          this.cpu.reg.flags.H = false;
        } else if (this.cpu.reg.flags.C) {
          this.cpu.reg.a = this.cpu.reg.a + 160 & 255;
        } else if (this.cpu.reg.flags.H) {
          this.cpu.reg.a = this.cpu.reg.a + 250 & 255;
          this.cpu.reg.flags.H = false;
        }
        this.cpu.reg.flags.Z = this.cpu.reg.a == 0;
      },
      [40 /* JR Z,PC+R8 */]: () => {
        let dist = this.cpu.nextByte();
        dist = dist & 128 ? dist - 256 : dist;
        if (this.cpu.reg.flags.Z) {
          this.cpu.reg.pc += dist;
          this.cpu.ticks += 4;
        }
      },
      [41 /* ADD HL,HL */]: () => {
        const a = this.cpu.reg.hl;
        const b = this.cpu.reg.hl;
        const temp = a + b;
        this.cpu.reg.flags.N = false;
        this.cpu.reg.flags.C = temp > 65535;
        this.cpu.reg.flags.H = (a & 4095) + (b & 4095) > 4095;
        this.cpu.reg.hl = temp & 65535;
      },
      [42 /* LD A,[HL+] */]: () => {
        this.cpu.reg.a = this.cpu.mem.readByte(this.cpu.reg.hl);
        this.cpu.reg.hl++;
      },
      [43 /* DEC HL */]: () => {
        this.cpu.reg.hl = this.cpu.reg.hl - 1 & 65535;
      },
      [44 /* INC L */]: () => {
        this.cpu.reg.l = this.cpu.alu.INC(this.cpu.reg.l);
      },
      [45 /* DEC L */]: () => {
        this.cpu.reg.l = this.cpu.alu.DEC(this.cpu.reg.l);
      },
      [46 /* LD L,D8 */]: () => {
        this.cpu.reg.l = this.cpu.nextByte();
      },
      [47 /* CPL */]: () => {
        this.cpu.reg.a = ~this.cpu.reg.a & 255;
        this.cpu.reg.flags.N = true;
        this.cpu.reg.flags.H = true;
      },
      [48 /* JR NC,PC+R8 */]: () => {
        let dist = this.cpu.nextByte();
        dist = dist & 128 ? dist - 256 : dist;
        if (!this.cpu.reg.flags.C) {
          this.cpu.reg.pc += dist;
          this.cpu.ticks += 4;
        }
      },
      [49 /* LD SP,D16 */]: () => {
        this.cpu.reg.sp = this.cpu.nextWord();
      },
      [50 /* LD [HL-],A */]: () => {
        this.cpu.mem.writeByte(this.cpu.reg.hl, this.cpu.reg.a);
        this.cpu.reg.hl--;
      },
      [51 /* INC SP */]: () => {
        this.cpu.reg.sp = this.cpu.reg.sp + 1 & 65535;
      },
      [52 /* INC [HL] */]: () => {
        this.cpu.mem.writeByte(this.cpu.reg.hl, this.cpu.alu.INC(this.cpu.mem.readWord(this.cpu.reg.hl)));
      },
      [53 /* DEC [HL] */]: () => {
        this.cpu.mem.writeByte(this.cpu.reg.hl, this.cpu.alu.DEC(this.cpu.mem.readWord(this.cpu.reg.hl)));
      },
      [54 /* LD [HL],D8 */]: () => {
        this.cpu.mem.writeByte(this.cpu.reg.hl, this.cpu.nextByte());
      },
      [55 /* SCF */]: () => {
        this.cpu.reg.flags.C = true;
        this.cpu.reg.flags.N = this.cpu.reg.flags.H = false;
      },
      [56 /* JR C,PC+R8 */]: () => {
        let dist = this.cpu.nextByte();
        dist = dist & 128 ? dist - 256 : dist;
        if (this.cpu.reg.flags.C) {
          this.cpu.reg.pc += dist;
          this.cpu.ticks += 4;
        }
      },
      [57 /* ADD HL,SP */]: () => {
        const dirtySum = this.cpu.reg.hl + this.cpu.reg.sp;
        this.cpu.reg.flags.H = (this.cpu.reg.hl & 4095) > (dirtySum & 4095);
        this.cpu.reg.flags.C = dirtySum > 65535;
        this.cpu.reg.hl = dirtySum & 65535;
        this.cpu.reg.flags.N = false;
      },
      [58 /* LD A,[HL-] */]: () => {
        this.cpu.reg.a = this.cpu.mem.readByte(this.cpu.reg.hl);
        this.cpu.reg.hl--;
      },
      [59 /* DEC SP */]: () => {
        this.cpu.reg.sp = this.cpu.reg.sp - 1 & 65535;
      },
      [60 /* INC A */]: () => {
        this.cpu.reg.a = this.cpu.alu.INC(this.cpu.reg.a);
      },
      [61 /* DEC A */]: () => {
        this.cpu.reg.a = this.cpu.alu.DEC(this.cpu.reg.a);
      },
      [62 /* LD A,D8 */]: () => {
        this.cpu.reg.a = this.cpu.nextByte();
      },
      [63 /* CCF */]: () => {
        this.cpu.reg.flags.C = !this.cpu.reg.flags.C;
        this.cpu.reg.flags.N = this.cpu.reg.flags.H = false;
      },
      [64 /* LD B,B */]: () => {
      },
      [65 /* LD B,C */]: () => {
        this.cpu.reg.b = this.cpu.reg.c;
      },
      [66 /* LD B,D */]: () => {
        this.cpu.reg.b = this.cpu.reg.d;
      },
      [67 /* LD B,E */]: () => {
        this.cpu.reg.b = this.cpu.reg.e;
      },
      [68 /* LD B,H */]: () => {
        this.cpu.reg.b = this.cpu.reg.h;
      },
      [69 /* LD B,L */]: () => {
        this.cpu.reg.b = this.cpu.reg.l;
      },
      [70 /* LD B,[HL] */]: () => {
        this.cpu.reg.b = this.cpu.mem.readByte(this.cpu.reg.hl);
      },
      [71 /* LD B,A */]: () => {
        this.cpu.reg.b = this.cpu.reg.a;
      },
      [72 /* LD C,B */]: () => {
        this.cpu.reg.c = this.cpu.reg.b;
      },
      [73 /* LD C,C */]: () => {
        this.cpu.reg.c = this.cpu.reg.c;
      },
      [74 /* LD C,D */]: () => {
        this.cpu.reg.c = this.cpu.reg.d;
      },
      [75 /* LD C,E */]: () => {
        this.cpu.reg.c = this.cpu.reg.e;
      },
      [76 /* LD C,H */]: () => {
        this.cpu.reg.c = this.cpu.reg.h;
      },
      [77 /* LD C,L */]: () => {
        this.cpu.reg.c = this.cpu.reg.l;
      },
      [78 /* LD C,[HL] */]: () => {
        this.cpu.reg.c = this.cpu.mem.readByte(this.cpu.reg.hl);
      },
      [79 /* LD C,A */]: () => {
        this.cpu.reg.c = this.cpu.reg.a;
      },
      [80 /* LD D,B */]: () => {
        this.cpu.reg.d = this.cpu.reg.b;
      },
      [81 /* LD D,C */]: () => {
        this.cpu.reg.d = this.cpu.reg.c;
      },
      [82 /* LD D,D */]: () => {
      },
      [83 /* LD D,E */]: () => {
        this.cpu.reg.d = this.cpu.reg.e;
      },
      [84 /* LD D,H */]: () => {
        this.cpu.reg.d = this.cpu.reg.h;
      },
      [85 /* LD D,L */]: () => {
        this.cpu.reg.d = this.cpu.reg.l;
      },
      [86 /* LD D,[HL] */]: () => {
        this.cpu.reg.d = this.cpu.mem.readByte(this.cpu.reg.hl);
      },
      [87 /* LD D,A */]: () => {
        this.cpu.reg.d = this.cpu.reg.a;
      },
      [88 /* LD E,B */]: () => {
        this.cpu.reg.e = this.cpu.reg.b;
      },
      [89 /* LD E,C */]: () => {
        this.cpu.reg.e = this.cpu.reg.c;
      },
      [90 /* LD E,D */]: () => {
        this.cpu.reg.e = this.cpu.reg.d;
      },
      [91 /* LD E,E */]: () => {
      },
      [92 /* LD E,H */]: () => {
        this.cpu.reg.e = this.cpu.reg.h;
      },
      [93 /* LD E,L */]: () => {
        this.cpu.reg.e = this.cpu.reg.l;
      },
      [94 /* LD E,[HL] */]: () => {
        this.cpu.reg.e = this.cpu.mem.readByte(this.cpu.reg.hl);
      },
      [95 /* LD E,A */]: () => {
        this.cpu.reg.e = this.cpu.reg.a;
      },
      [96 /* LD H,B */]: () => {
        this.cpu.reg.h = this.cpu.reg.b;
      },
      [97 /* LD H,C */]: () => {
        this.cpu.reg.h = this.cpu.reg.c;
      },
      [98 /* LD H,D */]: () => {
        this.cpu.reg.h = this.cpu.reg.d;
      },
      [99 /* LD H,E */]: () => {
        this.cpu.reg.h = this.cpu.reg.e;
      },
      [100 /* LD H,H */]: () => {
      },
      [101 /* LD H,L */]: () => {
        this.cpu.reg.h = this.cpu.reg.l;
      },
      [102 /* LD H,[HL] */]: () => {
        this.cpu.reg.h = this.cpu.mem.readByte(this.cpu.reg.hl);
      },
      [103 /* LD H,A */]: () => {
        this.cpu.reg.h = this.cpu.reg.a;
      },
      [104 /* LD L,B */]: () => {
        this.cpu.reg.l = this.cpu.reg.b;
      },
      [105 /* LD L,C */]: () => {
        this.cpu.reg.l = this.cpu.reg.c;
      },
      [106 /* LD L,D */]: () => {
        this.cpu.reg.l = this.cpu.reg.d;
      },
      [107 /* LD L,E */]: () => {
        this.cpu.reg.l = this.cpu.reg.e;
      },
      [108 /* LD L,H */]: () => {
        this.cpu.reg.l = this.cpu.reg.h;
      },
      [109 /* LD L,L */]: () => {
      },
      [110 /* LD L,[HL] */]: () => {
        this.cpu.reg.l = this.cpu.mem.readByte(this.cpu.reg.hl);
      },
      [111 /* LD L,A */]: () => {
        this.cpu.reg.l = this.cpu.reg.a;
      },
      [112 /* LD [HL],B */]: () => {
        this.cpu.mem.writeByte(this.cpu.reg.hl, this.cpu.reg.b);
      },
      [113 /* LD [HL],C */]: () => {
        this.cpu.mem.writeByte(this.cpu.reg.hl, this.cpu.reg.c);
      },
      [114 /* LD [HL],D */]: () => {
        this.cpu.mem.writeByte(this.cpu.reg.hl, this.cpu.reg.d);
      },
      [115 /* LD [HL],E */]: () => {
        this.cpu.mem.writeByte(this.cpu.reg.hl, this.cpu.reg.e);
      },
      [116 /* LD [HL],H */]: () => {
        this.cpu.mem.writeByte(this.cpu.reg.hl, this.cpu.reg.h);
      },
      [117 /* LD [HL],L */]: () => {
        this.cpu.mem.writeByte(this.cpu.reg.hl, this.cpu.reg.l);
      },
      [118 /* HALT */]: () => {
        this.cpu.halt();
      },
      [119 /* LD [HL],A */]: () => {
        this.cpu.mem.writeByte(this.cpu.reg.hl, this.cpu.reg.a);
      },
      [120 /* LD A,B */]: () => {
        this.cpu.reg.a = this.cpu.reg.b;
      },
      [121 /* LD A,C */]: () => {
        this.cpu.reg.a = this.cpu.reg.c;
      },
      [122 /* LD A,D */]: () => {
        this.cpu.reg.a = this.cpu.reg.d;
      },
      [123 /* LD A,E */]: () => {
        this.cpu.reg.a = this.cpu.reg.e;
      },
      [124 /* LD A,H */]: () => {
        this.cpu.reg.a = this.cpu.reg.h;
      },
      [125 /* LD A,L */]: () => {
        this.cpu.reg.a = this.cpu.reg.l;
      },
      [126 /* LD A,[HL] */]: () => {
        this.cpu.reg.a = this.cpu.mem.readByte(this.cpu.reg.hl);
      },
      [127 /* LD A,A */]: () => {
      },
      [128 /* ADD B */]: () => {
        this.cpu.alu.ADD(this.cpu.reg.b);
      },
      [129 /* ADD C */]: () => {
        this.cpu.alu.ADD(this.cpu.reg.c);
      },
      [130 /* ADD D */]: () => {
        this.cpu.alu.ADD(this.cpu.reg.d);
      },
      [131 /* ADD E */]: () => {
        this.cpu.alu.ADD(this.cpu.reg.e);
      },
      [132 /* ADD H */]: () => {
        this.cpu.alu.ADD(this.cpu.reg.h);
      },
      [133 /* ADD L */]: () => {
        this.cpu.alu.ADD(this.cpu.reg.l);
      },
      [134 /* ADD [HL] */]: () => {
        this.cpu.alu.ADD(this.cpu.mem.readByte(this.cpu.reg.hl));
      },
      [135 /* ADD A */]: () => {
        this.cpu.alu.ADD(this.cpu.reg.a);
      },
      [136 /* ADC B */]: () => {
        this.cpu.alu.ADC(this.cpu.reg.b);
      },
      [137 /* ADC C */]: () => {
        this.cpu.alu.ADC(this.cpu.reg.c);
      },
      [138 /* ADC D */]: () => {
        this.cpu.alu.ADC(this.cpu.reg.d);
      },
      [139 /* ADC E */]: () => {
        this.cpu.alu.ADC(this.cpu.reg.e);
      },
      [140 /* ADC H */]: () => {
        this.cpu.alu.ADC(this.cpu.reg.h);
      },
      [141 /* ADC L */]: () => {
        this.cpu.alu.ADC(this.cpu.reg.l);
      },
      [142 /* ADC [HL] */]: () => {
        this.cpu.alu.ADC(this.cpu.mem.readByte(this.cpu.reg.hl));
      },
      [143 /* ADC A */]: () => {
        this.cpu.alu.ADC(this.cpu.reg.a);
      },
      [144 /* SUB B */]: () => {
        this.cpu.alu.SUB(this.cpu.reg.b);
      },
      [145 /* SUB C */]: () => {
        this.cpu.alu.SUB(this.cpu.reg.c);
      },
      [146 /* SUB D */]: () => {
        this.cpu.alu.SUB(this.cpu.reg.d);
      },
      [147 /* SUB E */]: () => {
        this.cpu.alu.SUB(this.cpu.reg.e);
      },
      [148 /* SUB H */]: () => {
        this.cpu.alu.SUB(this.cpu.reg.h);
      },
      [149 /* SUB L */]: () => {
        this.cpu.alu.SUB(this.cpu.reg.l);
      },
      [150 /* SUB [HL] */]: () => {
        this.cpu.alu.SUB(this.cpu.mem.readByte(this.cpu.reg.hl));
      },
      [151 /* SUB A */]: () => {
        this.cpu.alu.SUB(this.cpu.reg.a);
      },
      [152 /* SBC B */]: () => {
        this.cpu.alu.SBC(this.cpu.reg.b);
      },
      [153 /* SBC C */]: () => {
        this.cpu.alu.SBC(this.cpu.reg.c);
      },
      [154 /* SBC D */]: () => {
        this.cpu.alu.SBC(this.cpu.reg.d);
      },
      [155 /* SBC E */]: () => {
        this.cpu.alu.SBC(this.cpu.reg.e);
      },
      [156 /* SBC H */]: () => {
        this.cpu.alu.SBC(this.cpu.reg.h);
      },
      [157 /* SBC L */]: () => {
        this.cpu.alu.SBC(this.cpu.reg.l);
      },
      [158 /* SBC [HL] */]: () => {
        this.cpu.alu.SBC(this.cpu.mem.readByte(this.cpu.reg.hl));
      },
      [159 /* SBC A */]: () => {
        this.cpu.alu.SBC(this.cpu.reg.a);
      },
      [160 /* AND B */]: () => {
        this.cpu.alu.AND(this.cpu.reg.b);
      },
      [161 /* AND C */]: () => {
        this.cpu.alu.AND(this.cpu.reg.c);
      },
      [162 /* AND D */]: () => {
        this.cpu.alu.AND(this.cpu.reg.d);
      },
      [163 /* AND E */]: () => {
        this.cpu.alu.AND(this.cpu.reg.e);
      },
      [164 /* AND H */]: () => {
        this.cpu.alu.AND(this.cpu.reg.h);
      },
      [165 /* AND L */]: () => {
        this.cpu.alu.AND(this.cpu.reg.l);
      },
      [166 /* AND [HL] */]: () => {
        this.cpu.alu.AND(this.cpu.mem.readByte(this.cpu.reg.hl));
      },
      [167 /* AND A */]: () => {
        this.cpu.alu.AND(this.cpu.reg.a);
      },
      [168 /* XOR B */]: () => {
        this.cpu.alu.XOR(this.cpu.reg.b);
      },
      [169 /* XOR C */]: () => {
        this.cpu.alu.XOR(this.cpu.reg.c);
      },
      [170 /* XOR D */]: () => {
        this.cpu.alu.XOR(this.cpu.reg.d);
      },
      [171 /* XOR E */]: () => {
        this.cpu.alu.XOR(this.cpu.reg.e);
      },
      [172 /* XOR H */]: () => {
        this.cpu.alu.XOR(this.cpu.reg.h);
      },
      [173 /* XOR L */]: () => {
        this.cpu.alu.XOR(this.cpu.reg.l);
      },
      [174 /* XOR [HL] */]: () => {
        this.cpu.alu.XOR(this.cpu.mem.readByte(this.cpu.reg.hl));
      },
      [175 /* XOR A */]: () => {
        this.cpu.alu.XOR(this.cpu.reg.a);
      },
      [176 /* OR B */]: () => {
        this.cpu.alu.OR(this.cpu.reg.b);
      },
      [177 /* OR C */]: () => {
        this.cpu.alu.OR(this.cpu.reg.c);
      },
      [178 /* OR D */]: () => {
        this.cpu.alu.OR(this.cpu.reg.d);
      },
      [179 /* OR E */]: () => {
        this.cpu.alu.OR(this.cpu.reg.e);
      },
      [180 /* OR H */]: () => {
        this.cpu.alu.OR(this.cpu.reg.h);
      },
      [181 /* OR L */]: () => {
        this.cpu.alu.OR(this.cpu.reg.l);
      },
      [182 /* OR [HL] */]: () => {
        this.cpu.alu.OR(this.cpu.mem.readByte(this.cpu.reg.hl));
      },
      [183 /* OR A */]: () => {
        this.cpu.alu.OR(this.cpu.reg.a);
      },
      [184 /* CP B */]: () => {
        this.cpu.alu.CP(this.cpu.reg.b);
      },
      [185 /* CP C */]: () => {
        this.cpu.alu.CP(this.cpu.reg.c);
      },
      [186 /* CP D */]: () => {
        this.cpu.alu.CP(this.cpu.reg.d);
      },
      [187 /* CP E */]: () => {
        this.cpu.alu.CP(this.cpu.reg.e);
      },
      [188 /* CP H */]: () => {
        this.cpu.alu.CP(this.cpu.reg.h);
      },
      [189 /* CP L */]: () => {
        this.cpu.alu.CP(this.cpu.reg.l);
      },
      [190 /* CP [HL] */]: () => {
        this.cpu.alu.CP(this.cpu.mem.readByte(this.cpu.reg.hl));
      },
      [191 /* CP A */]: () => {
        this.cpu.alu.CP(this.cpu.reg.a);
      },
      [192 /* RET NZ */]: () => {
        if (!this.cpu.reg.flags.Z) {
          this.cpu.reg.pc = this.cpu.popWord();
          this.cpu.ticks += 12;
        }
      },
      [193 /* POP BC */]: () => {
        this.cpu.reg.bc = this.cpu.popWord();
      },
      [194 /* JP NZ,A16 */]: () => {
        const address = this.cpu.nextWord();
        if (!this.cpu.reg.flags.Z) {
          this.cpu.reg.pc = address;
          this.cpu.ticks += 4;
        }
      },
      [195 /* JP A16 */]: () => {
        this.cpu.reg.pc = this.cpu.nextWord();
      },
      [196 /* CALL NZ,A16 */]: () => {
        const dest = this.cpu.nextWord();
        if (!this.cpu.reg.flags.Z) {
          this.cpu.pushWord(this.cpu.reg.pc);
          this.cpu.reg.pc = dest;
          this.cpu.ticks += 12;
        }
      },
      [197 /* PUSH BC */]: () => {
        this.cpu.pushWord(this.cpu.reg.bc);
      },
      [198 /* ADD D8 */]: () => {
        this.cpu.alu.ADD(this.cpu.nextByte());
      },
      [199 /* RST $00 */]: () => {
        this.cpu.pushWord(this.cpu.reg.pc);
        this.cpu.reg.pc = 0;
      },
      [200 /* RET Z */]: () => {
        if (this.cpu.reg.flags.Z) {
          this.cpu.reg.pc = this.cpu.popWord();
          this.cpu.ticks += 12;
        }
      },
      [201 /* RET */]: () => {
        this.cpu.reg.pc = this.cpu.mem.readByte(this.cpu.reg.sp);
        this.cpu.reg.sp += 1;
        this.cpu.reg.pc += this.cpu.mem.readByte(this.cpu.reg.sp) << 8;
        this.cpu.reg.sp += 1;
      },
      [202 /* JP Z,A16 */]: () => {
        const address = this.cpu.nextWord();
        if (this.cpu.reg.flags.Z) {
          this.cpu.reg.pc = address;
          this.cpu.ticks += 4;
        }
      },
      [203 /* CBPREFIX */]: () => {
        const b = this.cpu.nextByte();
        try {
          this.cpu.ticks += CBOpcodeTicks[b];
          this.cpu.cbops[b]();
        } catch (error) {
          console.error(`CBPREFIX ${this.cpu.reg.pc.toString(16)} ${b.toString(16)}`);
        }
      },
      [204 /* CALL Z,A16 */]: () => {
        if (this.cpu.reg.flags.Z) {
          this.cpu.reg.sp = this.cpu.reg.sp - 1;
          this.cpu.mem.writeByte(this.cpu.reg.sp, (this.cpu.reg.pc + 2 & 65280) >> 8);
          this.cpu.reg.sp = this.cpu.reg.sp - 1;
          this.cpu.mem.writeByte(this.cpu.reg.sp, this.cpu.reg.pc + 2 & 255);
          var j = this.cpu.mem.readByte(this.cpu.reg.pc) + (this.cpu.mem.readByte(this.cpu.reg.pc + 1) << 8);
          this.cpu.reg.pc = j;
          this.cpu.ticks += 12;
        } else {
          this.cpu.reg.pc += 2;
        }
      },
      [205 /* CALL A16 */]: () => {
        this.cpu.reg.sp--;
        this.cpu.mem.writeByte(this.cpu.reg.sp, (this.cpu.reg.pc + 2 & 65280) >> 8);
        this.cpu.reg.sp--;
        this.cpu.mem.writeByte(this.cpu.reg.sp, this.cpu.reg.pc + 2 & 255);
        const j = this.cpu.mem.readByte(this.cpu.reg.pc) + (this.cpu.mem.readByte(this.cpu.reg.pc + 1) << 8);
        this.cpu.reg.pc = j;
      },
      [206 /* ADC D8 */]: () => {
        this.cpu.alu.ADC(this.cpu.nextByte());
      },
      [207 /* RST $08 */]: () => {
        this.cpu.pushWord(this.cpu.reg.pc);
        this.cpu.reg.pc = 8;
      },
      [208 /* RET NC */]: () => {
        if (!this.cpu.reg.flags.C) {
          this.cpu.reg.pc = this.cpu.popWord();
          this.cpu.ticks += 12;
        }
      },
      [209 /* POP DE */]: () => {
        this.cpu.reg.de = this.cpu.popWord();
      },
      [210 /* JP NC,A16 */]: () => {
        const dest = this.cpu.nextWord();
        if (!this.cpu.reg.flags.C) {
          this.cpu.reg.pc = dest;
          this.cpu.ticks += 4;
        }
      },
      [211 /* DB $D3 */]: () => {
        throw Error("Not implemented");
      },
      [212 /* CALL NC,A16 */]: () => {
        if (!this.cpu.reg.flags.C) {
          this.cpu.reg.sp = this.cpu.reg.sp - 1;
          this.cpu.mem.writeByte(this.cpu.reg.sp, (this.cpu.reg.pc + 2 & 65280) >> 8);
          this.cpu.reg.sp = this.cpu.reg.sp - 1;
          this.cpu.mem.writeByte(this.cpu.reg.sp, this.cpu.reg.pc + 2 & 255);
          var j = this.cpu.mem.readByte(this.cpu.reg.pc) + (this.cpu.mem.readByte(this.cpu.reg.pc + 1) << 8);
          this.cpu.reg.pc = j;
          this.cpu.ticks += 12;
        } else {
          this.cpu.reg.pc += 2;
        }
      },
      [213 /* PUSH DE */]: () => {
        this.cpu.pushWord(this.cpu.reg.de);
      },
      [214 /* SUB D8 */]: () => {
        this.cpu.alu.SUB(this.cpu.nextByte());
      },
      [215 /* RST $10 */]: () => {
        this.cpu.pushWord(this.cpu.reg.pc);
        this.cpu.reg.pc = 16;
      },
      [216 /* RET C */]: () => {
        if (this.cpu.reg.flags.C) {
          this.cpu.reg.pc = this.cpu.popWord();
          this.cpu.ticks += 12;
        }
      },
      [217 /* RETI */]: () => {
        this.cpu.enableInterrupts();
        this.cpu.reg.pc = this.cpu.mem.rw(this.cpu.reg.sp);
        this.cpu.reg.sp += 2;
      },
      [218 /* JP C,A16 */]: () => {
        const address = this.cpu.nextWord();
        if (this.cpu.reg.flags.C) {
          this.cpu.reg.pc = address;
          this.cpu.ticks += 4;
        }
      },
      [219 /* DB $DB */]: () => {
        throw Error("Not implemented");
      },
      [220 /* CALL C,A16 */]: () => {
        if (this.cpu.reg.flags.C) {
          this.cpu.reg.sp = this.cpu.reg.sp - 1;
          this.cpu.mem.writeByte(this.cpu.reg.sp, (this.cpu.reg.pc + 2 & 65280) >> 8);
          this.cpu.reg.sp = this.cpu.reg.sp - 1;
          this.cpu.mem.writeByte(this.cpu.reg.sp, this.cpu.reg.pc + 2 & 255);
          var j = this.cpu.mem.readByte(this.cpu.reg.pc) + (this.cpu.mem.readByte(this.cpu.reg.pc + 1) << 8);
          this.cpu.reg.pc = j;
          this.cpu.ticks += 12;
        } else {
          this.cpu.reg.pc += 2;
        }
      },
      [221 /* DB $DD */]: () => {
        throw Error("Not implemented");
      },
      [222 /* SBC D8 */]: () => {
        var temp_var = this.cpu.nextByte();
        var dirtySum = this.cpu.reg.a - temp_var - (this.cpu.reg.flags.C ? 1 : 0);
        this.cpu.reg.flags.H = (this.cpu.reg.a & 15) - (temp_var & 15) - (this.cpu.reg.flags.C ? 1 : 0) < 0;
        this.cpu.reg.flags.C = dirtySum < 0;
        this.cpu.reg.a = dirtySum & 255;
        this.cpu.reg.flags.Z = this.cpu.reg.a == 0;
        this.cpu.reg.flags.N = true;
      },
      [223 /* RST $18 */]: () => {
        this.cpu.pushWord(this.cpu.reg.pc);
        this.cpu.reg.pc = 24;
      },
      [224 /* LDH [A8],A */]: () => {
        const v = this.cpu.nextByte();
        this.cpu.mem.writeByte(65280 + v, this.cpu.reg.a);
      },
      [225 /* POP HL */]: () => {
        const w = this.cpu.mem.readWord(this.cpu.reg.sp);
        this.cpu.reg.l = this.cpu.mem.readByte(this.cpu.reg.sp) & 255;
        this.cpu.reg.sp++;
        this.cpu.reg.h = this.cpu.mem.readByte(this.cpu.reg.sp) & 255;
        this.cpu.reg.sp++;
      },
      [226 /* LD [C],A */]: () => {
        this.cpu.mem.writeByte(65280 + this.cpu.reg.c, this.cpu.reg.a);
      },
      [227 /* DB $E3 */]: () => {
        throw Error("Not implemented");
      },
      [228 /* DB $E4 */]: () => {
        console.warn("unknown");
      },
      [229 /* PUSH HL */]: () => {
        this.cpu.pushWord(this.cpu.reg.hl);
      },
      [230 /* AND D8 */]: () => {
        this.cpu.alu.AND(this.cpu.nextByte());
      },
      [231 /* RST $20 */]: () => {
        this.cpu.pushWord(this.cpu.reg.pc);
        this.cpu.reg.pc = 32;
      },
      [232 /* ADD SP,R8 */]: () => {
        var v = this.cpu.nextByte();
        v = v & 128 ? v - 256 : v;
        this.cpu.reg.flags.C = (this.cpu.reg.sp & 255) + (v & 255) > 255;
        this.cpu.reg.flags.H = (this.cpu.reg.sp & 15) + (v & 15) > 15;
        this.cpu.reg.flags.Z = this.cpu.reg.flags.N = false;
        this.cpu.reg.sp = this.cpu.reg.sp + v & 65535;
      },
      [233 /* JP HL */]: () => {
        this.cpu.reg.pc = this.cpu.reg.hl;
      },
      [234 /* LD [A16],A */]: () => {
        this.cpu.mem.writeByte(this.cpu.nextWord(), this.cpu.reg.a);
      },
      [235 /* DB $EB */]: () => {
        this.cpu.stopped = true;
        console.log(this.cpu.reg.pc.toString(16));
        console.warn("Unknown");
      },
      [236 /* DB $EC */]: () => {
        this.cpu.stopped = true;
        console.log(this.cpu.reg.pc.toString(16));
        console.warn("Unknown");
      },
      [237 /* DB $ED */]: () => {
        this.cpu.stopped = true;
        console.log(this.cpu.reg.pc.toString(16));
        console.warn("Unknown");
      },
      [238 /* XOR D8 */]: () => {
        this.cpu.alu.XOR(this.cpu.nextByte());
      },
      [239 /* RST $28 */]: () => {
        this.cpu.pushWord(this.cpu.reg.pc);
        this.cpu.reg.pc = 40;
      },
      [240 /* LDH A,[A8] */]: () => {
        this.cpu.reg.a = this.cpu.mem.readByte(65280 + this.cpu.nextByte());
      },
      [241 /* POP AF */]: () => {
        const val = this.cpu.popWord();
        this.cpu.reg.a = (val & 65280) >> 8;
        this.cpu.reg.flags.Z = (val & 1 << 7) != 0;
        this.cpu.reg.flags.N = (val & 1 << 6) != 0;
        this.cpu.reg.flags.H = (val & 1 << 5) != 0;
        this.cpu.reg.flags.C = (val & 1 << 4) != 0;
      },
      [242 /* LD A,[C] */]: () => {
        this.cpu.reg.a = this.cpu.mem.readByte(this.cpu.reg.c + 65280);
      },
      [243 /* DI */]: () => {
        this.cpu.disableInterrupts();
      },
      [244 /* DB $F4 */]: () => {
        throw Error("Not implemented");
      },
      [245 /* PUSH AF */]: () => {
        let val = this.cpu.reg.a << 8;
        if (this.cpu.reg.flags.Z) {
          val |= 1 << 7;
        }
        if (this.cpu.reg.flags.N) {
          val |= 1 << 6;
        }
        if (this.cpu.reg.flags.H) {
          val |= 1 << 5;
        }
        if (this.cpu.reg.flags.C) {
          val |= 1 << 4;
        }
        this.cpu.pushWord(val);
      },
      [246 /* OR D8 */]: () => {
        this.cpu.alu.OR(this.cpu.nextByte());
      },
      [247 /* RST $30 */]: () => {
        this.cpu.pushWord(this.cpu.reg.pc);
        this.cpu.reg.pc = 48;
      },
      [248 /* LD HL,SP+R8 */]: () => {
        var rel = this.cpu.nextByte();
        rel = rel & 128 ? rel - 256 : rel;
        const val = this.cpu.reg.sp + rel & 65535;
        this.cpu.reg.flags.C = (this.cpu.reg.sp & 255) + (rel & 255) > 255;
        this.cpu.reg.flags.H = (this.cpu.reg.sp & 15) + (rel & 15) > 15;
        this.cpu.reg.flags.Z = this.cpu.reg.flags.N = false;
        this.cpu.reg.hl = val;
      },
      [249 /* LD SP,HL */]: () => {
        this.cpu.reg.sp = this.cpu.reg.hl;
      },
      [250 /* LD A,[A16] */]: () => {
        this.cpu.reg.a = this.cpu.mem.readByte(this.cpu.nextWord());
      },
      [251 /* EI */]: () => {
        this.cpu.enableInterrupts();
      },
      [252 /* DB $FC */]: () => {
        console.warn("DB $FC not implemented");
      },
      [253 /* DB $FD */]: () => {
        throw Error("Not implemented");
      },
      [254 /* CP D8 */]: () => {
        this.cpu.alu.CP(this.cpu.nextByte());
      },
      [255 /* RST $38 */]: () => {
        this.cpu.pushWord(this.cpu.reg.pc);
        this.cpu.reg.pc = 56;
      }
    };
    this.cpu = cpu;
  }
};

// src/Registers.ts
var Registers = class {
  get bc() {
    return this.b << 8 | this.c;
  }
  set bc(value) {
    this.b = value >> 8;
    this.c = value & 255;
  }
  get de() {
    return this.d << 8 | this.e;
  }
  set de(value) {
    this.d = value >> 8;
    this.e = value & 255;
  }
  get hl() {
    return this.h << 8 | this.l;
  }
  set hl(value) {
    this.h = value >> 8;
    this.l = value & 255;
  }
  constructor() {
    this.a = 0;
    this.b = 0;
    this.c = 0;
    this.d = 0;
    this.e = 0;
    this.h = 0;
    this.l = 0;
    this.flags = {
      Z: false,
      H: false,
      N: false,
      C: false
    };
    this.sp = 0;
    this.pc = 0;
  }
  // public static GetUpper(value: number): number {
  //     return value & 0xFF00 >> 8;
  // }
  // public static SetUpper(register: number, value: number): number {
  //     return (register & 0x00FF) | (value << 8);
  // }
  // public static GetLower(value: number): number {
  //     return value & 0xFF;
  // }
  // public static SetLower(register: number, value: number): number {
  //     return (register & 0xFF00) | value;
  // }
};

// src/CPU.ts
var Util = {
  // Add to the first argument the properties of all other arguments
  extend: function(target) {
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
    var test = 1;
    var mask = 16;
    if (cc == "NZ" || cc == "NC")
      test = 0;
    if (cc == "NZ" || cc == "Z")
      mask = 128;
    return test && p.r.F & mask || !test && !(p.r.F & mask);
  },
  getRegAddr: function(p, r1, r2) {
    return Util.makeword(p.r[r1], p.r[r2]);
  },
  // make a 16 bits word from 2 bytes
  makeword: function(b1, b2) {
    return (b1 << 8) + b2;
  },
  // return the integer signed value of a given byte
  getSignedValue: function(v) {
    return v & 128 ? v - 256 : v;
  },
  // extract a bit from a byte
  readBit: function(byte, index) {
    return byte >> index & 1;
  }
};
var CPU = class {
  constructor(memory) {
    this.gbcMode = false;
    this.IME = true;
    this.halt = function() {
      this.isHalted = true;
    };
    this.unhalt = function() {
      this.isHalted = false;
    };
    this.stopped = false;
    this.mem = memory;
    this.reg = new Registers();
    this.ops = new OpcodeInstructions(this).instructions;
    this.cbops = new CBOpcodeInstructions(this).instructions;
    this.alu = new ALUInstructions(this);
  }
  get stopped() {
    return this._stopped;
  }
  set stopped(value) {
    console.warn("stop triggered");
    if (this.reg) {
      console.log(`PC: 0x${this.reg.pc.toString(16)}`);
    }
    this._stopped = value;
  }
  reset() {
    this.reg.sp = 65534;
    this.reg.pc = 256;
    this.reg.flags.Z = false;
    this.reg.flags.H = false;
    this.reg.flags.C = false;
    this.reg.flags.N = false;
    this.ticks = 0;
    this.isHalted = false;
  }
  nextByte() {
    const b = this.mem.readByte(this.reg.pc);
    this.reg.pc++;
    return b;
  }
  nextWord() {
    const b = this.mem.readWord(this.reg.pc);
    this.reg.pc += 2;
    return b;
  }
  nextRelative() {
    const b = this.nextByte();
    return this.reg.pc + (b & 127) - (b & 128) & 65535;
  }
  pushWord(value) {
    this.reg.sp -= 2;
    this.writeWord(this.reg.sp, value);
  }
  popWord() {
    const value = this.mem.readWord(this.reg.sp);
    this.reg.sp += 2;
    return value;
  }
  writeWord(address, value) {
    this.mem.writeWord(address, value);
  }
  step() {
    if (!this.isHalted && !this.stopped) {
      const instruction = this.nextByte();
      this.ops[instruction]();
      this.ticks += OpcodeTicks[instruction];
    } else {
      this.ticks += 4;
    }
  }
  // Look for interrupt flags
  checkInterrupt() {
    if (!this.IME) {
      return;
    }
    for (var i = 0; i < 5; i++) {
      var IFval = this.mem.rb(65295);
      if (Util.readBit(IFval, i) && this.isInterruptEnable(i)) {
        IFval &= 255 - (1 << i);
        this.mem.wb(65295, IFval);
        this.disableInterrupts();
        this.ticks += 4;
        if (i == 0)
          this.rst(64);
        else if (i == 1)
          this.rst(72);
        else if (i == 2)
          this.rst(80);
        else if (i == 3)
          this.rst(88);
        else if (i == 4)
          this.rst(96);
        break;
      }
    }
  }
  rst(value) {
    this.pushWord(this.reg.pc);
    this.reg.pc = value;
  }
  RSTInst(value) {
    this.reg.sp--;
    this.mem.writeByte(this.reg.sp, this.reg.pc >> 8);
    this.reg.sp--;
    this.mem.writeByte(this.reg.sp, this.reg.pc & 255);
    this.reg.pc = value;
    this.ticks += 16;
  }
  // Set an interrupt flag
  requestInterrupt(type) {
    var IFval = this.mem.rb(65295);
    IFval |= 1 << type;
    this.mem.wb(65295, IFval);
    this.unhalt();
  }
  isInterruptEnable(type) {
    return Util.readBit(this.mem.rb(65535), type) != 0;
  }
  enableInterrupts() {
    this.IME = true;
  }
  disableInterrupts() {
    this.IME = false;
  }
  getIME() {
    return this.IME;
  }
};
CPU.INTERRUPTS = {
  VBLANK: 0,
  LCDC: 1,
  TIMER: 2,
  SERIAL: 3,
  HILO: 4
};

// src/GPU.ts
var _GPU = class {
  constructor(cpu, memory) {
    this.pxMap = new Uint8Array(160 * 144);
    this._line = 0;
    this._modeclock = 0;
    this._mode = 2 /* OAM */;
    this.cpu = cpu;
    this.mem = memory;
    this.screenData = new ImageData(160, 144);
    this.winImageData = new ImageData(160, 144);
    this.bgImageData = new ImageData(160, 144);
    this.spriteImageData = new ImageData(160, 144);
  }
  step(clockElapsed) {
    this._modeclock += clockElapsed;
    var vblank = false;
    switch (this._mode) {
      case 0 /* HBLANK */:
        if (this._modeclock >= 204) {
          this._line++;
          this.updateLY();
          if (this._line == 144) {
            this.setMode(1 /* VBLANK */);
            vblank = true;
            this.cpu.requestInterrupt(CPU.INTERRUPTS.VBLANK);
          } else {
            this.setMode(2 /* OAM */);
          }
          this._modeclock -= 204;
        }
        break;
      case 1 /* VBLANK */:
        if (this._modeclock >= 456) {
          this._line++;
          if (this._line == 155) {
            this._line = 0;
            this.screenData = new ImageData(160, 144);
            this.winImageData = new ImageData(160, 144);
            this.bgImageData = new ImageData(160, 144);
            this.spriteImageData = new ImageData(160, 144);
            this.setMode(2 /* OAM */);
          }
          this.updateLY();
          this._modeclock -= 456;
        }
        break;
      case 2 /* OAM */:
        if (this._modeclock >= 80) {
          this.setMode(3 /* VRAM */);
          this._modeclock -= 80;
        }
        break;
      case 3 /* VRAM */:
        if (this._modeclock >= 172) {
          this.draw();
          this.setMode(0 /* HBLANK */);
          this._modeclock -= 172;
        }
        break;
    }
    return vblank;
  }
  readBit(byte, index) {
    return byte >> index & 1;
  }
  updateLY() {
    this.mem.memory[65348 /* LY */] = this._line;
    var STAT = this.mem.memory[65345 /* STAT */];
    if (this._line == this.mem.memory[65349 /* LYC */]) {
      this.mem.memory[65345 /* STAT */], STAT | 1 << 2;
      if (STAT & 1 << 6) {
        this.cpu.requestInterrupt(CPU.INTERRUPTS.LCDC);
      }
    } else {
      this.mem.memory[65345 /* STAT */] = STAT & 255 - (1 << 2);
    }
  }
  setMode(mode) {
    this._mode = mode;
    var newSTAT = this.mem.memory[65345 /* STAT */];
    newSTAT &= 252;
    newSTAT |= mode;
    this.mem.memory[65345 /* STAT */] = newSTAT;
    if (mode < 3) {
      if (newSTAT & 1 << 3 + mode) {
        this.cpu.requestInterrupt(CPU.INTERRUPTS.LCDC);
      }
    }
  }
  draw() {
    const lcdc = this.mem.memory[65344 /* LCDC */];
    const lcdon = lcdc & 128 /* LCD_ENABLE */ ? 1 : 0;
    if (lcdon) {
      this.renderLine();
      this.drawSprites(lcdc, this._line);
    }
  }
  renderLine() {
    const lcdc = this.mem.memory[65344 /* LCDC */];
    const WindowTileMap = (lcdc >> 6 & 1) == 1;
    const WindowEnabled = (lcdc >> 5 & 1) == 1;
    const tileSelect = (lcdc >> 4 & 1) == 1;
    const BgTileMap = (lcdc >> 3 & 1) == 1;
    const BgEnabled = (lcdc >> 0 & 1) == 1;
    const BgPalette = this.get_palette(65351 /* BGP */);
    const SCX = this.mem.memory[65347 /* SCX */];
    const SCY = this.mem.memory[65346 /* SCY */];
    const WX = this.mem.memory[65355 /* WX */];
    const WY = this.mem.memory[65354 /* WY */];
    const winx = WX - 7;
    const ly = this._line;
    for (let lx = 0; lx < 160; lx++) {
      if (BgEnabled) {
        const realX = lx + SCX & 255;
        const realY = ly + SCY & 255;
        const color = this.GetTileColor(realX, realY, BgTileMap, tileSelect);
        const pixelIndex = this.PutPixel(lx, ly, BgPalette[color], this.bgImageData);
        this.PutPixel(lx, ly, BgPalette[color], this.screenData);
        this.pxMap[pixelIndex] = color;
      }
      if (WindowEnabled) {
        if (ly >= WY && lx >= winx) {
          const realX = lx - winx;
          const realY = ly - WY;
          const color = this.GetTileColor(realX, realY, WindowTileMap, tileSelect);
          const pixelIndex = this.PutPixel(lx, ly, BgPalette[color], this.winImageData);
          this.PutPixel(lx, ly, BgPalette[color], this.screenData);
          this.pxMap[pixelIndex] = color;
        }
      }
    }
  }
  GetTileColor(x, y, tileMap, tileSelect) {
    var mapbase = tileMap ? 39936 : 38912;
    var tiledatabase = tileSelect ? 32768 : 36864;
    var mapindy = mapbase + (y >> 3) * 32;
    var mapind = mapindy + (x >> 3);
    var patind = this.mem.memory[mapind];
    if (!tileSelect)
      patind = patind << 24 >> 24;
    const sub_ly = y & 7;
    var addr = tiledatabase + (patind << 4) + sub_ly * 2;
    var lobyte = this.mem.memory[addr++];
    var hibyte = this.mem.memory[addr];
    const color = this.GetColorIndex(hibyte, lobyte, x);
    return color;
  }
  GetColorIndex(msb, lsb, bitPos) {
    var bitmask = 1 << ((bitPos ^ 7) & 7);
    var nib = (msb & bitmask ? 2 : 0) | (lsb & bitmask ? 1 : 0);
    return nib;
  }
  getTile(dataStart, index, size = 16) {
    const s = dataStart + index * size;
    return this.mem.memory.slice(s, s + size);
  }
  // Write a line of a tile (8 pixels) into a buffer array
  parseTile(tileData, line, xflip, yflip) {
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
      var mask = 1 << offset;
      var colorValue = ((b1 & mask) >> offset) + ((b2 & mask) >> offset) * 2;
      var p = xflip ? offset : pixel;
      buf[p] = colorValue;
    }
    return buf;
  }
  PutPixel(x, y, color, imageData) {
    var ind = y * 160 + x;
    var pind = ind * 4;
    if (color == 255)
      color = 0;
    else if (color == 192)
      color = 1;
    else if (color == 96)
      color = 2;
    else if (color == 0)
      color = 3;
    var pal = _GPU.PALLETE[color];
    imageData.data[pind] = pal.r;
    imageData.data[pind + 1] = pal.g;
    imageData.data[pind + 2] = pal.b;
    imageData.data[pind + 3] = 255;
    return ind;
  }
  getSprite(spriteId, height) {
    let spriteAddress = 65024 + spriteId * 4;
    let spriteY = this.mem.memory[spriteAddress - 16];
    let spriteX = this.mem.memory[spriteAddress + 1 - 8];
    let tileId = this.mem.memory[spriteAddress + 2];
    let attributes = this.mem.memory[spriteAddress + 3];
    let pixels = new Array();
    let tileAddress = 32768 + tileId * 16;
    for (let y = 0; y < height; y++) {
      pixels[y] = [];
      let lb = this.mem.memory[tileAddress + y * 2];
      let hb = this.mem.memory[tileAddress + y * 2 + 1];
      for (let x = 0; x < 8; x++) {
        let l = lb & 1 << 7 - x ? 1 : 0;
        let h = hb & 1 << 7 - x ? 1 : 0;
        let color = (h << 1) + l;
        pixels[y][x] = color;
      }
    }
    return {
      id: spriteId,
      address: spriteAddress,
      tileId,
      x: spriteX,
      y: spriteY,
      xFlip: !!(attributes & 32),
      yFlip: !!(attributes & 64),
      pixels,
      palette: attributes & 16 ? this.mem.memory[65353] : this.mem.memory[65352],
      paletteId: attributes & 16,
      priority: attributes >> 7
    };
  }
  drawSprites(LCDC, line) {
    if (!this.readBit(LCDC, 1)) {
      return;
    }
    var spriteHeight = this.readBit(LCDC, 2) ? 16 : 8;
    const OAM_START = 65024;
    const OAM_END = 65183;
    var sprites = new Array();
    for (var i = OAM_START; i < OAM_END && sprites.length < 10; i += 4) {
      var y = this.mem.memory[i];
      var x = this.mem.memory[i + 1];
      var index = this.mem.memory[i + 2];
      var flags = this.mem.memory[i + 3];
      if (y - 16 > line || y - 16 < line - spriteHeight) {
        continue;
      }
      sprites.push({ x, y, index, flags });
    }
    if (sprites.length == 0)
      return;
    var spriteLineBuffer = new Array(160);
    for (var i = 0; i < sprites.length; i++) {
      var sprite = sprites[i];
      var tileLine = line - sprite.y + 16;
      var paletteNumber = this.readBit(flags, 4);
      var xflip = this.readBit(sprite.flags, 5);
      var yflip = this.readBit(sprite.flags, 6);
      var tileData = this.getTile(32768, sprite.index, spriteHeight * 2);
      const tileBuffer = this.parseTile(tileData, tileLine, xflip, yflip);
      this.copySpriteTileLine(spriteLineBuffer, tileBuffer, sprite.x - 8, paletteNumber, sprite);
    }
    const objPalette = [
      this.get_palette(65352 /* OBP0 */),
      this.get_palette(65353 /* OBP1 */)
    ];
    var canvasoffs = this._line * 160 * 4;
    for (let i2 = 0; i2 < 160; i2++) {
      const sc = spriteLineBuffer[i2];
      if (!sc) {
        canvasoffs += 4;
        continue;
      }
      const spritePalette = objPalette[spriteLineBuffer[i2].palette];
      this.spriteImageData.data[canvasoffs + 0] = spritePalette[sc.color];
      this.spriteImageData.data[canvasoffs + 1] = spritePalette[sc.color];
      this.spriteImageData.data[canvasoffs + 2] = spritePalette[sc.color];
      this.spriteImageData.data[canvasoffs + 3] = 255;
      this.screenData.data[canvasoffs + 0] = spritePalette[sc.color];
      this.screenData.data[canvasoffs + 1] = spritePalette[sc.color];
      this.screenData.data[canvasoffs + 2] = spritePalette[sc.color];
      this.screenData.data[canvasoffs + 3] = 255;
      canvasoffs += 4;
    }
  }
  // Copy a tile line from a tileBuffer to a line buffer, at a given x position
  copySpriteTileLine(lineBuffer, tileBuffer, x, palette, sprite) {
    const behind = sprite.flags & 128 ? true : false;
    var row = this._line + 16 - sprite.y;
    var realY = sprite.y - 16 + row;
    var pxind_y = realY * 160;
    for (var k = 0; k < 8; k++, x++) {
      if (x < 0 || x >= 160 || tileBuffer[k] == 0)
        continue;
      if (behind && this.pxMap[pxind_y + x] > 0)
        continue;
      lineBuffer[x] = { color: tileBuffer[k], palette };
    }
  }
  get_palette(address) {
    const val = this.mem.memory[address];
    let palette = [255, 255, 255, 255];
    for (var i = 0; i < 4; i++) {
      switch (val >> i * 2 & 3) {
        case 0:
          palette[i] = 255;
          break;
        case 1:
          palette[i] = 192;
          break;
        case 2:
          palette[i] = 96;
          break;
        case 3:
          palette[i] = 0;
          break;
      }
    }
    return palette;
  }
};
var GPU = _GPU;
GPU.PALLETE = [
  { r: 255, g: 255, b: 255 },
  // WHITE
  { r: 170, g: 170, b: 170 },
  // LITE GRAY
  { r: 85, g: 85, b: 85 },
  // DARK GRAY
  { r: 0, g: 0, b: 0 }
  // BLACK
];

// src/Input.ts
var _Input = class {
  constructor(cpu, mem) {
    this.cpu = cpu;
    this.memory = mem;
    this.state = 0;
  }
  getState() {
    return this.state;
  }
  pressKey(key) {
    this.state |= key;
    this.cpu.requestInterrupt(CPU.INTERRUPTS.HILO);
  }
  releaseKey(key) {
    var mask = 255 - key;
    this.state &= mask;
  }
  step() {
    var value = this.memory.rb(_Input.P1);
    value = ~value & 48;
    if (value & 16) {
      value |= this.state & 15;
    } else if (value & 32) {
      value |= (this.state & 240) >> 4;
    } else if ((value & 48) == 0) {
      value &= 240;
    }
    value = ~value & 63;
    this.memory.memory[_Input.P1] = value;
  }
};
var Input = _Input;
Input.P1 = 65280;

// src/ExternalRam.ts
var ExternalRam = class {
  constructor() {
    this.ramSize = 0;
    this.ramBank = 0;
    this.ramBanksize = 0;
  }
  loadRam(game, size) {
    this.gameName = game;
    this.ramSize = size;
    this.ramBanksize = this.ramSize >= 8192 ? 8192 : 2048;
    this.extRam = new Array(this.ramSize).fill(0);
    var key = this.getStorageKey();
    var data = localStorage.getItem(key);
    if (data == null) {
      this.extRam = Array.apply(null, new Array(this.ramSize)).map(function() {
        return 0;
      });
    } else {
      this.extRam = JSON.parse(data);
      if (this.extRam.length != size) {
        console.error("Found RAM data but not matching expected size.");
      }
    }
  }
  setRamBank(bank) {
    this.ramBank = bank;
  }
  manageWrite(offset, value) {
    this.extRam[this.ramBank * 8192 + offset] = value;
  }
  manageRead(offset) {
    return this.extRam[this.ramBank * 8192 + offset];
  }
  getStorageKey() {
    return this.gameName + "_EXTRAM";
    ;
  }
  // Actually save the RAM in the physical storage (localStorage)
  saveRamData() {
    localStorage.setItem(this.getStorageKey(), JSON.stringify(this.extRam));
  }
};

// src/MBC.ts
var MBCMode = /* @__PURE__ */ ((MBCMode2) => {
  MBCMode2[MBCMode2["ROM"] = 0] = "ROM";
  MBCMode2[MBCMode2["RAM"] = 1] = "RAM";
  return MBCMode2;
})(MBCMode || {});
var MBCType = /* @__PURE__ */ ((MBCType3) => {
  MBCType3[MBCType3["MBC0"] = 0] = "MBC0";
  MBCType3[MBCType3["MBC1"] = 1] = "MBC1";
  MBCType3[MBCType3["MBC3"] = 2] = "MBC3";
  MBCType3[MBCType3["MBC5"] = 3] = "MBC5";
  return MBCType3;
})(MBCType || {});
var MBC = class {
  constructor(memory) {
    this.romBankNumber = 0;
    this.memory = memory;
    this.mode = 0 /* ROM */;
  }
  static getMbcInstance(memory, type) {
    var instance;
    switch (type) {
      case 0:
        instance = new MBC0(memory);
        break;
      case 1:
      case 2:
      case 3:
        instance = new MBC1(memory);
        break;
      case 15:
      case 16:
      case 17:
      case 18:
      case 19:
        instance = new MBC3(memory);
        break;
      case 25:
      case 26:
      case 27:
      case 28:
      case 29:
      case 30:
        instance = new MBC5(memory);
        break;
      default:
        throw Error(`MBC type ${type} not supported`);
    }
    return instance;
  }
  readRam(addr) {
    return 0;
  }
  loadRam(game, size) {
  }
  manageWrite(addr, value) {
  }
};
var MBC0 = class extends MBC {
  constructor(memory) {
    super(memory);
    this.type = 0 /* MBC0 */;
  }
};
var MBC1 = class extends MBC {
  constructor(memory) {
    super(memory);
    this.type = 1 /* MBC1 */;
    this.romBankNumber = 1;
    this.ramEnabled = true;
    this.extRam = new ExternalRam();
  }
  manageWrite(addr, value) {
    switch (addr & 61440) {
      case 0:
      case 4096:
        this.ramEnabled = value & 10 ? true : false;
        if (this.ramEnabled) {
          this.extRam.saveRamData();
        }
        break;
      case 8192:
      case 12288:
        value &= 31;
        if (value == 0)
          value = 1;
        var mask = this.mode ? 0 : 224;
        this.romBankNumber = (this.romBankNumber & mask) + value;
        this.memory._romoffs = this.romBankNumber * 16384;
        break;
      case 16384:
      case 20480:
        value &= 3;
        if (this.mode == 0) {
          this.romBankNumber = this.romBankNumber & 31 | value << 5;
          this.memory._romoffs = this.romBankNumber * 16384;
        } else {
          this.extRam.setRamBank(value);
        }
        break;
      case 24576:
      case 28672:
        this.mode = value & 1;
        break;
      case 40960:
      case 45056:
        this.extRam.manageWrite(addr - 40960, value);
        break;
    }
  }
  readRam(addr) {
    return this.extRam.manageRead(addr - 40960);
  }
  loadRam(game, size) {
    this.extRam.loadRam(game, size);
  }
};
var MBC3 = class extends MBC {
  constructor(memory) {
    super(memory);
    this.type = 2 /* MBC3 */;
    this.romBankNumber = 1;
    this.ramEnabled = true;
    this.extRam = new ExternalRam();
  }
  loadRam(game, size) {
    this.extRam.loadRam(game, size);
  }
  manageWrite(addr, value) {
    switch (addr & 61440) {
      case 0:
      case 4096:
        this.ramEnabled = value & 10 ? true : false;
        if (this.ramEnabled) {
          this.extRam.saveRamData();
        }
        break;
      case 8192:
      case 12288:
        value &= 127;
        if (value == 0)
          value = 1;
        this.romBankNumber = value;
        this.memory._romoffs = this.romBankNumber * 16384;
        break;
      case 16384:
      case 20480:
        this.extRam.setRamBank(value);
        break;
      case 24576:
      case 28672:
        break;
      case 40960:
      case 45056:
        this.extRam.manageWrite(addr - 40960, value);
        break;
    }
  }
  readRam(addr) {
    return this.extRam.manageRead(addr - 40960);
  }
};
var MBC5 = MBC3;

// src/Memory.ts
var Memory = class {
  constructor() {
    this.BIOS = [
      49,
      254,
      255,
      175,
      33,
      255,
      159,
      50,
      203,
      124,
      32,
      251,
      33,
      38,
      255,
      14,
      17,
      62,
      128,
      50,
      226,
      12,
      62,
      243,
      226,
      50,
      62,
      119,
      119,
      62,
      252,
      224,
      71,
      17,
      4,
      1,
      33,
      16,
      128,
      26,
      205,
      149,
      0,
      205,
      150,
      0,
      19,
      123,
      254,
      52,
      32,
      243,
      17,
      216,
      0,
      6,
      8,
      26,
      19,
      34,
      35,
      5,
      32,
      249,
      62,
      25,
      234,
      16,
      153,
      33,
      47,
      153,
      14,
      12,
      61,
      40,
      8,
      50,
      13,
      32,
      249,
      46,
      15,
      24,
      243,
      103,
      62,
      100,
      87,
      224,
      66,
      62,
      145,
      224,
      64,
      4,
      30,
      2,
      14,
      12,
      240,
      68,
      254,
      144,
      32,
      250,
      13,
      32,
      247,
      29,
      32,
      242,
      14,
      19,
      36,
      124,
      30,
      131,
      254,
      98,
      40,
      6,
      30,
      193,
      254,
      100,
      32,
      6,
      123,
      226,
      12,
      62,
      135,
      242,
      240,
      66,
      144,
      224,
      66,
      21,
      32,
      210,
      5,
      32,
      79,
      22,
      32,
      24,
      203,
      79,
      6,
      4,
      197,
      203,
      17,
      23,
      193,
      203,
      17,
      23,
      5,
      32,
      245,
      34,
      35,
      34,
      35,
      201,
      206,
      237,
      102,
      102,
      204,
      13,
      0,
      11,
      3,
      115,
      0,
      131,
      0,
      12,
      0,
      13,
      0,
      8,
      17,
      31,
      136,
      137,
      0,
      14,
      220,
      204,
      110,
      230,
      221,
      221,
      217,
      153,
      187,
      187,
      103,
      99,
      110,
      14,
      236,
      204,
      221,
      220,
      153,
      159,
      187,
      185,
      51,
      62,
      60,
      66,
      185,
      165,
      185,
      165,
      66,
      76,
      33,
      4,
      1,
      17,
      168,
      0,
      26,
      19,
      190,
      32,
      254,
      35,
      125,
      254,
      52,
      32,
      245,
      6,
      25,
      120,
      134,
      35,
      5,
      32,
      251,
      134,
      32,
      254,
      62,
      1,
      224,
      80
    ];
    this.memory = new Array(65535).fill(0);
    this._romoffs = 0;
  }
  reset() {
    for (var i = 32768; i <= 40959; i++) {
      this.memory[i] = 0;
    }
    for (var i = 65280; i <= 65407; i++) {
      this.memory[i] = 0;
    }
    this[65535] = 0;
  }
  getGameName() {
    var name = "";
    for (var i = 308; i < 323; i++) {
      var char = this.rb(i) || 32;
      name += String.fromCharCode(char);
    }
    return name;
  }
  getRamSize() {
    var size = 0;
    switch (this.rb(329)) {
      case 1:
        size = 2048;
        break;
      case 2:
        size = 2048 * 4;
        break;
      case 3:
        size = 2048 * 16;
        break;
    }
    return size;
  }
  loadRom(data) {
    this.reset();
    this.rom = data;
    for (var i = 0; i < 16384; i++) {
      this.memory[i] = this.rom[i];
    }
    this.mbc = MBC.getMbcInstance(this, this.rom[327]);
    this.mbc.loadRam(this.getGameName(), this.getRamSize());
  }
  // Read a byte from memory
  rb(addr) {
    if (addr >= 40960 && addr < 49152) {
      return this.mbc.readRam(addr);
    } else if (addr >= 16384 && addr <= 32767) {
      return this.rom[this._romoffs + (addr - (this._romoffs != 0 ? 16384 : 0))];
    }
    return this.memory[addr];
  }
  // Read a 16-bit word
  rw(addr) {
    return this.rb(addr) | this.rb(addr + 1) << 8;
  }
  // Read a byte from memory
  wb(addr, value) {
    if (addr < 32768 || addr >= 40960 && addr < 49152) {
      this.mbc.manageWrite(addr, value);
    } else if (addr == 65280) {
      this.memory[addr] = this[addr] & 15 | value & 48;
    } else {
      this.memory[addr] = value;
      if (addr == 65284) {
        this.timer.resetDiv();
      } else if (addr == 65350) {
        this.dmaTransfer(value);
      }
    }
  }
  // Start a DMA transfer (OAM data from cartrige to RAM)
  dmaTransfer(startAddressPrefix) {
    const OAM_START = 65024;
    const OAM_END = 65183;
    var startAddress = startAddressPrefix << 8;
    for (var i = 0; i < 160; i++) {
      this.memory[OAM_START + i] = this.memory[startAddress + i];
    }
  }
  ww(addr, val) {
    this.wb(addr, val & 255);
    this.wb(addr + 1, val >> 8);
  }
  // Helpers
  readByte(address) {
    return this.rb(address);
  }
  readWord(address) {
    return this.rw(address);
  }
  writeByte(address, value) {
    this.wb(address, value);
  }
  writeWord(address, value) {
    this.ww(address, value);
  }
};

// src/Timer.ts
var Timer = class {
  constructor(cpu, memory) {
    this.cpu = cpu;
    this.memory = memory;
    this.mainTime = 0;
    this.divTime = 0;
  }
  update(clockElapsed) {
    this.updateDiv(clockElapsed);
    this.updateTimer(clockElapsed);
  }
  updateTimer(clockElapsed) {
    if (!(this.memory.rb(65287 /* TAC */) & 4)) {
      return;
    }
    this.mainTime += clockElapsed;
    var threshold = 64;
    switch (this.memory.rb(65287 /* TAC */) & 3) {
      case 0:
        threshold = 64;
        break;
      case 1:
        threshold = 1;
        break;
      case 2:
        threshold = 4;
        break;
      case 3:
        threshold = 16;
        break;
    }
    threshold *= 16;
    while (this.mainTime >= threshold) {
      this.mainTime -= threshold;
      this.memory.wb(65285 /* TIMA */, this.memory.rb(65285 /* TIMA */) + 1);
      if (this.memory.rb(65285 /* TIMA */) > 255) {
        this.memory.wb(65285 /* TIMA */, this.memory.rb(65286 /* TMA */));
        this.cpu.requestInterrupt(CPU.INTERRUPTS.TIMER);
      }
    }
  }
  // Update the DIV register internal clock
  // Increment it if the clock threshold is elapsed and
  // reset it if its value overflows
  updateDiv(clockElapsed) {
    var divThreshold = 256;
    this.divTime += clockElapsed;
    if (this.divTime > divThreshold) {
      this.divTime -= divThreshold;
      var div = this.memory.rb(65284 /* DIV */) + 1;
      this.memory.wb(65284 /* DIV */, div & 255);
    }
  }
  resetDiv() {
    this.divTime = 0;
    this.memory[65284 /* DIV */] = 0;
  }
};

// src/ui/assets/dmg-pcb.png
var dmg_pcb_default = "./dmg-pcb-JQRF24TN.png";

// src/ui/assets/cartridge.png
var cartridge_default = "./cartridge-ISZJ6EWI.png";

// src/ui/panels/RamPanel.ts
var RamPanel = class {
  constructor(emulator) {
    this.rect = { x: 112.7, y: 188.2, w: 81, h: 47 };
    this.emulator = emulator;
  }
  tickDebugger(context, scaleFactor) {
    context.save();
    context.translate(this.rect.x, this.rect.y);
    context.scale(1, 1.3);
    let x = 0;
    let y = 0;
    const ram = this.emulator.mem.memory;
    for (let addr = 49152; addr < 57343; addr += 3) {
      const r = ram[addr + 0];
      const g = ram[addr + 1];
      const b = ram[addr + 2];
      if (r != 0 || g != 0 || b != 0) {
        const color = `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
        context.fillStyle = color;
        context.fillRect(x, y, 1, 1);
      }
      x++;
      if (x % this.rect.w == 0) {
        y++;
        x = 0;
      }
    }
    context.restore();
  }
};

// src/ui/CanvasPanZoom.ts
var CanvasPanZoom = class {
  constructor(ctx, scaleFactor = 1.1) {
    this.scale = 1;
    this.ctx = ctx;
    this.scaleFactor = scaleFactor;
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    this.transform = svg.createSVGMatrix();
    this._point = svg.createSVGPoint();
  }
  pointsMidPoint(p1, p2) {
    return { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
  }
  transformedPoint(x, y) {
    this._point.x = x;
    this._point.y = y;
    this._point = this._point.matrixTransform(this.transform.inverse());
    return { x: this._point.x, y: this._point.y };
  }
  onMouseDown(event) {
    if (event.button == 2 /* RIGHT */)
      return;
    this.dragStart = event.position;
  }
  onMouseUp(event) {
    this.dragStart = null;
    this.lastTouchDistance = null;
  }
  onMouseMove(event) {
    if (event.rawEvent instanceof TouchEvent && event.rawEvent.touches.length == 2) {
      if (!this.lastTouchDistance) {
        const touch12 = { x: event.rawEvent.touches[0].clientX, y: event.rawEvent.touches[0].clientY };
        const touch22 = { x: event.rawEvent.touches[1].clientX, y: event.rawEvent.touches[1].clientY };
        this.lastTouchDistance = Math.sqrt(Math.pow(touch22.x - touch12.x, 2) + Math.pow(touch22.y - touch12.y, 2));
        return;
      }
      const touch1 = { x: event.rawEvent.touches[0].clientX, y: event.rawEvent.touches[0].clientY };
      const touch2 = { x: event.rawEvent.touches[1].clientX, y: event.rawEvent.touches[1].clientY };
      const pointsMiddle = this.pointsMidPoint({ x: touch1.x, y: touch1.y }, { x: touch2.x, y: touch2.y });
      const currentDistance = Math.sqrt(Math.pow(touch2.x - touch1.x, 2) + Math.pow(touch2.y - touch1.y, 2));
      const distanceDelta = this.lastTouchDistance - currentDistance;
      event.wheelDelta = distanceDelta;
      event.position = this.transformedPoint(pointsMiddle.x, pointsMiddle.y);
      this.onMouseWheel(event);
      this.lastTouchDistance = currentDistance;
    } else {
      if (this.dragStart) {
        const dx = event.position.x - this.dragStart.x;
        const dy = event.position.y - this.dragStart.y;
        this.transform = this.transform.translate(dx, dy);
        this.ctx.translate(dx, dy);
      }
    }
  }
  onMouseWheel(event) {
    var delta = -event.wheelDelta / 40;
    if (delta) {
      const factor = Math.pow(this.scaleFactor, delta);
      this.scale -= 1 - factor;
      const pt = event.position;
      this.ctx.translate(pt.x, pt.y);
      this.ctx.scale(factor, factor);
      this.ctx.translate(-pt.x, -pt.y);
      this.transform = this.transform.translate(pt.x, pt.y);
      this.transform = this.transform.scaleNonUniform(factor, factor);
      this.transform = this.transform.translate(-pt.x, -pt.y);
    }
  }
};

// src/ui/panels/VRamPanel.ts
var VRamPanel = class {
  constructor(emulator) {
    this.rect = { x: 130, y: 281, w: 47, h: 80 };
    this.cw = 16 * 8;
    this.ch = 24 * 8;
    this.emulator = emulator;
    this.vramImageData = new ImageData(this.cw, this.ch);
    setInterval(() => {
      this.getTiles();
    }, 1e3);
  }
  displayTile(index, xDraw, yDraw) {
    const VRAM_START = 32768;
    const VRAM_END = 38912;
    const palette = [
      [255, 255, 255, 255],
      [192, 192, 192, 255],
      [96, 96, 96, 255],
      [0, 0, 0, 255]
    ];
    const tileAddress = VRAM_START + index * 16;
    const tileData = this.emulator.mem.memory.slice(tileAddress, tileAddress + 16);
    const cw = this.cw / 8;
    const ch = this.ch / 8;
    let buffer = [];
    for (let i = 0; i < tileData.length; i += 2) {
      const lsb = tileData[i + 0];
      const msb = tileData[i + 1];
      for (let x = 0; x < 8; x++) {
        var mask = 1 << 7 - x;
        const hi = (lsb & mask) >> 7 - x;
        const lo = ((msb & mask) >> 7 - x) * 2;
        const paletteNumber = hi + lo;
        const color = palette[paletteNumber];
        const xa = xDraw + x;
        const ya = yDraw + i / 2;
        let cIndex = (ya * (cw * 8) + xa) * 4;
        this.vramImageData.data[cIndex + 0] = color[0];
        this.vramImageData.data[cIndex + 1] = color[1];
        this.vramImageData.data[cIndex + 2] = color[2];
        this.vramImageData.data[cIndex + 3] = color[3];
        buffer.push(color);
      }
    }
  }
  getTiles() {
    this.vramImageData = new ImageData(this.cw, this.ch);
    let xDraw = 0;
    let yDraw = 0;
    const VRAM_START = 32768;
    let tileNum = 0;
    const cw = this.cw / 8;
    const ch = this.ch / 8;
    for (let y = 0; y < ch; y++) {
      for (let x = 0; x < cw; x++) {
        const tileAddress = VRAM_START + tileNum * 16;
        this.displayTile(tileNum, xDraw + x, yDraw + y);
        xDraw += 7;
        tileNum++;
      }
      yDraw += 7;
      xDraw = 0;
    }
    createImageBitmap(this.vramImageData).then((b) => {
      this.vramImageBitmap = b;
    });
  }
  tickDebugger(context, scaleFactor) {
    context.save();
    context.translate(this.rect.x, this.rect.y);
    if (this.vramImageBitmap) {
      context.scale(0.375, 0.415);
      context.drawImage(this.vramImageBitmap, 0, 0);
    }
    context.restore();
  }
};

// src/ui/panels/CPUPanel.ts
var CPUPanel = class {
  constructor(emulator) {
    this.rect = { x: 211, y: 265, w: 97, h: 69 };
    this.locations = {
      OAM: { rows: 27, start: 65024, end: 65184, title: "OAM" },
      HIGH_RAM: { rows: 15, start: 65408, end: 65534, title: "HRAM" },
      BIOS: { rows: 15, start: 65408, end: 65534, title: "HRAM" }
    };
    this.emulator = emulator;
  }
  fNum(num, padLen = 2) {
    return num.toString(16).toUpperCase().padStart(padLen, "0");
  }
  drawRegisters(context, xStart, yStart) {
    let x = xStart + 10;
    let y = yStart;
    const ySpacing = 3;
    const reg = this.emulator.cpu.reg;
    context.textAlign = "right";
    context.fillText(`PC ${this.fNum(reg.pc, 4)}`, x, y);
    context.fillText(`${Opcodes[this.emulator.mem.memory[reg.pc]]}`, x + 20, y);
    context.fillText(`SP ${this.fNum(reg.sp, 4)}`, x, y += ySpacing);
    context.fillText(`A   ${this.fNum(reg.a, 2)}`, x, y += ySpacing);
    context.fillText(`B   ${this.fNum(reg.b, 2)}`, x, y += ySpacing);
    context.fillText(`D   ${this.fNum(reg.b, 2)}`, x, y += ySpacing);
    context.fillText(`H   ${this.fNum(reg.b, 2)}`, x, y += ySpacing);
    x = xStart + 30;
    y = yStart + ySpacing;
    context.fillText(`F   00`, x, y += ySpacing);
    context.fillText(`C   ${this.fNum(reg.c, 2)}`, x, y += ySpacing);
    context.fillText(`E   ${this.fNum(reg.e, 2)}`, x, y += ySpacing);
    context.fillText(`L   ${this.fNum(reg.l, 2)}`, x, y += ySpacing);
  }
  drawFlags(context, yStart) {
    let x = 0;
    let y = yStart;
    let xSpacing = this.rect.w / 2 / 5;
    context.textAlign = "center";
    const reg = this.emulator.cpu.reg;
    context.textAlign = "right";
    context.fillText(`C ${reg.flags.C ? 1 : 0}`, x += xSpacing, y);
    context.fillText(`H ${reg.flags.H ? 1 : 0}`, x += xSpacing, y);
    context.fillText(`N ${reg.flags.N ? 1 : 0}`, x += xSpacing, y);
    context.fillText(`Z ${reg.flags.Z ? 1 : 0}`, x += xSpacing, y);
  }
  drawPPU(context, xStart, yStart) {
    let x = xStart;
    let y = yStart;
    let ySpacing = 3;
    context.textAlign = "right";
    const mem = this.emulator.mem.memory;
    context.fillText(`LCDC ${this.fNum(mem[65344], 2)}`, x, y += ySpacing);
    context.fillText(`STAT ${this.fNum(mem[65345], 2)}`, x, y += ySpacing);
    x += 15;
    y = yStart;
    context.fillText(`SCY ${this.fNum(mem[65346], 2)}`, x, y += ySpacing);
    context.fillText(`SCX ${this.fNum(mem[65347], 2)}`, x, y += ySpacing);
    x += 15;
    y = yStart;
    context.fillText(`LY ${this.fNum(mem[65348], 2)}`, x, y += ySpacing);
    context.fillText(`LYC ${this.fNum(mem[65349], 2)}`, x, y += ySpacing);
    x += 15;
    y = yStart;
    context.fillText(`WY ${this.fNum(mem[65354], 2)}`, x, y += ySpacing);
    context.fillText(`WX ${this.fNum(mem[65355], 2)}`, x, y += ySpacing);
    x += 15;
    y = yStart;
    context.fillText(`OBP0 ${this.fNum(mem[65352], 2)}`, x, y += ySpacing);
    context.fillText(`OBP1 ${this.fNum(mem[65353], 2)}`, x, y += ySpacing);
    x += 15;
    y = yStart;
    context.fillText(`BGP ${this.fNum(mem[65351], 2)}`, x, y += ySpacing);
  }
  drawRamImage(context, x, y, rows, source, startAddr, endArr) {
    const size = 1.5;
    const m = context.getTransform();
    const prevColor = context.fillStyle;
    context.translate(x, y);
    let xi = 0;
    let yi = 0;
    for (let addr = startAddr; addr <= endArr; addr += 3) {
      const r = source[addr + 0] | 0;
      const g = source[addr + 1] | 0;
      const b = source[addr + 2] | 0;
      if (r != 0 || g != 0 || b != 0) {
        const color = `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
        context.fillStyle = color;
        context.fillRect(xi, yi, size, size);
      }
      xi += size;
      if (xi % (rows * size) == 0) {
        yi += size;
        xi = 0;
      }
    }
    context.setTransform(m);
    context.fillStyle = prevColor;
  }
  divider(context, startX, startY, endX, endY) {
    context.beginPath();
    context.moveTo(startX, startY);
    context.lineTo(endX, endY);
    context.stroke();
    context.closePath();
  }
  tickDebugger(context, scaleFactor) {
    context.save();
    context.translate(this.rect.x, this.rect.y);
    context.strokeStyle = "#222222";
    context.strokeRect(0, 0, this.rect.w, this.rect.h);
    context.lineWidth = 0.4;
    context.strokeRect(0, 0, 44, 59);
    context.fillStyle = "white";
    context.font = "3px monospace";
    context.textAlign = "center";
    context.fillText("CPU Core", 21, 3);
    this.drawRegisters(context, 6, 7);
    this.drawFlags(context, 30);
    this.divider(context, 0, 38, 44, 38);
    context.textAlign = "center";
    context.fillText("RAM", 22, 41);
    this.drawRamImage(context, 1, 43, 27, this.emulator.mem.memory, this.locations.HIGH_RAM.start, this.locations.HIGH_RAM.end);
    this.divider(context, 0, 48, 44, 48);
    context.textAlign = "center";
    context.fillText("ROM", 22, 51);
    this.drawRamImage(context, 1, 53, 27, this.emulator.mem.BIOS, 0, 256);
    context.textAlign = "center";
    context.strokeRect(0, this.rect.h - 10, this.rect.w, 10);
    context.fillText("LCD Controller", 48, 62);
    this.drawPPU(context, 18, 62);
    this.divider(context, 44, 10, this.rect.w, 10);
    this.divider(context, 70, 0, 70, 10);
    context.textAlign = "center";
    context.fillText("Port", 57, 3);
    context.fillText(`P1 ${(~(-this.emulator.input.getState() - 1)).toString(2).padStart(8, "0")}`, 57, 7);
    context.fillText("Divider", 84, 3);
    context.fillText(`DIV ${this.fNum(this.emulator.mem.memory[65284], 2)}`, 84, 7);
    this.divider(context, 44, 22, this.rect.w, 22);
    this.divider(context, 70, 10, 70, 22);
    context.fillText("SIO", 57, 13);
    context.fillText(`SB ${this.fNum(this.emulator.mem.memory[65281], 2)}`, 57, 17);
    context.fillText(`SC ${this.fNum(this.emulator.mem.memory[65283], 2)}`, 57, 19.5);
    context.fillText("Timer", 84, 13);
    context.fillText(`TIMA ${this.fNum(this.emulator.mem.memory[65285], 2)}`, 84, 16);
    context.fillText(`TMA ${this.fNum(this.emulator.mem.memory[65286], 2)}`, 84, 18.5);
    context.fillText(`TAC ${this.fNum(this.emulator.mem.memory[65287], 2)}`, 84, 21);
    this.divider(context, 44, 38, this.rect.w, 38);
    context.fillText("Interrupt Controller", 70, 25);
    context.textAlign = "right";
    const interruptFlag = this.emulator.mem.memory[65535];
    context.fillText(`IME ${this.fNum((this.emulator.cpu.getIME() ? 1 : 0) & 1, 2)}`, 64, 29);
    context.fillText(`VBLANK ${this.fNum(interruptFlag >> 0 & 1, 2)}`, 64, 32);
    context.fillText(`STAT ${this.fNum(interruptFlag >> 1 & 1, 2)}`, 64, 35);
    context.fillText(`Timer ${this.fNum(interruptFlag >> 2 & 1, 2)}`, 94, 29);
    context.fillText(`Serial ${this.fNum(interruptFlag >> 3 & 1, 2)}`, 94, 32);
    context.fillText(`Joypad ${this.fNum(interruptFlag >> 4 & 1, 2)}`, 94, 35);
    context.textAlign = "center";
    this.divider(context, 44, 48, this.rect.w, 48);
    context.fillText("DMA Controller", 70, 41);
    context.fillText("OAM Memory", 70, 51);
    this.drawRamImage(context, 50, 53, this.locations.OAM.rows, this.emulator.mem.memory, this.locations.OAM.start, this.locations.OAM.end);
    context.restore();
  }
};

// src/ui/panels/CartridgePanel.ts
var CartridgePanel = class {
  constructor(emulator) {
    this.romRect = { x: 273, y: -37, w: 57.5, h: 72.5 };
    this.mbcRect = { x: 167, y: -59, w: 34, h: 30 };
    this.sramRect = { x: 172, y: -9.2, w: 35.9, h: 72.2 };
    this.batteryArc = { x: 301, y: -86, r: 25.5 };
    this.emulator = emulator;
    console.log(this.emulator);
    setTimeout(() => {
      const romLength = this.emulator.mem.rom.length;
      console.log(romLength);
      const len = Math.round(Math.sqrt(romLength));
      console.log(len, len / 2, len * 2);
      const romImageData = this.getImageForRange(Math.ceil(len / 2), Math.ceil(len * 2), 0, romLength, this.emulator.mem.rom);
      console.log(romImageData, len);
      createImageBitmap(romImageData).then((ib) => {
        const cartType = this.emulator.mem.rom[327];
        if (cartType == 0)
          this.cartType = 0 /* MBC0 */;
        else if (cartType >= 1 && cartType <= 3)
          this.cartType = 1 /* MBC1 */;
        else if (cartType >= 15 && cartType <= 19)
          this.cartType = 2 /* MBC3 */;
        else if (cartType >= 25 && cartType <= 30)
          this.cartType = 3 /* MBC5 */;
        this.romImage = ib;
      });
    }, 1e3);
    setInterval(() => {
      if (!this.emulator.mem.mbc.extRam)
        return;
      if (this.emulator.mem.mbc.extRam.extRam.length == 0)
        return;
      const extRamLength = this.emulator.mem.mbc.extRam.extRam.length;
      const len = Math.round(Math.sqrt(extRamLength));
      const extRamImage = this.getImageForRange(Math.ceil(len / 2), Math.ceil(len * 2), 0, extRamLength, this.emulator.mem.mbc.extRam.extRam);
      createImageBitmap(extRamImage).then((ib) => {
        this.extRamImage = ib;
      });
    }, 1e3);
  }
  getImageForRange(imgWidth, imgHeight, startRange, endRange, source) {
    const data = new Uint8ClampedArray(imgWidth * imgHeight * 4);
    const romImageData = new ImageData(data, imgWidth, imgHeight);
    for (let addr = startRange; addr <= data.length; addr += 4) {
      const r = source[addr + 0];
      const g = source[addr + 1];
      const b = source[addr + 2];
      const a = source[addr + 3];
      data[addr + 0] = r;
      data[addr + 1] = g;
      data[addr + 2] = b;
      data[addr + 3] = a;
    }
    return romImageData;
  }
  romLenToHeight(len) {
    const ratio = len * this.romRect.h / this.emulator.mem.rom.length;
    return ratio;
  }
  fNum(num, padLen = 2) {
    return num.toString(16).toUpperCase().padStart(padLen, "0");
  }
  tickDebugger(context, scaleFactor) {
    context.save();
    if (this.romImage) {
      context.translate(this.romRect.x, this.romRect.y);
      context.drawImage(this.romImage, 0, 0, this.romRect.w, this.romRect.h * 4);
      context.fillStyle = "#ff0000a0";
      const y = this.romLenToHeight(this.emulator.mem._romoffs);
      const romOffsetWOffset = this.romLenToHeight(16384);
      context.fillRect(0, y, this.romRect.w, romOffsetWOffset);
      context.translate(-this.romRect.x, -this.romRect.y);
    }
    if (this.cartType != 0 /* MBC0 */) {
      context.fillStyle = "black";
      context.translate(this.mbcRect.x, this.mbcRect.y);
      context.fillRect(0, 0, this.mbcRect.w, this.mbcRect.h);
      context.translate(-this.mbcRect.x, -this.mbcRect.y);
      if (this.cartType == 2 /* MBC3 */ || this.cartType == 3 /* MBC5 */) {
        context.translate(this.sramRect.x, this.sramRect.y);
        context.fillRect(0, 0, this.sramRect.w, this.sramRect.h);
        if (this.extRamImage) {
          context.drawImage(this.extRamImage, 0, 0, this.sramRect.w, this.sramRect.h);
        }
        context.translate(-this.sramRect.x, -this.sramRect.y);
        context.save();
        context.translate(this.batteryArc.x, this.batteryArc.y);
        context.scale(1.2, 1);
        context.beginPath();
        context.arc(0, 0, this.batteryArc.r, 0, 2 * Math.PI);
        context.fill();
        context.closePath();
        context.fillStyle = "white";
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.font = "10px monospace";
        context.fillText("CR2032", 0, 0);
        context.translate(-this.batteryArc.x, -this.batteryArc.y);
        context.restore();
      }
      const tX = 33;
      context.fillStyle = "white";
      context.font = "3px monospace";
      context.textAlign = "right";
      context.translate(this.mbcRect.x, this.mbcRect.y);
      context.fillText(`Type          ${MBCType[this.emulator.mem.mbc.type]}`, tX, 5);
      context.fillText(`ROM Bank        ${this.fNum(this.emulator.mem.mbc.romBankNumber)}`, tX, 10);
      context.fillText(`ROM Offset  ${this.fNum(this.emulator.mem._romoffs, 6)}`, tX, 15);
      context.fillText(`Mode           ${MBCMode[this.emulator.mem.mbc.mode]}`, tX, 20);
      context.fillText(`RAM Enabled   ${this.emulator.mem.mbc.ramEnabled}`, tX, 25);
      context.translate(-this.mbcRect.x, -this.mbcRect.y);
      context.restore();
    }
  }
};

// src/ui/panels/LCDPanel.ts
var LCDPanel = class {
  constructor(emulator) {
    this.rect = { x: 260, y: 450, w: 160, h: 144 };
    this.emulator = emulator;
    this.canvasTemp = document.createElement("canvas");
    this.contextTemp = this.canvasTemp.getContext("2d");
    this.image = [
      new ImageData(160, 144),
      new ImageData(160, 144),
      new ImageData(160, 144)
    ];
    setInterval(() => {
      if (this.emulator.gpu._line < 140)
        return;
      const bgI = this.emulator.gpu.bgImageData;
      this.image[0].data.set(bgI.data.slice(0, bgI.data.length));
      const winI = this.emulator.gpu.winImageData;
      this.image[1].data.set(winI.data.slice(0, winI.data.length));
      const spriteI = this.emulator.gpu.spriteImageData;
      this.image[2].data.set(spriteI.data.slice(0, spriteI.data.length));
      if (this.image[0] === this.image[1])
        alert("BRTEBTRB");
    }, 100);
  }
  tickDebugger(context, scaleFactor) {
    context.save();
    context.globalAlpha = 0.5;
    context.translate(this.rect.x, this.rect.y);
    this.contextTemp.clearRect(0, 0, this.canvasTemp.width, this.canvasTemp.height);
    const xO = -100;
    const yO = 50;
    let tb = context.getTransform();
    tb = tb.skewY(20);
    context.setTransform(tb);
    this.contextTemp.putImageData(this.image[0], 0, 0);
    context.strokeRect(0, 0, 160, 144);
    context.drawImage(this.canvasTemp, 0, 0);
    context.translate(xO, yO);
    this.contextTemp.putImageData(this.image[1], 0, 0);
    context.strokeRect(0, 0, 160, 144);
    context.drawImage(this.canvasTemp, 0, 0);
    context.translate(xO, yO);
    this.contextTemp.putImageData(this.image[2], 0, 0);
    context.strokeRect(0, 0, 160, 144);
    context.drawImage(this.canvasTemp, 0, 0);
    context.restore();
  }
};

// src/ui/panels/DebuggerPanel.ts
var DebuggerPanel = class {
  constructor(emulator, container) {
    // private startTime = Date.now();
    this.lastTime = 0;
    this.enabled = true;
    this.emulator = emulator;
    this.container = container;
    this.element = document.createElement("div");
    this.element.classList.add("container__right");
    container.appendChild(this.element);
    this.canvas = document.createElement("canvas");
    this.canvas.width = this.element.clientWidth;
    this.canvas.height = this.element.clientHeight;
    this.context = this.canvas.getContext("2d");
    new ResizeObserver((outputsize) => {
      if (this.element.clientWidth < 200) {
        this.enabled = false;
        return;
      }
      this.canvas.width = this.element.clientWidth;
      this.canvas.height = this.element.clientHeight;
      this.graphPanAndZoom = new CanvasPanZoom(this.context);
      this.enabled = true;
    }).observe(this.element);
    this.element.appendChild(this.canvas);
    this.ramPanel = new RamPanel(this.emulator);
    this.vramPanel = new VRamPanel(this.emulator);
    this.cpuPanel = new CPUPanel(this.emulator);
    this.cartridgePanel = new CartridgePanel(this.emulator);
    this.lcdPanel = new LCDPanel(this.emulator);
    this.dmgPCBImage = document.createElement("img");
    this.dmgPCBImage.src = dmg_pcb_default;
    this.dmgPCBImage.onload = (event) => {
      this.cartridgePCBImage = document.createElement("img");
      this.cartridgePCBImage.width = 512;
      this.cartridgePCBImage.src = cartridge_default;
      this.cartridgePCBImage.onload = (event2) => {
        requestAnimationFrame((event3) => {
          this.tickDebugger();
        });
      };
    };
    this.graphPanAndZoom = new CanvasPanZoom(this.context);
    this.canvas.addEventListener("mousedown", (event) => this.onMouseOrTouchDown(event));
    this.canvas.addEventListener("mouseup", (event) => this.onMouseOrTouchUp(event));
    this.canvas.addEventListener("mousemove", (event) => this.onMouseOrTouchMove(event));
    this.canvas.addEventListener("wheel", (event) => this.onMouseWheel(event));
    this.canvas.addEventListener("touchstart", (event) => this.onMouseOrTouchDown(event));
    this.canvas.addEventListener("touchend", (event) => this.onMouseOrTouchUp(event));
    this.canvas.addEventListener("touchmove", (event) => this.onMouseOrTouchMove(event));
  }
  static scaleCanvas(canvas, context, width, height) {
    const devicePixelRatio = window.devicePixelRatio || 1;
    const backingStoreRatio = context.webkitBackingStorePixelRatio || context.mozBackingStorePixelRatio || context.msBackingStorePixelRatio || context.oBackingStorePixelRatio || context.backingStorePixelRatio || 1;
    const ratio = devicePixelRatio / backingStoreRatio;
    if (devicePixelRatio !== backingStoreRatio) {
      canvas.width = width * ratio;
      canvas.height = height * ratio;
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
    } else {
      canvas.width = width;
      canvas.height = height;
      canvas.style.width = "";
      canvas.style.height = "";
    }
    context.scale(ratio, ratio);
    return ratio;
  }
  processMouseOrTouchEvent(event, type) {
    let mouseEvent = { position: { x: 0, y: 0 }, button: 0, rawEvent: event };
    if (event instanceof MouseEvent) {
      mouseEvent.position = this.graphPanAndZoom.transformedPoint(event.offsetX, event.offsetY);
      mouseEvent.button = event.button;
    }
    if (event instanceof TouchEvent) {
      const canvasBoundingRect = this.canvas.getBoundingClientRect();
      mouseEvent.position = this.graphPanAndZoom.transformedPoint(event.changedTouches[0].clientX - canvasBoundingRect.x, event.changedTouches[0].clientY - canvasBoundingRect.y);
    }
    if (event instanceof WheelEvent) {
      mouseEvent.position = this.graphPanAndZoom.transformedPoint(event.offsetX, event.offsetY);
      mouseEvent.button = event.button;
      mouseEvent.wheelDelta = event.deltaY;
    }
    return mouseEvent;
  }
  onMouseWheel(event) {
    const mouseEvent = this.processMouseOrTouchEvent(event, 3 /* WHEEL */);
    this.graphPanAndZoom.onMouseWheel(mouseEvent);
    event.preventDefault();
  }
  onMouseOrTouchUp(event) {
    const mouseEvent = this.processMouseOrTouchEvent(event, 1 /* UP */);
    this.graphPanAndZoom.onMouseUp(mouseEvent);
    event.preventDefault();
  }
  onMouseOrTouchDown(event) {
    const mouseEvent = this.processMouseOrTouchEvent(event, 0 /* DOWN */);
    this.graphPanAndZoom.onMouseDown(mouseEvent);
    event.preventDefault();
  }
  onMouseOrTouchMove(event) {
    const mouseEvent = this.processMouseOrTouchEvent(event, 2 /* MOVE */);
    this.graphPanAndZoom.onMouseMove(mouseEvent);
    event.preventDefault();
  }
  tickEmulator() {
    if (!this.enabled)
      return;
    this.lastTime++;
    if (this.lastTime >= 2e4) {
      var p1 = this.graphPanAndZoom.transformedPoint(0, 0);
      var p2 = this.graphPanAndZoom.transformedPoint(this.context.canvas.width, this.context.canvas.height);
      this.context.clearRect(p1.x, p1.y, p2.x - p1.x, p2.y - p1.y);
      this.context.imageSmoothingEnabled = false;
      const ratio = this.dmgPCBImage.naturalWidth / this.dmgPCBImage.naturalHeight;
      const width = 478;
      const height = width / ratio;
      if (this.dmgPCBImage)
        this.context.drawImage(this.dmgPCBImage, 0, 0, width, height);
      if (this.cartridgePCBImage)
        this.context.drawImage(this.cartridgePCBImage, 123, -134, width - 240, height - 240);
      this.ramPanel.tickDebugger(this.context, this.graphPanAndZoom.scale);
      this.vramPanel.tickDebugger(this.context, this.graphPanAndZoom.scale);
      this.cpuPanel.tickDebugger(this.context, this.graphPanAndZoom.scale);
      this.cartridgePanel.tickDebugger(this.context, this.graphPanAndZoom.scale);
      this.lcdPanel.tickDebugger(this.context, this.graphPanAndZoom.scale);
      this.lastTime = 0;
    }
  }
  tickDebugger() {
    if (!this.enabled)
      return;
  }
};

// src/ui/assets/dmg.png
var dmg_default = "./dmg-YW43FCAM.png";

// src/ui/panels/EmulatorPanel.ts
var KeyMapping = {
  "KeyH": 128 /* START */,
  "KeyN": 64 /* SELECT */,
  "KeyZ": 16 /* A */,
  "KeyX": 32 /* B */,
  "ArrowUp": 4 /* UP */,
  "ArrowDown": 8 /* DOWN */,
  "ArrowLeft": 2 /* LEFT */,
  "ArrowRight": 1 /* RIGHT */
};
var EmulatorPanel = class {
  constructor(emulator, container) {
    this.emulator = emulator;
    this.container = container;
    this.element = document.createElement("div");
    this.element.classList.add("container__left");
    this.element.style.userSelect = "none";
    this.element.style.touchAction = "none";
    container.appendChild(this.element);
    const gameboyImageElement = document.createElement("img");
    gameboyImageElement.src = dmg_default;
    gameboyImageElement.style.pointerEvents = "none";
    gameboyImageElement.style.width = "302px";
    gameboyImageElement.style.height = "493px";
    this.element.appendChild(gameboyImageElement);
    this.canvas = document.createElement("canvas");
    this.canvas.width = 160;
    this.canvas.height = 144;
    this.canvas.style.background = "black";
    this.canvas.style.position = "absolute";
    this.canvas.style.transform = `translate(calc(-50% + 84px), -74%)`;
    this.context = this.canvas.getContext("2d");
    this.element.appendChild(this.canvas);
    document.addEventListener("keydown", (e) => {
      this.emulator.input.pressKey(KeyMapping[e.code]);
    });
    document.addEventListener("keyup", (e) => {
      this.emulator.input.releaseKey(KeyMapping[e.code]);
    });
    this.touchCount = 0;
    this.touchLastTime = 0;
    this.canvas.addEventListener("touchstart", (e) => {
      this.touchCount++;
      if (this.touchCount >= 2) {
        const currentTime = performance.now();
        const elapsed = currentTime - this.touchLastTime;
        console.log(elapsed);
        if (elapsed < 300) {
          console.log("double touched");
          alert("double");
        }
        this.touchLastTime = currentTime;
        this.touchCount = 0;
      }
      e.preventDefault();
    });
    this.canvas.addEventListener("touchend", (e) => {
      this.touchLastTime = performance.now();
      e.preventDefault();
    });
    const buttonsContainer = document.createElement("div");
    buttonsContainer.style.position = "absolute";
    buttonsContainer.style.display = "flex";
    buttonsContainer.style.justifyContent = "center";
    buttonsContainer.style.alignItems = "center";
    buttonsContainer.style.width = "100%";
    const aBtnElement = this.createABButton(32 /* B */, "Z", 181, 267);
    buttonsContainer.appendChild(aBtnElement);
    const bBtnElement = this.createABButton(16 /* A */, "X", 319, 205);
    buttonsContainer.appendChild(bBtnElement);
    const selectButton = this.createStartSelectButton(64 /* SELECT */, "H", -37, 156, -27);
    buttonsContainer.appendChild(selectButton);
    const startButton = this.createStartSelectButton(128 /* START */, "N", 12, 156, -27);
    buttonsContainer.appendChild(startButton);
    const arrows = this.createDirectionButtons(-102, 109);
    buttonsContainer.appendChild(arrows);
    this.element.appendChild(buttonsContainer);
  }
  createABButton(key, text, xPercent, yPercent) {
    const abBtnElement = document.createElement("button");
    abBtnElement.classList.add("ab-button");
    abBtnElement.style.position = "absolute";
    abBtnElement.textContent = text;
    abBtnElement.style.transform = `translate(${xPercent}%, ${yPercent}%)`;
    abBtnElement.addEventListener("touchstart", (event) => {
      abBtnElement.style.borderStyle = "inset";
      this.emulator.input.pressKey(key);
      event.preventDefault();
    });
    abBtnElement.addEventListener("touchend", (event) => {
      abBtnElement.style.borderStyle = "outset";
      this.emulator.input.releaseKey(key);
      event.preventDefault();
    });
    return abBtnElement;
  }
  createStartSelectButton(key, text, xPercent, yPercent, rotation) {
    const startSelectButtonElement = document.createElement("button");
    startSelectButtonElement.classList.add("startselect-button");
    startSelectButtonElement.style.position = "absolute";
    startSelectButtonElement.textContent = text;
    startSelectButtonElement.style.transform = `translate(${xPercent}px, ${yPercent}px) rotate(${rotation}deg)`;
    startSelectButtonElement.addEventListener("touchstart", (event) => {
      startSelectButtonElement.style.borderStyle = "inset";
      this.emulator.input.pressKey(key);
      event.preventDefault();
    });
    startSelectButtonElement.addEventListener("touchend", (event) => {
      startSelectButtonElement.style.borderStyle = "outset";
      this.emulator.input.releaseKey(key);
      event.preventDefault();
    });
    return startSelectButtonElement;
  }
  getArrowsClickDirection(arrowsElement, x, y) {
    const w = 80;
    const h = 80;
    const triggerOffset = 10;
    const rect = arrowsElement.getBoundingClientRect();
    console.log(rect);
    let ox = x - (rect.left + rect.width / 2);
    let oy = y - (rect.top + rect.height / 2);
    ox *= 1.4;
    oy *= 1.4;
    return {
      u: oy < -triggerOffset,
      d: oy > triggerOffset,
      r: ox > triggerOffset,
      l: ox < -triggerOffset
    };
  }
  createDirectionButtons(xPercent, yPercent) {
    const w = 80;
    const h = 80;
    const arrows = document.createElement("div");
    arrows.style.backgroundColor = "#00ff0050";
    arrows.style.position = "absolute";
    arrows.style.width = `${w}px`;
    arrows.style.height = `${h}px`;
    arrows.style.transform = `translate(${xPercent}%, ${yPercent}%)`;
    console.warn("is bugged, need to use touchmove cuz when user moves to a different key etc");
    arrows.addEventListener("touchstart", (event) => {
      const touch = event.changedTouches[0];
      const dir = this.getArrowsClickDirection(arrows, touch.clientX, touch.clientY);
      if (dir.u)
        this.emulator.input.pressKey(4 /* UP */);
      else if (dir.d)
        this.emulator.input.pressKey(8 /* DOWN */);
      else if (dir.r)
        this.emulator.input.pressKey(1 /* RIGHT */);
      else if (dir.l)
        this.emulator.input.pressKey(2 /* LEFT */);
      event.preventDefault();
    });
    arrows.addEventListener("touchend", (event) => {
      const touch = event.changedTouches[0];
      const dir = this.getArrowsClickDirection(arrows, touch.clientX, touch.clientY);
      if (dir.u)
        this.emulator.input.releaseKey(4 /* UP */);
      else if (dir.d)
        this.emulator.input.releaseKey(8 /* DOWN */);
      else if (dir.r)
        this.emulator.input.releaseKey(1 /* RIGHT */);
      else if (dir.l)
        this.emulator.input.releaseKey(2 /* LEFT */);
      event.preventDefault();
    });
    return arrows;
  }
  vblankStep() {
    this.context.putImageData(this.emulator.getScreenImage(), 0, 0);
  }
};

// src/ui/panels/Resizer.ts
var Resizer = class {
  constructor(container, type) {
    // The current position of mouse
    this.x = 0;
    this.y = 0;
    this.prevSiblingHeight = 0;
    this.prevSiblingWidth = 0;
    this.container = container;
    this.type = type;
    this.element = document.createElement("div");
    this.element.classList.add("resizer");
    this.element.setAttribute("data-direction", this.type);
    this.container.appendChild(this.element);
    this.mouseDownHandler = this.mouseDownHandler.bind(this);
    this.mouseMoveHandler = this.mouseMoveHandler.bind(this);
    this.mouseUpHandler = this.mouseUpHandler.bind(this);
    this.element.addEventListener("mousedown", this.mouseDownHandler, { passive: false });
    this.element.addEventListener("touchstart", this.mouseDownHandler, { passive: false });
  }
  get prevSibling() {
    return this.element.previousElementSibling;
  }
  get nextSibling() {
    return this.element.nextElementSibling;
  }
  // Handle the mousedown event
  // that's triggered when user drags the resizer
  mouseDownHandler(e) {
    const position = {
      clientX: e instanceof MouseEvent ? e.clientX : e.touches[0].clientX,
      clientY: e instanceof MouseEvent ? e.clientY : e.touches[0].clientY
    };
    this.x = position.clientX;
    this.y = position.clientY;
    const rect = this.element.previousElementSibling.getBoundingClientRect();
    this.prevSiblingHeight = rect.height;
    this.prevSiblingWidth = rect.width;
    document.addEventListener("mousemove", this.mouseMoveHandler, { passive: false });
    document.addEventListener("touchmove", this.mouseMoveHandler, { passive: false });
    document.addEventListener("mouseup", this.mouseUpHandler, { passive: false });
    document.addEventListener("touchend", this.mouseUpHandler, { passive: false });
    e.preventDefault();
  }
  mouseMoveHandler(e) {
    const position = {
      clientX: e instanceof MouseEvent ? e.clientX : e.touches[0].clientX,
      clientY: e instanceof MouseEvent ? e.clientY : e.touches[0].clientY
    };
    const dx = position.clientX - this.x;
    const dy = position.clientY - this.y;
    switch (this.type) {
      case "vertical":
        const h = (this.prevSiblingHeight + dy) * 100 / this.element.parentNode.getBoundingClientRect().height;
        this.prevSibling.style.height = `${h}%`;
        break;
      case "horizontal":
      default:
        const w = (this.prevSiblingWidth + dx) * 100 / this.element.parentNode.getBoundingClientRect().width;
        this.prevSibling.style.width = `${w}%`;
        break;
    }
    const cursor = this.type === "horizontal" ? "col-resize" : "row-resize";
    this.element.style.cursor = cursor;
    document.body.style.cursor = cursor;
    if (this.prevSibling) {
      this.prevSibling.style.userSelect = "none";
      this.prevSibling.style.pointerEvents = "none";
    }
    if (this.nextSibling) {
      this.nextSibling.style.userSelect = "none";
      this.nextSibling.style.pointerEvents = "none";
    }
    e.preventDefault();
  }
  mouseUpHandler() {
    this.element.style.removeProperty("cursor");
    document.body.style.removeProperty("cursor");
    if (this.prevSibling) {
      this.prevSibling.style.removeProperty("user-select");
      this.prevSibling.style.removeProperty("pointer-events");
    }
    if (this.nextSibling) {
      this.nextSibling.style.removeProperty("user-select");
      this.nextSibling.style.removeProperty("pointer-events");
    }
    document.removeEventListener("mousemove", this.mouseMoveHandler);
    document.removeEventListener("touchmove", this.mouseMoveHandler);
    document.removeEventListener("mouseup", this.mouseUpHandler);
    document.removeEventListener("touchend", this.mouseUpHandler);
  }
};

// src/ui/UI.ts
var UI = class {
  constructor(emulator, container) {
    this.emulator = emulator;
    this.container = container;
    this.element = document.createElement("div");
    this.element.classList.add("container");
    this.container.appendChild(this.element);
    this.emulatorPanel = new EmulatorPanel(this.emulator, this.element);
    const emulatorPanelResizer = new Resizer(this.element, "horizontal");
    this.debuggerPanel = new DebuggerPanel(this.emulator, this.element);
  }
  instructionStep() {
    this.debuggerPanel.tickEmulator();
  }
  vblankStep() {
    this.emulatorPanel.vblankStep();
  }
};

// src/index.ts
var Emulator = class {
  constructor(container) {
    this.mem = new Memory();
    this.cpu = new CPU(this.mem);
    this.gpu = new GPU(this.cpu, this.mem);
    this.input = new Input(this.cpu, this.mem);
    this.timer = new Timer(this.cpu, this.mem);
    this.mem.timer = this.timer;
    this.ui = new UI(this, container);
  }
  loadGame(gameURL) {
    return fetch(gameURL).then((response) => response.arrayBuffer()).then((arrayBuffer) => {
      this.mem.loadRom(new Uint8Array(arrayBuffer));
      this.cpu.reset();
      return true;
    });
  }
  startGame() {
    this.frame();
  }
  pauseGame() {
    this.cpu.stopped = true;
  }
  getScreenImage() {
    return this.gpu.screenData;
  }
  step() {
    var oldInstrCount = this.cpu.ticks;
    this.cpu.step();
    var elapsed = this.cpu.ticks - oldInstrCount;
    const vblank = this.gpu.step(elapsed);
    this.timer.update(elapsed);
    this.input.step();
    this.cpu.checkInterrupt();
    return vblank;
  }
  frame() {
    if (this.cpu.stopped)
      return;
    setTimeout(this.frame.bind(this), 1e3 / 60);
    try {
      var vblank = false;
      while (!vblank) {
        vblank = this.step();
        this.ui.instructionStep();
      }
      this.ui.vblankStep();
      this.cpu.ticks = 0;
    } catch (e) {
      console.error(e);
    }
  }
};
export {
  Emulator
};
