const axios = require('axios');
const chalk = require('chalk');
const {
    sendMeesageToQueue,
    pullMessageFromQueue,
    deleteMessageFromQueue,
    deleteQueue,
    getNumberOfMessagesInQueue,
} = require('../../aws/sqs');
const { Node } = require('../tree/node');
const {} = require('../tree/tree');
