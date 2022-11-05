
import test from 'ava';
import { point } from "@turf/turf";
import { NominatimResponseMapper } from '../model/mapper/nominatim';
import { OverpassResponseMapper } from '../model/mapper/overpass';
import NominatimResult from './fixtures/cologne/nominatim.json';
import OverpassResult from './fixtures/cologne/overpass.json';
import OverpassResult2 from './fixtures/cologne/overpass2.json';

test('nominatim', t => {
	const mapper = new NominatimResponseMapper();
	const result = mapper.map(NominatimResult);
	t.assert(result.length === 2);
	t.deepEqual(result[0], {
		type: 'city',
		value: 'Cologne',
	});
	t.deepEqual(result[1], {
		type: 'country',
		value: 'Germany',
	});
});

test('overpass', t => {
	const mapper = new OverpassResponseMapper();
	const result = mapper.map(OverpassResult, point([50.94212, 6.95779]));
	t.assert(result);
})

test('overpass 2', t => {
	const mapper = new OverpassResponseMapper();
	const result = mapper.map(OverpassResult2, point([50.94212, 6.95779]));
	t.assert(result);
})
