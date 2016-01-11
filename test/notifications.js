var nock = require('nock');
var urljoin = require('url-join');
var assert = require('assert');
var util = require('util');

require('dotenv').load({silent: true});

var accessKey = process.env.ACCESS_KEY
var endpointName = process.env.ENDPOINT_NAME
var resourceName = process.env.RESOURCE_NAME

module.exports = function(mbedConnector, mock) {
  describe('Handle-Notifications', function() {
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
      it('should handle notifications', function(done) {
        var payload = {
          "notifications": [
            {
              "ep": "test-endpoint",
              "path": "Test/0/N",
              "payload": "MQ=="
            }
          ]
        };

        var expected = [
          {
            "ep": "test-endpoint",
            "path": "Test/0/N",
            "payload": "1"
          }
        ];

        mbedConnector.on('notifications', function(notifications) {
          assert.deepStrictEqual(notifications, expected)
          done();
        });

        mbedConnector.handleNotifications(payload);
      });
    });

    describe('registrations', function() {
      it('should handle registrations', function(done) {
        var payload = {
          "registrations": [
            {
              "ep": "test-endpoint",
              "ep-type": "test",
              "resources": [
                {
                  "path": "Test/0/N",
                  "obs": "false"
                }
              ]
            }
          ]
        };

        var expected = payload.registrations;

        mbedConnector.on('registrations', function(registrations) {
          assert.deepStrictEqual(registrations, expected)
          done();
        });

        mbedConnector.handleNotifications(payload);
      });
    });

    describe('reg-updates', function() {
      it('should handle reg-updates', function(done) {
        var payload = {
          "reg-updates": [
            {
              "ep": "test-endpoint",
              "ep-type": "test",
              "resources": [
                {
                  "path": "Test/0/N",
                  "obs": "false"
                }
              ]
            }
          ]
        };

        var expected = payload['reg-updates'];

        mbedConnector.on('reg-updates', function(regUpdates) {
          assert.deepStrictEqual(regUpdates, expected)
          done();
        });

        mbedConnector.handleNotifications(payload);
      });
    });

    describe('de-registrations', function() {
      it('should handle de-registraions', function(done) {
        var payload = {
          "de-registrations": [
            "test-endpoint-1",
            "test-endpoint-2"
          ]
        };

        var expected = payload['de-registrations'];

        mbedConnector.on('de-registrations', function(deRegistrations) {
          assert.deepStrictEqual(deRegistrations, expected)
          done();
        });

        mbedConnector.handleNotifications(payload);
      });
    });

    describe('registrations-expired', function() {
      it('should handle registrations-expired', function(done) {
        var payload = {
          "registrations-expired": [
            "test-endpoint-1",
            "test-endpoint-2"
          ]
        };

        var expected = payload['registrations-expired'];

        mbedConnector.on('registrations-expired', function(registrationsExpired) {
          assert.deepStrictEqual(registrationsExpired, expected)
          done();
        });

        mbedConnector.handleNotifications(payload);
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