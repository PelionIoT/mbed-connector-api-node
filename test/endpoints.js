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

    beforeEach(function(done) {
      mbedConnectorApi.removeAllListeners();

      if (config.mock) {
        done();
      } else {
        config.clientManager.startClient(done);
      }
    });

    afterEach(function(done) {
      mbedConnectorApi.stopLongPolling();

      if (config.mock) {
        done();
      } else {
        config.clientManager.stopClient(done);
      }
    });

    describe('#getEndpoints', function() {
      var mockApi;

      beforeEach(function() {
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

          nock(config.host, config.nockConfig)
                    .get(urljoin('/', mbedConnectorApi.options.restApiVersion, 'endpoints') + '?type=test')
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

      it('should get endpoints - options at the end', function(done) {
        mbedConnectorApi.getEndpoints(function(error, endpoints) {
          assert(!error);
          assert(util.isArray(endpoints));
          assert(endpoints.length > 0);

          var testEndpointMatches = endpoints.filter(function(endpoint) {
            return endpoint.name === config.endpointName;
          });

          assert(testEndpointMatches.length > 0);
          done();
        }, { parameters: { type: 'test' } });
      });

      it('should get endpoints - options at the beginning', function(done) {
        mbedConnectorApi.getEndpoints({ parameters: { type: 'test' } }, function(error, endpoints) {
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

      it('should get endpoints - string at the beginning', function(done) {
        mbedConnectorApi.getEndpoints('test', function(error, endpoints) {
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

      it('should get endpoints - promises', function(done) {
        var promise = mbedConnectorApi.getEndpoints();

        assert(promise.then, 'should have then property');
        assert(promise.catch, 'should have catch property');

        promise.then(function(endpoints) {
          assert(util.isArray(endpoints));
          assert(endpoints.length > 0);

          var testEndpointMatches = endpoints.filter(function(endpoint) {
            return endpoint.name === config.endpointName;
          });

          assert(testEndpointMatches.length > 0);
          done();
        }).catch(function(error) {
          assert(!error);
        });
      });

      it('should get endpoints - promises - with options', function(done) {
        var promise = mbedConnectorApi.getEndpoints('test');

        assert(promise.then, 'should have then property');
        assert(promise.catch, 'should have catch property');

        promise.then(function(endpoints) {
          assert(util.isArray(endpoints));
          assert(endpoints.length > 0);

          var testEndpointMatches = endpoints.filter(function(endpoint) {
            return endpoint.name === config.endpointName;
          });

          assert(testEndpointMatches.length > 0);
          done();
        }).catch(function(error) {
          assert(!error);
        });
      });
    });

    describe('#getResources', function() {
      var mockApi;

      beforeEach(function() {
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

      it("should allow passing in an object as first arg", function(done) {
        mbedConnectorApi.getResources({ name: config.endpointName }, function(error, resources) {
          assert(!error);
          assert(util.isArray(resources));
          assert(resources.length > 0);

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

    var getResourceValueTestWithObject = function(done){
      mbedConnectorApi.getResourceValue({ name: config.endpointName }, config.resourceName, function(error, value) {
        assert(!error, String(error));
        assert(util.isString(value));
        assert(parseInt(value) >= 0);
        done();
      });
    };

    describe('#getResourceValue', function() {
      var mockApi;

      beforeEach(function(done) {
        if (config.mock) {
          mockApi = nock(config.host, config.nockConfig)
                    .get(urljoin('/', mbedConnectorApi.options.restApiVersion, 'endpoints', config.endpointName, config.resourceName))
                    .reply(200, 1);

          done();
        } else {
          mbedConnectorApi.startLongPolling(done);
        }
      });

      afterEach(function() {
        mbedConnectorApi.stopLongPolling();
      });

      it('should get a resource value', getResourceValueTest);
      it('should get a resource value w/ object as first arg', getResourceValueTestWithObject);
    });

    if (config.mock) {
      describe('#getResourceValue (async-response)', function() {
        var mockApi;

        beforeEach(function(done) {
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

        afterEach(function() {
          mbedConnectorApi.stopLongPolling();
          nock.cleanAll();
        });

        it('should get a resource value (after first receiving an async response)', getResourceValueTest);
        it('should get a resource value with object as first arg (after first receiving an async response)',
          getResourceValueTestWithObject);
      });
    }

    var putResourceValueTest = function(done) {
      mbedConnectorApi.putResourceValue(config.endpointName, config.resourceName, 1, function(error, value) {
        assert(!error, String(error));
        done();
      });
    };

    var putResourceValueTestWithObject = function(done) {
      mbedConnectorApi.putResourceValue({ name: config.endpointName }, config.resourceName, 1, function(error, value) {
        assert(!error, String(error));
        done();
      });
    };

    describe('#putResourceValue', function() {
      var mockApi;

      beforeEach(function(done) {
        if (config.mock) {
          mockApi = nock(config.host, config.nockConfig)
                    .put(urljoin('/', mbedConnectorApi.options.restApiVersion, 'endpoints', config.endpointName, config.resourceName))
                    .reply(200);

          done();
        } else {
          mbedConnectorApi.startLongPolling(done);
        }
      });

      afterEach(function() {
        mbedConnectorApi.stopLongPolling();
      });

      it("should put a resource's value", putResourceValueTest);
      it("should put a resource's value with object as first arg", putResourceValueTestWithObject);
    });

    if (config.mock) {
      describe('#putResourceValue (async-response)', function() {
        var mockApi;

        beforeEach(function(done) {
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

        afterEach(function() {
          mbedConnectorApi.stopLongPolling();
          nock.cleanAll();
        });

        it("should put a resource's value (after first receiving an async response)", putResourceValueTest);
        it("should put a resource's value with object as first arg (after first receiving an async response)",
          putResourceValueTestWithObject);
      });
    }

    if (config.mock) {
      var postResourceTest = function(done) {
        mbedConnectorApi.postResource(config.endpointName, config.resourceName, null, function(error, value) {
          assert(!error, String(error));
          done();
        });
      };

      var postResourceTestWithObject = function(done) {
        mbedConnectorApi.postResource({ name: config.endpointName }, config.resourceName, null, function(error, value) {
          assert(!error, String(error));
          done();
        });
      };

      describe('#postResource', function() {
        var mockApi;

        beforeEach(function(done) {
          if (config.mock) {
            mockApi = nock(config.host, config.nockConfig)
                      .post(urljoin('/', mbedConnectorApi.options.restApiVersion, 'endpoints', config.endpointName, config.resourceName))
                      .reply(200);

            done();
          } else {
            mbedConnectorApi.startLongPolling(done);
          }
        });

        afterEach(function() {
          mbedConnectorApi.stopLongPolling();
        });

        it("should post a resource", postResourceTest);
        it("should post a resource with object as first arg", postResourceTestWithObject);
      });

      describe('#postResource (async-response)', function() {
        var mockApi;

        beforeEach(function(done) {
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

        afterEach(function() {
          mbedConnectorApi.stopLongPolling();
          nock.cleanAll();
        });

        it("should post a resource (after first receiving an async response)", postResourceTest);
        it("should post a resource with object as first arg (after first receiving an async response)", postResourceTestWithObject);
      });
    }

    if (config.mock) {
      var deleteEndpointTest = function(done) {
        mbedConnectorApi.deleteEndpoint(config.endpointName, function(error, value) {
          assert(!error, String(error));
          done();
        });
      };

      var deleteEndpointTestWithObject = function(done) {
        mbedConnectorApi.deleteEndpoint({ name: config.endpointName }, function(error, value) {
          assert(!error, String(error));
          done();
        });
      };

      describe('#deleteEndpoint', function() {
        var mockApi;

        beforeEach(function(done) {
          if (config.mock) {
            mockApi = nock(config.host, config.nockConfig)
                      .delete(urljoin('/', mbedConnectorApi.options.restApiVersion, 'endpoints', config.endpointName))
                      .reply(200);

            done();
          } else {
            mbedConnectorApi.startLongPolling(done);
          }
        });

        afterEach(function() {
          mbedConnectorApi.stopLongPolling();
        });

        it("should delete an endpoint", deleteEndpointTest);
        it("should delete an endpoint with object as first arg", deleteEndpointTestWithObject);
      });

      describe('#deleteEndpoint (async-response)', function() {
        var mockApi;

        beforeEach(function(done) {
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

        afterEach(function() {
          mbedConnectorApi.stopLongPolling();
          nock.cleanAll();
        });

        it("should delete and endpoint (after first receiving an async response)", deleteEndpointTest);
        it("should delete and endpoint with object as first arg (after first receiving an async response)",
          deleteEndpointTestWithObject);
      });
    }

  });
};