
var RStationsCtr = (function () {
    var instance;
    function getController() {
        if (instance) {
            return instance;
        }
        instance = this;
        var settings = new SettingsController().controller;

        this.controller = new RSUnits(settings);
    }
    getController.getInstance = function () {
        return instance || new getController();
    }
    return getController;
}());

class RSBuffer {
    constructor(name, type, indx) {
        this.name = name; /** The name of the Rs station */
        this.type = type; /** Type of functional unit: Adder, Multiplier, Loader */

        this.Operator = undefined;
        this.Busy = RSStatusFlag.No;
        this.Vj = undefined;
        this.Vk = undefined;
        this.Qj = undefined;
        this.Qk = undefined;
        this.Address = undefined;
        this.dest = undefined;

        this.insHash = undefined;
        this.indx = indx;
    }

    reset() {
        this.Operator = undefined;
        this.Busy = RSStatusFlag.No;
        this.Vj = undefined;
        this.Vk = undefined;
        this.Qj = undefined;
        this.Qk = undefined;
        this.A = undefined;
        this.dest = undefined;
        this.insHash = undefined;
        this.Address = undefined;
    }

    getRSName() {
        return this.name;
    }

    getType() {
        return this.type;
    }

    isBufferSet() {
        if (this.Vj == undefined &&
            this.Vk == undefined &&
            this.Qj == undefined &&
            this.Qj == undefined
        ) {
            return false;
        }
        return true;
    }

    isOperandReady() {
        if (this.type == RSType.FPLd) {
            return (this.Qj == 0 || this.Qk == 0)
        }
        else {
            return (this.Qj == 0 && this.Qk == 0)
        }
    }
}

class RSUnits {
    constructor() {

        /**
         * 
         * _adders = {
         *              size:3,
         *              statusTrace: {
         *                  free: [1,2],
         *                  busy: [0]
         *              },
         *              buffers:[ buffer1, buffer2, buffer3]
         * 
         *          }
         */

        this.Adder = {};
        this.Multiplier = {};
        this.Loader = {};
    }

    initAdd(size) {
        this.Adder.size = size;
        this.Adder.buffers = [];

        for (let indx = 0; indx < size; ++indx) {
            this.Adder.buffers.push(new RSBuffer(
                (getRSName(RSType.FPAdd) + (indx + 1)),
                RSType.FPAdd, indx));
        }
    }

    getRSAdd() {
        return this.Adder;
    }

    resetRSAdd() {
        this.Adder.buffers.forEach(element => {
            element.reset();
        });
    }

    initMul(size) {
        this.Multiplier.size = size;
        this.Multiplier.buffers = [];

        for (let indx = 0; indx < size; ++indx) {
            this.Multiplier.buffers.push(new RSBuffer(
                (getRSName(RSType.FPMul) + (indx + 1)),
                RSType.FPMul, indx));
        }
    }

    getRSMul() {
        return this.Multiplier;
    }


    resetRSMul() {
        this.Multiplier.buffers.forEach(element => {
            element.reset();
        });
    }

    initLd(size) {
        this.Loader.size = size;
        this.Loader.buffers = [];

        for (let indx = 0; indx < size; ++indx) {
            this.Loader.buffers.push(new RSBuffer(
                (getRSName(RSType.FPLd) + (indx + 1)),
                RSType.FPLd, indx));
        }
    }

    getRSLd() {
        return this.Loader;
    }


    resetRSLoad() {
        this.Loader.buffers.forEach(element => {
            element.reset();
        });
    }

    createRSUnits(arch) {
        this.initAdd(arch.FPAdd);
        this.initMul(arch.FPMul);
        this.initLd(arch.FPLd);
    }

    resetRSUnits() {
        this.resetRSLoad();
        this.resetRSAdd();
        this.resetRSMul();
    }

