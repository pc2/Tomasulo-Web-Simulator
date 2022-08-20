
function getDest(ins) {
    var dest;
    if (getOPType(ins.OP) == OPType.sd) {
        dest = Number.isInteger(
            parseInt(ins.Src1)
        ) ? ins.Src2 : ins.Src1;
    } else {
        dest = ins.Dest;
    }

    return dest;
}

function getSrc(ins, OperandNumber = 1) {
    var src;
    if (getOPType(ins.OP) == OPType.sd) {
        src = ins.Dest;
    } else {
        if (OperandNumber == 1) {
            src = ins.Src1;
        }
        else {
            src = ins.Src2;
        }
    }

    return src;
}

function parseInstructions(content) {
    var insLines = content.split("\n");

    if (insLines[insLines.length - 1].length == 0) {
        insLines.pop();
    }
    var insList = [];
    insLines.forEach(function (line, indx) {
        line = line.replace(/\r?\n|\r/g, "");
        let insParts = line.split(/[ ,]+/);
        if (insParts.length != 4) {
            console.log("something missing in instructions input");
            return undefined;
        }

        insList.push(
            {
                "OP": insParts[0],
                "Dest": insParts[1],
                "Src1": insParts[2],
                "Src2": insParts[3],
            }
        );

    });

    return insList;
}

function LoadTestCase_2() {
    var instructions = [
        { OP: 'l.d', Dest: 'f6', Src1: '34+', Src2: 's2' },
        { OP: 'l.d', Dest: 'f2', Src1: '45+', Src2: 's3' },
        { OP: 'mul.d', Dest: 'f0', Src1: 'f2', Src2: 'f4' },
        { OP: 'sub.d', Dest: 'f8', Src1: 'f6', Src2: 'f2' },
        { OP: 'div.d', Dest: 'f10', Src1: 'f0', Src2: 'f6' },
        { OP: 'add.d', Dest: 'f6', Src1: 'f8', Src2: 'f2' }
    ]
    showAutoSelectionTable(instructions);
}

function LoadTestCase_1() {
    var instructions = [
        { OP: 'div.d', Dest: 'f0', Src1: 'f2', Src2: 'f4' },
        { OP: 'add.d', Dest: 'f6', Src1: 'f0', Src2: 'f8' },
        { OP: 'sub.d', Dest: 'f8', Src1: 'f10', Src2: 'f14' },
        { OP: 'mul.d', Dest: 'f6', Src1: 'f10', Src2: 'f8' }
    ]
    showAutoSelectionTable(instructions);
}

function LoadFromFile(e) {
    let input = document.createElement('input');
    input.type = 'file';
    input.onchange = _ => {
        let files = Array.from(input.files);
        var file = files[0];
        var reader = new FileReader();
        reader.readAsText(file);
        reader.onload = function (progressEvent) {
            console.log(reader.result);
            let instructions = parseInstructions(reader.result);
            //validate(instructions);
            if (instructions != undefined) {
                showAutoSelectionTable(instructions);
                //generateENV(instructions);
            }
        };

        reader.onerror = function () {
            console.log(reader.error);
        };

    };
    input.click();

}


function getLoopBodyOnly(instruction){

   var loopLevel=undefined;
   var loopBranchLevel= undefined;


    for(let indx=0; indx < instruction.length; ++indx){
        
        if(instruction.Level.length != 0){
            loopLevel = instruction.Level;  
        }
        
        if(getOp2RSName(instruction.OP) ==OPClass.Branch){
            loopBranchLevel=instruction.Level;
            var levelName = loopBranchLevel.split("_")[1];
            if(levelName == loopLevel){
                break;
            }
            else{
                continue;
            }
        }
    }

}


function checkForBranch(instruction){
    for(let indx=1; indx < instruction.length; ++indx){
        if(getOp2RSName(instruction[indx].OP) ==OPClass.Branch){
            return indx;
        }
    }
    return false;
}

function collectInstructionsFromUI() {

    var inputTable = document.getElementById("insInputTable");
    var tBody = inputTable.tBodies[0];
    var rowCount = tBody.rows.length;

    let instructions = [];
    for (let rIndx = 0; rIndx < rowCount - 1; ++rIndx) {
        let row = tBody.rows[rIndx];
        let ins = {};
        for (let cIndx = 1; cIndx < row.cells.length - 1; ++cIndx) {
            if(!row.cells[cIndx].hasChildNodes()){
                continue;
            }
            let id = row.cells[cIndx].childNodes[0].id;
            let elem = document.getElementById(id);
            let val = elem.options[elem.selectedIndex].text;
            ins[id.split("-")[0]] = val;
        }
        instructions.push(ins);
    }

    return instructions;

}

function collectExecCycleFromUI() {

    var elemCycles = document.querySelectorAll('#cCyclesFormText');
    var ret = {};
    for (let indx = 0; indx < elemCycles.length; ++indx) {

        ret[elemCycles[indx].name] = elemCycles[indx].value;
    }
    return ret;
}

function collectUnitsSizeFromUI() {
    var elemUnits = document.querySelectorAll('#cUnitsFormText');
    var ret = {};
    for (let indx = 0; indx < elemUnits.length; ++indx) {

        ret[elemUnits[indx].name] = elemUnits[indx].value;
    }
    return ret;
}
