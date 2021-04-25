const axios = require('axios');
const { parse } = require('node-html-parser');
const chalk = require('chalk');

const parseURL = async (url) => {
    const children = [];
    try {
        const result = await axios.get(url);
        const html = parse(result.data);
        const title = html.querySelector('title').innerText;
        const aElementsList = html.querySelectorAll('a');
        aElementsList.forEach((element) => {
            const link = element.attributes.href;
            if (link && link.startsWith('http')) children.push(link);
        });
        return { title, children };
    } catch (err) {
        console.log(chalk.red.inverse('Parser error!'), err);
    }
};

module.exports = parseURL;
