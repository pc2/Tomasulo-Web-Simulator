class Instruction {
    constructor(instruction, cycle, color, posAtQ, rootInsHash=undefined) {
        this.operator = instruction.OP;
        this.type = getOPType(this.operator);
        this.updateOperand(this.type, instruction);
        this.posAtQ = posAtQ;
        this.state = undefined;

        this.id = "id_" + Math.random().toString(36).slice(-10);
        this.orgInsHash = (rootInsHash==undefined)?this.id:rootInsHash;;
        this.reqCycle = parseInt(cycle);
        this.exeCycle = parseInt(cycle);
        this.issueCycle = 0;
        this.exStartCycle = 0;
        this.exEndCycle = 0;
        this.wbCycle = 0;

        this.color = color;
        this.antTree = new AnnotationTree();
        this.antKeyTrack = undefined;
    }

    findIntegerOperand(operand) {
        return Number.isInteger(
            parseInt(operand)
        );
    }
    updateOperand(type, instruction) {
        
        if(type == OPType.sd &&
            instruction.Dest.startsWith("S") && 
            instruction.Src1.startsWith("F")) {
                this.srcFirst = instruction.Src1;
                this.srcSecond = instruction.Src2;
                this.dest = instruction.Dest;
                return;
        }
        if (this.findIntegerOperand(instruction.Src1)) {
            this.srcFirst = instruction.Src2;
            this.srcSecond = instruction.Src1;
        }
        else if (this.findIntegerOperand(instruction.Src2)) {
            this.srcFirst = instruction.Src1;
            this.srcSecond = instruction.Src2;
        } else {
            this.srcFirst = instruction.Src1;
            this.srcSecond = instruction.Src2;
        }

        if (type == OPType.sd) {
            let tempOperand = this.srcFirst;
            this.srcFirst = instruction.Dest;
            this.dest = tempOperand;
        } else {
            this.dest = instruction.Dest;
        }

    }

    resetCycles() {
        this.issueCycle = 0;
        this.exStartCycle = 0;
        this.exEndCycle = 0;
        this.wbCycle = 0;
        this.reqCycle = this.exeCycle;
    }


    setCycle(type, cycle) {
        switch (type) {
            case INSCycles.Issue:
                this.issueCycle = cycle;
                break;
            case INSCycles.ExecStart:
                this.exStartCycle = cycle;
                break;
            case INSCycles.ExecEnd:
                this.exEndCycle = cycle;
                break;
            case INSCycles.ExecCycle:
                this.exeCycle = cycle;
                break;
            case INSCycles.WriteBack:
                this.wbCycle = cycle;
                break;
            default:
                console.log("Cycle type not defined");
                break;
        }
    }

    getCycle(type) {
        switch (type) {
            case INSCycles.Issue:
                return this.issueCycle;
            case INSCycles.ExecStart:
                return this.exStartCycle;
            case INSCycles.ExecEnd:
                return this.exEndCycle;
            case INSCycles.WriteBack:
                return this.wbCycle;
            case INSCycles.ExecCycle:
                return this.exeCycle;
            default:
                console.log("Cycle type not defined");
                break;
        }
    }

    isExpandedInstruction(){
        return this.orgInsHash != this.id;
    }

    getType() {
        return this.type;
    }
    getState() {
        return this.state;
    }

    getColor() {
        return this.color;
    }

    getStateType() {
        if (this.getState() != undefined) {
            return this.state.getType();
        }
        return undefined;
    }

    getID() {
        return this.id;
    }

    getReqCycle() {
        return this.reqCycle;
    }

    updateReqCycle() {
        --this.reqCycle;
    }

    getFirstOperand() {
        return this.srcFirst;
    }

    getSecOperand() {
        return this.srcSecond;
    }

    getDestOperand() {
        return this.dest;
    }

    getOperator() {
        return this.operator;
    }

    setState(state) {
        this.state = state;
    }

    insertAnnotation(antMsg, rowNumber, resourceType, columnNumber = 0) {

        var ant = new Annotation(antMsg, rowNumber, resourceType, columnNumber);

        var retNode = this.antTree.SearchAntNode(this.antTree.Root(), this.antKeyTrack);
        this.antTree.AddAntatNode(retNode, ant);

    }

    insertAntNode() {
        var ret = this.antTree.InsertNode();
        this.antKeyTrack = ret.Key();
    }

    goBack() {
        var ret = this.antTree.MoveUp();
        if (ret == undefined) {
            return undefined;
        }
        this.antKeyTrack = ret.Key();
        return 0;
    }

    getAnnotation() {
        var retAnnotations = [];
        if (this.antKeyTrack == undefined) {
            return retAnnotations;
        }

        var antNode = this.antTree.SearchAntNode(this.antTree.Root(), this.antKeyTrack);

        if (antNode == undefined) {
            return undefined;
        }
        var annotations = antNode.Annotation();

        for (let indx = 0; indx < annotations.length; ++indx) {
            retAnnotations.push({
                "message": annotations[indx].message,
                "row": annotations[indx].insRow,
                "resourceType": annotations[indx].component,
                "pointsTo": annotations[indx].pointsTo
            });
        }
        return retAnnotations;
    }

    getAntCounter() {
        if (this.antKeyTrack == undefined) {
            return 0;
        }
        var antNode = this.antTree.SearchAntNode(this.antTree.Root(), this.antKeyTrack);
        var annotations = antNode.Annotation();
        if ((antNode == undefined) || (annotations.length == 0)) {
            return 0;
        }

        return annotations.length;
    }

    isAnyAnnotation() {
        var counter = this.getAntCounter();
        return counter != 0;
    }
}
