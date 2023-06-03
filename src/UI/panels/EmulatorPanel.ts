import { Emulator } from '../../';
import { KEYS } from '../../Input';

// @ts-ignore
import GameBoyImageUrl from '../assets/dmg.png';

const KeyMapping = {
    "KeyH": KEYS.START,
    "KeyN": KEYS.SELECT,
    "KeyZ": KEYS.A,
    "KeyX": KEYS.B,
    "ArrowUp": KEYS.UP,
    "ArrowDown": KEYS.DOWN,
    "ArrowLeft": KEYS.LEFT,
    "ArrowRight": KEYS.RIGHT,
};

export class EmulatorPanel {
    private emulator: Emulator;
    private container: HTMLDivElement;
    private element: HTMLDivElement;

    private canvas: HTMLCanvasElement;
    private context: CanvasRenderingContext2D;

    private touchCount: number;
    private touchLastTime: number;

    constructor(emulator: Emulator, container: HTMLDivElement) {
        this.emulator = emulator;
        this.container = container;
        // Create panel
        this.element = document.createElement("div");
        this.element.classList.add("container__left");
        this.element.style.userSelect = "none";
        this.element.style.touchAction = "none";
        container.appendChild(this.element);

        // Create gb image
        const gameboyImageElement = document.createElement("img");
        gameboyImageElement.src = GameBoyImageUrl;
        gameboyImageElement.style.pointerEvents = "none";
        
        gameboyImageElement.style.width = "302px";
        gameboyImageElement.style.height = "493px";

        this.element.appendChild(gameboyImageElement);

        // Create emulator canvas
        this.canvas = document.createElement("canvas");
        this.canvas.width = 160;
        this.canvas.height = 144;
        this.canvas.style.background = "black";
        this.canvas.style.position = "absolute";
        this.canvas.style.transform = `translate(calc(-50% + 84px), -74%)`;

        this.context = this.canvas.getContext("2d");

        this.element.appendChild(this.canvas)

        document.addEventListener('keydown', e => {
            this.emulator.input.pressKey(KeyMapping[e.code]);
        });
        document.addEventListener('keyup', e => {
            this.emulator.input.releaseKey(KeyMapping[e.code]);
        });
        
        this.touchCount = 0;
        this.touchLastTime = 0;
        this.canvas.addEventListener("touchstart", e => {
            this.touchCount++;

            if (this.touchCount >= 2) {
                const currentTime = performance.now();
                const elapsed = currentTime - this.touchLastTime;
                console.log(elapsed)
                if (elapsed < 300) {
                    // Double touch
                    console.log("double touched");
                    alert("double")
                }
                this.touchLastTime = currentTime;
                this.touchCount = 0;
            }

            e.preventDefault();
        });
        this.canvas.addEventListener("touchend", e => {
            this.touchLastTime = performance.now();
            e.preventDefault();
        });


        const buttonsContainer = document.createElement("div");
        buttonsContainer.style.position = "absolute";
        buttonsContainer.style.display = "flex";
        buttonsContainer.style.justifyContent = "center";
        buttonsContainer.style.alignItems = "center";
        buttonsContainer.style.width = "100%";
        // buttonsContainer.style.height = "365px";

        // // mobile view
        // this.canvas.style.transform = "";
        // this.canvas.style.top = `0`;
        // this.canvas.style.width = `100%`;
        // this.canvas.style.height = `auto`;
        // buttonsContainer.style.bottom = "50";
        // buttonsContainer.style.zoom = "1.4";

        // Key elements
        const aBtnElement = this.createABButton(KEYS.B, "Z", 181, 267);
        buttonsContainer.appendChild(aBtnElement);

        const bBtnElement = this.createABButton(KEYS.A, "X", 319, 205);
        buttonsContainer.appendChild(bBtnElement);

        // Start/Select
        const selectButton = this.createStartSelectButton(KEYS.SELECT, "H", -37, 156, -27);
        buttonsContainer.appendChild(selectButton);

        const startButton = this.createStartSelectButton(KEYS.START, "N", 12, 156, -27);
        buttonsContainer.appendChild(startButton);

        // Arrows
        const arrows = this.createDirectionButtons(-102, 109);
        buttonsContainer.appendChild(arrows);

        this.element.appendChild(buttonsContainer);
    }

