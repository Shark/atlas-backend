const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const buildResponse = require('./response_builder');

const handler = async (event, context, callback) => {
    // TODO: get request parameters from "event" object

    const openaiResponse = await openai.createImage({
        prompt: "a white siamese cat",
        n: 1,
        size: "256x256",
      });
    let imageUrl = openaiResponse.data.data[0].url;

    let responseBody = {
        imageUrl,
    }

    callback(null, buildResponse(responseBody));
}

module.exports = handler
