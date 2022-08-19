var _height = undefined;
var _width = undefined;
var ClientWidth = undefined;
var ClientHeight = undefined;


function upperMidPoint(Ax, Ay, Bx, By) {
    return {
        x: Ax + (Bx - Ax) / 2,
        y: Ay
    }
}

function lowerMidPoint(Ax, Ay, Bx, By) {
    return {
        x: Ax + (Bx - Ax) / 2,
        y: By
    }
}

function canvasSetup(cWidth, cHeight) {
    _width = cWidth / 40;
    _height = cHeight / 40;
}
function chunkString(str, length) {
    return str.match(new RegExp('.{1,' + length + '}', 'g'));
}

function roundRect(context, x, y, w, h, radius) {

    var r = x + w;
    var b = y + h;
    context.beginPath();
    context.strokeStyle = "green";
    context.lineWidth = "4";
    context.moveTo(x + radius, y);
    context.lineTo(r - radius, y);
    context.quadraticCurveTo(r, y, r, y + radius);
    context.lineTo(r, y + h - radius);
    context.quadraticCurveTo(r, b, r - radius, b);
    context.lineTo(x + radius, b);
    context.quadraticCurveTo(x, b, x, b - radius);
    context.lineTo(x, y + radius);
    context.quadraticCurveTo(x, y, x + radius, y);
    context.fill();
}

function canvas_textBox(context, divWidth, Sx, Sy, message, cX, cY) {

    var textLen = context.measureText(message).width + 50;
    var recWidth;
    var recHeight;
    var messages = [];
    if (textLen >= (divWidth * .5)) {
        recWidth = divWidth * .5;
        recHeight = (textLen / recWidth) * 50;
        let strLen = Math.floor(recWidth * 0.125);
        messages = chunkString(message, strLen);

    } else {
        recWidth = textLen + 50;
        recHeight = 50;
        messages.push(message);
    }
    context.fillStyle = '#3388FF';
    roundRect(context, Sx, Sy, recWidth + 15, recHeight, 20);
    context.fillStyle = '#FFFFFF';
    context.font = '15px Roboto Slab';
    context.lineWidth = 2;


    Sy += 25;

    for (let indx = 0; indx < messages.length; ++indx) {
        context.fillText(messages[indx], Sx + 20, Sy + indx * 15, recWidth);
    }

    context.strokeStyle = '#808080';
    context.lineWidth = 3;
    if (cY - Sy > 0) {
        Sy += recHeight;
    }
    canvas_arrow(context, Sx + recWidth / 2, Sy - 25, cX, cY);
    context.stroke();
}

function drawAntBox(theCanvas, boxPosX, boxPosY, message, points2X, points2Y) {
    var context = theCanvas.getContext("2d");
    context.beginPath();
    context.clearRect(0, 0, theCanvas.width, theCanvas.height);
    canvas_textBox(context, theCanvas.width, boxPosX, boxPosY, message, points2X, points2Y);
    context.closePath();
}

function canvas_line(context, fromx, fromy, tox, toy) {
    context.moveTo(fromx, fromy);
    context.lineTo(tox, toy);
}

function canvas_arrow(context, fromx, fromy, tox, toy) {
    var headlen = 10; // length of head in pixels
    var dx = tox - fromx;
    var dy = toy - fromy;
    var angle = Math.atan2(dy, dx);

    context.moveTo(fromx, fromy);
    context.lineTo(tox, toy);
    context.lineTo(tox - headlen * Math.cos(angle - Math.PI / 6), toy - headlen * Math.sin(angle - Math.PI / 6));
    context.moveTo(tox, toy);
    context.lineTo(tox - headlen * Math.cos(angle + Math.PI / 6), toy - headlen * Math.sin(angle + Math.PI / 6));
}



function drawDependency(theCanvas, insCounter, dependency){
    var context = theCanvas.getContext("2d");

    context.clearRect(0, 0, theCanvas.width, theCanvas.height);
    var startX = 200;
    var startY = 50;
    var radius = 25;
    var distance = 75;


    for (let indx = 0; indx < insCounter; ++indx) {
        context.beginPath();

        startY += (radius + (indx * distance));
        context.arc(startX, startY, radius, 0, 2 * Math.PI, true);

        context.lineWidth = 2;
        context.strokeStyle = '#003300';
        context.stroke();

        context.font = '15px Roboto Slab';
        context.fillStyle = 'black';
        context.textAlign = 'center';
        context.fillText(indx + 1, startX, startY + 3);
    }
    context.closePath();

}
/**
 * 
0: [1]
1: []
[[Prototype]]: Object
 */
