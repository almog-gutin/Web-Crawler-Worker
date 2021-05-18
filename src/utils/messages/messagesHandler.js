const axios = require('axios');
const chalk = require('chalk');
const {
    sendMeesageToQueue,
    pullMessageFromQueue,
    deleteMessageFromQueue,
    getNumberOfMessagesInQueue,
} = require('../../aws/sqs');
const { redisGetTree, redisSetTree, redisGetNode, redisSetNode } = require('../redis/redisUtils');
const parseURL = require('../parser/parserUtils');
const { Node, createChildrenNodes, getChildrenURLs } = require('../tree/node');
const { Tree, updateTree, getNumOfNodesInDB } = require('../tree/tree');

const createOrUpdateTree = async (node, messageAttributes, currentLevel, isNodeInDB) => {
    if (!isNodeInDB) await redisSetNode(node);
    if (node.id === '0') {
        const tree = new Tree(
            node,
            messageAttributes.queueName,
            messageAttributes.maxLevel,
            messageAttributes.maxPages
        );
        return await redisSetTree(tree.title, tree);
    }

    await updateTree(node, messageAttributes, currentLevel);
};

const processMessage = async (queueURL, messageAttributes, numOfPages) => {
    const { queueName, url, id, maxLevel, maxPages } = messageAttributes;
    const level = parseInt(messageAttributes.level);

    try {
        const node = new Node(url, id, level);
        const nodeFromDB = await redisGetNode(url);
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

        let pagesGap = parseInt(maxPages) - numOfPages;
        const levelGap = parseInt(maxLevel) - level;
        for (let i = 0; levelGap > 0 && pagesGap > 0 && i < node.children.length; i++, pagesGap--) {
            const request = {
                queueName,
                id: node.children[i].id,
                url: node.children[i].url,
                level: `${level + 1}`,
                maxLevel,
                maxPages,
            };
            await sendMeesageToQueue(queueURL, request);
            axios.post('http://localhost:8080/worker', { queueURL });
        }
        return true;
    } catch (err) {
        console.log(chalk.red.inverse('Error in processMessage function:'), err);
    }
};

const handlePostMessages = async (queueURL, queueName) => {
    try {
        const tree = await redisGetTree(queueName);
        if (tree && !tree.isTreeComplete) {
            const { availableMessages, delayedMessages, nonVisibleMessages } = await getNumberOfMessagesInQueue(
                queueURL
            );

            if (availableMessages === 0 && delayedMessages === 0 && nonVisibleMessages == 0) {
                console.log(true);
                tree.isTreeComplete = true;
                await redisSetTree(queueName);
            }

            if (availableMessages > 0) axios.post('http://localhost:8080/worker', { queueURL });
        }
    } catch (err) {
        console.log(chalk.red.inverse('Error in handlePostMessages function:'), err);
    }
};

const handleMessages = async (queueURL) => {
    try {
        const nmberOfMessagesInQueue = await getNumberOfMessagesInQueue(queueURL);

        if (nmberOfMessagesInQueue?.availableMessages > 0) {
            const messages = await pullMessageFromQueue(queueURL);
            if (messages) {
                const queueName = messages[0].messageAttributes.queueName;
                messages.forEach(async (message) => {
                    const { messageAttributes, receiptHandle } = message;
                    const { availableMessages, delayedMessages, nonVisibleMessages } = await getNumberOfMessagesInQueue(
                        queueURL
                    );
                    const numOfMessages = availableMessages + delayedMessages + nonVisibleMessages;
                    const numOfPages = messageAttributes.id === '0' ? 0 : await getNumOfNodesInDB(queueName);
                    const hasMessageBeenProcessed = await processMessage(
                        queueURL,
                        messageAttributes,
                        numOfMessages + numOfPages
                    );
                    if (hasMessageBeenProcessed) deleteMessageFromQueue(queueURL, receiptHandle, messageAttributes.id);
                });

                await handlePostMessages(queueURL, queueName);
            }
        }
    } catch (err) {
        console.log(chalk.red.inverse('Error in handleMessages function:'), err);
    }
};

module.exports = handleMessages;
