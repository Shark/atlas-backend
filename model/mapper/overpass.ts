import { distance, point, Coord, clustersDbscan, featureCollection, convex, centroid } from "@turf/turf";
import { parse } from 'csv-parse/sync';
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
          coords = point([element.lon, element.lat]);
        } else if('center' in element && 'lat' in element.center && 'lon' in element.center) {
          coords = point([element.center.lon, element.center.lat]);
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

  // response is a ;-separated CSV document with lat;lon
  cluster(response: any): Coord[] {
    const records = parse(response, { delimiter: ';', columns: true });

    const allCoords = records.map((r: any) => {
      return point([r['@lon'], r['@lat']])
    });

    const clustered = clustersDbscan(featureCollection(allCoords), 8, {});
    const byCluster = clustered.features.reduce((o: any, val: any) => {
      const clusterNumber = val.properties.cluster;
      if(typeof clusterNumber === 'undefined') return o
      if(!o[clusterNumber]) o[clusterNumber] = []
      o[clusterNumber].push(val.geometry.coordinates)
      return o
    }, {});

    const hullByCluster = {}
    for(const clusterNumber in byCluster) {
      const thisCollection = featureCollection(byCluster[clusterNumber].map((p: any) => point([Number(p[0]), Number(p[1])])));
      const hull = convex(thisCollection);
      if(hull === null) continue
      // @ts-ignore
      hullByCluster[clusterNumber] = {
        n: byCluster[clusterNumber].length,
        hull
      };
    }

    const centroidByCluster = []
    for(const clusterNumber in hullByCluster) {
      // @ts-ignore
      const { n, hull } = hullByCluster[clusterNumber];
      const point = centroid(hull);
      centroidByCluster.push({
        n,
        point,
      })
    }

    centroidByCluster.sort((a, b) => b.n - a.n);

    return centroidByCluster.slice(0, 5).map(p => p.point);
  }
}
