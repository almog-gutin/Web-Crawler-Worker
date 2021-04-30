const chalk = require('chalk');
const handleMessages = require('../utils/messages/messagesHandler');

const workerController = async (req, res) => {
    const queueURL = req.body.queueURL;
    try {
        await handleMessages(queueURL);
        res.status(202).send({
            status: 202,
            message: 'Worker is working!',
        });
    } catch (err) {
        console.log(chalk.red.inverse('Error in the workerController.', err));
        res.status(500).send({
            status: 500,
            message: 'Internal server error.',
        });
    }
};

module.exports = workerController;
