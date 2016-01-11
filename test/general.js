var nock = require('nock');
var urljoin = require('url-join');
var assert = require('assert');
var util = require('util');

require('dotenv').load({silent: true});

var host = process.env.host || 'https://api.connector.mbed.com';
var accessKey = process.env.ACCESS_KEY
var endpointName = process.env.ENDPOINT_NAME
var resourceName = process.env.RESOURCE_NAME

var config = {
  reqheaders: {
    'Authorization': 'Bearer ' + accessKey
  }
}

module.exports = function(mbedConnector, mock) {
  describe('General', function() {
    if (!mock) {
      this.timeout(10000);
    }

    describe('#MbedConnector', function() {
      it('should set the appropriate variables in the constructor', function() {
        assert.strictEqual(mbedConnector.options.host, host);
        assert.strictEqual(mbedConnector.options.accessKey, accessKey);
      });
    });

    describe('#getLimits', function() {
      var mockApi;

      before(function() {
        if (mock) {
          mockApi = nock(mbedConnector.options.host, config)
                    .get('/limits')
                    .reply(200, {
                      'transaction-quota': 10000,
                      'transaction-count': 7845,
                      'endpoint-quota': 100,
                      'endpoint-count': 50
                    });
        }
      });

      it('should return the traffic limits', function(done) {
        mbedConnector.getLimits(function(error, limits) {
          assert(!error);
          assert('transaction-quota' in limits);
          assert(util.isNumber(limits['transaction-quota']));
          assert.strictEqual(limits['transaction-quota'], 10000);

          assert('transaction-count' in limits);
          assert(util.isNumber(limits['transaction-count']));
          assert(limits['transaction-count'] >= 0);

          assert('endpoint-quota' in limits);
          assert(util.isNumber(limits['endpoint-quota']));
          assert.strictEqual(limits['endpoint-quota'], 100);

          assert('endpoint-count' in limits);
          assert(util.isNumber(limits['endpoint-count']));
          assert(limits['endpoint-count'] >= 0);

          done();
        });
      });
    });
  });
};