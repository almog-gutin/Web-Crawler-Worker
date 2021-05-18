const { updateNodeByID } = require('./node');
const { redisGetTree, redisSetTree } = require('../redis/redisUtils');

class Tree {
    constructor(node, queueName, maxLevel, maxPages) {
        this.root = node;
        this.title = queueName;
        this.url = node.url;
        this.maxLevel = maxLevel;
        this.maxPages = maxPages;
        this.numOfNodes = 1;
        this.countLevels = 1;
        this.isTreeComplete = false;
    }
}

const updateTree = async (node, messageAttributes, level) => {
    const tree = await redisGetTree(messageAttributes.queueName);
    const root = updateNodeByID(node.id, node, tree.root);
    tree.root = root;
    tree.numOfNodes++;
    if (level > tree.countLevels) tree.countLevels++;
    await redisSetTree(messageAttributes.queueName, tree);
};

const getNumOfNodesInDB = async (queueName) => {
    let nunOfNodes = 0;
    const tree = await redisGetTree(queueName);
    if (tree) numOfNodes = tree.numOfNodes;
    return numOfNodes;
};

module.exports = { Tree, updateTree, getNumOfNodesInDB };
