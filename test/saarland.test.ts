
import test from 'ava';
import { OverpassResponseMapper } from '../model/mapper/overpass';
import { reply as OverpassResult } from './fixtures/saarland/overpass_suggest';

test('overpass clustering', t => {
	const mapper = new OverpassResponseMapper();
	const result = mapper.cluster(OverpassResult);
	t.assert(result.length === 5);
})
