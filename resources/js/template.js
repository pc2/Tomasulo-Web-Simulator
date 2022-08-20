class Template {

    constructor(type) {
        this._type = type;
    }

    createBtn(attribute) {
        let btn = document.createElement("button");
        btn.setAttribute('type', 'button');
        btn.textContent = attribute.textContent;

        let property = Object.keys(attribute);
        property = property.filter(item => item != "textContent");
        property.forEach((item) => {
            btn.setAttribute(item, attribute[item]);
        });
        return btn;
    }

    attachBtn(parentElement, childAttribute) {
        if (typeof parentElement === "string") {
            parentElement = document.querySelector(parentElement);
        }
        let childElement = this.createBtn(childAttribute);;
        parentElement.appendChild(childElement);
    }

    createText(attribute) {
        let node = document.createTextNode(attribute.text);
        return node;
    }

    attachText(parentElement, childAttribute) {

        if (typeof parentElement === "string") {
            parentElement = document.querySelector(parentElement);
        }
        let child = this.createText(childAttribute);
        parentElement.appendChild(child);
    }

    clearContent(element) {
        if (typeof element === "string") {
            element = document.querySelector(element);
        }
        element.innerHTML = '';
        element.style.backgroundColor = "";
    }

    createDiv(attribute) {
        let divElem = document.createElement('div');

        let property = Object.keys(attribute);
        property = property.filter(item => item != "textContent");
        property.forEach((item) => {
            divElem.setAttribute(item, attribute[item]);
        });

        return divElem;
    }

    attachDiv(parentElement, childAttribute) {
        if (typeof parentElement === "string") {
            parentElement = document.querySelector(parentElement);
        }

        let child = this.createDiv(childAttribute);
        parentElement.appendChild(child);
    }

}