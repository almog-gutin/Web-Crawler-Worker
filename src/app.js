const express = require('express');
const cors = require('cors');
const parserRouter = require('./routers/parserRouter');
const workerRouter = require('./routers/workerRouter');

const app = express();

app.use(express.json());
app.use(cors());
app.get('/', (req, res) => res.send());
app.use(parserRouter);
app.use(workerRouter);

module.exports = app;
