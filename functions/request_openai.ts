import axios from "axios";
import fs from 'fs';
import { Configuration, OpenAIApi } from "openai";
import { v4 as uuidv4 } from 'uuid';
const configuration = new Configuration({apiKey: process.env.OPENAI_API_KEY});
const openai = new OpenAIApi(configuration);

import buildResponse from '../util/response_builder';

const numberOfImages = 3;
const imageSize = "256x256"; // possible: "256x256", "512x512", "1024x1024"

type RequestBody = {
    prompt: string;
    images?: {
        full: string;
        masked: string;
    };
}

const withImages = async (event: RequestBody, callback: Function) => {
    const [fullImagePath, maskedImagePath] = [event.images!.full, event.images!.masked].map((image: string) => {
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
            numberOfImages,
            imageSize,
        );
        const imageUrls = openaiResponse.data.data.map((image: any) => image.url);

        callback(null, buildResponse({urls: imageUrls}));
    } catch(error: any) {
        const errorMessage = error.response?.data?.error?.message;
        callback(null, buildResponse({reason: "OpenaiError", error: errorMessage}, 400));
    } finally {
        fs.unlinkSync(fullImagePath);
        fs.unlinkSync(maskedImagePath);
    }
}

const withoutImages = async (event: RequestBody, callback: Function) => {
    try {
        const openaiResponse = await openai.createImage({
            prompt: event.prompt,
            n: numberOfImages, // number of images to return
            size: imageSize,
        });
        const imageUrls = openaiResponse.data.data.map((image: any) => image.url);

        callback(null, buildResponse({urls: imageUrls}));
    } catch(error: any) {
        const errorMessage = error.response?.data?.error?.message;
        callback(null, buildResponse({reason: "OpenaiError", error: errorMessage}, 400));
    }
}

module.exports = async (event: RequestBody, context: any, callback: Function) => {
    if (event.images) {
        withImages(event, callback);
    } else {
        withoutImages(event, callback);
    }
}
