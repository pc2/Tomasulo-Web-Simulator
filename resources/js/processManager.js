
class ProcessManager {
    constructor() {
        this.resourceMgt = new ResourceManager();
        this.architecture = new Architecture();
        this.cycle = 0;
        this.antInsturctionCnt = 0;
    }

    initializeResource() {
        var instructions = this.getInputInstruction();
        var insCycles = this.architecture.getExecCycle();
        var unitsSize = this.architecture.getUnitsSize();
        this.resourceMgt.initializeResource(instructions, insCycles, unitsSize);
    }

    reInitializResource() {
        this.resourceMgt.reInitializeResource();
    }

    setProcessEnv(instructions, execCycles, unitsSize) {
        this.setInstructions(instructions);
        this.setArchitecture(execCycles, unitsSize);
        this.initializeResource();
    }

    setArchitecture(execCycles, unitsSize) {
        this.architecture.setExecCycles(execCycles);
        this.architecture.setUnitsSize(unitsSize);
    }

    getExCycles(opName) {
        return this.architecture.getExecCycle(opName);
    }

    getUnitsSize(unitType) {
        return this.architecture.getUnitsSize(unitType);
    }

    setInstructions(instructions) {
        return this.architecture.setInstructions(instructions);
    }

    getInputInstruction() {
        return this.architecture.getInstruction();
    }

    getRAT(type) {
        return this.resourceMgt.getRAT(type);
    }

    getRSUnits(rsType) {
        return this.resourceMgt.getRSUnits(rsType);
    }

    getWLoads() {
        return this.resourceMgt.getWLoads();
    }

    getReqCycles(insHash) {

        if (insHash == undefined) {
            return -1;
        }
        var instruction = undefined;
        var wLoad = this.resourceMgt.getWLoads();
        wLoad.forEach(ins => {
            if (ins.id == insHash) {
                instruction = ins;
            }
        });


        var reqExecCycle = instruction.getReqCycle();
        return reqExecCycle;

    }

    getRsName(rsType, insId) {
        let rs = this.getRSUnits();
        let rsBuf = rs.getRsBufbyInsID(rsType, insId);
        return rsBuf.getRSName();
    }

    getRegName(rsName) {
        let rat = this.getRAT();
        return rat.getRegForRS(rsName);
    }

    getInsColor(insHash) {
        if (insHash == undefined) {
            return "";
        }

        var wLoads = this.resourceMgt.getWLoads();
        for (let indx = 0; indx < wLoads.length; ++indx) {
            if (wLoads[indx].id == insHash) {
                return wLoads[indx].color;
            }
        }

        return "";
    }

    getAllInsColor() {
        var insColors = {};
        var wLoads = this.resourceMgt.getWLoads();
        for (let indx = 0; indx < wLoads.length; ++indx) {
            insColors[wLoads[indx].id] = wLoads[indx].color;
        }

        return insColors;
    }

    getWLoadContent() {
        /**
         *  [
         *      {
         *          OP:
         *          Dest:
         *      },
         *      {
         *          OP:
         *          Dest:
         *      }
         *  ]
 
         */
        var wLoadList = [];
        var workLoads = this.resourceMgt.getWLoads();;
        if (workLoads == undefined) {
            console.log("Workload is empty");
            return;
        }

        workLoads.forEach(ins => {
            let dest, src1, src2;
            if (ins.type == OPType.sd) {
                dest = ins.getFirstOperand();
                src1 = ins.getDestOperand();
            } else {
                dest = ins.getDestOperand();
                src1 = ins.getFirstOperand();
            }
            src2 = ins.getSecOperand();

            wLoadList.push({
                "OP": ins.getOperator(),
                "Dest": dest,
                "Src1": src1,
                "Src2": src2,
                "CyIS": ins.getCycle(INSCycles.Issue),
                "CyExecStart": ins.getCycle(INSCycles.ExecStart),
                "CyExecEnd": ins.getCycle(INSCycles.ExecEnd),
                "CyExecution": ins.getCycle(INSCycles.ExecCycle),
                "CyWBack": ins.getCycle(INSCycles.WriteBack),
                "CyExecReq": ins.getReqCycle(),
                "StateType": ins.getStateType(),
                "Type": ins.type,
                "Id": ins.getID(),
                "Color": ins.color
            });
        });

        return wLoadList;
    }

    getIQContent() {
        var insQContent = [];
        var wLoadContents = this.getWLoadContent();
        wLoadContents.forEach(wLoad => {
            if (wLoad.StateType == StateType.Pending ||
                (wLoad.StateType == undefined)) {
                insQContent.push(wLoad);
            }
        });

        for (let indxI = 0, indxJ = insQContent.length - 1; indxI < indxJ; ++indxI, --indxJ) {
            let temp = insQContent[indxI];
            insQContent[indxI] = insQContent[indxJ];
            insQContent[indxJ] = temp;

        }
        return insQContent;
    }

