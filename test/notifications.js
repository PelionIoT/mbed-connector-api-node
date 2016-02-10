var nock = require('nock');
var urljoin = require('url-join');
var assert = require('assert');
var util = require('util');

var MockHelper = require('./mock-helper');

module.exports = function(mbedConnector, config) {
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
                      .get(urljoin('/', mbedConnector.options.restApiVersion, 'notification', 'callback'))
                      .reply(200, { url: config.callbackUrl })
                      .put(urljoin('/', mbedConnector.options.restApiVersion, 'notification', 'callback'))
                      .reply(204);
          }

          mbedConnector.putCallback(config.callbackUrl, done);
        });

        if (!config.mock) {
          after(function(done) {
            mbedConnector.deleteCallback(done);
          });
        }

        it('should get the current callback data', function(done) {
          mbedConnector.getCallback(function(error, callbackData) {
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
                      .put(urljoin('/', mbedConnector.options.restApiVersion, 'notification', 'callback'))
                      .reply(204);
          });
        }

        if (!config.mock) {
          after(function(done) {
            mbedConnector.deleteCallback(done);
          });
        }

        it('should put the new callback data', function(done) {
          mbedConnector.putCallback(config.callbackUrl, done);
        });
      });

      describe('#deleteCallback', function() {
        var mockApi;

        before(function(done) {
          if (config.mock) {
            mockApi = nock(config.host, config.nockConfig)
                    .put(urljoin('/', mbedConnector.options.restApiVersion, 'notification', 'callback'))
                    .reply(204)
                    .delete(urljoin('/', mbedConnector.options.restApiVersion, 'notification', 'callback'))
                    .reply(204);
          }

          mbedConnector.putCallback(config.callbackUrl, done);
        });

        it('should delete the current callback data', function(done) {
          mbedConnector.deleteCallback(done);
        });
      });
    });
  }

  describe('Handle-Notifications', function() {
    if (!config.mock) {
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
        if (config.mock) {
          var longPollCb;
          mockApi = MockHelper.createLongPollInstance(config.host, config.nockConfig);
          mockApi.put(urljoin('/', mbedConnector.options.restApiVersion, 'subscriptions', config.endpointName, config.resourceName))
                  .reply(200)
                  .delete(urljoin('/', mbedConnector.options.restApiVersion, 'subscriptions', config.endpointName, config.resourceName))
                  .reply(204)
                  .persist()
                  .get(urljoin('/', mbedConnector.options.restApiVersion, 'notification', 'pull'))
                  .query({ noWait: false })
                  .reply(function(uri, requestBody, cb) {
                    longPollCb = cb;
                  })
                  .get(urljoin('/', mbedConnector.options.restApiVersion, 'notification', 'pull'))
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

        mbedConnector.startLongPolling(function(error) {
          assert(!error, String(error));

          if (config.mock) {
            mbedConnector.putResourceSubscription(config.endpointName, config.resourceName, done);
          } else {
            config.clientManager.startClient(function() {
              mbedConnector.putResourceSubscription(config.endpointName, config.resourceName, done);
            });
          }
        });
      });

      after(function(done) {
        mbedConnector.deleteResourceSubscription(config.endpointName, config.resourceName, function(error) {
          assert(!error, String(error));

          mbedConnector.stopLongPolling();

          if (config.mock) {
            nock.cleanAll();
            done();
          } else {
            config.clientManager.stopClient(done);
          }
        });
      });

      it('should handle notifications', function(done) {
        mbedConnector.on('notifications', function(notifications) {
          var foundEndpoint = false;

          assert(util.isArray(notifications));
          assert(notifications.length > 0);

          notifications.forEach(function(notification) {
            if (notification.ep === config.endpointName && notification.path === config.resourceName) {
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

      before(function(done) {
        if (config.mock) {
          var longPollCb;
          mockApi = MockHelper.createLongPollInstance(config.host, config.nockConfig);
          mockApi.persist()
                  .get(urljoin('/', mbedConnector.options.restApiVersion, 'notification', 'pull'))
                  .query({ noWait: false })
                  .reply(function(uri, requestBody, cb) {
                    longPollCb = cb;
                  })
                  .get(urljoin('/', mbedConnector.options.restApiVersion, 'notification', 'pull'))
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

        mbedConnector.startLongPolling(done);
      });

      after(function() {
        mbedConnector.stopLongPolling();

        if (config.mock) {
          nock.cleanAll();
        }
      });

      it('should handle registrations', function(done) {
        mbedConnector.on('registrations', function(registrations) {
          var foundEndpoint = false;

          assert(util.isArray(registrations));
          assert(registrations.length > 0);

          registrations.forEach(function(registration) {
            if (registration.ep === config.endpointName) {
              foundEndpoint = true;
            }
          });

          assert(foundEndpoint);

          done();
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
                  .get(urljoin('/', mbedConnector.options.restApiVersion, 'notification', 'pull'))
                  .query({ noWait: false })
                  .reply(function(uri, requestBody, cb) {
                    longPollCb = cb;
                  })
                  .get(urljoin('/', mbedConnector.options.restApiVersion, 'notification', 'pull'))
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

        mbedConnector.startLongPolling(done);
      });

      after(function() {
        mbedConnector.stopLongPolling();

        if (config.mock) {
          nock.cleanAll();
        }
      });

      it('should handle reg-updates', function(done) {
        mbedConnector.on('reg-updates', function(regUpdates) {
          var foundEndpoint = false;

          assert(util.isArray(regUpdates));
          assert(regUpdates.length > 0);

          regUpdates.forEach(function(regUpdate) {
            if (regUpdate.ep === config.endpointName) {
              foundEndpoint = true;
            }
          });

          if (foundEndpoint) {
            done();
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
                  .get(urljoin('/', mbedConnector.options.restApiVersion, 'notification', 'pull'))
                  .query({ noWait: false })
                  .reply(function(uri, requestBody, cb) {
                    longPollCb = cb;
                  })
                  .get(urljoin('/', mbedConnector.options.restApiVersion, 'notification', 'pull'))
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

        mbedConnector.startLongPolling(function(error) {
          assert(!error, String(error));

          if (config.mock) {
            done();
          } else {
            config.clientManager.startClient(done);
          }
        });
      });

      after(function() {
        mbedConnector.stopLongPolling();

        if (config.mock) {
          nock.cleanAll();
        }
      });

      it('should handle de-registrations', function(done) {
        mbedConnector.on('de-registrations', function(deRegistrations) {
          assert(util.isArray(deRegistrations));
          assert(deRegistrations.length > 0);
          assert(deRegistrations.indexOf(config.endpointName) > -1);
          done();
        });

        if (!config.mock) {
          config.clientManager.stopClient();
        }
      });
    });

    describe('registrations-expired', function() {
      var mockApi;

      this.timeout(120000);

      before(function(done) {
        if (config.mock) {
          var longPollCb;
          mockApi = MockHelper.createLongPollInstance(config.host, config.nockConfig);
          mockApi.persist()
                  .get(urljoin('/', mbedConnector.options.restApiVersion, 'notification', 'pull'))
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
                  .get(urljoin('/', mbedConnector.options.restApiVersion, 'notification', 'pull'))
                  .query({ noWait: true })
                  .reply(204);
        }

        mbedConnector.startLongPolling(function(error) {
          assert(!error, String(error));

          if (config.mock) {
            done();
          } else {
            config.clientManager.startClient(done);
          }
        });
      });

      after(function() {
        mbedConnector.stopLongPolling();

        if (config.mock) {
          nock.cleanAll();
        }
      });

      it('should handle registrations-expired', function(done) {
        mbedConnector.on('registrations-expired', function(registrationsExpired) {
          assert(util.isArray(registrationsExpired));
          assert(registrationsExpired.length > 0);
          assert(registrationsExpired.indexOf(config.endpointName) > -1);
          done();
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