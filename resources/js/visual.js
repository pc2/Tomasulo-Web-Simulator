
var instructions = "Ld F6 34+ S2 2|Ld F2 45+ S3 2|Mul.d F0 F2 F4 10|Sub F8 F6 F2 2|Div.d F10 F0 F6 40|add.d F6 F8 F2 2";
/** L.d F6 34+ S2 2|L.d F2 45+ S3 2|Mul.d F0 F2 F4 5| */

class Visual {
    constructor() {
        this.mgt = new ProcessManager();
    }

    setEnv(instructions, execCycles, unitsSize) {
        this.mgt.setInstructions(instructions);
        this.mgt.setArchitecture(execCycles, unitsSize);
        this.mgt.initializeResource();
    }

    setInstructions(instructions) {
        return
    }

    getWLoadContent() {
        return this.mgt.getWLoadContent();
    }

    getIQContent() {
        return this.mgt.getIQContent();
    }

    getRSContent() {
        return this.mgt.getRSContent();
    }

    getFPContent() {
        return this.mgt.getFPContent();
    }

    getExCycles(opName) {
        return this.mgt.getExCycles(opName);
    }

    getReqCycles(insHash) {
        return this.mgt.getReqCycles(insHash);
    }

    getAllInsColor() {

        return this.mgt.getAllInsColor();
    }

    getInsColor(insHash) {
        if (insHash == undefined) {
            return "";
        }
        return this.mgt.getInsColor(insHash);
    }

    cycleSteps() {

        return this.mgt.cycleSteps();

    }

    cycleStepBack() {
        return this.mgt.cycleStepBack();
    }

    getRSUnits() {
        return this.mgt.getRSUnits();
    }
    hasInstruction(OPClassType) {
        return this.mgt.hasInstruction(OPClassType);
    }

    getRAT() {
        return this.mgt.getRAT();
    }



}