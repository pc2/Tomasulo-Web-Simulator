class Architecture {
    constructor() {
        this.execCycles = [];
        this.unitsNumber = [];
        this.instruction = [];
    }
    setExecCycles(execCycles) {
        this.execCycles = execCycles; // do proper error handling
    }

    setUnitsSize(unitsSize) {
        this.unitsNumber = unitsSize; //// do proper error handling
    }

    getUnitsSize(opName = undefined) {

        var ret = undefined;
        if (opName == undefined) {
            ret = _.cloneDeep(this.unitsNumber);
            return ret;
        }

        var rsName = getOp2RSName(opName);
        if (rsName != undefined) {
            return this.unitsNumber[rsName];
        }
        return ret;

    }

    verifyInstruction(instruction) {
        return true;
    }

    setInstructions(instruction) {
        this.instruction = instruction;

    }

    getInstruction() {
        var ret = _.cloneDeep(this.instruction);
        return ret;
    }

    getExecCycle(opName = undefined) {
        var ret = undefined;
        if (opName == undefined) {
            ret = _.cloneDeep(this.execCycles);
            return ret;
        }

        opName = getUniqueOPName(opName);
        if (opName != undefined) {
            return this.execCycles[opName];
        }
        return ret;
    }

}
