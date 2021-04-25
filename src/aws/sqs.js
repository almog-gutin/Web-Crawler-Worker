const chalk = require('chalk');
const sqs = require('./aws');

const sendMeesageToQueue = async (queueURL, data) => {
    const params = {
        QueueURL: queueURL,
        MessageAttributes: {
            'queueName': {
                DataType: 'String',
                StringValue: data.queueName,
            },
            'id': {
                DataType: 'String',
                StringValue: data.id,
            },
            'level': {
                DataType: 'String',
                StringValue: data.level,
            },
            'maxLevel': {
                DataType: 'String',
                StringValue: data.maxLevel,
            },
            'maxPages': {
                DataType: 'String',
                StringValue: data.maxPages,
            },
        },
        MessageBody: `${data.url}:${data.id}`,
        MessageDeduplicationId: data.id,
        MessageGroupId: `Group${data.maxLevel}`,
    };

    try {
        const { MessageId } = await sqs.sendMessage(params).promise();
        console.log(chalk.blue(`Message ${chalk.bold(data.id)} was added to queue, ${chalk.bold(data.queueName)}!`));
        return MessageId;
    } catch (err) {
        console.log(chalk.red.inverse('Error while creating a message on sqs:'), err);
    }
};

const pullMessageFromQueue = async (queueURL) => {
    const params = {
        QueueURL: queueURL,
        MessageAttributes: ['All'],
        MaxNumberOfMessages: 10,
        VisibilityTimeOut: 300,
        WaitTimeSeconds: 5,
    };

    try {
        const { Messages } = await sqs.recieveMessage(params).promise();
        if (!Messages) return;

        const messagesArray = [];
        for (let message of Messages) {
            const messageAttributes = {};
            const receiptHandle = message.receiptHandle;

            for (let [key, value] of Object.entries(message.MessageAttributes))
                messageAttributes[key] = value.StringValue;

            messagesArray.push({ messageAttributes, receiptHandle });
        }

        console.log(messagesArray);
        return messagesArray;
    } catch (err) {
        console.log(chalk.red.inverse('Error while recieveing messages from sqs:'), err);
    }
};

const deleteMessageFromQueue = async (queueURL, receiptHandle, messageID) => {
    const params = {
        QueueURL: queueURL,
        ReceiptHandle: receiptHandle,
    };

    try {
        const deletedMessage = await sqs.deleteMessage(params).promise();
        console.log(chalk.blue(`Message ${chalk.bold(messageID)} was deleted from the queue!`));
    } catch (err) {
        console.log(chalk.red.inverse('Error while deleting message from a queue:'), err);
    }
};

const deleteQueue = async (queueURL) => {
    const params = { QueueURL: queueURL };

    try {
        const deletedQueue = await sqs.deleteQueue(params).promise();
        console.log(chalk.blue(`Queue was deleted!`));
    } catch (err) {
        console.log(chalk.red.inverse('Error while deleting a queue:'), err);
    }
};

const getNumberOfMessagesInQueue = async (queueURL) => {
    const params = {
        QueueURL: queueURL,
        AttributeNames: [
            'ApproximateNumberOfMessages',
            'ApproximateNumberOfMessagesDelayed',
            'ApproximateNumberOfMessagesNotVisible',
        ],
    };

    try {
        const { attributes } = await sqs.getQueueAttributes(params).promise();
        const availableMessages = parseInt(attributes.ApproximateNumberOfMessages);
        const delayedMessages = parseInt(attributes.ApproximateNumberOfMessagesDelayed);
        const nonVisibleMessages = parseInt(attributes.ApproximateNumberOfMessagesNotVisible);

        return { availableMessages, delayedMessages, nonVisibleMessages };
    } catch (err) {
        console.log(chalk.red.inverse('Error while fetching number of messages in queue!'), err);
    }
};

module.exports = {
    sendMeesageToQueue,
    pullMessageFromQueue,
    deleteMessageFromQueue,
    deleteQueue,
    getNumberOfMessagesInQueue,
};
