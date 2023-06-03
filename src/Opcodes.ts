export enum Opcodes {
    'NOP' = 0x00,
    'LD BC,D16' = 0x01,
    'LD [BC],A' = 0x02,
    'INC BC' = 0x03,
    'INC B' = 0x04,
    'DEC B' = 0x05,
    'LD B,D8' = 0x06,
    'RLCA' = 0x07,
    'LD [A16],SP' = 0x08,
    'ADD HL,BC' = 0x09,
    'LD A,[BC]' = 0x0A,
    'DEC BC' = 0x0B,
    'INC C' = 0x0C,
    'DEC C' = 0x0D,
    'LD C,D8' = 0x0E,
    'RRCA' = 0x0F,

    'STOP' = 0x10,
    'LD DE,D16' = 0x11,
    'LD [DE],A' = 0x12,
    'INC DE' = 0x13,
    'INC D' = 0x14,
    'DEC D' = 0x15,
    'LD D,D8' = 0x16,
    'RLA' = 0x17,
    'JR PC+R8' = 0x18,
    'ADD HL,DE' = 0x19,
    'LD A,[DE]' = 0x1A,
    'DEC DE' = 0x1B,
    'INC E' = 0x1C,
    'DEC E' = 0x1D,
    'LD E,D8' = 0x1E,
    'RRA' = 0x1F,

    'JR NZ,PC+R8' = 0x20,
    'LD HL,D16' = 0x21,
    'LD [HL+],A' = 0x22,
    'INC HL' = 0x23,
    'INC H' = 0x24,
    'DEC H' = 0x25,
    'LD H,D8' = 0x26,
    'DAA' = 0x27,
    'JR Z,PC+R8' = 0x28,
    'ADD HL,HL' = 0x29,
    'LD A,[HL+]' = 0x2A,
    'DEC HL' = 0x2B,
    'INC L' = 0x2C,
    'DEC L' = 0x2D,
    'LD L,D8' = 0x2E,
    'CPL' = 0x2F,

    'JR NC,PC+R8' = 0x30,
    'LD SP,D16' = 0x31,
    'LD [HL-],A' = 0x32,
    'INC SP' = 0x33,
    'INC [HL]' = 0x34,
    'DEC [HL]' = 0x35,
    'LD [HL],D8' = 0x36,
    'SCF' = 0x37,
    'JR C,PC+R8' = 0x38,
    'ADD HL,SP' = 0x39,
    'LD A,[HL-]' = 0x3A,
    'DEC SP' = 0x3B,
    'INC A' = 0x3C,
    'DEC A' = 0x3D,
    'LD A,D8' = 0x3E,
    'CCF' = 0x3F,

    'LD B,B' = 0x40,
    'LD B,C' = 0x41,
    'LD B,D' = 0x42,
    'LD B,E' = 0x43,
    'LD B,H' = 0x44,
    'LD B,L' = 0x45,
    'LD B,[HL]' = 0x46,
    'LD B,A' = 0x47,
    'LD C,B' = 0x48,
    'LD C,C' = 0x49,
    'LD C,D' = 0x4A,
    'LD C,E' = 0x4B,
    'LD C,H' = 0x4C,
    'LD C,L' = 0x4D,
    'LD C,[HL]' = 0x4E,
    'LD C,A' = 0x4F,

    'LD D,B' = 0x50,
    'LD D,C' = 0x51,
    'LD D,D' = 0x52,
    'LD D,E' = 0x53,
    'LD D,H' = 0x54,
    'LD D,L' = 0x55,
    'LD D,[HL]' = 0x56,
    'LD D,A' = 0x57,
    'LD E,B' = 0x58,
    'LD E,C' = 0x59,
    'LD E,D' = 0x5A,
    'LD E,E' = 0x5B,
    'LD E,H' = 0x5C,
    'LD E,L' = 0x5D,
    'LD E,[HL]' = 0x5E,
    'LD E,A' = 0x5F,

    'LD H,B' = 0x60,
    'LD H,C' = 0x61,
    'LD H,D' = 0x62,
    'LD H,E' = 0x63,
    'LD H,H' = 0x64,
    'LD H,L' = 0x65,
    'LD H,[HL]' = 0x66,
    'LD H,A' = 0x67,
    'LD L,B' = 0x68,
    'LD L,C' = 0x69,
    'LD L,D' = 0x6A,
    'LD L,E' = 0x6B,
    'LD L,H' = 0x6C,
    'LD L,L' = 0x6D,
    'LD L,[HL]' = 0x6E,
    'LD L,A' = 0x6F,

    'LD [HL],B' = 0x70,
    'LD [HL],C' = 0x71,
    'LD [HL],D' = 0x72,
    'LD [HL],E' = 0x73,
    'LD [HL],H' = 0x74,
    'LD [HL],L' = 0x75,
    'HALT' = 0x76,
    'LD [HL],A' = 0x77,
    'LD A,B' = 0x78,
    'LD A,C' = 0x79,
    'LD A,D' = 0x7A,
    'LD A,E' = 0x7B,
    'LD A,H' = 0x7C,
    'LD A,L' = 0x7D,
    'LD A,[HL]' = 0x7E,
    'LD A,A' = 0x7F,

    'ADD B' = 0x80,
    'ADD C' = 0x81,
    'ADD D' = 0x82,
    'ADD E' = 0x83,
    'ADD H' = 0x84,
    'ADD L' = 0x85,
    'ADD [HL]' = 0x86,
    'ADD A' = 0x87,
    'ADC B' = 0x88,
    'ADC C' = 0x89,
    'ADC D' = 0x8A,
    'ADC E' = 0x8B,
    'ADC H' = 0x8C,
    'ADC L' = 0x8D,
    'ADC [HL]' = 0x8E,
    'ADC A' = 0x8F,

    'SUB B' = 0x90,
    'SUB C' = 0x91,
    'SUB D' = 0x92,
    'SUB E' = 0x93,
    'SUB H' = 0x94,
    'SUB L' = 0x95,
    'SUB [HL]' = 0x96,
    'SUB A' = 0x97,
    'SBC B' = 0x98,
    'SBC C' = 0x99,
    'SBC D' = 0x9A,
    'SBC E' = 0x9B,
    'SBC H' = 0x9C,
    'SBC L' = 0x9D,
    'SBC [HL]' = 0x9E,
    'SBC A' = 0x9F,

    'AND B' = 0xA0,
    'AND C' = 0xA1,
    'AND D' = 0xA2,
    'AND E' = 0xA3,
    'AND H' = 0xA4,
    'AND L' = 0xA5,
    'AND [HL]' = 0xA6,
    'AND A' = 0xA7,
    'XOR B' = 0xA8,
    'XOR C' = 0xA9,
    'XOR D' = 0xAA,
    'XOR E' = 0xAB,
    'XOR H' = 0xAC,
    'XOR L' = 0xAD,
    'XOR [HL]' = 0xAE,
    'XOR A' = 0xAF,

    'OR B' = 0xB0,
    'OR C' = 0xB1,
    'OR D' = 0xB2,
    'OR E' = 0xB3,
    'OR H' = 0xB4,
    'OR L' = 0xB5,
    'OR [HL]' = 0xB6,
    'OR A' = 0xB7,
    'CP B' = 0xB8,
    'CP C' = 0xB9,
    'CP D' = 0xBA,
    'CP E' = 0xBB,
    'CP H' = 0xBC,
    'CP L' = 0xBD,
    'CP [HL]' = 0xBE,
    'CP A' = 0xBF,

    'RET NZ' = 0xC0,
    'POP BC' = 0xC1,
    'JP NZ,A16' = 0xC2,
    'JP A16' = 0xC3,
    'CALL NZ,A16' = 0xC4,
    'PUSH BC' = 0xC5,
    'ADD D8' = 0xC6,
    'RST $00' = 0xC7,
    'RET Z' = 0xC8,
    'RET' = 0xC9,
    'JP Z,A16' = 0xCA,
    'CBPREFIX' = 0xCB,
    'CALL Z,A16' = 0xCC,
    'CALL A16' = 0xCD,
    'ADC D8' = 0xCE,
    'RST $08' = 0xCF,

    'RET NC' = 0xD0,
    'POP DE' = 0xD1,
    'JP NC,A16' = 0xD2,
    'DB $D3' = 0xD3,
    'CALL NC,A16' = 0xD4,
    'PUSH DE' = 0xD5,
    'SUB D8' = 0xD6,
    'RST $10' = 0xD7,
    'RET C' = 0xD8,
    'RETI' = 0xD9,
    'JP C,A16' = 0xDA,
    'DB $DB' = 0xDB,
    'CALL C,A16' = 0xDC,
    'DB $DD' = 0xDD,
    'SBC D8' = 0xDE,
    'RST $18' = 0xDF,

    'LDH [A8],A' = 0xE0,
    'POP HL' = 0xE1,
    'LD [C],A' = 0xE2,
    'DB $E3' = 0xE3,
    'DB $E4' = 0xE4,
    'PUSH HL' = 0xE5,
    'AND D8' = 0xE6,
    'RST $20' = 0xE7,
    'ADD SP,R8' = 0xE8,
    'JP HL' = 0xE9,
    'LD [A16],A' = 0xEA,
    'DB $EB' = 0xEB,
    'DB $EC' = 0xEC,
    'DB $ED' = 0xED,
    'XOR D8' = 0xEE,
    'RST $28' = 0xEF,

    'LDH A,[A8]' = 0xF0,
    'POP AF' = 0xF1,
    'LD A,[C]' = 0xF2,
    'DI' = 0xF3,
    'DB $F4' = 0xF4,
    'PUSH AF' = 0xF5,
    'OR D8' = 0xF6,
    'RST $30' = 0xF7,
    'LD HL,SP+R8' = 0xF8,
    'LD SP,HL' = 0xF9,
    'LD A,[A16]' = 0xFA,
    'EI' = 0xFB,
    'DB $FC' = 0xFC,
    'DB $FD' = 0xFD,
    'CP D8' = 0xFE,
    'RST $38' = 0xFF,
}

