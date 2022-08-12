class Shape{
    constructor(name, row){
        this.name= name;
        this.row = row;

    }

    setCellSize(width, height){
        this.cellWidth = width;
        this.cellHeight = height;
    }

    setStartPosition(posX, posY){
        this.SX = posX;
        this.SY = posY;
    }

    drawTable(){

    }

    drawLine(){}

    drawArrow(){}

}

class drawUnits extends Shape(){
    constructor(name, row){
        super(name, row);
    }
}

