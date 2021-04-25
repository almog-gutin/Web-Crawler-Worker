const express = require('express');
const cors = require('cors');
const chalk = require('chalk');
const parserRouter = require('./routers/parserRouter');

const port = process.env.PORT;
const app = express();

app.use(express.json());
app.use(cors());
app.get('/', (req, res) => res.send());
app.use(parserRouter);

app.listen(port, () => console.log(chalk.green.bold('Server connected on port:'), port));
