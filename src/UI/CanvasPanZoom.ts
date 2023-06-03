import { Point } from "./Point";
import { IMouseEvent, MouseButton } from "./IMouseEvent";

export class CanvasPanZoom {
    private ctx: CanvasRenderingContext2D;

    private dragStart: Point;

    private transform: DOMMatrix;
    private _point: DOMPoint;

    private scaleFactor: number;
    private lastTouchDistance: number;

    public scale: number = 1;

    constructor(ctx: CanvasRenderingContext2D, scaleFactor: number = 1.1) {
        this.ctx = ctx;
        this.scaleFactor = scaleFactor;

        const svg = document.createElementNS("http://www.w3.org/2000/svg",'svg');
        this.transform = svg.createSVGMatrix();
        this._point = svg.createSVGPoint();
    }

    private pointsMidPoint(p1: Point, p2: Point): Point {
        return {x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2};
    }

    public transformedPoint(x: number, y: number): Point {
        this._point.x = x;
        this._point.y = y;
        this._point = this._point.matrixTransform(this.transform.inverse())
        return {x: this._point.x, y: this._point.y};
    }

    public onMouseDown(event: IMouseEvent) {
        if (event.button == MouseButton.RIGHT) return;
        
        this.dragStart = event.position;
    }

    public onMouseUp(event: IMouseEvent) {
        this.dragStart = null;
        this.lastTouchDistance = null;
    }

    public onMouseMove(event: IMouseEvent) {
        if (event.rawEvent instanceof TouchEvent && event.rawEvent.touches.length == 2) {
            if (!this.lastTouchDistance) {
                const touch1 = { x: event.rawEvent.touches[0].clientX, y: event.rawEvent.touches[0].clientY };
                const touch2 = { x: event.rawEvent.touches[1].clientX, y: event.rawEvent.touches[1].clientY };
                this.lastTouchDistance = Math.sqrt(Math.pow(touch2.x - touch1.x, 2) + Math.pow(touch2.y - touch1.y, 2));
                return;
            }

            const touch1 = { x: event.rawEvent.touches[0].clientX, y: event.rawEvent.touches[0].clientY };
            const touch2 = { x: event.rawEvent.touches[1].clientX, y: event.rawEvent.touches[1].clientY };
            const pointsMiddle = this.pointsMidPoint({x: touch1.x, y: touch1.y}, {x: touch2.x, y: touch2.y});
            
            const currentDistance = Math.sqrt(Math.pow(touch2.x - touch1.x, 2) + Math.pow(touch2.y - touch1.y, 2));
            const distanceDelta = this.lastTouchDistance - currentDistance;

            event.wheelDelta = distanceDelta;
            event.position = this.transformedPoint(pointsMiddle.x, pointsMiddle.y);
            this.onMouseWheel(event);

            this.lastTouchDistance = currentDistance;
        }
        else {
            if (this.dragStart) {
                const dx = event.position.x - this.dragStart.x;
                const dy = event.position.y - this.dragStart.y;

                this.transform = this.transform.translate(dx,dy);
                this.ctx.translate(dx, dy);
            }
        }  
    }

    onMouseWheel(event: IMouseEvent) {
        var delta = -event.wheelDelta/40;
        if (delta) {
            const factor = Math.pow(this.scaleFactor, delta);

            
            this.scale -= 1-factor;
            // console.log(this.scaleFactor, factor, this.scale)

            const pt = event.position;
            this.ctx.translate(pt.x, pt.y)
            this.ctx.scale(factor, factor);
            this.ctx.translate(-pt.x, -pt.y)

            this.transform = this.transform.translate(pt.x, pt.y);
            this.transform = this.transform.scaleNonUniform(factor, factor);
            this.transform = this.transform.translate(-pt.x, -pt.y);
        }
    }
}