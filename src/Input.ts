import { CPU } from "./CPU";
import { Memory } from "./Memory";

export enum KEYS {
    START = 0x80,
    SELECT = 0x40,
    B = 0x20,
    A = 0x10,
    DOWN = 0x08,
    UP = 0x04,
    LEFT = 0x02,
    RIGHT = 0x01
};

export class Input {
    private cpu: CPU;
    private memory: Memory;

    private state: number;

    public static P1 = 0xFF00;

    constructor(cpu: CPU, mem: Memory) {
        this.cpu = cpu;
        this.memory = mem;
        this.state = 0;
    }

    public getState(): number {
        return this.state;
    }

    public pressKey(key: KEYS) {
        this.state |= key;
        this.cpu.requestInterrupt(CPU.INTERRUPTS.HILO);
    };
    
    public releaseKey(key) {
        var mask = 0xFF - key;
        this.state &= mask;
    };

    public step() {
        var value = this.memory.rb(Input.P1);
        value = ((~value) & 0x30); // invert the value so 1 means 'active'
        if (value & 0x10) { // direction keys listened
            value |= (this.state & 0x0F);
        } else if (value & 0x20) { // action keys listened
            value |= ((this.state & 0xF0) >> 4);
        } else if ((value & 0x30) == 0) { // no keys listened
            value &= 0xF0;
        }
    
        value = ((~value) & 0x3F); // invert back
        this.memory.memory[Input.P1] = value;
    }
}