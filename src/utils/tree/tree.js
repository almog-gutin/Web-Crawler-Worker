const Node = require('./node');
const { redisGetTree, redisSetTree } = require('../redis/redisUtils');

class Tree {
    constructor(node, title, url, maxDepthLevels, maxPages) {
        this.root = node;
        this.title = title;
        this.url = url;
        this.maxDepthLevels = maxDepthLevels;
        this.maxPages = maxPages;
        this.numOfNodes = 1;
        this.levelsRecorded = 1;
    }
}

module.exports = { Tree };
