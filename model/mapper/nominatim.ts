import { Location } from "../place.js";

export class NominatimResponseMapper {
  // response is supposed to be a parsed JSON object, not a string
  map(response: any): Location[] {
    if(!response || !('address' in response)) {
      throw new Error('expected "address" in response');
    }
    const address = response.address;
    var inElements: Location[] = [];
    const values: string[] = [];
    if(('city' in address) && !values.includes(address.city)) {
      values.push(address.city);
      inElements.push({
        type: 'city',
        value: address.city,
      });
    }
    if(('municipality' in address) && !values.includes(address.municipality)) {
      values.push(address.municipality);
      inElements.push({
        type: 'municipality',
        value: address.municipality,
      });
    }
    if(('town' in address) && !values.includes(address.town)) {
      values.push(address.town);
      inElements.push({
        type: 'town',
        value: address.town,
      });
    }
    if(('village' in address) && !values.includes(address.village)) {
      values.push(address.village);
      inElements.push({
        type: 'village',
        value: address.village,
      });
    }
    if(('country' in address) && !values.includes(address.country)) {
      values.push(address.country);
      inElements.push({
        type: 'country',
        value: address.country,
      });
    }
    return inElements;
  }

}

// type ReverseGeocoderResponse = {
//   country: string,
//   city: string,
//   town: string,
//   village: string,
// }
