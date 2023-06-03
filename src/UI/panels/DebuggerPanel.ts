// @ts-ignore
import DMGPCBImageURL from '../assets/dmg-pcb.png';
// @ts-ignore
import CartridgeImageURL from '../assets/cartridge.png';
import { RamPanel } from './RamPanel';
import { Rect } from '../Rect';
import { CanvasPanZoom } from '../CanvasPanZoom';
import { IMouseEvent, MouseEventTypes } from '../IMouseEvent';
import { Emulator } from '../..';
import { VRamPanel } from './VRamPanel';
import { CPUPanel } from './CPUPanel';

import { CartridgePanel } from './CartridgePanel';
import { LCDPanel } from './LCDPanel';

// TODO: Detatch emulator from debugger canvas tick, store values and update at 60fps

export class DebuggerPanel {
    private emulator: Emulator;
    private container: HTMLDivElement;
    private element: HTMLDivElement;

    private canvas: HTMLCanvasElement;
    private context: CanvasRenderingContext2D;

    private dmgPCBImage: HTMLImageElement;
    private cartridgePCBImage: HTMLImageElement;

    private ramPanel: RamPanel;
    private vramPanel: VRamPanel;
    private cpuPanel: CPUPanel;
    private cartridgePanel: CartridgePanel;
    private lcdPanel: LCDPanel;

    private graphPanAndZoom: CanvasPanZoom;

    // private startTime = Date.now();
    private lastTime: number = 0;

    private enabled: boolean = true;

    constructor(emulator: Emulator, container: HTMLDivElement) {

        // console.time("run");
        // let tt = 0;
        // for (let i = 0; i < 100000; i++) {
        //     tt += Date.now();
        // }
        // console.log(tt)
        // console.timeEnd("run");


        this.emulator = emulator;
        this.container = container;
        // Create panel
        this.element = document.createElement("div");
        this.element.classList.add("container__right");
        container.appendChild(this.element);

        this.canvas = document.createElement("canvas");

        // this.canvas.style.width = "100%";
        // this.canvas.style.height = "100%";
        this.canvas.width = this.element.clientWidth;
        this.canvas.height = this.element.clientHeight;
        this.context = this.canvas.getContext("2d");

        new ResizeObserver(outputsize => {
            if (this.element.clientWidth < 200) {
                this.enabled = false;
                return;
            }
            this.canvas.width = this.element.clientWidth;
            this.canvas.height = this.element.clientHeight;
            this.graphPanAndZoom = new CanvasPanZoom(this.context);
            this.enabled = true;

        }).observe(this.element)


        this.element.appendChild(this.canvas);

        this.ramPanel = new RamPanel(this.emulator);
        this.vramPanel = new VRamPanel(this.emulator);
        this.cpuPanel = new CPUPanel(this.emulator);
        this.cartridgePanel = new CartridgePanel(this.emulator);
        this.lcdPanel = new LCDPanel(this.emulator);

        
        
        this.dmgPCBImage = document.createElement("img");
        this.dmgPCBImage.src = DMGPCBImageURL;
        this.dmgPCBImage.onload = event => {
            this.cartridgePCBImage = document.createElement("img");
            this.cartridgePCBImage.width = 512;
            this.cartridgePCBImage.src = CartridgeImageURL;
            this.cartridgePCBImage.onload = event => {
                requestAnimationFrame(event => {this.tickDebugger()})
            }
        }


        // this.canvas.width = this.canvas.parentElement.clientWidth;
        // this.canvas.height = this.canvas.parentElement.clientHeight;
        // DebuggerPanel.scaleCanvas(this.canvas, this.context, this.canvas.width, this.canvas.height);
        this.graphPanAndZoom = new CanvasPanZoom(this.context);

        this.canvas.addEventListener("mousedown", (event) => this.onMouseOrTouchDown(event));
        this.canvas.addEventListener("mouseup", (event) => this.onMouseOrTouchUp(event));
        this.canvas.addEventListener("mousemove", (event) => this.onMouseOrTouchMove(event));
        this.canvas.addEventListener("wheel", (event) => this.onMouseWheel(event));

        this.canvas.addEventListener("touchstart", (event) => this.onMouseOrTouchDown(event));
        this.canvas.addEventListener("touchend", (event) => this.onMouseOrTouchUp(event));
        this.canvas.addEventListener("touchmove", (event) => this.onMouseOrTouchMove(event));

        // window.addEventListener("resize", (event) => this.onResize(event));
    }

