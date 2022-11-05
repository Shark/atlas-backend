const axios = require('axios');

// import responseBuilder
import buildResponse from '../util/response_builder';

const overpassURl = "https://overpass-api.de/api/interpreter";
const overpassOptions = {headers: {"Content-Type": "text/plain"}};
const overpassRadius = 250;


type RequestBody = {
    location: {
        latitude: number,
        longitude: number
    }
}

const fetchNominatim = async (location: RequestBody['location']) => {
    const response = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${location.latitude}&lon=${location.longitude}&zoom=18&addressdetails=1`);
    const data = response.data;

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (data.error) throw new Error(data.error, {cause: "NominatimError"});
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (!data.address) throw new Error("Nominatim response does not have adress field", {cause: "NominatimError"});

    return data;
}

const fetchOverpass = async (location: RequestBody['location']) => {
    const body = `
        [out:json][timeout:25];
        (
        node(around:${overpassRadius},${location.latitude},${location.longitude});
        <<;
        );
        out;
    `;

    var response: any;
    try {
        response = await axios.post(overpassURl, body, overpassOptions);
    } catch (error: any) {
        const responseData = error.response.data;
        const mapped = responseData
            .split("\n")
            .filter((line: string) => line.includes("error"))
            .map((line: string) => line.replace(/(<([^>]+)>)/gi, ""));

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        throw new Error(`${error.message}: ${mapped.join(",")}`, {cause: "OverpassError"});
    }

    return response.data;
}



module.exports = async (event: RequestBody, context: any, callback: Function) => {
    const location = event.location;

    var nominatimResponse, overpassResponse;
    try {
        [nominatimResponse, overpassResponse] = await Promise.all([fetchNominatim(location), fetchOverpass(location)]);
    } catch (error: any) {
        return callback(null, buildResponse({reason: error.cause, error: error.message}, 400));
    }

    console.log(nominatimResponse);
    console.log(overpassResponse);

    // TODO: const nodeResult = nodeParser(overpassResponse); // passes array of nodes
    // TODO: const prompt = wireUpPrompt(nominatimResponse, nodeResult); // pass city/country and nodes

    // TODO: build response
    const prompt = "This is a test prompt.";
    callback(null, buildResponse({prompt}, 200));
}