export const OpcodeTicks = [
/*   0,  1,  2,  3,  4,  5,  6,  7,      8,  9,  A, B,  C,  D, E,  F*/
    4, 12,  8,  8,  4,  4,  8,  4,     20,  8,  8, 8,  4,  4, 8,  4,  //0
    4, 12,  8,  8,  4,  4,  8,  4,     12,  8,  8, 8,  4,  4, 8,  4,  //1
    8, 12,  8,  8,  4,  4,  8,  4,      8,  8,  8, 8,  4,  4, 8,  4,  //2
    8, 12,  8,  8, 12, 12, 12,  4,      8,  8,  8, 8,  4,  4, 8,  4,  //3

    4,  4,  4,  4,  4,  4,  8,  4,      4,  4,  4, 4,  4,  4, 8,  4,  //4
    4,  4,  4,  4,  4,  4,  8,  4,      4,  4,  4, 4,  4,  4, 8,  4,  //5
    4,  4,  4,  4,  4,  4,  8,  4,      4,  4,  4, 4,  4,  4, 8,  4,  //6
    8,  8,  8,  8,  8,  8,  4,  8,      4,  4,  4, 4,  4,  4, 8,  4,  //7

    4,  4,  4,  4,  4,  4,  8,  4,      4,  4,  4, 4,  4,  4, 8,  4,  //8
    4,  4,  4,  4,  4,  4,  8,  4,      4,  4,  4, 4,  4,  4, 8,  4,  //9
    4,  4,  4,  4,  4,  4,  8,  4,      4,  4,  4, 4,  4,  4, 8,  4,  //A
    4,  4,  4,  4,  4,  4,  8,  4,      4,  4,  4, 4,  4,  4, 8,  4,  //B

    8, 12, 12, 16, 12, 16,  8, 16,      8, 16, 12, 0, 12, 24, 8, 16,  //C
    8, 12, 12,  4, 12, 16,  8, 16,      8, 16, 12, 4, 12,  4, 8, 16,  //D
   12, 12,  8,  4,  4, 16,  8, 16,     16,  4, 16, 4,  4,  4, 8, 16,  //E
   12, 12,  8,  4,  4, 16,  8, 16,     12,  8, 16, 4,  0,  4, 8, 16   //F

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