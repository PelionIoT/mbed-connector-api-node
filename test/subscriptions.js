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
  describe('Subscriptions', function() {
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

    describe('#getResourceSubscription', function() {
      var mockApi;


      before(function(done) {
        if (config.mock) {
          mockApi = nock(config.host, config.nockConfig)
                    .put(urljoin('/', mbedConnectorApi.options.restApiVersion, 'subscriptions', config.endpointName, config.resourceName))
                    .reply(200)
                    .get(urljoin('/', mbedConnectorApi.options.restApiVersion, 'subscriptions', config.endpointName, config.resourceName))
                    .reply(200);

          mbedConnectorApi.putResourceSubscription(config.endpointName, config.resourceName, done);
        } else {
          mbedConnectorApi.startLongPolling(function() {
            mbedConnectorApi.putResourceSubscription(config.endpointName, config.resourceName, done);
          })
        }
      });

      if (!config.mock) {
        after(function(done) {
          mbedConnectorApi.deleteResourceSubscription(config.endpointName,config.resourceName, done);
        });
      }

      it("should get the subscription a resource", function(done) {
        mbedConnectorApi.getResourceSubscription(config.endpointName, config.resourceName, function(error, subscribed) {
          assert(!error, String(error));
          assert(subscribed);
          done();
        });
      });
    });

    var putResourceSubscriptionTest = function(done){
      mbedConnectorApi.putResourceSubscription(config.endpointName, config.resourceName, function(error) {
        assert(!error, String(error));
        done();
      });
    };

    describe('#putResourceSubscription', function() {
      var mockApi;

      if (config.mock) {
        before(function() {
          mockApi = nock(config.host, config.nockConfig)
                    .put(urljoin('/', mbedConnectorApi.options.restApiVersion, 'subscriptions', config.endpointName, config.resourceName))
                    .reply(200);
        });
      } else {
        after(function(done) {
          mbedConnectorApi.deleteResourceSubscription(config.endpointName, config.resourceName, done);
        });
      }

      it("should put a subscription to a resource", putResourceSubscriptionTest);
    });

    if (config.mock) {
      describe('#putResourceSubscription (async-response)', function() {
        var mockApi;

        before(function(done) {
          var longPollCb;
          mockApi = MockHelper.createLongPollInstance(config.host, config.nockConfig);
          mockApi.put(urljoin('/', mbedConnectorApi.options.restApiVersion, 'subscriptions', config.endpointName, config.resourceName))
                  .reply(202, function() {
                    setTimeout(function() {
                      longPollCb(null, [
                        200,
                        {
                          "async-responses": [
                            {
                              "id": "12978#node-001@test.domain.com/dev/temp",
                              "status":  200
                            }
                          ]
                        }
                      ]);
                    }, 100);

                    return {
                      "async-response-id": "12978#node-001@test.domain.com/dev/temp"
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

        it("should put a subscription to a resource (after first receiving an async response)", putResourceSubscriptionTest);
      });
    }

    describe('#deleteResourceSubscription', function() {
      var mockApi;


      before(function(done) {
        if (config.mock) {
          mockApi = nock(config.host, config.nockConfig)
                    .put(urljoin('/', mbedConnectorApi.options.restApiVersion, 'subscriptions', config.endpointName, config.resourceName))
                    .reply(200)
                    .delete(urljoin('/', mbedConnectorApi.options.restApiVersion, 'subscriptions', config.endpointName, config.resourceName))
                    .reply(204);
        }

        mbedConnectorApi.putResourceSubscription(config.endpointName, config.resourceName, done);
      });

      it("should delete a subscription to a resource", function(done) {
        mbedConnectorApi.deleteResourceSubscription(config.endpointName, config.resourceName, done);
      });
    });

    describe('#getEndpointSubscriptions', function() {
      var mockApi;

      before(function(done) {
        if (config.mock) {
          mockApi = nock(config.host, config.nockConfig)
                    .put(urljoin('/', mbedConnectorApi.options.restApiVersion, 'subscriptions', config.endpointName, config.resourceName))
                    .reply(200)
                    .get(urljoin('/', mbedConnectorApi.options.restApiVersion, 'subscriptions', config.endpointName))
                    .reply(200, urljoin('/subscriptions', config.endpointName, config.resourceName));
        }

        mbedConnectorApi.putResourceSubscription(config.endpointName, config.resourceName, done);
      });

      if (!config.mock) {
        after(function(done) {
          mbedConnectorApi.deleteResourceSubscription(config.endpointName, config.resourceName, done);
        });
      }

      it("should get the subscription a resource", function(done) {
        mbedConnectorApi.getEndpointSubscriptions(config.endpointName, function(error, subscriptions) {
          assert(!error, String(error));
          assert(util.isArray(subscriptions));
          assert.strictEqual(subscriptions.length, 1);
          assert.strictEqual(subscriptions[0], urljoin('/subscriptions', config.endpointName, config.resourceName));
          done();
        });
      });
    });

    describe('#deleteEndpointSubscriptions', function() {
      var mockApi;

      before(function(done) {
        if (config.mock) {
          mockApi = nock(config.host, config.nockConfig)
                    .put(urljoin('/', mbedConnectorApi.options.restApiVersion, 'subscriptions', config.endpointName, config.resourceName))
                    .reply(200)
                    .delete(urljoin('/', mbedConnectorApi.options.restApiVersion, 'subscriptions', config.endpointName))
                    .reply(204);
        }

        mbedConnectorApi.putResourceSubscription(config.endpointName, config.resourceName, done);
      });

      it("should delete all subscriptions for an endpoint", function(done) {
        mbedConnectorApi.deleteEndpointSubscriptions(config.endpointName, done);
      });
    });

    describe('#deleteAllSubscriptions', function() {
      var mockApi;

      before(function(done) {
        if (config.mock) {
          mockApi = nock(config.host, config.nockConfig)
                    .put(urljoin('/', mbedConnectorApi.options.restApiVersion, 'subscriptions', config.endpointName, config.resourceName))
                    .reply(200)
                    .delete(urljoin('/', mbedConnectorApi.options.restApiVersion, 'subscriptions'))
                    .reply(204);
        }

        mbedConnectorApi.putResourceSubscription(config.endpointName, config.resourceName, done);
      });

      it("should delete all subscriptions for an endpoint", function(done) {
        mbedConnectorApi.deleteAllSubscriptions(done);
      });
    });

    describe('#getPreSubscription', function() {
      var mockApi;

      var preSubscriptionData = [
        {
          "endpoint-name": config.endpointName
        }
      ];

      var curPreSubscriptionData;

      before(function(done) {
        if (config.mock) {
          mockApi = nock(config.host, config.nockConfig)
                    .put(urljoin('/', mbedConnectorApi.options.restApiVersion, 'subscriptions'))
                    .reply(function(uri, requestBody) {
                      if (util.isString(requestBody)) {
                        curPreSubscriptionData = JSON.parse(requestBody);
                      } else {
                        curPreSubscriptionData = requestBody;
                      }

                      return [200, ''];
                    })
                    .get(urljoin('/', mbedConnectorApi.options.restApiVersion, 'subscriptions'))
                    .reply(function(uri, requestBody) {
                      return [200, JSON.stringify(curPreSubscriptionData)];
                    });
        }

        mbedConnectorApi.putPreSubscription(preSubscriptionData, done);
      });

      if (!config.mock) {
        after(function(done) {
          mbedConnectorApi.putPreSubscription([], done);
        });
      }

      it("should get pre subscription data", function(done) {
        mbedConnectorApi.getPreSubscription(function(error, returnedPreSubscriptionData) {
          assert(!error, String(error));
          assert.deepEqual(returnedPreSubscriptionData, preSubscriptionData);
          done();
        });
      });
    });

    describe('#putPreSubscription', function() {
      var mockApi;

      var preSubscriptionData = [
        {
          "endpoint-name": config.endpointName
        }
      ];

      if (config.mock) {
        before(function() {
          mockApi = nock(config.host, config.nockConfig)
                    .put(urljoin('/', mbedConnectorApi.options.restApiVersion, 'subscriptions'))
                    .reply(function(uri, requestBody) {
                      try {
                        if (util.isString(requestBody)) {
                          requestBody = JSON.parse(requestBody);
                        }
                        assert.deepEqual(requestBody, preSubscriptionData);
                        return [200, ''];
                      } catch(e) {
                        // Note: the body here does not mimic a mbed Device
                        // Connector response. This is intended to be a hint as
                        // to why the mocked api test failed
                        return [400, 'Incorrect data received'];
                      }
                    });
        });
      }

      if (!config.mock) {
        after(function(done) {
          mbedConnectorApi.putPreSubscription([], done);
        });
      }

      it("should put presubscription data", function(done) {
        mbedConnectorApi.putPreSubscription(preSubscriptionData, done);
      });
    });
  });
};