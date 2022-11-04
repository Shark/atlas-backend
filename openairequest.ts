// import openai
const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({apiKey: process.env.OPENAI_API_KEY});
const openai = new OpenAIApi(configuration);

// import responseBuilder
import buildResponse from './response_builder';

// expects a request body in the format: { "prompt": "This is a test prompt." }
module.exports = async (event: {prompt: String}, context: any, callback: Function) => {
    try {
        const openaiResponse = await openai.createImage({
            prompt: event.prompt,
            n: 1,
            size: "256x256",
        });

        const imageUrl = openaiResponse.data.data[0].url;
        const responseBody = {
            success: true,
            url: imageUrl,
        }

        callback(null, buildResponse(responseBody));
    } catch(error) {
        const errorMessage = error.response.data.error.message;
        const responseBody = {
            success: false,
            error: errorMessage,
        }

        callback(null, buildResponse(responseBody, 400));
    }
}
