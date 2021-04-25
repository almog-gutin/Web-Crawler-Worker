const express = require('express');
const workerController = require('../controllers/workerController');

const router = new express.Router();

router.post('/worker', workerController);

module.exports = router;
