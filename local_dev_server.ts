require('dotenv').config()
const express = require("express");
const handler = require("./handler")
const cors = require('cors')

const app = express();
app.use(cors());
app.use(express.json({limit: '50mb'}));

app.post('*', (req: any, res: any) => {
    const path = req.path.slice(1); // slices out first '/'

    // call handler with body, context as null and response handler callback
    handler[path](req.body, null, (_: any, response: any) => {
        const {statusCode, headers, body} = response;

        res.set(headers);
        res.status(statusCode)
        res.json(body);
    });
});

app.listen(3000, () => {
    console.log('Local dev server listening on port 3000');
});
