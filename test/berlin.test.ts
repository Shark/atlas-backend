
import test from 'ava';
import { OverpassResponseMapper } from '../model/mapper/overpass';
import { reply as OverpassResult } from './fixtures/berlin/overpass_suggest';

test('overpass clustering', t => {
	const mapper = new OverpassResponseMapper();
	const result = mapper.cluster(OverpassResult);
	console.log(JSON.stringify(result));
	t.assert(result.length === 3);
})
