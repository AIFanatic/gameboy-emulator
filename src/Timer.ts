import { CPU } from "./CPU";
import { Memory } from "./Memory";

enum TimerRegisters {
    DIV  = 0xFF04,
    TIMA = 0xFF05,
    TMA  = 0xFF06,
    TAC  = 0xFF07
};

export class Timer {
    private cpu: CPU;
    private memory: Memory;
    private mainTime: number;
    private divTime: number;

    constructor(cpu: CPU, memory: Memory) {
        this.cpu = cpu;
        this.memory = memory;
        this.mainTime = 0;
        this.divTime = 0;
    }
    public update(clockElapsed) {
        this.updateDiv(clockElapsed);
        this.updateTimer(clockElapsed);
    };

    private updateTimer(clockElapsed) {
        if (!(this.memory.rb(TimerRegisters.TAC) & 0x4)) {
            return;
        }
        this.mainTime += clockElapsed;

        var threshold = 64;
        switch (this.memory.rb(TimerRegisters.TAC) & 3) {
            case 0: threshold=64; break; // 4KHz
            case 1: threshold=1;  break; // 256KHz
            case 2: threshold=4;  break; // 64KHz
            case 3: threshold=16; break; // 16KHz
        }
        threshold *= 16;

        while (this.mainTime >= threshold) {
            this.mainTime -= threshold;

            this.memory.wb(TimerRegisters.TIMA, this.memory.rb(TimerRegisters.TIMA) + 1);
            if (this.memory.rb(TimerRegisters.TIMA) > 0xFF) {
                this.memory.wb(TimerRegisters.TIMA, this.memory.rb(TimerRegisters.TMA));
                this.cpu.requestInterrupt(CPU.INTERRUPTS.TIMER);
            }
        }
    };
    // Update the DIV register internal clock
    // Increment it if the clock threshold is elapsed and
    // reset it if its value overflows
    private updateDiv(clockElapsed) {
        var divThreshold = 256; // DIV is 16KHz
        this.divTime += clockElapsed;
        if (this.divTime > divThreshold) {
            this.divTime -= divThreshold;
            var div = this.memory.rb(TimerRegisters.DIV) + 1;
            this.memory.wb(TimerRegisters.DIV, div&0xFF);
        }
    };

    public resetDiv() {
        this.divTime = 0;
        this.memory[TimerRegisters.DIV] = 0; // direct write to avoid looping
    };
}


// const clockSpeed = 4194304; 

// export class Timer {
//     private cpu: CPU;
//     private mem: Memory;

//     private frequency: number;
//     private counter: number;
//     private register;

//     constructor(cpu: CPU, mem: Memory) {
//         this.cpu = cpu;
//         this.mem = mem;

//         this.frequency = 4096;
//         this.counter = 0;

//         this.register = {
//             div:  0, // 0xFF04 (r/w) Divider 16-bit MSB is actual value
//             tima: 0, // 0xFF05 (r/w) Timer counter
//             tma:  0, // 0xFF06 (r/w) Timer modulo
//             tac:  0, // 0xFF07 (r/w) Timer control
//         };
//     }

//     readByte(address) {
//         switch (address) {
//             case 0xFF04: return this.register.div>>8;
//             case 0xFF05: return this.register.tima;
//             case 0xFF06: return this.register.tma;
//             case 0xFF07: return this.register.tac|0xF8;                
//         }
//     }

//     writeByte(address, byte) {
//         switch (address) {
//             case 0xFF04: this.register.div = 0; return;
//             case 0xFF05: this.register.tima = byte; return;
//             case 0xFF06: this.register.tma = byte; return;
//             case 0xFF07: this.updateFrequency(byte); return;
//         }
//     }

//     isClockEnabled() {
//         return !!(this.register.tac&0x04);
//     }

//     updateFrequency(data) {
//         let currentFrequency = this.register.tac&0x03;
//         this.register.tac = data;
//         let newFrequency = this.register.tac&0x03;

//         if (currentFrequency != newFrequency) {
//             // console.log(`Frequency adjusted to MOD ${newFrequency}`);
//             switch (newFrequency) {
//                 case 0: this.frequency = 4096; break;
//                 case 1: this.frequency = 262144; break;
//                 case 2: this.frequency = 65536; break;
//                 case 3: this.frequency = 16386; break;
//             }
//         }
//     }

//     tick(cycles) {
//         this.register.div = (this.register.div+cycles)&0xFFFF;

//         if (!this.isClockEnabled()) return;

//         this.counter += cycles;
//         const interval = clockSpeed / this.frequency;

//         while (this.counter >= interval) {
//             this.counter -= interval;

//             // Did timer overflow?
//             if (this.register.tima == 0xFF) {
//                 this.register.tima = this.register.tma;
//                 this.cpu.requestInterrupt(2);
//             } else {
//                 this.register.tima = (this.register.tima+1)&0xFF;
//             }
//         }
//     }
// }