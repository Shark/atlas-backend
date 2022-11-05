import { distance, point, Coord } from "@turf/turf";
import { Feature } from "../place";
import Tags from './tags.json';

export class OverpassResponseMapper {
  // response is supposed to be a parsed JSON object, not a string
  map(response: any, forPoint: Coord): Feature[] {
    if(!response || !('elements' in response)) {
      throw new Error('expected elements in response');
    }
    const unfilteredFeatures: Feature[] = [];

    // Mapping elements to unfiltered features
    for(const element of response.elements) {
      if(!('tags' in element)) {
        throw new Error('expected tags in element');
      }
      for(const key in element.tags) {
        const value = element.tags[key];
        const searchKey = `${key}=${value}`;
        var coords: Coord;
        if('lat' in element && 'lon' in element) {
          coords = point([element.lat, element.lon]);
        } else if('center' in element && 'lat' in element.center && 'lon' in element.center) {
          coords = point([element.center.lat, element.center.lon]);
        } else {
          throw new Error('fail')
        }
        const pointDistance = distance(forPoint, coords, { units: 'kilometers' });
        if(searchKey in Tags) {
          // @ts-ignore
          const mappedValue = Tags[searchKey];
          unfilteredFeatures.push({
            type: mappedValue,
            distance: Math.round(pointDistance * 1000),
            name: 'name:en' in element.tags ? element.tags['name:en'] : element.tags.name,
          })
        }
      }
    }

    // Sorting the unfiltered features
    unfilteredFeatures.sort((a, b) => a.distance - b.distance)

    const whatWeGot: Map<String, number> = new Map();
    const filteredFeatures: Feature[] = [];

    var count = 0;
    for(const feature of unfilteredFeatures) {

      var key = feature.type;
      const value = whatWeGot.get(key)
      if(value) {
        continue;
      } else {
        whatWeGot.set(key, 1);
      }
      filteredFeatures.push(feature);
      count += 1;
    }

    return filteredFeatures;
  }
}
