import { assert } from 'chai';

import offlineConversionService from '../src/offlineConversion/offlineConversionService';

describe('Offline Conversion', () => {
    it('Pipeline Service', async () => {
        const options = {
            day: 1,
        };
        const res = await offlineConversionService(options);
        assert.isAbove(res, 0);
    }).timeout(540000);
});