function drawRAWDepdendency(context, rawDependency, X, Y, radius, distanceFactor) {
    var sX, sY, dX, dY;
    var keys = Object.keys(rawDependency);

    for(let indxI = 0; indxI < keys.length; ++indxI){
        let curIns = parseInt(keys[indxI]);
        var depInstructions = rawDependency[curIns];
        for (let indxJ = 0; indxJ < depInstructions.length; ++indxJ) {
            if ((depInstructions[indxJ] - indxI) == 1) {
                sX = X ;
                sY = Y;

                dX = X ;
                dY = sY+( distanceFactor) - (radius*2);
                context.beginPath();
                context.lineWidth = 2;
                context.strokeStyle = "red";
                canvas_arrow(context, sX, sY, dX, dY);
                context.stroke();
                Y = dY+radius*2;
            }
        }
    }
}

function drawDependency_1(theCanvas, insCounter, dependency) {
    var context = theCanvas.getContext("2d");
    var circleHeight = 50;
    var ctxHeight = context.height;

    context.clearRect(0, 0, theCanvas.width, theCanvas.height);
    var startX = 200;
    var radius = 20;
    var distance = 75;


    for (let indx = 0; indx < insCounter; ++indx) {
        context.beginPath();

        var startY = circleHeight + radius + (indx * distance);
        context.arc(startX, startY, radius, 0, 2 * Math.PI, true);

        context.lineWidth = 2;
        context.strokeStyle = '#003300';
        context.stroke();

        context.font = '15px Roboto Slab';
        context.fillStyle = 'black';
        context.textAlign = 'center';
        context.fillText(indx + 1, startX, startY + 3);

    }
    context.closePath();
    var rawDependency = dependency["raw"];
    drawRAWDepdendency(context, dependency["raw"], startX, circleHeight+(radius*2), radius, distance);
}

function drawTable(context, cellSize, coordinates, nRow, nColumn, rowName = "") {
    var posX = coordinates.x;
    var posY = coordinates.y;

    for (let rIndx = 0; rIndx <= nRow; ++rIndx) {
        posY = rIndx * cellSize.height + coordinates.y;
        posX = coordinates.x;
        context.moveTo(posX, posY);
        context.lineTo(cellSize.width * nColumn + posX, posY);
        if (rIndx != 0 && (rowName.length != 0)) {
            context.font = '10px Roboto Slab';
            context.textAlign = "left";
            context.fillText(rowName + (rIndx), posX - _width * 2, posY - _height);
        }
    }

    for (let cIndx = 0; cIndx <= nColumn; ++cIndx) {
        posX = cIndx * cellSize.width + coordinates.x;
        posY = coordinates.y;
        context.moveTo(posX, posY);
        context.lineTo(posX, posY + cellSize.height * (nRow));
    }
}

function arrowFPAddr2CDB(context, fpIntcoXY, cdbColor) {
    var startXY = lowerMidPoint(fpIntcoXY.sx, fpIntcoXY.sy, fpIntcoXY.ex, fpIntcoXY.ey);
    context.beginPath();
    context.lineWidth = 2;
    context.strokeStyle = cdbColor;
    canvas_arrow(context, startXY.x, startXY.y, startXY.x, startXY.y + 1.5 * _height);
    context.stroke();
    context.closePath();
}

function arrowFPMul2CDB(context, fpMulcoXY, cdbColor) {
    var startXY = lowerMidPoint(fpMulcoXY.sx, fpMulcoXY.sy, fpMulcoXY.ex, fpMulcoXY.ey);
    context.beginPath();
    context.strokeStyle = cdbColor;
    context.lineWidth = 2;
    canvas_arrow(context, startXY.x, startXY.y, startXY.x, startXY.y + 1.5 * _height);

    context.stroke();
    context.closePath();

}

function arrowCDB2SBuffer(context, sbufcoXY, cdbXY, cdbColor) {
    var endX = sbufcoXY.ex;
    var endY = (sbufcoXY.ey - sbufcoXY.sy) / 2;
    context.strokeStyle = cdbColor;
    context.lineWidth = 2;
    canvas_arrow(context, cdbXY.x, endY + sbufcoXY.sy, endX, endY + sbufcoXY.sy);
    context.stroke();
    context.closePath();
}