    getRSContent() {
        var rsContents = [];
        var rs = this.getRSUnits();
        var buffers = rs.getBusyRSBuffers();

        buffers.forEach(rsbuf => {
            rsContents.push({
                "Hash": rsbuf.insHash,
                "Type": rsbuf.type,
                "ReqCycle": this.getReqCycles(rsbuf.insHash),
                "Name": rsbuf.name,
                "Status": (rsbuf.Busy == 0) ? "No" : "Yes",
                "Operator": (rsbuf.Operator == undefined) ? "" : rsbuf.Operator,
                "Vj": (rsbuf.Vj == undefined || rsbuf.Vj == 0) ? "" : rsbuf.Vj,
                "Vk": (rsbuf.Vk == undefined || rsbuf.Vk == 0) ? "" : rsbuf.Vk,
                "Qj": (rsbuf.Qj == undefined || rsbuf.Qj == 0) ? "" : rsbuf.Qj,
                "Qk": (rsbuf.Qk == undefined || rsbuf.Qk == 0) ? "" : rsbuf.Qk,
                "Address": (rsbuf.Address == undefined) ? "" : rsbuf.Address,
                "Color": this.getInsColor(rsbuf.insHash)
            });
        });

        return rsContents;
    }

    updateScalerReg(key, value){
        var rat = this.getRAT(RegType.Scaler);
        rat.updateScalerRat(key, value);
    }
    getRATContent(type) {
        var ratContents = [];
        var rat = this.getRAT(type).rtTable;
        rat.forEach(elem => {
            ratContents.push({
                "Hash": elem.id,
                "Name": elem.name,
                "Qi": elem.Qi,
                "Color": this.getInsColor(elem.id)
            });
        });

        return ratContents;
    }

    getFPContent() {
        var exeContent = [];
        var wLoadContents = this.getWLoadContent();
        wLoadContents.forEach(wLoad => {
            if (wLoad.StateType == StateType.Execution) {
                exeContent.push(wLoad);
            }
        });

        return exeContent;
    }

    hasInstruction(opTypes) {
        return this.resourceMgt.hasInstruction(opTypes);
    }


    findRAWDependency(wload, curIndx) {
        var rawDep = [];

        for (let indx = curIndx + 1; indx < wload.length; ++indx) {
            if (
                (wload[curIndx].dest == wload[indx].srcFirst) ||
                (wload[curIndx].dest == wload[indx].srcSecond)
            ) {
                rawDep.push(wload[indx].getID());
            }
        }

        return rawDep;
    }

    findOutputDependency(wload, curIndx) {
        var wawDep = [];

        for (let indx = curIndx + 1; indx < wload.length; ++indx) {
            if (wload[curIndx].dest == wload[indx].dest) {
                wawDep.push(wload[indx].getID());
            }
        }
        return wawDep;

    }

    findAntiDependency(wload, curIndx) {
        var warDep = [];

        for (let indx = curIndx + 1; indx < wload.length; ++indx) {
            if ((wload[curIndx].srcFirst == wload[indx].dest) ||
                (wload[curIndx].srcSecond == wload[indx].dest)) {
                warDep.push(wload[indx].getID());
            }
        }

        return warDep;
    }
    /**
     * {
     *  ins_id_0 : [ins_id_1, ins_id_2, ins_id_3]
     *  ins_id_2 : [ins_id_1, ins_id_2, ins_id_3]
     * }
     *[
        ins_id_0:{
        raw: id_2
        waw: id_3,
        war:0
        },
        
        ins_id_0:{
        raw: id_2
        waw: id_3,
        war:0
        }
     }
     */

    calculateDependency() {
        var dependencyList = [];
        var wLoads = this.resourceMgt.getWLoads();


        wLoads.forEach(function (element, indx) {
            let dependencyforId = {
                "posAt": indx,
                "insId": element.getID(),
                "color": element.color,
                "raw": this.findRAWDependency(wLoads, indx),
                "war": this.findAntiDependency(wLoads, indx),
                "waw": this.findOutputDependency(wLoads, indx)
            }
            dependencyList.push(dependencyforId)
        }, this);
        return dependencyList;
    }

    getInsAnnotationCount() {
        let counter = 0;
        var workLoads = this.getWLoads();
        for (let indx = 0; indx < workLoads.length; ++indx) {
            counter += workLoads[indx].isAnyAnnotation();
        }

        return counter;
    }