    isAvailable(rsType) {
        var ret = false;
        switch (rsType) {
            case RSType.FPAdd:
                this.Adder.buffers.forEach(buffer => {
                    if (buffer.Busy == RSStatusFlag.No) {
                        ret = true;
                    }
                });
                break;
            case RSType.FPMul:
                this.Multiplier.buffers.forEach(buffer => {
                    if (buffer.Busy == RSStatusFlag.No) {
                        ret = true;;
                    }
                });
                break;
            case RSType.FPLd:
                this.Loader.buffers.forEach(buffer => {
                    if (buffer.Busy == RSStatusFlag.No) {
                        ret = true;;
                    }
                });
                break;
        }

        return ret;
    }


    isDuplicateAccessRequest(buffers, insId) {
        var ret = false;
        buffers.forEach(buffer => {
            if (buffer.insHash == insId) {
                ret = true;
            }
        });

        return ret;
    }

    getRsBufbyInsID(rstype, insId) {
        var rsbuffer = undefined;
        var ret = undefined;
        switch (rstype) {
            case RSType.FPAdd:
                rsbuffer = this.Adder.buffers;
                rsbuffer.forEach(buffer => {
                    if (buffer.insHash == insId) {
                        ret = buffer;
                    }
                });

                break;

            case RSType.FPMul:
                rsbuffer = this.Multiplier.buffers;
                rsbuffer.forEach(buffer => {
                    if (buffer.insHash == insId) {
                        ret = buffer;
                    }
                });
                break;
            case RSType.FPLd:
                rsbuffer = this.Loader.buffers;
                rsbuffer.forEach(buffer => {
                    if (buffer.insHash == insId) {
                        ret = buffer;
                    }
                });
                break;
        }
        return ret;
    }

    getRSUnits(rsType) {
        let ret = undefined;
        switch (rsType) {
            case RSType.FPAdd:
                ret = this.getRSAdd();
                break;
            case RSType.FPMul:
                ret = this.getRSMul();
                break;

            case RSType.FPLd:
                ret = this.getRSLd();
                break;

            default:
                break;
        }
        return ret;
    }
    getFreeBuffer(rsType) {

        switch (rsType) {
            case RSType.FPAdd:
                for (let indx = 0; indx < this.Adder.buffers.length; ++indx) {
                    if (this.Adder.buffers[indx].Busy == RSStatusFlag.No) {
                        return this.Adder.buffers[indx];
                    }
                }
                break;
            case RSType.FPMul:
                for (let indx = 0; indx < this.Multiplier.buffers.length; ++indx) {
                    if (this.Multiplier.buffers[indx].Busy == RSStatusFlag.No) {
                        return this.Multiplier.buffers[indx];
                    }
                }
                break;
            case RSType.FPLd:
                for (let indx = 0; indx < this.Loader.buffers.length; ++indx) {
                    if (this.Loader.buffers[indx].Busy == RSStatusFlag.No) {
                        return this.Loader.buffers[indx];
                    }
                }
                break;
        }

        console.log("RSType not found");
        return undefined;
    }

    getBusyRSBuffers() {
        var rsBuffers = [];

        var buffers = [...this.getRSUnits(RSType.FPLd).buffers, ...this.getRSUnits(RSType.FPAdd).buffers]
        buffers = [...buffers, ...this.getRSUnits(RSType.FPMul).buffers];

        for (let indx = 0; indx < buffers.length; ++indx) {
            if (buffers[indx].Busy != 0) {
                rsBuffers.push(buffers[indx]);
            }
        }

        return rsBuffers;
    }


    getRSBuffer(rstype, insId) {

        var buffer = this.getRsBufbyInsID(rstype, insId);
        if (buffer != undefined) {
            return buffer;
        }

        if (!this.isAvailable(rstype)) {
            console.log("There is no available RS station of the type of" + rstype);
            return undefined;
        }

        return this.getFreeBuffer(rstype);
    }


    release(rsbuff) {
        rsbuff.reset();
    }

