var assert = require('assert');
var path = require('path');
var ClientManager = require('./client-manager');
var MbedConnector = require('../index');

var mbedConnector;
var binClientPath = path.join(__dirname, 'bin/mbed-client-linux-example');
var clientManager = new ClientManager(binClientPath);

require('dotenv').load({silent: true});
var url = process.env.HOST;
var token = process.env.ACCESS_KEY
var endpointName = process.env.ENDPOINT_NAME;

var preSubscriptionData = [
  {
    "endpoint-name": endpointName,
    "resource-path": [ "/Test/0/D" ]
  }
];

before(function() {
  mbedConnector = new MbedConnector(url, { token: token });
});

describe('Notifications-External', function() {
  this.timeout(10000);

  before(function(done) {
    mbedConnector.removeAllListeners();
    mbedConnector.startLongPolling(done);
  });

  after(function() {
    mbedConnector.stopLongPolling();
    mbedConnector.removeAllListeners();
  });

  describe('#setPreSubscriptionData', function() {
    after(function(done) {
      mbedConnector.setPreSubscriptionData([], done);
    });

    it('should register presubscription data', function(done) {
      mbedConnector.setPreSubscriptionData(preSubscriptionData, done);
    });
  });

  describe('#getPreSubscriptionData', function() {
    before(function(done) {
      mbedConnector.setPreSubscriptionData(preSubscriptionData, done);
    });

    after(function(done) {
      mbedConnector.setPreSubscriptionData([], done);
    });

    it('should get presubscription data', function(done) {
      mbedConnector.getPreSubscriptionData(function(error, data) {
        assert.deepStrictEqual(data, preSubscriptionData);
        done(error);
      });
    });
  });
});

describe('Resource-Subscriptions-External', function() {
  before(function(done) {
    this.timeout(20000);
    mbedConnector.removeAllListeners();
    mbedConnector.on('registrations', clientManager.getRegistrationsEventHandler(endpointName));
    mbedConnector.on('de-registrations', clientManager.getDeRegistrationsEventHandler(endpointName));
    mbedConnector.startLongPolling(function() {
      clientManager.startClient(function() {
        done();
      });
    });
  });

  after(function() {
    clientManager.stopClient();
    mbedConnector.removeAllListeners();
    mbedConnector.stopLongPolling();
  });

  describe('#subscribeToResource', function() {
    after(function(done) {
      mbedConnector.unsubscribeFromResource(endpointName, "Test/0/D", done);
    });

    it('should subscribe to a resource for a given endpoint', function(done) {
      mbedConnector.subscribeToResource(endpointName, "Test/0/D", done);
    });
  });

  describe('#unsubscribeFromResource', function() {
    before(function(done) {
      mbedConnector.subscribeToResource(endpointName, "Test/0/D", done);
    });

    it('should unsubscribe from a resource for a given endpoint', function(done) {
      mbedConnector.unsubscribeFromResource(endpointName, "Test/0/D", done);
    });
  });

  describe('#unsubscribeFromAllResources', function() {
    it('should unsubscribe from all resources', function(done) {
      mbedConnector.unsubscribeFromAllResources(done);
    });
  });

  describe('#getSubscriptionForResource', function() {
    before(function(done) {
      mbedConnector.subscribeToResource(endpointName, "Test/0/D", done);
    });

    after(function(done) {
      mbedConnector.unsubscribeFromResource(endpointName, "Test/0/D", done);
    });

    it("should get the subscriptions for an endpoint's resource", function(done) {
      mbedConnector.getSubscriptionForResource(endpointName, "Test/0/D", done);
    });
  });

  describe('#getSubscriptionsForEndpoint', function() {
    before(function(done) {
      mbedConnector.subscribeToResource(endpointName, "Test/0/D", done);
    });

    after(function(done) {
      mbedConnector.unsubscribeFromResource(endpointName, "Test/0/D", done);
    });

    it("should get the subscriptions for an endpoint", function(done) {
      mbedConnector.getSubscriptionsForEndpoint(endpointName, done);
    });
  });

  describe('#unsubscribeFromEndpointResources', function() {
    before(function(done) {
      mbedConnector.subscribeToResource(endpointName, "Test/0/D", done);
    });

    it("should unsubscribe from all of an endpoint's resources", function(done) {
      mbedConnector.unsubscribeFromEndpointResources(endpointName, done);
    });
  });
});

