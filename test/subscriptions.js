var nock = require('nock');
var urljoin = require('url-join');
var assert = require('assert');
var util = require('util');

require('dotenv').load({silent: true});

var accessKey = process.env.ACCESS_KEY
var endpointName = process.env.ENDPOINT_NAME
var resourceName = process.env.RESOURCE_NAME

var config = {
  reqheaders: {
    'Authorization': 'Bearer ' + accessKey
  }
}

module.exports = function(mbedConnector, mock, useCallback) {
  describe('Subscriptions', function() {
    if (!mock) {
      this.timeout(10000);
    }

    before(function() {
      mbedConnector.removeAllListeners();
    });

    after(function() {
      mbedConnector.stopLongPolling();
    });

    describe('#getResourceSubscription', function() {
      var mockApi;


      before(function(done) {
        if (mock) {
          mockApi = nock(mbedConnector.options.host, config)
                    .put(urljoin('/subscriptions', endpointName, resourceName))
                    .reply(200)
                    .get(urljoin('/subscriptions', endpointName, resourceName))
                    .reply(200);
        }

        mbedConnector.putResourceSubscription(endpointName, resourceName, done);
      });

      if (!mock) {
        after(function(done) {
          mbedConnector.deleteResourceSubscription(endpointName,resourceName, done);
        });
      }

      it("should get the subscription a resource", function(done) {
        mbedConnector.getResourceSubscription(endpointName, resourceName, function(error, subscribed) {
          assert(!error, String(error));
          assert(subscribed);
          done();
        });
      });
    });

    var putResourceSubscriptionTest = function(done){
      mbedConnector.putResourceSubscription(endpointName, resourceName, function(error) {
        assert(!error, String(error));
        done();
      });
    };

    describe('#putResourceSubscription', function() {
      var mockApi;

      if (mock) {
        before(function() {
          mockApi = nock(mbedConnector.options.host, config)
                    .put(urljoin('/subscriptions', endpointName, resourceName))
                    .reply(200);
        });
      } else {
        after(function(done) {
          mbedConnector.deleteResourceSubscription(endpointName,resourceName, done);
        });
      }

      it("should put a subscription to a resource", putResourceSubscriptionTest);
    });

    if (mock) {
      describe('#putResourceSubscription (async-response)', function() {
        var mockApi;

        before(function() {
          var longPollCb;
          mockApi = nock(mbedConnector.options.host, config)
                  .put(urljoin('/subscriptions', endpointName, resourceName))
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
                  .get(urljoin('/notification', 'pull'))
                  .reply(function(uri, requestBody, cb) {
                    longPollCb = cb;
                  });

          mbedConnector.startLongPolling();
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
        if (mock) {
          mockApi = nock(mbedConnector.options.host, config)
                    .put(urljoin('/subscriptions', endpointName, resourceName))
                    .reply(200)
                    .delete(urljoin('/subscriptions', endpointName, resourceName))
                    .reply(204);
        }

        mbedConnector.putResourceSubscription(endpointName, resourceName, done);
      });

      it("should delete a subscription to a resource", function(done) {
        mbedConnector.deleteResourceSubscription(endpointName, resourceName, done);
      });
    });

    describe('#getEndpointSubscriptions', function() {
      var mockApi;

      before(function(done) {
        if (mock) {
          mockApi = nock(mbedConnector.options.host, config)
                    .put(urljoin('/subscriptions', endpointName, resourceName))
                    .reply(200)
                    .get(urljoin('/subscriptions', endpointName))
                    .reply(200, urljoin('/subscriptions', endpointName, resourceName));
        }

        mbedConnector.putResourceSubscription(endpointName, resourceName, done);
      });

      if (!mock) {
        after(function(done) {
          mbedConnector.deleteResourceSubscription(endpointName,resourceName, done);
        });
      }

      it("should get the subscription a resource", function(done) {
        mbedConnector.getEndpointSubscriptions(endpointName, function(error, subscriptions) {
          assert(!error, String(error));
          assert(util.isArray(subscriptions));
          assert.strictEqual(subscriptions.length, 1);
          assert.strictEqual(subscriptions[0], urljoin('/subscriptions', endpointName, resourceName));
          done();
        });
      });
    });

    describe('#deleteEndpointSubscriptions', function() {
      var mockApi;

      before(function(done) {
        if (mock) {
          mockApi = nock(mbedConnector.options.host, config)
                    .put(urljoin('/subscriptions', endpointName, resourceName))
                    .reply(200)
                    .delete(urljoin('/subscriptions', endpointName))
                    .reply(204);
        }

        mbedConnector.putResourceSubscription(endpointName, resourceName, done);
      });

      it("should delete all subscriptions for an endpoint", function(done) {
        mbedConnector.deleteEndpointSubscriptions(endpointName, done);
      });
    });

    describe('#deleteAllSubscriptions', function() {
      var mockApi;

      before(function(done) {
        if (mock) {
          mockApi = nock(mbedConnector.options.host, config)
                    .put(urljoin('/subscriptions', endpointName, resourceName))
                    .reply(200)
                    .delete(urljoin('/subscriptions'))
                    .reply(204);
        }

        mbedConnector.putResourceSubscription(endpointName, resourceName, done);
      });

      it("should delete all subscriptions for an endpoint", function(done) {
        mbedConnector.deleteAllSubscriptions(done);
      });
    });

    describe('#getPreSubscription', function() {
      var mockApi;

      var preSubscriptionData = [
        {
          "endpoint-name": endpointName
        }
      ];

      var curPreSubscriptionData;

      before(function(done) {
        if (mock) {
          mockApi = nock(mbedConnector.options.host, config)
                    .put(urljoin('/subscriptions'))
                    .reply(function(uri, requestBody) {
                      curPreSubscriptionData = JSON.parse(requestBody)
                      return [200, ''];
                    })
                    .get(urljoin('/subscriptions'))
                    .reply(function(uri, requestBody) {
                      return [200, JSON.stringify(curPreSubscriptionData)];
                    });
        }

        mbedConnector.putPreSubscription(preSubscriptionData, done);
      });

      if (!mock) {
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
          "endpoint-name": endpointName
        }
      ];

      if (mock) {
        before(function() {
          mockApi = nock(mbedConnector.options.host, config)
                    .put(urljoin('/subscriptions'))
                    .reply(function(uri, requestBody) {
                      try {
                        assert.deepEqual(JSON.parse(requestBody), preSubscriptionData);
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

      if (!mock) {
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