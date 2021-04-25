const parseURL = require('../utils/parser/parserUtils');

const parserContoller = async (req, res) => {
    try {
        const result = await parseURL(req.body.url);
        res.send(result);
    } catch (err) {
        res.send(404).send(err.message);
    }
};

module.exports = parserContoller;
