
import test from 'ava';
import { NominatimResponseMapper } from '../model/mapper/nominatim.js';
import NominatimResult from './fixtures/bordeaux/nominatim.js';

test('nominatim', t => {
	const mapper = new NominatimResponseMapper();
	const result = mapper.map(NominatimResult);
	t.assert(result.length === 3)
})
