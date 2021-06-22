const assert = require('chai').assert;
const sinon = require('sinon');

const { main } = require('..');

describe('Unit Test', () => {
    it('auto', async () => {
        const req = {
            day: 1,
        };
        const res = { send: sinon.stub() };
        await main(req, res);
        assert.isTrue(res.send.calledOnce);
        for (let result of res.send.firstCall.firstArg.results) {
            assert.isAbove(result.num_processed_entries, 0);
        }
    }).timeout(10000);
});