describe('Handle-Notifications-External', function() {
  this.timeout(10000);

  before(function(done) {
    mbedConnector.removeAllListeners();
    mbedConnector.on('registrations', clientManager.getRegistrationsEventHandler(endpointName));
    mbedConnector.on('de-registrations', clientManager.getDeRegistrationsEventHandler(endpointName));
    mbedConnector.startLongPolling(done);
  });

  after(function() {
    mbedConnector.stopLongPolling();
    mbedConnector.removeAllListeners();
  });

  describe('notifications', function() {
    before(function(done) {
      mbedConnector.setPreSubscriptionData(preSubscriptionData, done);
    });

    after(function(done) {
      mbedConnector.removeAllListeners('notifications');
      mbedConnector.setPreSubscriptionData([], function(error) {
        if (error) throw error;
        clientManager.stopClient(done);
      });

    });

    it('should handle notifications', function(done) {
      mbedConnector.on('notifications', function(notifications) {
        assert.strictEqual(notifications[0].ep, endpointName);
        assert.strictEqual(notifications[0].path, "/Test/0/D");
        assert.strictEqual(notifications[0].payload, "1");
        done();
      });
      clientManager.startClient();
    });
  });

  describe('registrations', function() {
    before(function() {
      mbedConnector.removeAllListeners('registrations');
    });

    after(function(done) {
      mbedConnector.removeAllListeners('registrations');
      mbedConnector.on('registrations', clientManager.getRegistrationsEventHandler(endpointName));
      clientManager.stopClient(done);
    });

    it('should handle registrations', function(done) {
      clientManager.setCurrentFinish(done);

      mbedConnector.on('registrations', function(registrations) {
        assert.strictEqual(registrations[0].ep, endpointName);
        assert.strictEqual(registrations[0].ept, "test");
        done();
      });

      clientManager.startClient();
    });
  });

  describe('reg-updates', function() {
    this.timeout(90000);

    after(function() {
      mbedConnector.removeAllListeners('reg-updates');
    });

    it('should handle reg-updates', function(done) {
      clientManager.setCurrentFinish(done);

      mbedConnector.on('reg-updates', function(regUpdates) {
        assert.strictEqual(regUpdates[0].ep, endpointName);
        assert.strictEqual(regUpdates[0].ept, "test");
        clientManager.stopClient();
      });

      clientManager.startClient();
    });
  });

  describe('de-registrations', function() {
    before(function() {
      mbedConnector.removeAllListeners('de-registrations');
    });

    after(function() {
      mbedConnector.removeAllListeners('de-registrations');
      mbedConnector.on('de-registrations', clientManager.getDeRegistrationsEventHandler(endpointName));
    });

    it('should handle de-registrations', function(done) {
      clientManager.startClient(function() {
        mbedConnector.on('de-registrations', function(deRegistrations) {
          assert.strictEqual(deRegistrations[0], endpointName);
          done();
        });

        clientManager.stopClient();
      });
    });
  });

  describe('registrations-expired', function() {
    currentFinish = null;

    this.timeout(90000);

    after(function() {
      mbedConnector.removeAllListeners('registrations-expired');
    });

    it('should handle registrations-expired', function(done) {
      mbedConnector.on('registrations-expired', function(regUpdates) {
        assert.strictEqual(regUpdates[0], endpointName);
        done();
      });

      clientManager.startClient(function() {
        clientManager.stopClient(null, 'SIGTERM');
      });
    });
  });
});
