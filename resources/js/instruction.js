class Instruction {
    constructor(instruction, cycle, color, posAtQ) {
        this.operator = instruction.OP;
        this.dest = instruction.Dest;
        this.srcFirst = instruction.Src1;
        this.srcSecond = instruction.Src2;
        this.type = getOPType(this.operator);
        this.posAtQ = posAtQ;

        this.state = undefined;

        this.id = Math.random().toString(36).slice(-10);
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
        if (antNode == undefined) {
            return 0;
        }

        var annotations = antNode.Annotation();
        return annotations.length;
    }
}
