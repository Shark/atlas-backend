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

module.exports = async (event: RequestBody, context: any, callback: Function) => {
    const [fullImagePath, maskedImagePath] = [event.images.full, event.images.masked].map((image: string) => {
        const base64Data = image.replace(/^data:image\/png;base64,/, "");
        const fileName = `${uuidv4()}.png`;
        fs.writeFileSync(fileName, base64Data, 'base64');
        return fileName;
    })

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
        callback(null, buildResponse({reason: "OpenaiError", error: errorMessage}, 400));
    } finally {
        fs.unlinkSync(fullImagePath);
        fs.unlinkSync(maskedImagePath);
    }
}
