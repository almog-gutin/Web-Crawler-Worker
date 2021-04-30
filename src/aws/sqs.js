const chalk = require('chalk');
const sqs = require('./aws');

const sendMeesageToQueue = async (queueURL, data) => {
    const params = {
        QueueUrl: queueURL,
        MessageAttributes: {
            'queueName': {
                DataType: 'String',
                StringValue: data.queueName,
            },
            'id': {
                DataType: 'String',
                StringValue: data.id,
            },
            'url': {
                DataType: 'String',
                StringValue: data.url,
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
        QueueUrl: queueURL,
        MessageAttributeNames: ['All'],
        MaxNumberOfMessages: 10,
        VisibilityTimeout: 30,
        WaitTimeSeconds: 5,
    };

    try {
        const { Messages } = await sqs.receiveMessage(params).promise();
        if (!Messages) return;

        const messagesArray = [];
        for (let message of Messages) {
            const messageAttributes = {};
            const receiptHandle = message.ReceiptHandle;

            for (let [key, value] of Object.entries(message.MessageAttributes))
                messageAttributes[key] = value.StringValue;

            messagesArray.push({ messageAttributes, receiptHandle });
        }

        return messagesArray;
    } catch (err) {
        console.log(chalk.red.inverse('Error while recieveing messages from sqs:'), err);
    }
};

const deleteMessageFromQueue = async (queueURL, receiptHandle, messageID) => {
    const params = {
        QueueUrl: queueURL,
        ReceiptHandle: receiptHandle,
    };

    try {
        const deletedMessage = await sqs.deleteMessage(params).promise();
        console.log(chalk.blue(`Message ${chalk.bold(messageID)} was deleted from the queue!`));
    } catch (err) {
        console.log(chalk.red.inverse('Error while deleting message from a queue:'), err);
    }
};

const getNumberOfMessagesInQueue = async (queueURL) => {
    const params = {
        QueueUrl: queueURL,
        AttributeNames: [
            'ApproximateNumberOfMessages',
            'ApproximateNumberOfMessagesDelayed',
            'ApproximateNumberOfMessagesNotVisible',
        ],
    };

    try {
        const { Attributes } = await sqs.getQueueAttributes(params).promise();
        const availableMessages = parseInt(Attributes.ApproximateNumberOfMessages);
        const delayedMessages = parseInt(Attributes.ApproximateNumberOfMessagesDelayed);
        const nonVisibleMessages = parseInt(Attributes.ApproximateNumberOfMessagesNotVisible);

        return { availableMessages, delayedMessages, nonVisibleMessages };
    } catch (err) {
        console.log(chalk.red.inverse('Error while fetching number of messages in queue!'), err);
    }
};

module.exports = {
    sendMeesageToQueue,
    pullMessageFromQueue,
    deleteMessageFromQueue,
    getNumberOfMessagesInQueue,
};
