
const UNDO = 1;
const REDO = 1 << 1;
const SearchStrategy = { "Top2Bottom": 1, "BottomUp": 1 << 1 };
Object.freeze(SearchStrategy);

class AnnotationTree {
    constructor() {
        this._rootAntNode = undefined;
        this._currentAntNode = undefined;
        this._lastAntNode = undefined;
    }

    Clean() {
        this._rootAntNode = undefined;
        this._currentAntNode = undefined;
        this._lastAntNode = undefined;
    }

    _insert(current, parent) {
        if (current == undefined) {
            current = new AntNode();
            if (parent == undefined) {
                return current;
            } else {
                parent.AddChild(current);
                this._currentAntNode = current;
                return parent;
            }
        }

        parent = current;
        if (current == this._currentAntNode) {
            current = new AntNode();
            this._currentAntNode = current;
            parent.AddChild(current);
            return parent;
        }


        current = this._insert(current, parent);

        return parent == current.Parent() ? parent : current;
    }

    InsertNode() {

        if (this._rootAntNode == undefined) {
            this._rootAntNode = new AntNode();
            this._currentAntNode = this._rootAntNode;
            this._lastAntNode = this._currentAntNode;
            return this._currentAntNode;
        }

        var curChild = this._currentAntNode.Children();
        var lastNode = this._currentAntNode;

        while (curChild != undefined) {
            lastNode = curChild;
            curChild = curChild.Children();

        }

        lastNode.AddChild(new AntNode());
        this._currentAntNode = lastNode.Children();
        this._lastAntNode = this._currentAntNode;
        return this._currentAntNode;
    }

    AddAntatNode(node, annotation) {
        node.AddAnnotation(annotation);
    }

    SearchAntNode(current, key) {
        if (current == undefined) {
            return undefined;
        }

        if (current.Key() == key) {
            return current;
        }

        let retNode = undefined;
        let childs = current.Children();
        retNode = this.SearchAntNode(
            childs,
            key);


        return retNode;
    }

    isEmpty() {
        return this.isAtRoot() && this.isAtLeaf();
    }

    isAtRoot() {
        return this._currentAntNode === this._rootAntNode;
    }

    isAtLeaf() {
        return this._currentAntNode.getChildren().length === 0;
    }

    Root() {
        return this._rootAntNode;
    }

    Current() {
        return this._currentAntNode;
    }

    Leaf() {
        return this._lastAntNode;
    }


    MoveUp2Root() {
        this._currentAntNode = this._rootAntNode;
    }

    MoveUp() {

        if (this._currentAntNode == undefined) {
            if (this._rootAntNode == undefined) {
                console.error("Command Tree is Empty: Game is not Started");
                return;
            }
        }

        if (this._currentAntNode.Key() === this._currentAntNode.Parent().Key()) {
            return this._currentAntNode;
        }

        return this._currentAntNode = this._currentAntNode.Parent();

    }


    MoveDown() {
        let current = undefined;
        if (this._currentAntNode == undefined) {
            if (this._rootAntNode == undefined) {
                console.error("Command Tree is Emty: Game is not Started");
                return;
            }
            else {
                this._currentAntNode = this._rootAntNode;
            }
        }


        return this._currentAntNode = this._currentAntNode.Children();

    }

}
