const handleMessages = require('../utils/messages/handleMessagesUtils');

const workerController = async (req, res) => {
    const queueURL = req.body.queueURL;
    try {
        await handleMessages(queueURL);
        res.send({
            status: 200,
            message: 'Worker is working!',
        });
    } catch (err) {
        res.status(500).send({
            status: 500,
            message: 'Something went wrong!',
        });
    }
};

module.exports = workerController;
