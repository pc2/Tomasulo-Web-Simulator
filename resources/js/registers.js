var RatController = (function () {
    var instance;
    function getController() {
        if (instance) {
            return instance;
        }
        instance = this;
        this.controller = new RAT();
    }
    getController.getInstance = function () {
        return instance || new getController();
    }
    return getController;
}());

class Register {
    constructor(name, valueReg) {
        this.name = name;
        this.Qi = "";
        this.valueReg = valueReg;
        this.id = "";
    }
}

class RAT {
    constructor(number, type = RegType.Float) {
        if (type == RegType.Scaler) {
            this.rtTable = Array(number).fill('S').map((x, y) => new Register(x + y, y));
        }
        else {
            this.rtTable = Array(number).fill('F').map((x, y) => new Register(x + y, 'M' + y));
        }
    }

    checkInRat(srcReg) {
        var ret = undefined;
        for (let i = 0; i < this.rtTable.length; ++i) {
            if (this.rtTable[i].name == srcReg) {
                return this.rtTable[i].Qi;
            }
            else {
                srcReg = srcReg.replace(/[^\d.]/g, '');
                ret = parseInt(srcReg, 10);
                return this.rtTable[ret].Qi;
            }
        }
        return ret;
    }

    /**
     * 
     * @param {*} srcReg 
     * @returns 
     *          true   refers to value type
     *          false  refers to rs type
     */

    getRATContent(srcReg) {
        let ret = this.checkInRat(srcReg);
        if (ret == undefined) {
            console.log("checkInRat return undefined");
        }

        return ret;
    }

    isRegType(src) {
        if (src != undefined &&
            (src.startsWith("M") ||
                src.startsWith("Val") ||
                (src == ""))) {
            return true;
        }
        return false;
    }

    valueTypeFromRat(srcReg) {
        let ret = this.checkInRat(srcReg);
        let type = undefined;
        if (ret == undefined) {
            console.log("checkInRat return undefined");
        }

        if ((ret == "") || (ret.startsWith("M"))) {
            type = "reg";
        }
        else {
            type = "rs";
        }

        return {
            "type": type,
            "value": ret
        }
    }

    updateScalerRat(reg, value) {
        for (let i = 0; i < this.rtTable.length; ++i) {
            if (this.rtTable[i].name == reg) {
                this.rtTable[i].Qi = value;
                return this.rtTable[i].Qi;
            }
        }
    }
    updateRat(reg, insId, value = 0) {

        for (let i = 0; i < this.rtTable.length; ++i) {
            if (this.rtTable[i].name == reg) {
                if (value != 0) {
                    this.rtTable[i].Qi = value;
                    this.rtTable[i].id = insId;
                    return this.rtTable[i].Qi;

                }
                else {
                    this.rtTable[i].Qi = this.rtTable[i].valueReg;
                    this.rtTable[i].id = "";
                    return this.rtTable[i].Qi;

                }
            }
        }
    }

    getRegForRS(rsName) {
        for (let i = 0; i < this.rtTable.length; ++i) {
            if (this.rtTable[i].Qi == rsName) {
                return this.rtTable[i].name;
            }
        }
        return undefined;
    }

    showRat() {
        let buffer = [];
        for (let i = 0; i < 2; ++i) {
            buffer.push(Array(this.rtTable.length).fill('0'));
        }

        for (let i = 0; i < this.rtTable.length; ++i) {
            buffer[0][i] = this.rtTable[i].name;
            buffer[1][i] = this.rtTable[i].Qi;
        }

        console.table(buffer);
    }
}

