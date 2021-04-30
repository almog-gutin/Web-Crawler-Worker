const axios = require('axios');
const chalk = require('chalk');
const {
    sendMeesageToQueue,
    pullMessageFromQueue,
    deleteMessageFromQueue,
    getNumberOfMessagesInQueue,
} = require('../../aws/sqs');
const { redisGetTree } = require('../redis/redisUtils');
const parseURL = require('../parser/parserUtils');
const { Node, createChildrenNodes, getChildrenURLs } = require('../tree/node');
const { Tree, updateTree } = require('../tree/tree');

const createOrUpdateTree = async (node, messageAttributes, currentLevel, isNodeInDB) => {
    if (isNodeInDB) return updateTree(node, messageAttributes, currentLevel);
    const tree = new Tree(node, messageAttributes.maxDepthLevel, messageAttributes.maxPages);
};

const processMessage = async (queueURL, messageAttributes) => {
    const { queueName, url, id, maxLevel, maxPages } = messageAttributes;
    const level = parseInt(messageAttributes.level);

    try {
        const node = new Node(url, id, level);
        const nodeFromDB = await redisGetTree(queueName);
        if (!nodeFromDB) {
            const { title, children } = await parseURL(url);
            node.title = title;
            node.children = createChildrenNodes(id, children, level + 1);
            await createOrUpdateTree(node, messageAttributes, level + 1, false);
        } else {
            node.title = nodeFromDB.title;
            const childrenURLs = getChildrenURLs(nodeFromDB.children);
            node.children = createChildrenNodes(id, childrenURLs, level + 1);
            await createOrUpdateTree(node, messageAttributes, level + 1, true);
        }

        for (let i = 0; i < node.children.length; i++) {
            const request = {
                queueName,
                id: `${id}/i`,
                url: children[i],
                level: `${level}+1`,
                maxLevel,
                maxPages,
            };
            await sendMeesageToQueue(queueURL, request);
            axios.post('http://localhost:8080/worker', { queueURL });
        }
        return true;
    } catch (err) {
        console.log(chalk.red.inverse('Error in processMessage function.'), err);
    }
};

const handleMessages = async (queueURL) => {
    try {
        const { availableMessages } = await getNumberOfMessagesInQueue(queueURL);

        if (availableMessages > 0) {
            const messages = await pullMessageFromQueue(queueURL);
            if (messages) {
                messages.forEach(async (message) => {
                    const { messageAttributes, receiptHandle } = message;
                    const hasMessageBeenProcessed = await processMessage(queueURL, messageAttributes);
                    if (hasMessageBeenProcessed) deleteMessageFromQueue(queueURL, receiptHandle, messageAttributes.id);
                });
            }
        }
    } catch (err) {
        console.log(chalk.red.inverse('Error in handleMessages function.'), err);
    }
};

module.exports = handleMessages;
