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
  if (config.useCallback) {
    describe('Notifications', function() {
      if (!config.mock) {
        this.timeout(10000);
      }

      describe('#getCallback', function() {
        var mockApi;
        before(function(done) {
          if (config.mock) {
            mockApi = nock(config.host, config.nockConfig)
                      .get(urljoin('/', mbedConnectorApi.options.restApiVersion, 'notification', 'callback'))
                      .reply(200, { url: config.callbackUrl })
                      .put(urljoin('/', mbedConnectorApi.options.restApiVersion, 'notification', 'callback'))
                      .reply(204);
          }

          mbedConnectorApi.putCallback(config.callbackUrl, done);
        });

        if (!config.mock) {
          after(function(done) {
            mbedConnectorApi.deleteCallback(done);
          });
        }

        it('should get the current callback data', function(done) {
          mbedConnectorApi.getCallback(function(error, callbackData) {
            assert(!error);
            assert(util.isObject(callbackData));
            assert.strictEqual(callbackData.url, config.callbackUrl);
            done();
          });
        });
      });

      describe('#setCallback', function() {
        var mockApi;

        if (config.mock) {
          before(function() {
            mockApi = nock(config.host, config.nockConfig)
                      .put(urljoin('/', mbedConnectorApi.options.restApiVersion, 'notification', 'callback'))
                      .reply(204);
          });
        }

        if (!config.mock) {
          after(function(done) {
            mbedConnectorApi.deleteCallback(done);
          });
        }

        it('should put the new callback data', function(done) {
          mbedConnectorApi.putCallback(config.callbackUrl, done);
        });
      });

      describe('#deleteCallback', function() {
        var mockApi;

        before(function(done) {
          if (config.mock) {
            mockApi = nock(config.host, config.nockConfig)
                    .put(urljoin('/', mbedConnectorApi.options.restApiVersion, 'notification', 'callback'))
                    .reply(204)
                    .delete(urljoin('/', mbedConnectorApi.options.restApiVersion, 'notification', 'callback'))
                    .reply(204);
          }

          mbedConnectorApi.putCallback(config.callbackUrl, done);
        });

        it('should delete the current callback data', function(done) {
          mbedConnectorApi.deleteCallback(done);
        });
      });
    });
  }

  describe('Handle-Notifications', function() {
    if (!config.mock) {
      this.timeout(30000);
    }

    before(function() {
      mbedConnectorApi.removeAllListeners();
    });

    after(function() {
      mbedConnectorApi.removeAllListeners();
    });

    afterEach(function() {
      mbedConnectorApi.removeAllListeners();
    });

    describe('notifications', function() {
      var mockApi;

      before(function(done) {
        if (config.mock) {
          var longPollCb;
          mockApi = MockHelper.createLongPollInstance(config.host, config.nockConfig);
          mockApi.put(urljoin('/', mbedConnectorApi.options.restApiVersion, 'subscriptions', config.endpointName, config.resourceName))
                  .reply(200)
                  .delete(urljoin('/', mbedConnectorApi.options.restApiVersion, 'subscriptions', config.endpointName, config.resourceName))
                  .reply(204)
                  .persist()
                  .get(urljoin('/', mbedConnectorApi.options.restApiVersion, 'notification', 'pull'))
                  .query({ noWait: false })
                  .reply(function(uri, requestBody, cb) {
                    longPollCb = cb;
                  })
                  .get(urljoin('/', mbedConnectorApi.options.restApiVersion, 'notification', 'pull'))
                  .query({ noWait: true })
                  .reply(204);

          setTimeout(function() {
            longPollCb(null, [
              200,
              {
                "notifications": [
                  {
                    "ep": config.endpointName,
                    "path": config.resourceName,
                    "payload": "MQ=="
                  }
                ]
              }
            ]);
          }, 500);
        }

        mbedConnectorApi.startLongPolling(function(error) {
          assert(!error, String(error));

          if (config.mock) {
            mbedConnectorApi.putResourceSubscription(config.endpointName, config.resourceName, done);
          } else {
            config.clientManager.startClient(function() {
              mbedConnectorApi.putResourceSubscription(config.endpointName, config.resourceName, done);
            });
          }
        });
      });

      after(function(done) {
        mbedConnectorApi.deleteResourceSubscription(config.endpointName, config.resourceName, function(error) {
          assert(!error, String(error));

          mbedConnectorApi.stopLongPolling();

          if (config.mock) {
            nock.cleanAll();
            done();
          } else {
            config.clientManager.stopClient(done);
          }
        });
      });

      it('should handle notifications', function(done) {
        mbedConnectorApi.on('notification', function(notification) {
          if (notification.ep === config.endpointName &&
              notification.path === config.resourceName) {
            assert(notification.payload >= 0);
            done();
          }
        });
      });
    });

    describe('registrations', function() {
      var mockApi;

      before(function(done) {
        if (config.mock) {
          var longPollCb;
          mockApi = MockHelper.createLongPollInstance(config.host, config.nockConfig);
          mockApi.persist()
                  .get(urljoin('/', mbedConnectorApi.options.restApiVersion, 'notification', 'pull'))
                  .query({ noWait: false })
                  .reply(function(uri, requestBody, cb) {
                    longPollCb = cb;
                  })
                  .get(urljoin('/', mbedConnectorApi.options.restApiVersion, 'notification', 'pull'))
                  .query({ noWait: true })
                  .reply(204);

          setTimeout(function() {
            // In reality, the "registrations" object is more complex, but we're
            // only mocking the minimum of what this test looks for
            longPollCb(null, [
              200,
              {
                "registrations": [
                  {
                    "ep": config.endpointName
                  }
                ]
              }
            ]);
          }, 500);
        }

        mbedConnectorApi.startLongPolling(done);
      });

      after(function() {
        mbedConnectorApi.stopLongPolling();

        if (config.mock) {
          nock.cleanAll();
        }
      });

      it('should handle registrations', function(done) {
        mbedConnectorApi.on('registration', function(registration) {
          if (registration.ep === config.endpointName) {
            done();
          }
        });

        if (!config.mock) {
          config.clientManager.startClient();
        }
      });
    });

    describe('reg-updates', function() {
      var mockApi;

      this.timeout(120000);

      before(function(done) {
        if (config.mock) {
          var longPollCb;
          mockApi = MockHelper.createLongPollInstance(config.host, config.nockConfig);
          mockApi.persist()
                  .get(urljoin('/', mbedConnectorApi.options.restApiVersion, 'notification', 'pull'))
                  .query({ noWait: false })
                  .reply(function(uri, requestBody, cb) {
                    longPollCb = cb;
                  })
                  .get(urljoin('/', mbedConnectorApi.options.restApiVersion, 'notification', 'pull'))
                  .query({ noWait: true })
                  .reply(204);

          setTimeout(function() {
            // In reality, the "reg-updates" object is more complex, but we're
            // only mocking the minimum of what this test looks for
            longPollCb(null, [
              200,
              {
                "reg-updates": [
                  {
                    "ep": config.endpointName
                  }
                ]
              }
            ]);
          }, 500);
        }

        mbedConnectorApi.startLongPolling(done);
      });

      after(function() {
        mbedConnectorApi.stopLongPolling();

        if (config.mock) {
          nock.cleanAll();
        }
      });

      it('should handle reg-updates', function(done) {
        mbedConnectorApi.on('reg-update', function(regUpdate) {
          if (regUpdate.ep === config.endpointName) {
            done()
          }
        });
      });
    });

    describe('de-registrations', function() {
      var mockApi;

      before(function(done) {
        if (config.mock) {
          var longPollCb;
          mockApi = MockHelper.createLongPollInstance(config.host, config.nockConfig);
          mockApi.persist()
                  .get(urljoin('/', mbedConnectorApi.options.restApiVersion, 'notification', 'pull'))
                  .query({ noWait: false })
                  .reply(function(uri, requestBody, cb) {
                    longPollCb = cb;
                  })
                  .get(urljoin('/', mbedConnectorApi.options.restApiVersion, 'notification', 'pull'))
                  .query({ noWait: true })
                  .reply(204);

          setTimeout(function() {
            longPollCb(null, [
              200,
              {
                "de-registrations": [
                  config.endpointName
                ]
              }
            ]);
          }, 500);
        }

        mbedConnectorApi.startLongPolling(function(error) {
          assert(!error, String(error));

          if (config.mock) {
            done();
          } else {
            config.clientManager.startClient(done);
          }
        });
      });

      after(function() {
        mbedConnectorApi.stopLongPolling();

        if (config.mock) {
          nock.cleanAll();
        }
      });

      it('should handle de-registrations', function(done) {
        mbedConnectorApi.on('de-registration', function(endpoint) {
          if (endpoint === config.endpointName) {
            done();
          }
        });

        if (!config.mock) {
          config.clientManager.stopClient();
        }
      });
    });

    describe('registrations-expired', function() {
      var mockApi;

      this.timeout(200000);

      before(function(done) {
        if (config.mock) {
          var longPollCb;
          mockApi = MockHelper.createLongPollInstance(config.host, config.nockConfig);
          mockApi.persist()
                  .get(urljoin('/', mbedConnectorApi.options.restApiVersion, 'notification', 'pull'))
                  .query({ noWait: false })
                  .reply(function(uri, requestBody, cb) {
                    setTimeout(function() {
                      cb(null, [
                        200,
                        {
                          "registrations-expired": [
                            config.endpointName
                          ]
                        }
                      ]);
                    }, 500);
                  })
                  .get(urljoin('/', mbedConnectorApi.options.restApiVersion, 'notification', 'pull'))
                  .query({ noWait: true })
                  .reply(204);
        }

        mbedConnectorApi.startLongPolling(function(error) {
          assert(!error, String(error));

          if (config.mock) {
            done();
          } else {
            config.clientManager.startClient(done);
          }
        });
      });

      after(function() {
        mbedConnectorApi.stopLongPolling();

        if (config.mock) {
          nock.cleanAll();
        }
      });

      it('should handle registrations-expired', function(done) {
        mbedConnectorApi.on('registration-expired', function(endpoint) {
          if (endpoint === config.endpointName) {
            done();
          }
        });

        if (!config.mock) {
          // SIGTERM signal used to ensure no de-register message is sent to Connector
          config.clientManager.stopClient(null, 'SIGTERM');
        }
      });
    });

    describe('async-responses', function() {
      it('should handle async-responses', function(done) {
        var body = '{"async-response-id": "15498#node-001@test.domain.com/dev/temp"}';

        var payload = {
          "async-responses": [
            {
              "id": "15498#node-001@test.domain.com/dev/temp",
              "status": 200,
              "payload": "MQ=="
            }
          ]
        };

        mbedConnectorApi.requestCallback(null, null, body, function(error, data) {
          assert.deepStrictEqual(data.status, 200);
          assert.deepStrictEqual(data.payload, '1');
          done(error);
        });

        mbedConnectorApi.on('async-responses', function(asyncResponses) {
          assert.deepStrictEqual(asyncResponses, expected)
          done();
        });

        mbedConnectorApi.handleNotifications(payload);
      });
    });
  });
};