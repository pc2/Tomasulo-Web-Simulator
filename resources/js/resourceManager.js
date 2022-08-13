class ResourceManager {
    constructor() {
        this.rs = new RSUnits();
        this.rat = new RAT();
        this.workloads = [];
    }

    initializeRS(unitsSize) {
        this.rs.createRSUnits(unitsSize);
    }

    initializeWLoad(instructions, execCycles) {
        if ((instructions == undefined) ||
            (instructions.length == 0)) {
            console.error("No instruction found to load");
            return undefined;
        }

        for (let index = 0; index < instructions.length; ++index) {
            var color = getRandomColor(index);
            var newIns = new Instruction(instructions[index],
                execCycles[getUniqueOPName(instructions[index].OP)], color, index + 1);
            this.workloads.push(newIns);
        }

        return 0;
    }

    reinitializeWLoad() {
        var tempWLoad = [];
        var wLoad = this.workloads;
        wLoad.forEach(function (insLoad, indx) {
            let ins = {
                "OP": insLoad.getOperator(),
                "Dest": insLoad.getDestOperand(),
                "Src1": insLoad.getFirstOperand(),
                "Src2": insLoad.getSecOperand()
            }

            var newIns = new Instruction(ins, insLoad.exeCycle, insLoad.color, indx + 1);
            tempWLoad.push(newIns);
        });

        this.workloads = tempWLoad;
    }

    initializeResource(instructions, insCycles, unitsSize) {
        this.initializeRS(unitsSize);
        this.initializeWLoad(instructions, insCycles, unitsSize);
    }

    reInitializeResource() {
        this.rat = new RAT();
        this.rs.resetRSUnits();
        this.reinitializeWLoad();
    }

    getWLoads() {
        return this.workloads;
    }

    getWLoadByID(id) {
        let indx = 0;
        var wLoad = [];
        for (; indx < this.workloads.length; ++indx) {
            if (id == this.workloads[indx].id) {
                wLoad = this.workloads[indx];
                break;
            }
        }

        return wLoad;
    }

    getRAT() {
        return this.rat;
    }

    getRSUnits(rsType) {
        var rsUnit = this.rs.getRSUnits(rsType);
        if (rsUnit != undefined) {
            return rsUnit;
        }
        else {
            return this.rs;
        }
    }

    hasInstruction(optypes) {
        let ret = false;
        var wloads = this.getWLoads();
        for (let indx = 0; indx < wloads.length; ++indx) {
            optypes.forEach(opType => {
                if (opType == wloads[indx].type) {
                    ret = true;
                    return;
                }
            });

            if (ret == true) {
                break;
            }
        }

        return ret;
    }

}