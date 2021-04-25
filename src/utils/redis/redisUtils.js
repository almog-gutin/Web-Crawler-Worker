const redisClient = require('../../databases/redis');

const redisGetTree = async (title) => {
    const tree = await redisClient.getAsync(title);
    return JSON.parse(tree);
};

const redisSetTree = async (URL, tree) => {
    const stringfyTree = JSON.stringify(tree);
    await redisClient.setexAsync(URL, stringfyTree);
};

module.exports = { redisGetTree, redisSetTree };