    updateRSOperand(targetReg, value) {
        this.Adder.buffers.forEach(buffer => {
            if (buffer.Qj == targetReg) {
                buffer.Vj = value;
                buffer.Qj = 0;
            }

            if (buffer.Qk == targetReg) {
                buffer.Vk = value;
                buffer.Qk = 0;
            }
        });

        this.Multiplier.buffers.forEach(buffer => {
            if (buffer.Qj == targetReg) {
                buffer.Vj = value;
                buffer.Qj = 0;
            }

            if (buffer.Qk == targetReg) {
                buffer.Vk = value;
                buffer.Qk = 0;
            }
        });


        this.Loader.buffers.forEach(buffer => {
            if (buffer.Qj == targetReg) {
                buffer.Vj = value;
                buffer.Qj = 0;
            }

            if (buffer.Qk == targetReg) {
                buffer.Vk = value;
                buffer.Qk = 0;
            }
        });
    }

    showRS() {
        let buffer = [];
        let totalRSSize = (
            parseInt(this.Adder.size) +
            parseInt(this.Multiplier.size) +
            parseInt(this.Loader.size));

        for (let i = 0; i <= totalRSSize; ++i) {
            buffer.push(Array(9).fill('-'));
        }


        {
            buffer[0][0] = "Name";
            buffer[0][1] = "Status";
            buffer[0][2] = "Operator";
            buffer[0][3] = "Dest";
            buffer[0][4] = "Vj";
            buffer[0][5] = "Vk";
            buffer[0][6] = "Qj";
            buffer[0][7] = "Qk";
            buffer[0][8] = "Address";
        }
        let bufIndx = 1;
        for (let indx = 0; indx < this.Adder.size; ++indx, ++bufIndx) {
            buffer[bufIndx][0] = this.Adder.buffers[indx].name;
            buffer[bufIndx][1] = this.Adder.buffers[indx].status;
            buffer[bufIndx][2] = this.Adder.buffers[indx].Operator;
            buffer[bufIndx][3] = this.Adder.buffers[indx].Dest;
            buffer[bufIndx][4] = this.Adder.buffers[indx].Vj;
            buffer[bufIndx][5] = this.Adder.buffers[indx].Vk;
            buffer[bufIndx][6] = this.Adder.buffers[indx].Qj;
            buffer[bufIndx][7] = this.Adder.buffers[indx].Qk;
            buffer[bufIndx][8] = this.Adder.buffers[indx].Address;

        }

        for (let indx = 0; indx < this.Multiplier.size; ++indx, ++bufIndx) {
            buffer[bufIndx][0] = this.Multiplier.buffers[indx].name;
            buffer[bufIndx][1] = this.Multiplier.buffers[indx].status;
            buffer[bufIndx][2] = this.Multiplier.buffers[indx].Operator;
            buffer[bufIndx][3] = this.Multiplier.buffers[indx].Dest;
            buffer[bufIndx][4] = this.Multiplier.buffers[indx].Vj;
            buffer[bufIndx][5] = this.Multiplier.buffers[indx].Vk;
            buffer[bufIndx][6] = this.Multiplier.buffers[indx].Qj;
            buffer[bufIndx][7] = this.Multiplier.buffers[indx].Qk;
            buffer[bufIndx][8] = this.Multiplier.buffers[indx].Address;

        }

        for (let indx = 0; indx < this.Loader.size; ++indx, ++bufIndx) {
            buffer[bufIndx][0] = this.Loader.buffers[indx].name;
            buffer[bufIndx][1] = this.Loader.buffers[indx].status;
            buffer[bufIndx][2] = this.Loader.buffers[indx].Operator;
            buffer[bufIndx][3] = this.Loader.buffers[indx].Dest;
            buffer[bufIndx][4] = this.Loader.buffers[indx].Vj;
            buffer[bufIndx][5] = this.Loader.buffers[indx].Vk;
            buffer[bufIndx][6] = this.Loader.buffers[indx].Qj;
            buffer[bufIndx][7] = this.Loader.buffers[indx].Qk;
            buffer[bufIndx][8] = this.Loader.buffers[indx].Address;

        }

        console.table(buffer);
        console.log("\n");
    }
}


