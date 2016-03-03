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

var MockHelper = require('./mock-helper');

module.exports = function(mbedConnectorApi, config) {
  describe('Endpoints', function() {
    if (!config.mock) {
      this.timeout(30000);
    }

    before(function(done) {
      mbedConnectorApi.removeAllListeners();

      if (config.mock) {
        done();
      } else {
        config.clientManager.startClient(done);
      }
    });

    after(function(done) {
      mbedConnectorApi.stopLongPolling();

      if (config.mock) {
        done();
      } else {
        config.clientManager.stopClient(done);
      }
    });

    describe('#getEndpoints', function() {
      var mockApi;

      before(function() {
        if (config.mock) {
          mockApi = nock(config.host, config.nockConfig)
                    .get(urljoin('/', mbedConnectorApi.options.restApiVersion, 'endpoints'))
                    .reply(200, [
                      {
                        'name': config.endpointName,
                        'type': 'test',
                        'status': 'ACTIVE'
                      }
                    ]);
        }
      });

      it('should get endpoints', function(done) {
        mbedConnectorApi.getEndpoints(function(error, endpoints) {
          assert(!error);
          assert(util.isArray(endpoints));
          assert(endpoints.length > 0);

          var testEndpointMatches = endpoints.filter(function(endpoint) {
            return endpoint.name === config.endpointName;
          });

          assert(testEndpointMatches.length > 0);
          done();
        });
      });
    });

    describe('#getResources', function() {
      var mockApi;

      before(function() {
        if (config.mock) {
          var mockApi = nock(config.host, config.nockConfig)
                        .get(urljoin('/', mbedConnectorApi.options.restApiVersion, 'endpoints', config.endpointName))
                        .reply(200, [
                          {
                            'uri': config.resourceName,
                            'rt': 'ResourceTest',
                            'obs': false,
                            'type': ''
                          }
                        ]);
        }
      });

      it("should get a list of an endpoint's resources", function(done) {
        mbedConnectorApi.getResources(config.endpointName, function(error, resources) {
          assert(!error);
          assert(util.isArray(resources));
          assert(resources.length > 0);

          resources.forEach(function(resource) {
            assert('uri' in resource);
            assert(util.isString(resource.uri));
            assert('obs' in resource);
            assert(util.isBoolean(resource.obs));
            assert('type' in resource);
            assert(util.isString(resource.type));
          });

          done();
        });
      });
    });

    var getResourceValueTest = function(done){
      mbedConnectorApi.getResourceValue(config.endpointName, config.resourceName, function(error, value) {
        assert(!error, String(error));
        assert(util.isString(value));
        assert(parseInt(value) >= 0);
        done();
      });
    };

    describe('#getResourceValue', function() {
      var mockApi;

      before(function(done) {
        if (config.mock) {
          mockApi = nock(config.host, config.nockConfig)
                    .get(urljoin('/', mbedConnectorApi.options.restApiVersion, 'endpoints', config.endpointName, config.resourceName))
                    .reply(200, 1);

          done();
        } else {
          mbedConnectorApi.startLongPolling(done);
        }
      });

      after(function() {
        mbedConnectorApi.stopLongPolling();
      });

      it('should get a resource value', getResourceValueTest);
    });

    if (config.mock) {
      describe('#getResourceValue (async-response)', function() {
        var mockApi;

        before(function(done) {
          var longPollCb;
          mockApi = MockHelper.createLongPollInstance(config.host, config.nockConfig);
          mockApi.get(urljoin('/', mbedConnectorApi.options.restApiVersion, 'endpoints', config.endpointName, config.resourceName))
                  .reply(202, function() {
                    setTimeout(function() {
                      longPollCb(null, [
                        200,
                        {
                          "async-responses": [
                            {
                              "id": "23471#node-001@test.domain.com/dev/temp",
                              "status":  200,
                              "payload":  "MQ=="
                            }
                          ]
                        }
                      ]);
                    }, 100);

                    return {
                      "async-response-id": "23471#node-001@test.domain.com/dev/temp"
                    };
                  });

          mockApi.persist()
                  .get(urljoin('/', mbedConnectorApi.options.restApiVersion, 'notification', 'pull'))
                  .query({ noWait: false })
                  .reply(function(uri, requestBody, cb) {
                    longPollCb = cb;
                  });
          mockApi.persist()
                  .get(urljoin('/', mbedConnectorApi.options.restApiVersion, 'notification', 'pull'))
                  .query({ noWait: true })
                  .reply(204);

          mbedConnectorApi.startLongPolling(done);
        });

        after(function() {
          mbedConnectorApi.stopLongPolling();
          nock.cleanAll();
        });

        it('should get a resource value (after first receiving an async response)', getResourceValueTest);
      });
    }

    var putResourceValueTest = function(done) {
      mbedConnectorApi.putResourceValue(config.endpointName, config.resourceName, 1, function(error, value) {
        assert(!error, String(error));
        done();
      });
    };

    describe('#putResourceValue', function() {
      var mockApi;

      before(function(done) {
        if (config.mock) {
          mockApi = nock(config.host, config.nockConfig)
                    .put(urljoin('/', mbedConnectorApi.options.restApiVersion, 'endpoints', config.endpointName, config.resourceName))
                    .reply(200);

          done();
        } else {
          mbedConnectorApi.startLongPolling(done);
        }
      });

      after(function() {
        mbedConnectorApi.stopLongPolling();
      });

      it("should put a resource's value", putResourceValueTest);
    });

    if (config.mock) {
      describe('#putResourceValue (async-response)', function() {
        var mockApi;

        before(function(done) {
          var longPollCb;
          mockApi = MockHelper.createLongPollInstance(config.host, config.nockConfig);
          mockApi.put(urljoin('/', mbedConnectorApi.options.restApiVersion, 'endpoints', config.endpointName, config.resourceName))
                  .reply(202, function() {
                    setTimeout(function() {
                      longPollCb(null, [
                        200,
                        {
                          "async-responses": [
                            {
                              "id": "23472#node-001@test.domain.com/dev/temp",
                              "status":  200
                            }
                          ]
                        }
                      ]);
                    }, 100);

                    return {
                      "async-response-id": "23472#node-001@test.domain.com/dev/temp"
                    };
                  });

          mockApi.persist()
                  .get(urljoin('/', mbedConnectorApi.options.restApiVersion, 'notification', 'pull'))
                  .query({ noWait: false })
                  .reply(function(uri, requestBody, cb) {
                    longPollCb = cb;
                  });

          mockApi.persist()
                  .get(urljoin('/', mbedConnectorApi.options.restApiVersion, 'notification', 'pull'))
                  .query({ noWait: true })
                  .reply(204);

          mbedConnectorApi.startLongPolling(done);
        });

        after(function() {
          mbedConnectorApi.stopLongPolling();
          nock.cleanAll();
        });

        it("should put a resource's value (after first receiving an async response)", putResourceValueTest);
      });
    }

    if (config.mock) {
      var postResourceTest = function(done) {
        mbedConnectorApi.postResource(config.endpointName, config.resourceName, null, function(error, value) {
          assert(!error, String(error));
          done();
        });
      };

      describe('#postResource', function() {
        var mockApi;

        before(function(done) {
          if (config.mock) {
            mockApi = nock(config.host, config.nockConfig)
                      .post(urljoin('/', mbedConnectorApi.options.restApiVersion, 'endpoints', config.endpointName, config.resourceName))
                      .reply(200);

            done();
          } else {
            mbedConnectorApi.startLongPolling(done);
          }
        });

        after(function() {
          mbedConnectorApi.stopLongPolling();
        });

        it("should post a resource", postResourceTest);
      });

      describe('#postResource (async-response)', function() {
        var mockApi;

        before(function(done) {
          var longPollCb;
          mockApi = MockHelper.createLongPollInstance(config.host, config.nockConfig);
          mockApi.post(urljoin('/', mbedConnectorApi.options.restApiVersion, 'endpoints', config.endpointName, config.resourceName))
                  .reply(202, function() {
                    setTimeout(function() {
                      longPollCb(null, [
                        200,
                        {
                          "async-responses": [
                            {
                              "id": "23473#node-001@test.domain.com/dev/temp",
                              "status":  200
                            }
                          ]
                        }
                      ]);
                    }, 100);

                    return {
                      "async-response-id": "23473#node-001@test.domain.com/dev/temp"
                    };
                  });

          mockApi.persist()
                  .get(urljoin('/', mbedConnectorApi.options.restApiVersion, 'notification', 'pull'))
                  .query({ noWait: false })
                  .reply(function(uri, requestBody, cb) {
                    longPollCb = cb;
                  });

          mockApi.persist()
                  .get(urljoin('/', mbedConnectorApi.options.restApiVersion, 'notification', 'pull'))
                  .query({ noWait: true })
                  .reply(204);

          mbedConnectorApi.startLongPolling(done);
        });

        after(function() {
          mbedConnectorApi.stopLongPolling();
          nock.cleanAll();
        });

        it("should post a resource (after first receiving an async response)", postResourceTest);
      });
    }

    if (config.mock) {
      var deleteEndpointTest = function(done) {
        mbedConnectorApi.deleteEndpoint(config.endpointName, function(error, value) {
          assert(!error, String(error));
          done();
        });
      };

      describe('#deleteEndpoint', function() {
        var mockApi;

        before(function(done) {
          if (config.mock) {
            mockApi = nock(config.host, config.nockConfig)
                      .delete(urljoin('/', mbedConnectorApi.options.restApiVersion, 'endpoints', config.endpointName))
                      .reply(200);

            done();
          } else {
            mbedConnectorApi.startLongPolling(done);
          }
        });

        after(function() {
          mbedConnectorApi.stopLongPolling();
        });

        it("should delete an endpoint", deleteEndpointTest);
      });

      describe('#deleteEndpoint (async-response)', function() {
        var mockApi;

        before(function(done) {
          var longPollCb;
          mockApi = MockHelper.createLongPollInstance(config.host, config.nockConfig);
          mockApi.delete(urljoin('/', mbedConnectorApi.options.restApiVersion, 'endpoints', config.endpointName))
                  .reply(202, function() {
                    setTimeout(function() {
                      longPollCb(null, [
                        200,
                        {
                          "async-responses": [
                            {
                              "id": "23474#node-001@test.domain.com/dev/temp",
                              "status":  200
                            }
                          ]
                        }
                      ]);
                    }, 100);

                    return {
                      "async-response-id": "23474#node-001@test.domain.com/dev/temp"
                    };
                  });

          mockApi.persist()
                  .get(urljoin('/', mbedConnectorApi.options.restApiVersion, 'notification', 'pull'))
                  .query({ noWait: false })
                  .reply(function(uri, requestBody, cb) {
                    longPollCb = cb;
                  });

          mockApi.persist()
                  .get(urljoin('/', mbedConnectorApi.options.restApiVersion, 'notification', 'pull'))
                  .query({ noWait: true })
                  .reply(204);

          mbedConnectorApi.startLongPolling(done);
        });

        after(function() {
          mbedConnectorApi.stopLongPolling();
          nock.cleanAll();
        });

        it("should delete and endpoint (after first receiving an async response)", deleteEndpointTest);
      });
    }

  });
};