function arrowCDB2Reg(context, srcXY, destXY, cdbColor) {
    var endX = srcXY.ex;
    var endY = (srcXY.ey - srcXY.sy) / 2;
    context.beginPath();
    context.strokeStyle = cdbColor;
    context.lineWidth = 2;
    canvas_arrow(context, destXY.x, endY, endX, endY);
    context.stroke();
    context.closePath();
}

function arrowCDB2RS(context, dest1xy, dest2XY, srcXY, cdbColor) {
    var midDest1XY = upperMidPoint(dest1xy.sx, dest1xy.sy, dest1xy.ex, dest1xy.ey);
    var midDest2XY = upperMidPoint(dest2XY.sx, dest2XY.sy, dest2XY.ex, dest2XY.ey);
    context.beginPath();
    context.strokeStyle = cdbColor;
    context.lineWidth = 2;
    var startX = srcXY.x;
    var startY = srcXY.y - (srcXY.y - dest2XY.ey) / 2;
    canvas_line(context, startX, startY, midDest2XY.x + (startX - midDest2XY.x) / 2, startY);
    canvas_line(context, midDest2XY.x + (startX - midDest2XY.x) / 2, startY, midDest2XY.x + (startX - midDest2XY.x) / 2, midDest2XY.y - (_height * 1.5));
    canvas_line(context, midDest2XY.x + (startX - midDest2XY.x) / 2, midDest2XY.y - (_height * 1.5), midDest1XY.x, midDest2XY.y - (_height * 1.5));
    canvas_arrow(context, midDest2XY.x, midDest2XY.y - (_height * 1.5), midDest2XY.x, midDest2XY.y);
    canvas_arrow(context, midDest1XY.x, midDest1XY.y - (_height * 1.5), midDest1XY.x, midDest1XY.y);
    context.stroke();
    context.closePath();
}

function arrowLBuf2CDB(context, lbufcoXY, cdbColor) {
    var ex = _width * 2;
    var ey = _height * 36.5;
    var midSrc1XY = lowerMidPoint(lbufcoXY.sx, lbufcoXY.sy, lbufcoXY.ex, lbufcoXY.ey);
    context.beginPath();
    context.strokeStyle = cdbColor;
    context.lineWidth = 2;
    canvas_arrow(context, midSrc1XY.x, midSrc1XY.y, midSrc1XY.x, ey);
    context.stroke();
    context.closePath();
}

function arrowFromInsQ2RS(context, insCoXY) {
    var midSrcXY = lowerMidPoint(insCoXY.sx, insCoXY.sy, insCoXY.ex, insCoXY.ey);
    context.beginPath();
    context.strokeStyle = '#ff8c00';
    context.lineWidth = 2;
    canvas_line(context, midSrcXY.x, midSrcXY.y, midSrcXY.x, midSrcXY.y + _height * 2);
    var startX = midSrcXY.x;
    var startY = midSrcXY.y + _height * 2;
    canvas_line(context, startX, startY, startX - _width * 5, startY);
    canvas_arrow(context, startX - _width * 5, startY, startX - _width * 5, startY + _height * 3);
    canvas_line(context, startX, startY, startX + _width * 6, startY);
    canvas_arrow(context, startX + _width * 6, startY, startX + _width * 6, startY + _height * 3);


    context.stroke();
    context.closePath();
}

function arrowFromReg2RS(context, regcoXY) {
    var midSrcXY = lowerMidPoint(regcoXY.sx, regcoXY.sy, regcoXY.ex, regcoXY.ey);
    context.beginPath();
    context.strokeStyle = '#2f4f4f';

    context.lineWidth = 2;
    canvas_line(context, midSrcXY.x, midSrcXY.y, midSrcXY.x, midSrcXY.y + _height * 3);
    var startX = midSrcXY.x;
    var startY = midSrcXY.y + _height * 3;
    canvas_line(context, startX, startY, startX - _width * 13.5, startY);
    canvas_arrow(context, startX - _width * 13.5, startY, startX - _width * 13.5, startY + _height * 2);
    canvas_arrow(context, startX - _width * 2, startY, startX - _width * 2, startY + _height * 2);


    context.stroke();
    context.closePath();
}

