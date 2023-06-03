import { Point } from "./Point";

export enum MouseEventTypes {
    DOWN,
    UP,
    MOVE,
    WHEEL
}

export enum MouseButton {
    LEFT,
    MIDDLE,
    RIGHT,
    BACK,
    FORWARD,
}

export interface IMouseEvent {
    position: Point;
    button: MouseButton;
    wheelDelta?: number;
    rawEvent: MouseEvent | TouchEvent | WheelEvent;
}