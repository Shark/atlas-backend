// import openai
const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({apiKey: process.env.OPENAI_API_KEY});
const openai = new OpenAIApi(configuration);

// import responseBuilder
import buildResponse from '../util/response_builder';

// expects a request body in the format: { "prompt": "This is a test prompt." }
module.exports = async (event: {prompt: String}, context: any, callback: Function) => {
    try {
        const openaiResponse = await openai.createImage({
            prompt: event.prompt,
            n: 1,
            size: "256x256",
        });

        const imageUrl = openaiResponse.data.data[0].url;

        callback(null, buildResponse({url: imageUrl}));
    } catch(error) {
        const errorMessage = error.response.data.error.message;
        callback(null, buildResponse({reason: "OpenaiErrorclass", error: errorMessage}, 400));
    }
}