function arrowRSAdder2FPAdder(context, rsAddercoXY, fpIntcoXY) {
    var midSrcXY = lowerMidPoint(rsAddercoXY.sx, rsAddercoXY.sy, rsAddercoXY.ex, rsAddercoXY.ey);
    var midDstXY = upperMidPoint(fpIntcoXY.sx, fpIntcoXY.sy, fpIntcoXY.ex, fpIntcoXY.ey);
    context.beginPath();
    context.strokeStyle = '#2e8b57';
    context.lineWidth = 2;
    canvas_arrow(context, midSrcXY.x, midSrcXY.y, midDstXY.x, midDstXY.y);


    context.stroke();
    context.closePath();

}

function arrowRSMul2FPMul(context, rsMulcoXY, fpMulCoXY) {
    var midSrcXY = lowerMidPoint(rsMulcoXY.sx, rsMulcoXY.sy, rsMulcoXY.ex, rsMulcoXY.ey);
    var midDstXY = upperMidPoint(fpMulCoXY.sx, fpMulCoXY.sy, fpMulCoXY.ex, fpMulCoXY.ey);
    context.beginPath();
    context.strokeStyle = '#02504e';
    context.lineWidth = 1.5;
    canvas_arrow(context, midSrcXY.x, midSrcXY.y, midDstXY.x, midDstXY.y);


    context.stroke();
    context.closePath();

}

function addTitle(context, x, y, message, style = "black") {
    context.font = '12px Roboto slab';
    context.textAlign = "center";
    context.fillStyle = style;
    context.fillText(message, x, y);
}

function doColor(context, sx, sy, dx, dy, color) {
    // context.clearRect(sx,sy,dx,dy);
    context.beginPath();
    context.fillStyle = color;
    context.rect(sx, sy, dx, dy);
    context.fill();
}
function drawInsQueue(context, rowNum, instructions) {

    var startX = (40 / 3) * _width;
    var startY = 2 * _height;

    //set always row num "8"
    rowNum = (rowNum > 8) ? 8 : rowNum;
    var cellWidth = _width * 6;
    var cellHeight = (rowNum < 5) ? _height * 2.5 : _height * 1.7;

    context.beginPath();
    drawTable(context,
        { width: cellWidth, height: cellHeight },
        { x: startX, y: startY },
        rowNum, 1);

    addTitle(context, startX + (cellWidth / 2), startY - (cellHeight / 2), "Instruction Queue");
    var insLength = instructions.length;
    var startTextRow = 0;
    if (insLength > rowNum) {
        startTextRow = 0;
    }
    else {
        startTextRow = rowNum - insLength;
    }

    context.lineWidth = 1.5;
    context.strokeStyle = '#02504e';
    context.stroke();

    for (let indx = 0; indx < insLength; ++indx) {
        var textY = startY + cellHeight * startTextRow + (indx * 1) * cellHeight;
        let textValue = instructions[indx].OP + " " + instructions[indx].Dest + " " + instructions[indx].Src1 + " " + instructions[indx].Src2;
        let col = instructions[indx].Color;
        doColor(context, startX, textY, cellWidth, cellHeight, col);
        addTitle(context, startX + (cellWidth / 2), textY + (cellHeight / 1.5), textValue);

    }

    context.closePath();

    return {
        "sx": startX,
        "sy": startY,
        "ex": startX + cellWidth,
        "ey": (startY + cellHeight * rowNum)
    }
}

function drawRegister(context, rowNum) {

    var startX = (40 / 3) * _width * 1.8;
    var startY = 2 * _height;

    rowNum = (rowNum > 8) ? 8 : rowNum;
    var cellWidth = _width * 4;
    var cellHeight = (rowNum < 5) ? _height * 2.5 : _height * 1.7;

    context.beginPath();
    drawTable(context,
        { width: cellWidth, height: cellHeight },
        { x: startX, y: startY },
        rowNum, 1);

    addTitle(context, startX + (cellWidth / 2), startY - (cellHeight / 2), "Register");

    context.lineWidth = 1.5;
    context.strokeStyle = '#02504e';
    context.stroke();
    context.closePath();

    return {
        "sx": startX,
        "sy": startY,
        "ex": startX + cellWidth,
        "ey": (startY + cellHeight * rowNum)
    }
}

