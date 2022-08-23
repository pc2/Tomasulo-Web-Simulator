function deepCopy(src) {
    var clone = JSON.parse(JSON.stringify(src));
    var dest = JSON.parse(clone);
    return dest;
}

OPDictionary = {
    "add": ["add.d", "add", "dadd", "addd"],
    "sub": ["sub.d", "sub", "subd", "dsub"],
    "mul": ["mul.d", "mul", "muld", "dmul"],
    "div": ["div.d", "div", "divd", "ddiv"],
    "ld": ["ld.d", "ld", "l.d", "ldd", "dld"],
    "sd": ["sd.d", "sd", "sdd", "dsd", "s.d"],
    "bneq": ["BNEQ", "bneq"],
    "beqz": ["BEQZ", "beqz"],
    "bnez": ["BNEZ", "bnez"]

}
Object.freeze(OPDictionary);

const OPType = {
    "add": 0,
    "sub": 1,
    "mul": 2,
    "div": 3,
    "ld": 4,
    "sd": 5,
    "bneq": 6,
    "beqz": 7,
    "bnez": 8
};
Object.freeze(OPType);

const OPClass = {
    "Integer": [OPType.add, OPType.sub],
    "Multiplier": [OPType.mul, OPType.div],
    "Loader": [OPType.ld, OPType.sd],
    "Branch": [OPType.bneq, OPType.beqz, OPType.bnez]
};
Object.freeze(OPClass);


OP2RSName = {
    "add": "FPAdd",
    "sub": "FPAdd",
    "mul": "FPMul",
    "div": "FPMul",
    "ld": "FPLd",
    "sd": "FPLd",
    "bneq": "Branch",
    "beqz": "Branch",
    "bnez": "Branch"
}
Object.freeze(OP2RSName);

const RSType = {
    "FPLd": 0,
    "FPAdd": 1,
    "FPMul": 2
};
Object.freeze(RSType);

const INSCycles = {
    "Issue": 0,
    "ExecStart": 1,
    "ExecEnd": 2,
    "ExecCycle": 3,
    "WriteBack": 4
}
Object.freeze(INSCycles);

const ResourceType = {
    "WorkLoad": 0,
    "RSUnits": 1,
    "RAT": 2,
    "FUnits": 3
};
Object.freeze(ResourceType);

const StateType = {
    "Pending": 0,
    "Issue": 1,
    "Execution": 2,
    "WriteBack": 3,
    "Done": 4
};
Object.freeze(StateType);

function getStateType(stateName) {
    return StateType[stateName];
}

const RSStatusFlag = {
    "No": 0,
    "Yes": 1
};
Object.freeze(RSStatusFlag);

const RegType = {
    "Float": 0,
    "Scaler": 1
};
Object.freeze(RegType);


function getUniqueOPName(opName) {
    let ret = undefined;
    opName = opName.toLowerCase();
    var keys = Object.keys(OPDictionary);
    for (var i = 0; i < keys.length; i++) {

        if (OPDictionary[keys[i]].indexOf(opName) != -1) {
            ret = keys[i];
            break;
        }
        else
            continue;
    }

    return ret;
}

function getOp2RSName(opName) {
    let ret = opName;
    opName = getUniqueOPName(opName);
    if (opName == undefined) {
        console.error(opName + "is unknown");
        return;
    }

    return OP2RSName[opName];
}


function getOPType(opName) {
    opName = getUniqueOPName(opName);
    if (opName == undefined) {
        console.error(opName + "Operation is unknown");
        return;
    }

    return OPType[opName];
}



/**
 * This function find the dictionary key by value and return the key if found,
 * 
 * @param {} object 
 * @param {*} value 
 * @returns ??
 */
function getKeyByValue(object, value) {
    return Object.keys(object).find(key => object[key] === value);
}

function getRSType(opName) {
    let opType = getOPType(opName);

    if (opType == OPType.add ||
        opType == OPType.sub) {
        return RSType.FPAdd;
    }
    else if (opType == OPType.mul ||
        opType == OPType.div) {
        return RSType.FPMul;
    }
    else if ((opType == OPType.ld) ||
        (opType == OPType.sd)) {
        return RSType.FPLd;
    }
}

function getOPClass(opName) {
    let opType = getOPType(opName);
    var keys = Object.keys(OPClass);

    for (let i = 0; i < keys.length; i++) {
        let values = OPClass[keys[i]];
        for (let j = 0; j < values.length; ++j) {
            if (values[j] == opType) {
                return keys[i];
            }
        }
    }

    return undefined;
}


function getRSName(type) {
    var rsName = getKeyByValue(RSType, type);
    return rsName;
}

function getStateName(type) {
    var stateName = getKeyByValue(StateType, type);
    return stateName;
}

function isAddress(operand) {
    return !isNaN(operand) &&
        isFinite(operand);
}

function isNumber(operand) {
    return isAddress(operand);
}

function getRandomColor(insNumber) {
    var distinctColors = [
        '#40e7e7',
        '#b6eb4d',
        '#ffa07a',
        '#9cf59c',
        '#f2d532',
        '#d6dff89f',
        '#a4f9f9',
        '#d8bfd8',
        '#eee8aa',
        '#556b2f',
        '#008080',
        '#9acd32',
        '#ffd700',
        '#00fa9a',
        '#4169e1',
        '#00ffff',
        '#00ff00',
        '#41f5b098'];
    var letters = 'ABCDEF';
    var color = '#';

    if (insNumber >= distinctColors.length) {
        for (var i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * letters.length)];
        }
    } else {
        color = distinctColors[insNumber];
    }

    return color;
}

