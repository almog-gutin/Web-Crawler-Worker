const express = require('express');
const parserContoller = require('../controllers/parserController');

const router = new express.Router();

router.post('/parse', parserContoller);

module.exports = router;
