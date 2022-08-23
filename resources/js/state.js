class State {
    constructor(stateType, cycle) {
        this.sName = getStateName(stateType);
        this.sType = stateType;
        this.sCycle = cycle;
    }

    getType() {
        return this.sType;
    }

    getState() {
        return this;
    }

    moveState(cycle, resManager, insID) {
        this.process(cycle, resManager, insID);
    }
}

class Init extends State {
    constructor(instruction, cycle = 0) {
        super(StateType.Pending, cycle);
        instruction.setState(this);
        instruction.resetCycles();
    }

    process(cycle, resManager, insID) {
        var wLoad = resManager.getWLoadByID(insID);
        if (wLoad == undefined) {
            console.error("Instruction ID does not found in workloads");
            return;
        }

        var rs = resManager.getRSUnits();
        var antMsg = "";
        var reqRSType = getRSType(wLoad.getOperator());

        if (rs.isAvailable(reqRSType) == false) {
            console.log("There is no available " + getRSName(reqRSType) +
                "rs station to issue instruction type " +
                wLoad.getOperator());

            antMsg = "Instruction " + wLoad.posAtQ +
                " can not be issued because there is no free RS station to issue";
            wLoad.insertAnnotation(antMsg, wLoad.posAtQ, ResourceType.WorkLoad, 0);
        }
        else if (!resManager.depInsIssued(wLoad)) {
            antMsg = "Instruction " + wLoad.posAtQ + " can not be issued at cycle " + cycle + " because of previous instruction did not complete";
            wLoad.insertAnnotation(antMsg, wLoad.posAtQ, ResourceType.WorkLoad, 6);

        }

        else {

            antMsg = "Instruction " + wLoad.posAtQ + " issued at cycle " + cycle;
            wLoad.insertAnnotation(antMsg, wLoad.posAtQ, ResourceType.WorkLoad, 6);
            let nextState = new Issue(wLoad, cycle);
            nextState.moveState(cycle, resManager, insID);
        }
    }
}

class Issue extends State {

    constructor(instruction, cycle) {
        super(StateType.Issue, cycle);
        instruction.setCycle(INSCycles.Issue, cycle);
        instruction.setState(this);
    }

    setRSBuffer(rsbuffer, rat, instruction, antMsg = "", insNumber) {

        var rstype = rsbuffer.getType();
        let dest = instruction.getDestOperand();
        let src1 = instruction.getFirstOperand();
        let src2 = instruction.getSecOperand();
        let address = undefined;
        let textMsg = "";

        if (rstype == RSType.FPLd) {
            if (isAddress(parseInt(src1)) == true) {
                address = src1;
                src1 = undefined;
            }
            else {
                address = src2;
                src2 = undefined;
            }

            rsbuffer.Address = address;
        }

        if (src1 != undefined && !rat.isRegType(rsbuffer.Vj)) {
            let ratCtx = rat.getRATContent(src1);
            if (!rat.isRegType(ratCtx)) {
                rsbuffer.Qj = ratCtx;
                textMsg += " Mark Qj with " + ratCtx + " indicating Src1 Vj comes from this RS unit. ";
            }
            else {
                if (ratCtx.length != 0) {
                    rsbuffer.Vj = ratCtx;
                    textMsg += "Register " + src1 + " generated the value " + ratCtx;
                }
                else {
                    rsbuffer.Vj = "Val(" + src1 + ")";
                    textMsg += " Copy the value of register " + src1 + " into Src1 Vj (“renaming”).";
                }
                rsbuffer.Qj = 0;
            }

        }

        if (src2 != undefined && !rat.isRegType(rsbuffer.Vk)) {
            let ratCtx = rat.getRATContent(src2);
            if (!rat.isRegType(ratCtx)) {
                rsbuffer.Qk = ratCtx;
                textMsg += " Mark Qk with " + ratCtx + " indicating Src2 Vk comes from this RS unit. ";
            }
            else {
                if (ratCtx.length != 0) {
                    rsbuffer.Vk = ratCtx;
                    textMsg += "Register " + src2 + " generated the value " + ratCtx;
                }
                else {
                    rsbuffer.Vk = "Val(" + src2 + ")";
                    textMsg += " Copy the value of register " + src2 + " into Src2 Vk (“renaming”).";
                }
                rsbuffer.Qk = 0;
            }

        }


        rsbuffer.Busy = RSStatusFlag.Yes;
        rsbuffer.Operator = instruction.getOperator();
        rsbuffer.dest = instruction.getDestOperand();
        rsbuffer.insHash = instruction.getID();
        if (instruction.getType() == OPType.sd) {
            rsbuffer.dest = "";
        }
        rat.setRAT(rsbuffer.dest, rsbuffer.insHash, rsbuffer.name);
        if (antMsg.length != 0) {
            instruction.insertAnnotation((antMsg + textMsg), insNumber, ResourceType.RSUnits, 1);
        }

    }

