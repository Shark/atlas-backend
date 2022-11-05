import axios from 'axios';
import { point } from "@turf/turf";


import buildResponse from '../util/response_builder';
import { OverpassResponseMapper } from '../model/mapper/overpass';
import { NominatimResponseMapper } from '../model/mapper/nominatim';

const overpassURl = "https://overpass-api.de/api/interpreter";
const overpassOptions = {headers: {"Content-Type": "text/plain", "Accept-Language": "en"}};
const overpassRadius = 10_000;

const nominatimResponseMapper = new NominatimResponseMapper();
const overpassResponseMapper = new OverpassResponseMapper();


type RequestBody = {
    location: {
        latitude: number,
        longitude: number
    }
}

const fetchNominatim = async (location: RequestBody['location']) => {
    const response = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${location.latitude}&lon=${location.longitude}&zoom=18&addressdetails=1`, {headers: {"Accept-Language": "en"}});
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
        nwr(around:${overpassRadius},${location.latitude},${location.longitude})->.all;
        (
        nwr.all["name:en"];
        nwr.all[wikipedia];
        )->.important;
        (
        nwr.important[aerialway];
        nwr.important[aeroway];
        nwr.important[amenity=place_of_worship];
        nwr.important[amenity=fountain];
        nwr.important[amenity=college];
        nwr.important[amenity=university];
        nwr.important[amenity=theatre];
        nwr.important[amenity=arts_theatre];
        nwr.important[boundary=national_park];
        nwr.important[building=train_station];
        nwr.important[historic=yes];
        nwr.important[historic=aqueduct];
        nwr.important[historic=battlefield];
        nwr.important[historic=building];
        nwr.important[historic=church];
        nwr.important[historic=city_gate];
        nwr.important[historic=citywalls];
        nwr.important[historic=district];
        nwr.important[historic=monument];
        nwr.important[historic=ruins];
        nwr.important[historic=ship];
        nwr.important[historic=tomb];
        nwr.important[historic=tower];
        nwr.important[landuse=vineyard];
        nwr.important[leisure=sauna];
        nwr.important[leisure=fishing];
        nwr.important[leisure=water_park];
        nwr.important[leisure=beach_resort];
        nwr.important[leisure=swimming_area];
        nwr.important[man_made=tower];
        nwr.important[man_made=bridge];
        nwr.important[tourism=attraction];
        nwr.important[water];
        nwr.important[waterway=river];
        nwr.important[waterway=dam];
        );
        out tags center;
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

    const locations = nominatimResponseMapper.map(nominatimResponse);
    const features = overpassResponseMapper.map(overpassResponse, point([location.latitude, location.longitude]));

    callback(null, buildResponse({locations, features}, 200));
}
