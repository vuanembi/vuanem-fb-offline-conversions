import offlineConversionService from '../src/offlineConversion/offlineConversionService';

jest.setTimeout(100000000)

describe('Offline Conversion', () => {
    it('Pipeline Service', async () => {
        const options = {
            day: 1,
        };
        const res = await offlineConversionService(options);
        expect(res).toBeGreaterThan(0);
    })
});