    process(cycle, resManager, insID) {
        var rs = resManager.getRSUnits();
        var rat = resManager.getRAT();

        var wLoad = resManager.getWLoadByID(insID);
        if (wLoad == undefined) {
            console.error("Instruction ID does not found in workloads");
            return;
        }

        var antMsg = "";
        var reqRSType = getRSType(wLoad.getOperator());
        var rsbuffer = rs.getRSBuffer(reqRSType, wLoad.getID());
        let rsName = rsbuffer.getRSName();


        if (rsbuffer.isBufferSet() == false) {
            antMsg = "Insutruction " + wLoad.posAtQ + " occupied the RS unit " + rsName + " .";


            this.setRSBuffer(rsbuffer, rat, wLoad, antMsg, wLoad.posAtQ);
            let regName = rat.getRegForRS(rsName);
            if (regName != undefined) {
                antMsg = "Register " + regName + " will be filled with the results from the RS unit " + rsName;
                wLoad.insertAnnotation(antMsg, wLoad.posAtQ, ResourceType.RAT, 0);
            }

        }
        else if (rsbuffer.isOperandReady()) {

            if (wLoad.isExpandedInstruction() &&
                (wLoad.getType() == OPType.ld)) {
                let orgIns = resManager.getWLoadByID(wLoad.orgInsHash);
                let stateType = orgIns.getStateType();
                if (stateType < StateType.WriteBack) {
                    antMsg = "Load Instruction stalls (waits for the first L1 cache miss)";
                    wLoad.insertAnnotation(antMsg, wLoad.posAtQ, ResourceType.WorkLoad, 6);
                    return;
                }
            }

            antMsg = "Instruction " + wLoad.posAtQ + " started execution. It takes " + wLoad.getReqCycle() + " cycles to complete: Format: \"start-end\"";
            wLoad.insertAnnotation(antMsg, wLoad.posAtQ, ResourceType.WorkLoad, 7);

            let nextState = new Execution(wLoad, cycle);
            nextState.moveState(cycle, resManager, insID);
        }

        else {



            // update the RS
            let tempQj = rsbuffer.Qj;
            let tempQk = rsbuffer.Qk;
            let targetReg = "";
            let tempVal = "";
            let columnNumber = 0;

            //this.setRSBuffer(rsbuffer, rat, wLoad);

            if (rsbuffer.Qj == 0 && rsbuffer.Qk == 0) {
                if (tempQj != 0) {
                    tempVal = tempQj;
                    targetReg = "Src1 Vj";
                    columnNumber = 5;
                }
                else {
                    tempVal = tempQk;
                    targetReg = "Src2 Vk";
                    columnNumber = 6;
                }
                antMsg = rsName + " sees " + tempVal + " on CDB matches its source and picks up the value for " + rsbuffer.Vj + "  " + targetReg;
                columnNumber = 3;
            }
            else {
                if (rsbuffer.Qj != 0) {
                    columnNumber = 6;
                    tempVal = rsbuffer.Qj
                } else {
                    columnNumber = 7;
                    tempVal = rsbuffer.Qk
                }

                antMsg = "Instruction " + wLoad.posAtQ + ": RAW Hazard detected. Wait for the " + tempVal + " resolving";

            }
            wLoad.insertAnnotation(antMsg, wLoad.posAtQ, ResourceType.RSUnits, columnNumber);

        }

    }
}

