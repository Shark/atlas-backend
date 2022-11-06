import * as dotenv from 'dotenv'
dotenv.config();
import express from 'express'
import handler from './index.js';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json({limit: '50mb'}));

app.post('*', (req: any, res: any) => {
    const path = req.path.slice(1); // slices out first '/'

    // call handler with body, context as null and response handler callback
    // @ts-ignore
    handler[path](req.body, null, (_: any, response: any) => {
        const {statusCode, headers, body} = response;

        res.set(headers);
        res.status(statusCode)
        res.json(body);
    });
});

app.listen(8000, () => {
    console.log('Server listening on port 8000');
});
