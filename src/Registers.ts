export class Registers {
    // public _a: number;

    // public _b: number;
    // public _c: number;

    // public _d: number;
    // public _e: number;

    // public _h: number;
    // public _l: number;

    // public get a(): number {return this._a;}
    // public set a(value: number) {this._a = value & 0xFF;}

    // public get b(): number {return this._b;}
    // public set b(value: number) {this._b = value & 0xFF;}

    // public get c(): number {return this._c;}
    // public set c(value: number) {
    //     console.log("set c", value.toString(16))
    //     this._c = value & 0xFF;
    // }

    // public get d(): number {return this._d;}
    // public set d(value: number) {
    //     // console.warn("set d", value)
    //     this._d = value & 0xFF;
    // }

    // public get e(): number {return this._e;}
    // public set e(value: number) {this._e = value & 0xFF;}

    // public get h(): number {return this._h;}
    // public set h(value: number) {this._h = value & 0xFF;}

    // public get l(): number {return this._l;}
    // public set l(value: number) {this._l = value & 0xFF;}

    public a: number;

    public b: number;
    public c: number;

    public d: number;
    public e: number;

    public h: number;
    public l: number;

    public get bc(): number {
        return (this.b << 8) | this.c;
    }

    public set bc(value: number) {
        this.b = value >> 8;
        this.c = value & 0xff;
    }

    public get de(): number {
        return (this.d << 8) | this.e;
    }

    public set de(value: number) {
        this.d = value >> 8;
        this.e = value & 0xff;
    }

    public get hl(): number {
        return (this.h << 8) | this.l;
    }

    public set hl(value: number) {
        this.h = value >> 8;
        this.l = value & 0xff;
    }

    public flags: {
        Z: boolean;
        H: boolean;
        N: boolean;
        C: boolean;
    };
    public sp: number;
    public pc: number;

    constructor() {
        this.a = 0;
        this.b = 0;
        this.c = 0;
        this.d = 0;
        this.e = 0;
        this.h = 0;
        this.l = 0;
        this.flags = {
            Z: false,
            H: false,
            N: false,
            C: false,
        };
        this.sp = 0;
        this.pc = 0;
    }

    // public static GetUpper(value: number): number {
    //     return value & 0xFF00 >> 8;
    // }

    // public static SetUpper(register: number, value: number): number {
    //     return (register & 0x00FF) | (value << 8);
    // }

    // public static GetLower(value: number): number {
    //     return value & 0xFF;
    // }

    // public static SetLower(register: number, value: number): number {
    //     return (register & 0xFF00) | value;
    // }
}