var nock = require('nock');
var urljoin = require('url-join');
var assert = require('assert');
var util = require('util');

var ClientManager = require('./client-manager');

require('dotenv').load({silent: true});

var accessKey = process.env.ACCESS_KEY;
var endpointName = process.env.ENDPOINT_NAME;
var resourceName = process.env.RESOURCE_NAME;
var clientPath = process.env.CLIENT_PATH;
var callbackUrl = process.env.CALLBACK_URL || 'http://example.com/callback';

var config = {
  reqheaders: {
    'Authorization': 'Bearer ' + accessKey
  }
};

var clientManager = new ClientManager(clientPath);

module.exports = function(mbedConnector, mock) {
  describe('Notifications', function() {
    if (!mock) {
      this.timeout(10000);
    }

    describe('#getCallback', function() {
      var mockApi;
      before(function(done) {
        if (mock) {
          mockApi = nock(mbedConnector.options.host, config)
                    .get(urljoin('/notification', 'callback'))
                    .reply(200, { url: callbackUrl })
                    .put(urljoin('/notification', 'callback'))
                    .reply(204);
        }

        mbedConnector.putCallback(callbackUrl, done);
      });

      if (!mock) {
        after(function(done) {
          mbedConnector.deleteCallback(done);
        });
      }

      it('should get the current callback data', function(done) {
        mbedConnector.getCallback(function(error, callbackData) {
          assert(!error);
          assert(util.isObject(callbackData));
          assert.strictEqual(callbackData.url, callbackUrl);
          done();
        });
      });
    });

    describe('#setCallback', function() {
      var mockApi;

      if (mock) {
        before(function() {
          mockApi = nock(mbedConnector.options.host, config)
                    .put(urljoin('/notification', 'callback'))
                    .reply(204);
        });
      }

      if (!mock) {
        after(function(done) {
          mbedConnector.deleteCallback(done);
        });
      }

      it('should get the current callback data', function(done) {
        mbedConnector.putCallback(callbackUrl, done);
      });
    });

    describe('#deleteCallback', function() {
      var mockApi;

      before(function(done) {
        if (mock) {
          mockApi = nock(mbedConnector.options.host, config)
                  .put(urljoin('/notification', 'callback'))
                  .reply(204)
                  .delete(urljoin('/notification', 'callback'))
                  .reply(204);
        }

        mbedConnector.putCallback(callbackUrl, done);
      });

      it('should get the current callback data', function(done) {
        mbedConnector.deleteCallback(done);
      });
    });
  });

  describe('Handle-Notifications', function() {
    if (!mock) {
      this.timeout(30000);
    }

    before(function() {
      mbedConnector.removeAllListeners();
    });

    after(function() {
      mbedConnector.removeAllListeners();
    });

    afterEach(function() {
      mbedConnector.removeAllListeners();
    });

    describe('notifications', function() {
      var mockApi;

      before(function(done) {
        if (mock) {
          var longPollCb;
          mockApi = nock(mbedConnector.options.host, config)
                    .put(urljoin('/subscriptions', endpointName, resourceName))
                    .reply(200)
                    .delete(urljoin('/subscriptions', endpointName, resourceName))
                    .reply(204)
                    .persist()
                    .get(urljoin('/notification', 'pull'))
                    .reply(function(uri, requestBody, cb) {
                      longPollCb = cb;
                    });

          setTimeout(function() {
            longPollCb(null, [
              200,
              {
                "notifications": [
                  {
                    "ep": endpointName,
                    "path": resourceName,
                    "payload": "MQ=="
                  }
                ]
              }
            ]);
          }, 500);
        }

        mbedConnector.startLongPolling();

        if (mock) {
          mbedConnector.putResourceSubscription(endpointName, resourceName, done);
        } else {
          clientManager.startClient(function() {
            mbedConnector.putResourceSubscription(endpointName, resourceName, done);
          });
        }
      });

      after(function(done) {
        mbedConnector.deleteResourceSubscription(endpointName, resourceName, function(error) {
          assert(!error, String(error));

          mbedConnector.stopLongPolling();

          if (mock) {
            nock.cleanAll();
            done();
          } else {
            clientManager.stopClient(function() {
              done();
            });
          }
        });
      });

      it('should handle notifications', function(done) {
        mbedConnector.on('notifications', function(notifications) {
          var foundEndpoint = false;

          assert(util.isArray(notifications));
          assert(notifications.length > 0);

          notifications.forEach(function(notification) {
            if (notification.ep === endpointName && notification.path === resourceName) {
              assert(notification.payload >= 0);
              foundEndpoint = true;
            }
          });

          assert(foundEndpoint);

          done();
        });
      });
    });

    describe('registrations', function() {
      var mockApi;

      before(function() {
        if (mock) {
          var longPollCb;
          mockApi = nock(mbedConnector.options.host, config)
                    .persist()
                    .get(urljoin('/notification', 'pull'))
                    .reply(function(uri, requestBody, cb) {
                      longPollCb = cb;
                    });

          setTimeout(function() {
            // In reality, the "registrations" object is more complex, but we're
            // only mocking the minimum of what this test looks for
            longPollCb(null, [
              200,
              {
                "registrations": [
                  {
                    "ep": endpointName
                  }
                ]
              }
            ]);
          }, 500);
        }

        mbedConnector.startLongPolling();
      });

      after(function() {
        mbedConnector.stopLongPolling();

        if (mock) {
          nock.cleanAll();
        }
      });

      it('should handle registrations', function(done) {
        mbedConnector.on('registrations', function(registrations) {
          var foundEndpoint = false;

          assert(util.isArray(registrations));
          assert(registrations.length > 0);

          registrations.forEach(function(registration) {
            if (registration.ep === endpointName) {
              foundEndpoint = true;
            }
          });

          assert(foundEndpoint);

          done();
        });

        if (!mock) {
          clientManager.startClient();
        }
      });
    });

    describe('reg-updates', function() {
      var mockApi;

      this.timeout(120000);

      before(function() {
        if (mock) {
          var longPollCb;
          mockApi = nock(mbedConnector.options.host, config)
                    .persist()
                    .get(urljoin('/notification', 'pull'))
                    .reply(function(uri, requestBody, cb) {
                      longPollCb = cb;
                    });

          setTimeout(function() {
            // In reality, the "reg-updates" object is more complex, but we're
            // only mocking the minimum of what this test looks for
            longPollCb(null, [
              200,
              {
                "reg-updates": [
                  {
                    "ep": endpointName
                  }
                ]
              }
            ]);
          }, 500);
        }

        mbedConnector.startLongPolling();
      });

      after(function() {
        mbedConnector.stopLongPolling();

        if (mock) {
          nock.cleanAll();
        }
      });

      it('should handle reg-updates', function(done) {
        mbedConnector.on('reg-updates', function(regUpdates) {
          var foundEndpoint = false;

          assert(util.isArray(regUpdates));
          assert(regUpdates.length > 0);

          regUpdates.forEach(function(regUpdate) {
            if (regUpdate.ep === endpointName) {
              foundEndpoint = true;
            }
          });

          assert(foundEndpoint);

          done();
        });
      });
    });

    describe('de-registrations', function() {
      var mockApi;

      before(function(done) {
        if (mock) {
          var longPollCb;
          mockApi = nock(mbedConnector.options.host, config)
                    .persist()
                    .get(urljoin('/notification', 'pull'))
                    .reply(function(uri, requestBody, cb) {
                      longPollCb = cb;
                    });

          setTimeout(function() {
            longPollCb(null, [
              200,
              {
                "de-registrations": [
                  endpointName
                ]
              }
            ]);
          }, 500);
        }

        mbedConnector.startLongPolling();

        if (mock) {
          done();
        } else {
          clientManager.startClient(done);
        }
      });

      after(function() {
        mbedConnector.stopLongPolling();

        if (mock) {
          nock.cleanAll();
        }
      });

      it('should handle de-registrations', function(done) {
        mbedConnector.on('de-registrations', function(deRegistrations) {
          assert(util.isArray(deRegistrations));
          assert(deRegistrations.length > 0);
          assert(deRegistrations.indexOf(endpointName) > -1);
          done();
        });

        if (!mock) {
          clientManager.stopClient();
        }
      });
    });

    describe('registrations-expired', function() {
      var mockApi;

      this.timeout(120000);

      before(function(done) {
        if (mock) {
          var longPollCb;
          mockApi = nock(mbedConnector.options.host, config)
                    .persist()
                    .get(urljoin('/notification', 'pull'))
                    .reply(function(uri, requestBody, cb) {
                      setTimeout(function() {
                        cb(null, [
                          200,
                          {
                            "registrations-expired": [
                              endpointName
                            ]
                          }
                        ]);
                      }, 500);
                    });


        }

        mbedConnector.startLongPolling();

        if (mock) {
          done();
        } else {
          clientManager.startClient(done);
        }
      });

      after(function() {
        mbedConnector.stopLongPolling();

        if (mock) {
          nock.cleanAll();
        }
      });

      it('should handle registrations-expired', function(done) {
        mbedConnector.on('registrations-expired', function(registrationsExpired) {
          assert(util.isArray(registrationsExpired));
          assert(registrationsExpired.length > 0);
          assert(registrationsExpired.indexOf(endpointName) > -1);
          done();
        });

        if (!mock) {
          clientManager.stopClient();
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

        mbedConnector.requestCallback(null, null, body, function(error, data) {
          assert.deepStrictEqual(data.status, 200);
          assert.deepStrictEqual(data.payload, '1');
          done(error);
        });

        mbedConnector.on('async-responses', function(asyncResponses) {
          assert.deepStrictEqual(asyncResponses, expected)
          done();
        });

        mbedConnector.handleNotifications(payload);
      });
    });
  });
};