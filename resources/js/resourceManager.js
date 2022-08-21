class ResourceManager {
    constructor() {
        this.rs = new RSUnits();
        this.rat = new RAT(32);
        this.scalerRAT = new RAT(32, RegType.Scaler)
        this.workloads = [];
        this.loopBodyloads = [];
        this.branchLoads = [];
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

        let indx = 0;
        for (indx = 0; indx < instructions.length; ++indx) {
            var color = getRandomColor(indx);
            if (getOPClass(instructions[indx].OP) == "Branch") {
                break;
            }

            var newIns = new Instruction(instructions[indx],
                execCycles[getUniqueOPName(
                    instructions[indx].OP)], color, indx + 1);
            this.workloads.push(newIns);
        }

        if (indx != instructions.length) {
            this.workloads.pop();
            this.loopBodyloads = _.cloneDeep(this.workloads);
            --indx;
            if (getOPClass(instructions[indx].OP) != "Integer") {
                console.error("Instruction should be integer");
                return;
            }


            var color = getRandomColor(indx);
            var newIns = new Instruction(instructions[indx], 1, color, indx + 1);
            this.branchLoads.push(newIns);

            ++indx;
            color = getRandomColor(indx);
            newIns = new Instruction(instructions[indx], 1, color, indx + 1);
            this.branchLoads.push(newIns);
        }

        return 0;
    }

    expandWorkLoad() {
        if (this.loopBodyloads.length == 0) {
            return;
        }
        var loopIns = this.branchLoads[0];
        var branchIns = this.branchLoads[1];

        var src1 = loopIns.getFirstOperand();
        var src1Value = parseInt(this.scalerRAT.getRATContent(src1));

        if (!isNumber(src1Value)) {
            src1Value = 0;
        }

        var src2Value = parseInt(loopIns.getSecOperand());
        if (!isNumber(src2Value)) {
            src2Value = 0;
        }
        var ratValue = src1Value + src2Value;
        this.scalerRAT.updateScalerRat(src1, ratValue);
        if (ratValue) {
            console.log("increment or decrement operator value is negative");
        }

        var branchRegSrc1 = branchIns.getDestOperand();
        var branchRegSrc2 = branchIns.getFirstOperand();
        var level = branchIns.getSecOperand();

        var branchRegValue = 0;
        if (src1 == branchRegSrc1) {
            branchRegValue = parseInt(this.scalerRAT.getRATContent(branchRegSrc2));
        }
        else if (src1 == branchRegSrc2) {
            branchRegValue = parseInt(this.scalerRAT.getRATContent(branchRegSrc1));
        }
        var expandFlag = false;
        if (branchIns.type == OPType.bneq) {
            expandFlag = true;
        }

        var tempWorkLoad = _.cloneDeep(this.loopBodyloads);
        var instructionLen = this.workloads.length;
        if (expandFlag) {
            for (let indx = 0; indx < tempWorkLoad.length; ++indx) {
                let rawIns = {
                    OP: tempWorkLoad[indx].getOperator(),
                    Dest: tempWorkLoad[indx].getDestOperand(),
                    Src1: tempWorkLoad[indx].getFirstOperand(),
                    Src2: tempWorkLoad[indx].getSecOperand()
                };

                let insCycle = tempWorkLoad[indx].getCycle(INSCycles.ExecCycle);
                let newInsLen = indx + instructionLen + 1;
                let color = getRandomColor(newInsLen);
                var newInstruction = new Instruction(rawIns, insCycle, color, newInsLen);
                this.workloads.push(newInstruction);
            }
        }
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
        this.rat = new RAT(15);
        this.scalerRAT = new RAT(5, RegType.Scaler);
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

    getRAT(type = RegType.Float) {
        if (type == RegType.Float) {
            return this.rat;
        } else if (type == RegType.Scaler) {
            return this.scalerRAT;
        }
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