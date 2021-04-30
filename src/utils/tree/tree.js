const Node = require('./node');
const { redisGetTree, redisSetTree } = require('../redis/redisUtils');

class Tree {
    constructor(node, maxDepthLevels, maxPages) {
        this.root = node;
        this.title = node.title;
        this.url = node.url;
        this.maxDepthLevels = maxDepthLevels;
        this.maxPages = maxPages;
        this.numOfNodes = 1;
        this.levelsRecorded = 1;
    }
}

const updateTree = async (node, messageAttributes, level) => {
    const tree = redisGetTree(node.queueName);

    await redisSetTree(messageAttributes.queueName, tree);
};

module.exports = { Tree, updateTree };