    static scaleCanvas(canvas, context, width, height): number {
        // assume the device pixel ratio is 1 if the browser doesn't specify it
        const devicePixelRatio = window.devicePixelRatio || 1;
        
        // determine the 'backing store ratio' of the canvas context
        const backingStoreRatio = (
            context.webkitBackingStorePixelRatio ||
            context.mozBackingStorePixelRatio ||
            context.msBackingStorePixelRatio ||
            context.oBackingStorePixelRatio ||
            context.backingStorePixelRatio || 1
        );
        
        // determine the actual ratio we want to draw at
        const ratio = devicePixelRatio / backingStoreRatio;
        
        if (devicePixelRatio !== backingStoreRatio) {
            // set the 'real' canvas size to the higher width/height
            canvas.width = width * ratio;
            canvas.height = height * ratio;
            
            // ...then scale it back down with CSS
            canvas.style.width = width + 'px';
            canvas.style.height = height + 'px';
        }
        else {
            // this is a normal 1:1 device; just scale it simply
            canvas.width = width;
            canvas.height = height;
            canvas.style.width = '';
            canvas.style.height = '';
        }
        
        // scale the drawing context so everything will work at the higher ratio
        context.scale(ratio, ratio);

        return ratio;
    }

    private processMouseOrTouchEvent(event: MouseEvent | TouchEvent | WheelEvent, type: MouseEventTypes): IMouseEvent {
        let mouseEvent: IMouseEvent = {position: {x: 0, y: 0}, button: 0, rawEvent: event};

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

    private onMouseWheel(event: WheelEvent) {
        const mouseEvent: IMouseEvent = this.processMouseOrTouchEvent(event, MouseEventTypes.WHEEL);
        this.graphPanAndZoom.onMouseWheel(mouseEvent);
        event.preventDefault()
    }

    private onMouseOrTouchUp(event: MouseEvent | TouchEvent) {
        const mouseEvent: IMouseEvent = this.processMouseOrTouchEvent(event, MouseEventTypes.UP);
        this.graphPanAndZoom.onMouseUp(mouseEvent);
        event.preventDefault();
    }

    private onMouseOrTouchDown(event: MouseEvent | TouchEvent) {
        const mouseEvent: IMouseEvent = this.processMouseOrTouchEvent(event, MouseEventTypes.DOWN);

        this.graphPanAndZoom.onMouseDown(mouseEvent);
        event.preventDefault();
    }

    private onMouseOrTouchMove(event: MouseEvent | TouchEvent) {
        const mouseEvent: IMouseEvent = this.processMouseOrTouchEvent(event, MouseEventTypes.MOVE);

        this.graphPanAndZoom.onMouseMove(mouseEvent);

        event.preventDefault();
    }

    public tickEmulator() {
        if (!this.enabled) return;
        // console.log("Ticking")
        // const time = Date.now();
        // const elapsed = time - this.lastTime;

        this.lastTime ++;
        if (this.lastTime >= 20000) {
            // console.log("tick")
            
            // Clear the entire canvas
            var p1 = this.graphPanAndZoom.transformedPoint(0,0);
            var p2 = this.graphPanAndZoom.transformedPoint(this.context.canvas.width, this.context.canvas.height);
            this.context.clearRect(p1.x, p1.y, p2.x-p1.x, p2.y-p1.y);

            this.context.imageSmoothingEnabled = false;
            const ratio = this.dmgPCBImage.naturalWidth / this.dmgPCBImage.naturalHeight;
            const width = 478; // Hardcoded, ups
            const height = width / ratio;

            if (this.dmgPCBImage) this.context.drawImage(this.dmgPCBImage, 0, 0, width, height);
            if (this.cartridgePCBImage) this.context.drawImage(this.cartridgePCBImage, 123, -134, width - 240, height - 240);

            this.ramPanel.tickDebugger(this.context, this.graphPanAndZoom.scale);
            this.vramPanel.tickDebugger(this.context, this.graphPanAndZoom.scale);
            this.cpuPanel.tickDebugger(this.context, this.graphPanAndZoom.scale);
            this.cartridgePanel.tickDebugger(this.context, this.graphPanAndZoom.scale);
            this.lcdPanel.tickDebugger(this.context, this.graphPanAndZoom.scale);

            this.lastTime = 0;
        }
    }

    private tickDebugger() {
        if (!this.enabled) return;
    }
}