    private createABButton(key: KEYS, text: string, xPercent: number, yPercent: number): HTMLButtonElement {
        const abBtnElement = document.createElement("button");
        abBtnElement.classList.add("ab-button");
        abBtnElement.style.position = "absolute";
        abBtnElement.textContent = text;
        abBtnElement.style.transform = `translate(${xPercent}%, ${yPercent}%)`;

        abBtnElement.addEventListener("touchstart", event => {
            abBtnElement.style.borderStyle = "inset";
            this.emulator.input.pressKey(key);
            event.preventDefault();
        })
        abBtnElement.addEventListener("touchend", event => {
            abBtnElement.style.borderStyle = "outset";
            this.emulator.input.releaseKey(key);
            event.preventDefault();
        })
        return abBtnElement;
    }

    private createStartSelectButton(key: KEYS, text: string, xPercent: number, yPercent: number, rotation): HTMLButtonElement {
        const startSelectButtonElement = document.createElement("button");
        startSelectButtonElement.classList.add("startselect-button");
        startSelectButtonElement.style.position = "absolute";
        startSelectButtonElement.textContent = text;
        startSelectButtonElement.style.transform = `translate(${xPercent}px, ${yPercent}px) rotate(${rotation}deg)`;

        startSelectButtonElement.addEventListener("touchstart", event => {
            startSelectButtonElement.style.borderStyle = "inset";
            this.emulator.input.pressKey(key);
            event.preventDefault();
        })
        startSelectButtonElement.addEventListener("touchend", event => {
            startSelectButtonElement.style.borderStyle = "outset";
            this.emulator.input.releaseKey(key);
            event.preventDefault();
        })

        return startSelectButtonElement;
    }

    private getArrowsClickDirection(arrowsElement: HTMLDivElement, x: number, y: number): {u: boolean, d: boolean, l: boolean, r: boolean} {
        const w = 80;
        const h = 80;
        const triggerOffset = 10;

        const rect = arrowsElement.getBoundingClientRect();

        console.log(rect)
        let ox = x - (rect.left + (rect.width / 2));
        let oy = y - (rect.top + (rect.height / 2));

        ox *= 1.4;
        oy *= 1.4;

        return {
            u: oy < -triggerOffset,
            d: oy > triggerOffset,
            r: ox > triggerOffset,
            l: ox < -triggerOffset,
        }
    }

    private createDirectionButtons(xPercent: number, yPercent: number): HTMLDivElement {
        const w = 80;
        const h = 80;

        const arrows = document.createElement("div");
        arrows.style.backgroundColor = "#00ff0050";
        arrows.style.position = "absolute";
        arrows.style.width = `${w}px`;
        arrows.style.height = `${h}px`
        arrows.style.transform = `translate(${xPercent}%, ${yPercent}%)`;


        console.warn("is bugged, need to use touchmove cuz when user moves to a different key etc")
		arrows.addEventListener('touchstart', (event) => {
            const touch = event.changedTouches[0];
            const dir = this.getArrowsClickDirection(arrows, touch.clientX, touch.clientY);

            if (dir.u) this.emulator.input.pressKey(KEYS.UP);
            else if (dir.d) this.emulator.input.pressKey(KEYS.DOWN);
            else if (dir.r) this.emulator.input.pressKey(KEYS.RIGHT);
            else if (dir.l) this.emulator.input.pressKey(KEYS.LEFT);
            event.preventDefault();
        });

		arrows.addEventListener('touchend', (event) => {
            const touch = event.changedTouches[0];
            const dir = this.getArrowsClickDirection(arrows, touch.clientX, touch.clientY);

            if (dir.u) this.emulator.input.releaseKey(KEYS.UP);
            else if (dir.d) this.emulator.input.releaseKey(KEYS.DOWN);
            else if (dir.r) this.emulator.input.releaseKey(KEYS.RIGHT);
            else if (dir.l) this.emulator.input.releaseKey(KEYS.LEFT);
            event.preventDefault();
        });

        return arrows;
    }

    public vblankStep() {
        this.context.putImageData(this.emulator.getScreenImage(), 0, 0);
    }
}