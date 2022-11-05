import axios from "axios";
import buildResponse from "../util/response_builder";

const overpassURl = "https://overpass-api.de/api/interpreter";
const overpassOptions = {headers: {"Content-Type": "text/plain"}};

type RequestBody = {
    south: number,
    west: number,
    north: number,
    east: number,
}

const fetchOverpass = async (box: RequestBody) => {
    const body = `
    [out:csv(::lat, ::lon; true; ";")][timeout:25][bbox:${box.south},${box.west},${box.north},${box.east}];
    nwr[amenity=bar];
    out center;
    `

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
    var overpassResponse;
    try {
        overpassResponse = await fetchOverpass(event);
    } catch (error: any) {
        return callback(null, buildResponse({reason: error.cause, error: error.message}, 400));
    }


    // TODO: do some felix magic

    return callback(null, buildResponse(overpassResponse));
}
