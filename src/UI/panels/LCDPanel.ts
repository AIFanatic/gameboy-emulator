import { Emulator } from "../..";
import { Rect } from "../Rect";

export class LCDPanel {
    private emulator: Emulator;

    private rect: Rect = {x: 260, y: 450, w: 160, h: 144};

    private canvasTemp: HTMLCanvasElement;
    private contextTemp: CanvasRenderingContext2D;

    private image: ImageData[];

    constructor(emulator: Emulator) {
        this.emulator = emulator;

        this.canvasTemp = document.createElement('canvas');
        this.contextTemp = this.canvasTemp.getContext('2d');

        this.image = [
            new ImageData(160, 144),
            new ImageData(160, 144),
            new ImageData(160, 144)
        ]

        setInterval(() => {
            // Make sure we have almost a full screen
            if (this.emulator.gpu._line < 140) return;

            const bgI = this.emulator.gpu.bgImageData;
            this.image[0].data.set(bgI.data.slice(0, bgI.data.length));

            const winI = this.emulator.gpu.winImageData;
            this.image[1].data.set(winI.data.slice(0, winI.data.length));

            const spriteI = this.emulator.gpu.spriteImageData;
            this.image[2].data.set(spriteI.data.slice(0, spriteI.data.length));


            if (this.image[0] === this.image[1]) alert("BRTEBTRB")
        }, 100);
    }

    public tickDebugger(context: CanvasRenderingContext2D, scaleFactor: number) {
        context.save();

        context.globalAlpha = 0.5;

        context.translate(this.rect.x, this.rect.y);

        this.contextTemp.clearRect(0, 0, this.canvasTemp.width, this.canvasTemp.height);
        
        const xO = -100;
        const yO = 50;

        let tb = context.getTransform();
        tb = tb.skewY(20)
        context.setTransform(tb)

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
}