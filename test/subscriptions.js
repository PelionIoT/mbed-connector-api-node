var nock = require('nock');
var urljoin = require('url-join');
var assert = require('assert');
var util = require('util');

var MockHelper = require('./mock-helper');

module.exports = function(mbedConnector, config) {
  describe('Subscriptions', function() {
    if (!config.mock) {
      this.timeout(30000);
    }

    before(function(done) {
      mbedConnector.removeAllListeners();
      if (config.mock) {
        done();
      } else {
        config.clientManager.startClient(done);
      }
    });

    after(function(done) {
      mbedConnector.stopLongPolling();
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
                    .put(urljoin('/', mbedConnector.options.restApiVersion, 'subscriptions', config.endpointName, config.resourceName))
                    .reply(200)
                    .get(urljoin('/', mbedConnector.options.restApiVersion, 'subscriptions', config.endpointName, config.resourceName))
                    .reply(200);

          mbedConnector.putResourceSubscription(config.endpointName, config.resourceName, done);
        } else {
          mbedConnector.startLongPolling(function() {
            mbedConnector.putResourceSubscription(config.endpointName, config.resourceName, done);
          })
        }
      });

      if (!config.mock) {
        after(function(done) {
          mbedConnector.deleteResourceSubscription(config.endpointName,config.resourceName, done);
        });
      }

      it("should get the subscription a resource", function(done) {
        mbedConnector.getResourceSubscription(config.endpointName, config.resourceName, function(error, subscribed) {
          assert(!error, String(error));
          assert(subscribed);
          done();
        });
      });
    });

    var putResourceSubscriptionTest = function(done){
      mbedConnector.putResourceSubscription(config.endpointName, config.resourceName, function(error) {
        assert(!error, String(error));
        done();
      });
    };

    describe('#putResourceSubscription', function() {
      var mockApi;

      if (config.mock) {
        before(function() {
          mockApi = nock(config.host, config.nockConfig)
                    .put(urljoin('/', mbedConnector.options.restApiVersion, 'subscriptions', config.endpointName, config.resourceName))
                    .reply(200);
        });
      } else {
        after(function(done) {
          mbedConnector.deleteResourceSubscription(config.endpointName, config.resourceName, done);
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
          mockApi.put(urljoin('/', mbedConnector.options.restApiVersion, 'subscriptions', config.endpointName, config.resourceName))
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
                  .get(urljoin('/', mbedConnector.options.restApiVersion, 'notification', 'pull'))
                  .query({ noWait: false })
                  .reply(function(uri, requestBody, cb) {
                    longPollCb = cb;
                  });
          mockApi.persist()
                  .get(urljoin('/', mbedConnector.options.restApiVersion, 'notification', 'pull'))
                  .query({ noWait: true })
                  .reply(204);

          mbedConnector.startLongPolling(done);
        });

        after(function() {
          mbedConnector.stopLongPolling();
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
                    .put(urljoin('/', mbedConnector.options.restApiVersion, 'subscriptions', config.endpointName, config.resourceName))
                    .reply(200)
                    .delete(urljoin('/', mbedConnector.options.restApiVersion, 'subscriptions', config.endpointName, config.resourceName))
                    .reply(204);
        }

        mbedConnector.putResourceSubscription(config.endpointName, config.resourceName, done);
      });

      it("should delete a subscription to a resource", function(done) {
        mbedConnector.deleteResourceSubscription(config.endpointName, config.resourceName, done);
      });
    });

    describe('#getEndpointSubscriptions', function() {
      var mockApi;

      before(function(done) {
        if (config.mock) {
          mockApi = nock(config.host, config.nockConfig)
                    .put(urljoin('/', mbedConnector.options.restApiVersion, 'subscriptions', config.endpointName, config.resourceName))
                    .reply(200)
                    .get(urljoin('/', mbedConnector.options.restApiVersion, 'subscriptions', config.endpointName))
                    .reply(200, urljoin('/subscriptions', config.endpointName, config.resourceName));
        }

        mbedConnector.putResourceSubscription(config.endpointName, config.resourceName, done);
      });

      if (!config.mock) {
        after(function(done) {
          mbedConnector.deleteResourceSubscription(config.endpointName, config.resourceName, done);
        });
      }

      it("should get the subscription a resource", function(done) {
        mbedConnector.getEndpointSubscriptions(config.endpointName, function(error, subscriptions) {
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
                    .put(urljoin('/', mbedConnector.options.restApiVersion, 'subscriptions', config.endpointName, config.resourceName))
                    .reply(200)
                    .delete(urljoin('/', mbedConnector.options.restApiVersion, 'subscriptions', config.endpointName))
                    .reply(204);
        }

        mbedConnector.putResourceSubscription(config.endpointName, config.resourceName, done);
      });

      it("should delete all subscriptions for an endpoint", function(done) {
        mbedConnector.deleteEndpointSubscriptions(config.endpointName, done);
      });
    });

    describe('#deleteAllSubscriptions', function() {
      var mockApi;

      before(function(done) {
        if (config.mock) {
          mockApi = nock(config.host, config.nockConfig)
                    .put(urljoin('/', mbedConnector.options.restApiVersion, 'subscriptions', config.endpointName, config.resourceName))
                    .reply(200)
                    .delete(urljoin('/', mbedConnector.options.restApiVersion, 'subscriptions'))
                    .reply(204);
        }

        mbedConnector.putResourceSubscription(config.endpointName, config.resourceName, done);
      });

      it("should delete all subscriptions for an endpoint", function(done) {
        mbedConnector.deleteAllSubscriptions(done);
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
                    .put(urljoin('/', mbedConnector.options.restApiVersion, 'subscriptions'))
                    .reply(function(uri, requestBody) {
                      if (util.isString(requestBody)) {
                        curPreSubscriptionData = JSON.parse(requestBody);
                      } else {
                        curPreSubscriptionData = requestBody;
                      }

                      return [200, ''];
                    })
                    .get(urljoin('/', mbedConnector.options.restApiVersion, 'subscriptions'))
                    .reply(function(uri, requestBody) {
                      return [200, JSON.stringify(curPreSubscriptionData)];
                    });
        }

        mbedConnector.putPreSubscription(preSubscriptionData, done);
      });

      if (!config.mock) {
        after(function(done) {
          mbedConnector.putPreSubscription([], done);
        });
      }

      it("should get pre subscription data", function(done) {
        mbedConnector.getPreSubscription(function(error, returnedPreSubscriptionData) {
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
                    .put(urljoin('/', mbedConnector.options.restApiVersion, 'subscriptions'))
                    .reply(function(uri, requestBody) {
                      try {
                        if (util.isString(requestBody)) {
                          requestBody = JSON.parse(requestBody);
                        }
                        assert.deepEqual(requestBody, preSubscriptionData);
                        return [200, ''];
                      } catch(e) {
                        // Note: the body here does not mimic mbed Connector
                        // This is intended to be a hint as to why the mocked
                        // api test failed
                        return [400, 'Incorrect data received'];
                      }
                    });
        });
      }

      if (!config.mock) {
        after(function(done) {
          mbedConnector.putPreSubscription([], done);
        });
      }

      it("should put presubscription data", function(done) {
        mbedConnector.putPreSubscription(preSubscriptionData, done);
      });
    });
  });
};