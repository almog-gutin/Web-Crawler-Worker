const redisClient = require('../../databases/redis');

const redisGetTree = async (queueName) => {
    const tree = await redisClient.getAsync(queueName);
    return JSON.parse(tree);
};

const redisSetTree = async (queueName, tree) => {
    const stringfyTree = JSON.stringify(tree);
    await redisClient.setexAsync(queueName, stringfyTree);
};

module.exports = { redisGetTree, redisSetTree };
