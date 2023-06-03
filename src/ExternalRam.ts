export class ExternalRam {
    private extRam;
    private ramSize = 0;
    private ramBank = 0;
    private ramBanksize = 0;
    private gameName: string;

    constructor() {
    }

    public loadRam(game, size) {
        this.gameName = game;
    
        this.ramSize = size;
        this.ramBanksize = this.ramSize >= 0x2000 ? 8192 : 2048;
    
        this.extRam = new Array(this.ramSize).fill(0);

        var key = this.getStorageKey();
        var data = localStorage.getItem(key);
        if (data == null) {
            this.extRam = Array.apply(null, new Array(this.ramSize)).map(function(){return 0;});
        } else {
            this.extRam = JSON.parse(data);
            if (this.extRam.length != size) {
                console.error('Found RAM data but not matching expected size.');
            }
        }
    };
    
    public setRamBank(bank) {
        this.ramBank = bank;
    };
    
    public manageWrite(offset, value) {
        this.extRam[this.ramBank * 8192 + offset] = value;
    };
    
    public manageRead(offset) {
        // return 0;
        return this.extRam[this.ramBank * 8192 + offset];
    };
    
    public getStorageKey() {
        return this.gameName + '_EXTRAM';;
    };

    // Actually save the RAM in the physical storage (localStorage)
    public saveRamData() {
        localStorage.setItem(this.getStorageKey(), JSON.stringify(this.extRam));
    };
}