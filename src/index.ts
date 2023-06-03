import { CPU } from "./CPU";
import { GPU } from "./GPU";
import { Input } from "./Input";
import { Memory } from "./Memory";
import { Timer } from "./Timer";
import { UI } from "./ui/UI";

export class Emulator {
    public readonly cpu: CPU;
    public readonly gpu: GPU;
    public readonly mem: Memory;
    public readonly input: Input;
    public readonly timer: Timer;

    private ui: UI;

    constructor(container: HTMLDivElement) {
        this.mem = new Memory();
        this.cpu = new CPU(this.mem);
        this.gpu = new GPU(this.cpu, this.mem);
        this.input = new Input(this.cpu, this.mem);
        this.timer = new Timer(this.cpu, this.mem);

        this.mem.timer = this.timer;

        this.ui = new UI(this, container);
    }

    public loadGame(gameURL: string): Promise<boolean> {
        return fetch(gameURL).then(response => response.arrayBuffer()).then(arrayBuffer => {
            this.mem.loadRom(new Uint8Array(arrayBuffer));

            this.cpu.reset();

            return true;
        })
    }

    public startGame() {
        this.frame();
    }

    public pauseGame() {
        this.cpu.stopped = true;
    }

    public getScreenImage(): ImageData {
        return this.gpu.screenData;
    }

    public step(): boolean {
        var oldInstrCount = this.cpu.ticks;
        this.cpu.step();

        var elapsed = this.cpu.ticks - oldInstrCount;
        const vblank = this.gpu.step(elapsed);
        this.timer.update(elapsed);
        this.input.step();
        this.cpu.checkInterrupt();

        return vblank;
    }

    private frame() {
        if (this.cpu.stopped) return;

        setTimeout(this.frame.bind(this), 1000 / 60);

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
}