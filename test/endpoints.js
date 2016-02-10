var nock = require('nock');
var urljoin = require('url-join');
var assert = require('assert');
var util = require('util');

var MockHelper = require('./mock-helper');

module.exports = function(mbedConnector, config) {
  describe('Endpoints', function() {
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

    describe('#getEndpoints', function() {
      var mockApi;

      before(function() {
        if (config.mock) {
          mockApi = nock(config.host, config.nockConfig)
                    .get(urljoin('/', mbedConnector.options.restApiVersion, 'endpoints'))
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
        mbedConnector.getEndpoints(function(error, endpoints) {
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
                        .get(urljoin('/', mbedConnector.options.restApiVersion, 'endpoints', config.endpointName))
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
        mbedConnector.getResources(config.endpointName, function(error, resources) {
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
      mbedConnector.getResourceValue(config.endpointName, config.resourceName, function(error, value) {
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
                    .get(urljoin('/', mbedConnector.options.restApiVersion, 'endpoints', config.endpointName, config.resourceName))
                    .reply(200, 1);

          done();
        } else {
          mbedConnector.startLongPolling(done);
        }
      });

      after(function() {
        mbedConnector.stopLongPolling();
      });

      it('should get a resource value', getResourceValueTest);
    });

    if (config.mock) {
      describe('#getResourceValue (async-response)', function() {
        var mockApi;

        before(function(done) {
          var longPollCb;
          mockApi = MockHelper.createLongPollInstance(config.host, config.nockConfig);
          mockApi.get(urljoin('/', mbedConnector.options.restApiVersion, 'endpoints', config.endpointName, config.resourceName))
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

        it('should get a resource value (after first receiving an async response)', getResourceValueTest);
      });
    }

    var putResourceValueTest = function(done) {
      mbedConnector.putResourceValue(config.endpointName, config.resourceName, 1, function(error, value) {
        assert(!error, String(error));
        done();
      });
    };

    describe('#putResourceValue', function() {
      var mockApi;

      before(function(done) {
        if (config.mock) {
          mockApi = nock(config.host, config.nockConfig)
                    .put(urljoin('/', mbedConnector.options.restApiVersion, 'endpoints', config.endpointName, config.resourceName))
                    .reply(200);

          done();
        } else {
          mbedConnector.startLongPolling(done);
        }
      });

      after(function() {
        mbedConnector.stopLongPolling();
      });

      it("should put a resource's value", putResourceValueTest);
    });

    if (config.mock) {
      describe('#putResourceValue (async-response)', function() {
        var mockApi;

        before(function(done) {
          var longPollCb;
          mockApi = MockHelper.createLongPollInstance(config.host, config.nockConfig);
          mockApi.put(urljoin('/', mbedConnector.options.restApiVersion, 'endpoints', config.endpointName, config.resourceName))
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

        it("should put a resource's value (after first receiving an async response)", putResourceValueTest);
      });
    }

    var postResourceTest = function(done) {
      mbedConnector.postResource(config.endpointName, config.resourceName, null, function(error, value) {
        assert(!error, String(error));
        done();
      });
    };

    describe('#postResource', function() {
      var mockApi;

      before(function(done) {
        if (config.mock) {
          mockApi = nock(config.host, config.nockConfig)
                    .post(urljoin('/', mbedConnector.options.restApiVersion, 'endpoints', config.endpointName, config.resourceName))
                    .reply(200);

          done();
        } else {
          mbedConnector.startLongPolling(done);
        }
      });

      after(function() {
        mbedConnector.stopLongPolling();
      });

      it("should post a resource", postResourceTest);
    });

    if (config.mock) {
      describe('#postResource (async-response)', function() {
        var mockApi;

        before(function(done) {
          var longPollCb;
          mockApi = MockHelper.createLongPollInstance(config.host, config.nockConfig);
          mockApi.post(urljoin('/', mbedConnector.options.restApiVersion, 'endpoints', config.endpointName, config.resourceName))
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

        it("should post a resource (after first receiving an async response)", postResourceTest);
      });
    }

    var deleteEndpointTest = function(done) {
      mbedConnector.deleteEndpoint(config.endpointName, function(error, value) {
        assert(!error, String(error));
        done();
      });
    };

    describe('#deleteEndpoint', function() {
      var mockApi;

      before(function(done) {
        if (config.mock) {
          mockApi = nock(config.host, config.nockConfig)
                    .delete(urljoin('/', mbedConnector.options.restApiVersion, 'endpoints', config.endpointName))
                    .reply(200);

          done();
        } else {
          mbedConnector.startLongPolling(done);
        }
      });

      after(function() {
        mbedConnector.stopLongPolling();
      });

      it("should delete an endpoint", deleteEndpointTest);
    });

    if (config.mock) {
      describe('#deleteEndpoint (async-response)', function() {
        var mockApi;

        before(function(done) {
          var longPollCb;
          mockApi = MockHelper.createLongPollInstance(config.host, config.nockConfig);
          mockApi.delete(urljoin('/', mbedConnector.options.restApiVersion, 'endpoints', config.endpointName))
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

        it("should delete and endpoint (after first receiving an async response)", deleteEndpointTest);
      });
    }

  });
};