const redisClient = require('../../databases/redis');

const redisGetTree = async (queueName) => {
    const tree = await redisClient.getAsync(queueName);
    return JSON.parse(tree);
};

const redisSetTree = async (queueName, tree) => {
    const stringfyTree = JSON.stringify(tree);
    await redisClient.setexAsync(queueName, 1200, stringfyTree);
};

const redisGetNode = async (url) => {
    const node = await redisClient.getAsync(url);
    return JSON.parse(node);
};

const redisSetNode = async (node) => {
    const stringfyNode = JSON.stringify(node);
    await redisClient.setexAsync(node.url, 1200, stringfyNode);
};

module.exports = {
    redisGetTree,
    redisSetTree,
    redisGetNode,
    redisSetNode,
};