class Execution extends State {
    constructor(instruction, cycle) {
        super(StateType.Execution, cycle);
        instruction.setCycle(INSCycles.ExecStart, cycle);
        instruction.setState(this);
    }

    process(cycle, resManager, insID) {
        var rs = resManager.getRSUnits();
        var rat = resManager.getRAT();

        var wLoad = resManager.getWLoadByID(insID);
        if (wLoad == undefined) {
            console.error("insId does not found in workloads");
            return;
        }

        var antMsg = "";
        wLoad.updateReqCycle();
        var reqInsCycle = wLoad.getReqCycle();


        if (reqInsCycle == 0) {
            wLoad.setCycle(INSCycles.ExecEnd, cycle);
            antMsg = " finishes execution at the of cycle " + cycle;
            wLoad.insertAnnotation(antMsg, wLoad.posAtQ, ResourceType.WorkLoad, 7);
        }

        else if (reqInsCycle < 0) {
            // antMsg = "Execution Done and jump to writeback";
            // wLoad.insertAnnotation(antMsg, wLoad.posAtQ, ResourceType.RSUnits);
            let nextState = new WriteBack(wLoad, cycle);
            nextState.moveState(cycle, resManager, insID);
        } else {
            antMsg = reqInsCycle + "  cycle remaining to execute";
            wLoad.insertAnnotation(antMsg, wLoad.posAtQ, ResourceType.RSUnits, 0);
            ;
        }
    }
}

class WriteBack extends State {

    constructor(instruction, cycle) {
        super(StateType.WriteBack, cycle);
        instruction.setCycle(INSCycles.WriteBack, cycle);
        instruction.setState(this);
    }

    process(cycle, resManager, insID) {
        var rs = resManager.getRSUnits();
        var rat = resManager.getRAT();

        var wLoad = resManager.getWLoadByID(insID);
        if (wLoad == undefined) {
            console.error("insId does not found in workloads");
            return;
        }

        if ((wLoad.getCycle(INSCycles.WriteBack) + 1) == cycle) {


            let nextState = new Finish(wLoad, cycle);
            nextState.moveState(cycle, resManager, insID);
            return;
        }


        var reqRSType = getRSType(wLoad.getOperator());
        var rsbuffer = rs.getRSBuffer(reqRSType, wLoad.getID());
        let value = rat.updateRat(wLoad.getDestOperand(), wLoad.getID(), rsbuffer.getRSName());


        rs.updateRSOperand(rsbuffer.getRSName(), value);
        var antMsg = "Instruction " + wLoad.posAtQ + " writes back. Load buffer sends result value " + value + " and id " + rsbuffer.getRSName() + " (“come from”) over CDB";
        wLoad.insertAnnotation(antMsg, wLoad.posAtQ, ResourceType.WorkLoad, 8);

        if (rsbuffer != undefined) {
            rs.release(rsbuffer);
        }


    }

    processBack(cycle, rs, rat) {
        var ins = this.Instruction();
        var rsName = "";
        rat.updateBackRat(ins.getDestOperand(), rsName);
    }

}

class Finish extends State {

    constructor(instruction, cycle = 0) {
        super(StateType.Done, cycle);
        instruction.setState(this);
    }

    process(cycle, resManager, insID) {
        var rs = resManager.getRSUnits();
        var rat = resManager.getRAT();

        var wLoad = resManager.getWLoadByID(insID);
        if (wLoad == undefined) {
            console.error("insId does not found in workloads");
            return;
        }

        //do clean up if necessary, usually marked as instruction already processed
    }

    processBack(cycle, rs, rat) {
        var ins = this.Instruction();
        this.moveStateBack(new WriteBack(ins, cycle), cycle, rs, rat);
    }

}




