
class AntNode {
    constructor() {

        /** Random key is generated to identify every command in the tree */
        this._key = Math.random().toString(36).slice(-10); /* key length: 10 */
        this._annotations = [];
        this._parent = this;
        this._child = undefined;
    }

    AddChild(antNode) {
        if (!(antNode instanceof AntNode)) {
            throw new Error("Invalid AntNode");
        }
        antNode._parent = this;
        this._child = antNode;
    }

    Children() {
        return this._child;
    }

    Key() {
        return this._key;
    }

    AddAnnotation(annotation) {
        this._annotations.push(annotation);
    }

    Annotation() {
        return this._annotations;
    }

    Parent() {
        return this._parent;
    }



}