function drawLoadBuffer(context, rowNum, rs, insColor) {

    var startX = _width * 2;
    var startY = 10 * _height;

    var cellWidth = _width * 4;
    var cellHeight = (rowNum < 5) ? _height * 2.5 : _height * 1.7;

    context.beginPath();


    drawTable(context,
        { width: cellWidth, height: cellHeight },
        { x: startX, y: startY },
        rowNum, 1);

    context.lineWidth = 1.5;
    context.strokeStyle = '#02504e';
    context.stroke();
    addTitle(context, startX + (cellWidth / 2), startY - (cellHeight / 1.5), "Load Buffer");

    for (let indx = 1; indx <= rowNum; ++indx) {
        var value = "FPLd" + indx;
        var textY = startY + cellHeight * (indx - 1);
        addTitle(context, startX + (cellWidth / 2), textY + (cellHeight / 1.5), value, "#5e6c62f6");
    }

    for (let indx = 0; indx < rs.length; ++indx) {
        var value = rs[indx].Name;
        var intval = value.split(/(\d+)/)[1];
        intval = parseInt(intval);
        var textY = startY + cellHeight * (intval - 1);
        let color = insColor[rs[indx].Hash];
        doColor(context, startX, textY, cellWidth, cellHeight, color);
        addTitle(context, startX + (cellWidth / 2), textY + (cellHeight / 1.5), value);
    }



    context.closePath();

    return {
        "sx": startX,
        "sy": startY,
        "ex": startX + cellWidth,
        "ey": (startY + cellHeight * rowNum)
    }
}

function drawStoreBuffer(context, rowNum) {


    var startX = 33 * _width;
    var startY = 10 * _height;

    var cellWidth = _width * 4;
    var cellHeight = (rowNum < 5) ? _height * 2.5 : _height * 1.7;

    context.beginPath();
    drawTable(context,
        { width: cellWidth, height: cellHeight },
        { x: startX, y: startY },
        rowNum, 1);

    addTitle(context, startX + (cellWidth / 2), startY - (cellHeight / 1.5), "Store Buffer");

    context.lineWidth = 1.5;
    context.strokeStyle = '#02504e';

    context.stroke();
    context.closePath();

    return {
        "sx": startX,
        "sy": startY,
        "ex": startX + cellWidth,
        "ey": (startY + cellHeight * rowNum)
    }
}

function drawFPAdder(context, rowNum, fuCtx = undefined) {

    var startX = 8.7 * _width;
    var startY = 33 * _height;
    var color = "rgba(0, 0, 200, 0)";
    var fpContent = "";
    if (fuCtx != undefined) {
        fpContent = fuCtx.OP;
        color = fuCtx.Color;
    }

    var cellWidth = _width * 6;
    var cellHeight = (rowNum < 5) ? _height * 2 : _height * 1.7;

    context.beginPath();
    drawTable(context,
        { width: cellWidth, height: cellHeight },
        { x: startX, y: startY },
        rowNum, 1);

    context.lineWidth = 2;
    context.strokeStyle = '#02504e';
    context.stroke();

    doColor(context, startX, startY, cellWidth, cellHeight, color);
    addTitle(context, startX - (cellWidth / 4), startY - (cellHeight / 2), "FPAdder");
    addTitle(context, startX + (cellWidth / 2), startY + (cellHeight / 1.5), fpContent);


    context.closePath();

    return {
        "sx": startX,
        "sy": startY,
        "ex": startX + cellWidth,
        "ey": (startY + cellHeight * rowNum)
    }
}

