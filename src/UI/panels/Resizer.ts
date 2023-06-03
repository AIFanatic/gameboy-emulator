export class Resizer {
    private container: HTMLDivElement;
    private type: "horizontal" | "vertical";
    private element: HTMLDivElement;


    // The current position of mouse
    private x = 0;
    private y = 0;
    private prevSiblingHeight = 0;
    private prevSiblingWidth = 0;

    public get prevSibling(): HTMLDivElement {
        return this.element.previousElementSibling as HTMLDivElement;
    }

    public get nextSibling(): HTMLDivElement {
        return this.element.nextElementSibling as HTMLDivElement;
    }

    constructor(container: HTMLDivElement, type: "horizontal" | "vertical") {
        this.container = container;
        this.type = type;

        this.element = document.createElement("div");
        this.element.classList.add("resizer");
        this.element.setAttribute("data-direction", this.type);

        this.container.appendChild(this.element);

        // Here so that removeEventListener can work and "this" context too
        this.mouseDownHandler = this.mouseDownHandler.bind(this);
        this.mouseMoveHandler = this.mouseMoveHandler.bind(this);
        this.mouseUpHandler = this.mouseUpHandler.bind(this);
        // Attach the handler
        this.element.addEventListener("mousedown", this.mouseDownHandler, {passive: false});
        this.element.addEventListener("touchstart", this.mouseDownHandler, {passive: false});
    }

    // Handle the mousedown event
    // that's triggered when user drags the resizer
    private mouseDownHandler(e: MouseEvent | TouchEvent) {
        const position = {
            clientX: e instanceof MouseEvent ? e.clientX : e.touches[0].clientX,
            clientY: e instanceof MouseEvent ? e.clientY : e.touches[0].clientY
        }

        // Get the current mouse position
        this.x = position.clientX;
        this.y = position.clientY;
        const rect = this.element.previousElementSibling.getBoundingClientRect();
        this.prevSiblingHeight = rect.height;
        this.prevSiblingWidth = rect.width;

        // Attach the listeners to `document`
        document.addEventListener("mousemove", this.mouseMoveHandler, {passive: false});
        document.addEventListener("touchmove", this.mouseMoveHandler, {passive: false});
        document.addEventListener("mouseup", this.mouseUpHandler, {passive: false});
        document.addEventListener("touchend", this.mouseUpHandler, {passive: false});

        e.preventDefault();
    };

    private mouseMoveHandler(e: MouseEvent | TouchEvent) {
        const position = {
            clientX: e instanceof MouseEvent ? e.clientX : e.touches[0].clientX,
            clientY: e instanceof MouseEvent ? e.clientY : e.touches[0].clientY
        }

        // How far the mouse has been moved
        const dx = position.clientX - this.x;
        const dy = position.clientY - this.y;

        switch (this.type) {
            case 'vertical':
                const h =
                    ((this.prevSiblingHeight + dy) * 100) /
                    this.element.parentNode.getBoundingClientRect().height;
                this.prevSibling.style.height = `${h}%`;
                break;
            case 'horizontal':
            default:
                const w =
                    ((this.prevSiblingWidth + dx) * 100) / this.element.parentNode.getBoundingClientRect().width;
                    this.prevSibling.style.width = `${w}%`;
                break;
        }

        const cursor = this.type === 'horizontal' ? 'col-resize' : 'row-resize';
        this.element.style.cursor = cursor;
        document.body.style.cursor = cursor;

        if (this.prevSibling) {
            this.prevSibling.style.userSelect = 'none';
            this.prevSibling.style.pointerEvents = 'none';
        }

        if (this.nextSibling) {
            this.nextSibling.style.userSelect = 'none';
            this.nextSibling.style.pointerEvents = 'none';
        }

        e.preventDefault();
    };

    private mouseUpHandler() {
        this.element.style.removeProperty('cursor');
        document.body.style.removeProperty('cursor');

        if (this.prevSibling) {
            this.prevSibling.style.removeProperty('user-select');
            this.prevSibling.style.removeProperty('pointer-events');
        }

        if (this.nextSibling) {
            this.nextSibling.style.removeProperty('user-select');
            this.nextSibling.style.removeProperty('pointer-events');
        }

        // Remove the handlers of `mousemove` and `mouseup`
        document.removeEventListener("mousemove", this.mouseMoveHandler);
        document.removeEventListener("touchmove", this.mouseMoveHandler);
        document.removeEventListener("mouseup", this.mouseUpHandler);
        document.removeEventListener("touchend", this.mouseUpHandler);
    };
}