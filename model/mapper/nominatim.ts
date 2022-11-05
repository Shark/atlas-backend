import { Location } from "../place";

export class NominatimResponseMapper {
  // response is supposed to be a parsed JSON object, not a string
  map(response: any): Location[] {
    if(!response || !('address' in response)) {
      throw new Error('expected "address" in response');
    }
    const address = response.address;
    var elements: Location[] = [];
    if('city' in address) {
      elements.push({
        type: 'city',
        value: address.city,
      });
    }
    if('country' in address) {
      elements.push({
        type: 'country',
        value: address.country,
      });
    }
    return elements;
  }

}

// type ReverseGeocoderResponse = {
//   country: string,
//   city: string,
//   town: string,
//   village: string,
// }
