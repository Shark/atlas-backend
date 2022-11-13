import { timingSafeEqual } from 'crypto';
import * as dotenv from 'dotenv'
dotenv.config();
import express from 'express'
import handler from './index.js';
import cors from 'cors';

const port = process.env.PORT || 3000;
const token: string = process.env.TOKEN || '';
if(token.length === 0) {
    throw new Error('TOKEN must be set');
}

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

function ensureToken(req: any, res: any, next: any) {
    var bearerHeader = req.headers["authorization"];
    var message = 'Unauthorized';
    if(typeof bearerHeader !== 'undefined') {
        const bearer = bearerHeader.split(" ");
        if(bearer.length === 2) {
            const requestToken = bearer[1]
            if(timingSafeEqual(Buffer.from(requestToken, 'utf8'), Buffer.from(token, 'utf8'))) {
                next();
                return;
            } else {
                message = 'Token Mismatch';
            }
        } else {
            message = 'Header Malformed'
        }
    }
    res.status(403);
    res.send(message);
}

app.post('*', ensureToken, (req: any, res: any) => {
    const path = req.path.slice(1); // slices out first '/'

    // call handler with body, context as null and response handler callback
    // @ts-ignore
    handler[path](req.body, null, (_: any, response: any) => {
        const { statusCode, headers, body } = response;

        res.set(headers);
        res.status(statusCode)
        res.json(body);
    });
});

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