    cycleStepForward() {
        var workLoads = this.getWLoads();
        this.antInsturctionCnt = workLoads.length - 1;

        if (this.cycle == 0) {
            if (workLoads == undefined) {
                console.error("There is no instruction loaded");
                return 0;
            }
        }

        ++this.cycle;
        var insAlreadyIssued = false;
        var exDoneCounter = 0;
        for (let indx = 0; indx < workLoads.length
            && (insAlreadyIssued != true); ++indx) {

            var wLoad = workLoads[indx];
            var insCurState = wLoad.getState();

            if (insCurState == undefined) {
                insCurState = new Init(wLoad, this.cycle);
                insAlreadyIssued = true;
            }

            wLoad.insertAntNode();
            insCurState.process(this.cycle, this.resourceMgt, wLoad.getID());

            if (wLoad.getStateType() == StateType.Done) {
                ++exDoneCounter;
                if (exDoneCounter == (workLoads.length)) {
                    console.info("All instruction execution done");
                    return 0;
                }
                continue;
            }
        }

        return this.cycle;
    }

    cycleStepBack() {

        var workLoads = this.resourceMgt.getWLoads();
        this.antInsturctionCnt = workLoads.length - 1;

        if (this.cycle == 0) {
            if (workLoads == undefined) {
                console.error("There is no instruction loaded");
                return -1;
            }
        }


        this.reInitializResource();
        var cycle = this.cycle;
        this.cycle = 0;
        while (--cycle && cycle > 0) {
            this.cycleStepForward()
        }
        return this.cycle;
    }

    checkForAnnotation(instruction) {

        if (instruction.getState() == undefined ||
            instruction.getStateType() == StateType.Done) {
            return false;
        }

        return true;

    }

    forwardAnnotation() {

        var workLoads = this.resourceMgt.getWLoads();

        while (
            this.antInsturctionCnt >= 0 &&
            this.checkForAnnotation(workLoads[this.antInsturctionCnt]) == false) {
            --this.antInsturctionCnt;
        }

        if (this.antInsturctionCnt < 0) {
            console.error("No instruction to annotate");
            return undefined;
        }

        var wLoad = workLoads[this.antInsturctionCnt];
        var row = this.antInsturctionCnt;
        --this.antInsturctionCnt;
        var annotations = wLoad.getAnnotation();
        var color = wLoad.getColor();
        return {
            "ant": annotations,
            "color": color,
            "row": row
        };
    }

    backwardAnnotation() {

        var workLoads = this.resourceMgt.getWLoads();
        while (
            this.antInsturctionCnt >= 0 &&
            this.checkForAnnotation(workLoads[this.antInsturctionCnt]) == false) {
            --this.antInsturctionCnt;
        }
        if (this.antInsturctionCnt < 0) {
            console.error("No instruction to annotate");
            return undefined;
        }

        var wLoad = workLoads[this.antInsturctionCnt];

        var annotations = wLoad.getAnnotation();
        wLoad.goBack();
        var color = wLoad.getColor();

        --this.antInsturctionCnt;

        return {
            "ant": annotations,
            "color": color
        };
    }

    showWorkload() {
        var workLoads = this.resourceMgt.getWLoads();
        let buffer = [];
        for (let i = 0; i <= workLoads.length; ++i) {
            buffer.push(Array(7).fill(''));
        }

        {
            buffer[0][0] = "Operator";
            buffer[0][1] = "Dest";
            buffer[0][2] = "Src1";
            buffer[0][3] = "Src2";
            buffer[0][4] = "ISSUE";
            buffer[0][5] = "EXECUTE";
            buffer[0][6] = "WRITE-BACK";
        }

        for (let i = 1; i <= workLoads.length; ++i) {
            let instruction = workLoads[i - 1];
            buffer[i][0] = instruction.getOperator();
            buffer[i][1] = instruction.getDestOperand();
            buffer[i][2] = instruction.getFirstOperand();
            buffer[i][3] = instruction.getSecOperand();
            buffer[i][4] = instruction.getCycle(INSCycles.Issue);

            let execCyclesInterval = undefined;
            if (instruction.getCycle(INSCycles.ExecStart) != undefined) {
                execCyclesInterval = instruction.getCycle(INSCycles.ExecStart) + "-"
            }

            if (instruction.getCycle(INSCycles.ExecEnd) != undefined) {
                execCyclesInterval = execCyclesInterval + instruction.getCycle(INSCycles.ExecEnd);
            }

            buffer[i][5] = execCyclesInterval;

            buffer[i][6] = instruction.getCycle(INSCycles.WriteBack);
        }

        console.table(buffer);

    }
}