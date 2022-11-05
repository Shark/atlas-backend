require('dotenv').config()
const express = require("express");
const handler = require("./handler")

const app = express();
app.use(express.json())

app.post('*', (req, res) => {
    const path = req.path.slice(1); // slices out first '/

    // call handler with body, context as null and response handler callback
    handler[path](req.body, null, (_, response) => {
        const {statusCode, headers, body} = response;


        res.set(headers);
        res.status(statusCode)
        res.json(body);
    });
});

app.listen(3000, () => {
    console.log('Local dev server listening on port 3000');
});
