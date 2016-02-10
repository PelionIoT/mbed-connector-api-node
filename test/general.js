var nock = require('nock');
var urljoin = require('url-join');
var assert = require('assert');
var util = require('util');

module.exports = function(mbedConnector, config) {
  describe('General', function() {
    if (!config.mock) {
      this.timeout(10000);
    }

    describe('#MbedConnector', function() {
      it('should set the appropriate variables in the constructor', function() {
        assert.strictEqual(mbedConnector.options.host, config.host);
        assert.strictEqual(mbedConnector.options.accessKey, config.accessKey);
      });
    });

    describe('#getLimits', function() {
      var mockApi;

      before(function() {
        if (config.mock) {
          mockApi = nock(config.host, config.nockConfig)
                    .get(urljoin('/', mbedConnector.options.restApiVersion, '/limits'))
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
          assert(!error, String(error));
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

    describe('#getApiVersions', function() {
      var mockApi;
      var restApiVersions = [
        'v1',
        'v2'
      ];

      before(function() {
        if (config.mock) {
          mockApi = nock(config.host, config.nockConfig)
                    .get(urljoin('/', 'rest-versions'))
                    .reply(200, restApiVersions);
        }
      });

      it('should get the current API version', function(done) {
        mbedConnector.getApiVersions(function(error, apiVersions) {
          assert(!error, String(error));
          assert(util.isArray(apiVersions));
          done();
        });
      });
    });

    describe('#getConnectorVersion', function() {
      var mockApi;

      before(function() {
        if (config.mock) {
          mockApi = nock(config.host, config.nockConfig)
                    .get('/')
                    .reply(200, 'DeviceServer v3.0.0-520\nREST version = v2');
        }
      });

      it('should get the current Connector version', function(done) {
        mbedConnector.getConnectorVersion(function(error, connectorVersion) {
          assert(!error, String(error));
          assert(util.isString(connectorVersion));
          done();
        });
      });
    });
  });
};