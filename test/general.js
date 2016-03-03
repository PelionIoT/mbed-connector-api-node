/*
 * Copyright (c) 2013-2016, ARM Limited, All Rights Reserved
 * SPDX-License-Identifier: Apache-2.0
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var nock = require('nock');
var urljoin = require('url-join');
var assert = require('assert');
var util = require('util');

module.exports = function(mbedConnectorApi, config) {
  describe('General', function() {
    if (!config.mock) {
      this.timeout(10000);
    }

    describe('#mbedConnectorApi', function() {
      it('should set the appropriate variables in the constructor', function() {
        assert.strictEqual(mbedConnectorApi.options.host, config.host);
        assert.strictEqual(mbedConnectorApi.options.accessKey, config.accessKey);
      });
    });

    describe('#getLimits', function() {
      var mockApi;

      before(function() {
        if (config.mock) {
          mockApi = nock(config.host, config.nockConfig)
                    .get(urljoin('/', mbedConnectorApi.options.restApiVersion, '/limits'))
                    .reply(200, {
                      'transaction-quota': 10000,
                      'transaction-count': 7845,
                      'endpoint-quota': 100,
                      'endpoint-count': 50
                    });
        }
      });

      it('should return the traffic limits', function(done) {
        mbedConnectorApi.getLimits(function(error, limits) {
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
        mbedConnectorApi.getApiVersions(function(error, apiVersions) {
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
        mbedConnectorApi.getConnectorVersion(function(error, connectorVersion) {
          assert(!error, String(error));
          assert(util.isString(connectorVersion));
          done();
        });
      });
    });
  });
};