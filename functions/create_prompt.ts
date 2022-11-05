// import responseBuilder
import buildResponse from '../util/response_builder';

module.exports = async (event: {prompt: String}, context: any, callback: Function) => {
    const responseBody = {success: false, error: "Not implemented yet."};
    callback(null, buildResponse(responseBody, 400));
}
