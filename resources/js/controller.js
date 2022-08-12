class FrontController {
    constructor() {
        this.mgt = new ProcessManager();
    }

    setExecCycles(insType, cycleNUm){

    }

    setFunits(fUnit, number){

    }

    setInstructions(instructionList){
        return this.mgt.initializeWLoad(instructionList);
    }

    cycleSteps(){

    }


    }