function drawRSAdders(context, rowNum, rsAdder, insColors) {
    var startX = ((40 / 7)) * _width;
    var startY = 21 * _height;

    var cellWidth = _width * 3;
    var cellHeight = (rowNum < 5) ? _height * 2 : _height * 1.7;

    context.beginPath();


    drawTable(context,
        { width: cellWidth, height: cellHeight },
        { x: startX, y: startY },
        rowNum, 4);

    context.lineWidth = 1.5;
    context.strokeStyle = '#02504e';
    context.stroke();
    addTitle(context, startX + cellWidth, startY - (cellHeight * 2), "Reservation");
    addTitle(context, startX + cellWidth, startY - (cellHeight), "Stations");


    for (let indx = 1; indx <= rowNum; ++indx) {
        var value = "FPAdd" + indx;
        var textY = startY + cellHeight * (indx - 1);
        addTitle(context, startX + (cellWidth / 2), textY + (cellHeight / 1.5), value, "#5e6c62f6");
    }


    for (let indx = 0; indx < rsAdder.length; ++indx) {
        var value = rsAdder[indx].Name;
        var intval = value.split(/(\d+)/)[1];
        intval = parseInt(intval);
        var textY = startY + cellHeight * (intval - 1);
        let color = insColors[rsAdder[indx].Hash];

        doColor(context, startX, textY, cellWidth * 4, cellHeight, color);
        addTitle(context, startX + (cellWidth / 2), textY + (cellHeight / 1.5), value);

        addTitle(context, startX + (cellWidth * 1.5), textY + (cellHeight / 1.5), rsAdder[indx].Operator);


        if (rsAdder[indx].Qj == 0) {
            value = rsAdder[indx].Vj;
        }
        else {
            value = rsAdder[indx].Qj;
        }

        addTitle(context, startX + (cellWidth * 2.5), textY + (cellHeight / 1.5), value);

        if (rsAdder[indx].Qk == 0) {
            value = rsAdder[indx].Vk;
        }
        else {
            value = rsAdder[indx].Qk;
        }
        addTitle(context, startX + (cellWidth * 3.5), textY + (cellHeight / 1.5), value);


    }


    context.closePath();

    return {
        "sx": startX,
        "sy": startY,
        "ex": startX + cellWidth * 4,
        "ey": (startY + cellHeight * rowNum)
    }
}

function drawFPMultiplier(context, rowNum, fuCtx = undefined) {
    var cellWidth = _width * 6;
    var cellHeight = (rowNum < 5) ? _height * 2 : _height * 1.7;

    var startX = _width * 22;
    var startY = 33 * _height;
    var color = "rgba(0, 0, 200, 0)";
    var fpContent = "";
    if (fuCtx != undefined) {
        fpContent = fuCtx.OP;
        color = fuCtx.Color;
    }


    context.beginPath();
    drawTable(context,
        { width: cellWidth, height: cellHeight },
        { x: startX, y: startY },
        rowNum, 1);

    context.lineWidth = 1.5;
    context.strokeStyle = '#02504e';
    context.stroke();

    doColor(context, startX, startY, cellWidth, cellHeight, color);
    addTitle(context, startX - (cellWidth / 4), startY - (cellHeight / 2), 'FP Multiplier');
    addTitle(context, startX + (cellWidth / 2), startY + (cellHeight / 1.5), fpContent);


    context.closePath();

    return {
        "sx": startX,
        "sy": startY,
        "ex": startX + cellWidth,
        "ey": (startY + cellHeight * rowNum)
    }
}

function drawRSMultipliers(context, rowNum, rs, insColors) {

    var startX = 19 * _width;
    var startY = 21 * _height;

    var cellWidth = _width * 3;
    var cellHeight = (rowNum < 5) ? _height * 2 : _height * 1.7;

    context.beginPath();

    drawTable(context,
        { width: cellWidth, height: cellHeight },
        { x: startX, y: startY },
        rowNum, 4);

    context.lineWidth = 1.5;
    context.strokeStyle = '#02504e';
    context.stroke();

    for (let indx = 1; indx <= rowNum; ++indx) {
        var value = "FPMul" + indx;
        var textY = startY + cellHeight * (indx - 1);
        addTitle(context, startX + (cellWidth / 2), textY + (cellHeight / 1.5), value, "#5e6c62f6");
    }

    for (let indx = 0; indx < rs.length; ++indx) {
        var value = rs[indx].Name;
        var intval = value.split(/(\d+)/)[1];
        intval = parseInt(intval);
        var textY = startY + cellHeight * (intval - 1)
        let color = insColors[rs[indx].Hash];
        doColor(context, startX, textY, cellWidth * 4, cellHeight, color);
        addTitle(context, startX + (cellWidth / 2), textY + (cellHeight / 1.5), value);

        addTitle(context, startX + (cellWidth * 1.5), textY + (cellHeight / 1.5), rs[indx].Operator);


        if (rs[indx].Qj == 0) {
            value = rs[indx].Vj;
        }
        else {
            value = rs[indx].Qj;
        }
        addTitle(context, startX + (cellWidth * 2.5), textY + (cellHeight / 1.5), value);

        if (rs[indx].Qk == 0) {
            value = rs[indx].Vk;
        }
        else {
            value = rs[indx].Qk;
        }

        addTitle(context, startX + (cellWidth * 3.5), textY + (cellHeight / 1.5), value);
    }


    context.closePath();

    return {
        "sx": startX,
        "sy": startY,
        "ex": startX + cellWidth * 4,
        "ey": (startY + cellHeight * rowNum)
    }
}



