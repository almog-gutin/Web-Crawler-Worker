class Node {
    constructor(url, id, depthLevel) {
        this.title = '';
        this.depthLevel = depthLevel;
        this.url = url;
        this.children = [];
        this.id = id;
    }
}

const createChildrenNodes = (parentID, children, level) => {
    const childrenNodes = [];
    for (let i = 0; i < children.length; i++) {
        const node = new Node(children[i], `${parentID}/${i}`, level);
        childrenNodes.push(node);
    }
    return childrenNodes;
};

const getChildrenURLs = (children) => {
    const URLs = [];
    children.forEach((child) => URLs.push(child.url));
    return URLs;
};

module.exports = {
    Node,
    createChildrenNodes,
    getChildrenURLs,
};
