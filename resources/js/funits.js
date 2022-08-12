var FUnitCtr = (function () {
    var instance;
    function getController() {
        if (instance) {
            return instance;
        }
        instance = this;
        var settings = new SettingsController().controller;
        return new Funits(settings);
    }
    getController.getInstance = function () {
        return instance || new getController();
    }
    return getController;
}());

class FUnit {
    constructor(type) {
        this._name = type;
        this.busy = false;
    }
}

class Funits {
    constructor(settings) {
        this.FPAdder = {};
        this.FPMultiplier = {};
        this.FPLoader = {};
        this.createFUnits(settings);
    }
    createFUnits(settings) {
        var funitCfg = settings.getFunitsNumber();
        for (let i = 0; i < funitCfg.length; ++i) {

            if (funitCfg[i].type == "Adder") {
                this.FPAdder.size = funitCfg[i].size;
                this.FPAdder.free = funitCfg[i].size;
                this.FPAdder.buffer = [];
                for (let j = 0; j < this.FPAdder.size; ++j) {
                    this.FPAdder.buffer.push(new FUnit("Adder"));
                }
            }
            else if (funitCfg[i].type == "Multiplier") {
                this.FPMultiplier.size = funitCfg[i].size;
                this.FPMultiplier.free = funitCfg[i].size;
                this.FPMultiplier.buffer = [];
                for (let j = 0; j < this.FPMultiplier.size; ++j) {
                    this.FPMultiplier.buffer.push(new FUnit("Multiplier"));
                }
            }
            else if (funitCfg[i].type == "Loader") {
                this.FPLoader.size = funitCfg[i].size;
                this.FPLoader.free = funitCfg[i].size;
                this.FPLoader.buffer = [];
                for (let j = 0; j < this.FPLoader.size; ++j) {
                    this.FPLoader.buffer.push(new FUnit("Loader"));
                }
            }
        }
    }

}