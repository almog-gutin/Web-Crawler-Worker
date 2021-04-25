class Node {
    constructor(title, depthLevel, url, id) {
        this.title = title;
        this.depthLevel = depthLevel;
        this.url = url;
        this.children = [];
        this.id = id;
    }
}

const setChildrenNodes = (parentID, childrenURLArr, level) => {
    const nodesArr = [];
};

module.exports = {
    Node,
    setChildrenNodes,
};