function drawCDB(context, cWidth, cHeight, cdbColor) {

    var sx = _width * 3;
    var sy = cHeight - _height * 3;

    context.beginPath();
    context.strokeStyle = cdbColor;
    context.lineWidth = 2;
    canvas_line(context, sx, sy, cWidth - _width, sy);
    sx = cWidth - _width;
    canvas_line(context, sx, sy, sx, _height * 3);

    context.font = '13px Roboto Slab';
    context.textAlign = "left";
    context.fillText('Common Data Bus (CDB)', sx - _width * 8, sy - _height);
    context.stroke();
    context.closePath();

    return {
        "x": sx,
        "y": sy
    }

}

function getOnlyRSCtx(rsCtx, rsType) {
    var retCtx = []
    for (let indx = 0; indx < rsCtx.length; ++indx) {
        if (rsCtx[indx].Type == rsType) {
            retCtx.push(rsCtx[indx]);
        }
    }

    return retCtx;
}

function getFPCtx(wloads, opTypes) {
    var retCtx = undefined;
    var tmp = false;
    for (let indx = 0; indx < wloads.length; ++indx) {
        opTypes.forEach(opType => {
            if (opType == wloads[indx].Type) {
                retCtx = wloads[indx];
                tmp = true;
            }
        });
        if (tmp) {
            return retCtx;
        }
    }

    return retCtx;
}

function drawBlockDiagram(context, cWidth, cHeight, unitSizes, insAtQ, RS, fuCtx, insColors) {
    canvasSetup(cWidth, cHeight);
    var coordInsQ = drawInsQueue(context, 8, insAtQ);
    var coordReg = drawRegister(context, 8);

    var loadRSCtx = getOnlyRSCtx(RS, RSType.FPLd);
    var coordLBuf = drawLoadBuffer(context, unitSizes.FPLd, loadRSCtx, insColors);
    var coordSBuf = drawStoreBuffer(context, unitSizes.FPLd);
    var coordCDB = drawCDB(context, cWidth, cHeight, "#a0522d");

    var addRSCtx = getOnlyRSCtx(RS, RSType.FPAdd);
    var coordRSAdd = drawRSAdders(context, unitSizes.FPAdd, addRSCtx, insColors);
    var mulRSCtx = getOnlyRSCtx(RS, RSType.FPMul);

    var coordRSMul = drawRSMultipliers(context, unitSizes.FPMul, mulRSCtx, insColors);
    var intFUCtx = getFPCtx(fuCtx, OPClass.Integer);
    var coordFPInt = drawFPAdder(context, 1, intFUCtx);
    var mulFUCtx = getFPCtx(fuCtx, OPClass.Multiplier);
    var coordFPMul = drawFPMultiplier(context, 1, mulFUCtx);

    arrowFromInsQ2RS(context, coordInsQ, "#a0522d");
    arrowFromReg2RS(context, coordReg);
    arrowCDB2RS(context, coordRSAdd, coordRSMul, coordCDB, "#a0522d");
    arrowLBuf2CDB(context, coordLBuf, coordCDB, "#a0522d");
    arrowRSAdder2FPAdder(context, coordRSAdd, coordFPInt);
    arrowRSMul2FPMul(context, coordRSMul, coordFPMul);
    arrowFPAddr2CDB(context, coordFPInt, coordCDB, "#a0522d");
    arrowFPMul2CDB(context, coordFPMul, coordCDB, "#a0522d");
    arrowCDB2SBuffer(context, coordSBuf, coordCDB, "#a0522d");
    arrowCDB2Reg(context, coordReg, coordCDB, "#a0522d");
}

function showCanvas(unitSizes, insAtQ, busyRS, fuCtx, insColors) {
    var canvas = document.getElementById("blockCanvas");
    if (ClientHeight == undefined) {
        ClientHeight = canvas.clientHeight;
    }
    canvas.width = canvas.clientWidth;
    canvas.height = ClientHeight;
    var context = canvas.getContext("2d");
    drawBlockDiagram(context, canvas.width, canvas.height, unitSizes, insAtQ, busyRS, fuCtx, insColors);
}