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

module.exports = function(mbedConnector, mock) {
  describe('Endpoints', function() {
    before(function() {
      mbedConnector.removeAllListeners();
    });

    after(function() {
      mbedConnector.stopLongPolling();
    });

    describe('#getEndpoints', function() {
      var mockApi;

      before(function() {
        if (mock) {
          mockApi = nock(mbedConnector.options.host, config)
                    .get('/endpoints')
                    .reply(200, [
                      {
                        'name': endpointName,
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
          assert.strictEqual(endpoints.length, 1);
          assert.strictEqual(endpoints[0].name, endpointName);
          done();
        });
      });
    });

    describe('#getResources', function() {
      var mockApi;

      before(function() {
        if (mock) {
          var mockApi = nock(mbedConnector.options.host, config)
                        .get(urljoin('/endpoints', endpointName))
                        .reply(200, [
                          {
                            'uri': resourceName,
                            'rt': 'ResourceTest',
                            'obs': false,
                            'type': ''
                          }
                        ]);
        }
      });

      it("should get a list of an endpoint's resources", function(done) {
        mbedConnector.getResources(endpointName, function(error, resources) {
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
      mbedConnector.getResourceValue(endpointName, resourceName, function(error, value) {
        assert(!error);
        assert(util.isNumber(value));
        assert(value > 0);
        done();
      });
    };

    describe('#getResourceValue', function() {
      var mockApi;

      before(function() {
        if (mock) {
          mockApi = nock(mbedConnector.options.host, config)
                    .get(urljoin('/endpoints', endpointName, resourceName))
                    .reply(200, 1);
        }
      });

      it('should get resource value (when a value is directly returned)', getResourceValueTest);
    });

    if (mock) {
      describe('#getResourceValue (async-response)', function() {
        var mockApi;

        before(function() {
          var longPollCb;
          mockApi = nock(mbedConnector.options.host, config)
                  .get(urljoin('/endpoints', endpointName, resourceName))
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

        it('should get resource value (after first receiving an async response)', getResourceValueTest);
      });
    }

    var putResourceValueTest = function(done) {
      mbedConnector.putResourceValue(endpointName, resourceName, 1, function(error, value) {
        assert(!error);
        done();
      });
    };

    describe('#putResourceValue', function() {
      var mockApi;

      before(function() {
        if (mock) {
          mockApi = nock(mbedConnector.options.host, config)
                    .put(urljoin('/endpoints', endpointName, resourceName))
                    .reply(200);
        }
      });

      it("should put a resource's value", putResourceValueTest);
    });

    if (mock) {
      describe('#putResourceValue (async-response)', function() {
        var mockApi;

        before(function() {
          var longPollCb;
          mockApi = nock(mbedConnector.options.host, config)
                  .put(urljoin('/endpoints', endpointName, resourceName))
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

        it("should put a resource's value (after first receiving an async response)", putResourceValueTest);
      });
    }

    var postResourceTest = function(done) {
      mbedConnector.postResource(endpointName, resourceName, null, function(error, value) {
        assert(!error);
        done();
      });
    };

    describe('#postResource', function() {
      var mockApi;

      before(function() {
        if (mock) {
          mockApi = nock(mbedConnector.options.host, config)
                    .post(urljoin('/endpoints', endpointName, resourceName))
                    .reply(200);
        }
      });

      it("should post a resource", postResourceTest);
    });

    if (mock) {
      describe('#postResource (async-response)', function() {
        var mockApi;

        before(function() {
          var longPollCb;
          mockApi = nock(mbedConnector.options.host, config)
                  .post(urljoin('/endpoints', endpointName, resourceName))
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

        it("should post a resource (after first receiving an async response)", postResourceTest);
      });
    }

    var deleteEndpointTest = function(done) {
      mbedConnector.deleteEndpoint(endpointName, function(error, value) {
        assert(!error);
        done();
      });
    };

    describe('#deleteEndpoint', function() {
      var mockApi;

      before(function() {
        if (mock) {
          mockApi = nock(mbedConnector.options.host, config)
                    .delete(urljoin('/endpoints', endpointName))
                    .reply(200);
        }
      });

      it("should delete an endpoint", deleteEndpointTest);
    });

    if (mock) {
      describe('#deleteEndpoint (async-response)', function() {
        var mockApi;

        before(function() {
          var longPollCb;
          mockApi = nock(mbedConnector.options.host, config)
                  .delete(urljoin('/endpoints', endpointName))
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

        it("should delete and endpoint (after first receiving an async response)", deleteEndpointTest);
      });
    }

  });
};