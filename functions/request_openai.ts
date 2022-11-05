import axios from "axios";
import fs from 'fs';
import { Configuration, OpenAIApi } from "openai";
import { v4 as uuidv4 } from 'uuid';
const configuration = new Configuration({apiKey: process.env.OPENAI_API_KEY});
const openai = new OpenAIApi(configuration);

import buildResponse from '../util/response_builder';

type RequestBody = {
    prompt: string;
    images: {
        full: string;
        masked: string;
    };
}

const downloadFile = async (url: string): Promise<string> => {
    const path = `tmp/${uuidv4()}.png`;
    const writer = fs.createWriteStream(path);
    const response = await axios.get(url, { responseType: 'stream' });
    response.data.pipe(writer);
    try {
        await new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });
    } catch (error) {
        throw error;
    }

    return path;
}

module.exports = async (event: RequestBody, context: any, callback: Function) => {
    const downloadPromises = [event.images.full, event.images.masked].map((url: string) => downloadFile(url));
    var fullImagePath: string, maskedImagePath: string;
    try {
        [fullImagePath, maskedImagePath] = await Promise.all(downloadPromises);
    } catch (error: any) {
        return callback(null, buildResponse({error: error.message}, 400));
    }

    try {
        const openaiResponse = await openai.createImageEdit(
            fs.createReadStream(fullImagePath),
            fs.createReadStream(maskedImagePath),
            event.prompt,
            1, // number of images to return
            "256x256", // possible: "256x256", "512x512", "1024x1024"
        );
        const imageUrl = openaiResponse.data.data[0].url;

        callback(null, buildResponse({url: imageUrl}));
    } catch(error: any) {
        const errorMessage = error.response?.data?.error?.message;
        callback(null, buildResponse({reason: "OpenaiErrorclass", error: errorMessage}, 400));
    } finally {
        fs.unlinkSync(fullImagePath);
        fs.unlinkSync(maskedImagePath);
    }
}
