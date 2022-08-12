class Annotation {
    constructor(message, rowNumber, item = ResourceType.WorkLoad, columnNumber) {
        this.insRow = rowNumber;
        this.message = message;
        this.component = item;
        this.pointsTo = columnNumber;
    }
}