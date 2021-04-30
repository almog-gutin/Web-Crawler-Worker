const AWS = require('aws-sdk');
AWS.config.update({ region: 'eu-west-1' });

const sqs = new AWS.SQS({ apiVersion: '2012-11-05' });

module.exports = sqs;
