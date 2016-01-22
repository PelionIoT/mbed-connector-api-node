var nock = require('nock');
var urljoin = require('url-join');
var assert = require('assert');
var util = require('util');

var ClientManager = require('./client-manager');
var MbedConnector = require('../index');

require('dotenv').load({silent: true});

var mbedConnector;
var host = process.env.HOST || 'https://api.connector.mbed.com';
var accessKey = process.env.ACCESS_KEY || 'DUMMY_KEY';
var endpointName = process.env.ENDPOINT_NAME || 'DUMMY_ENDPOINT';
var resourceName = process.env.RESOURCE_NAME || 'DUMMY/0/RESOURCE';
var clientPath = process.env.CLIENT_PATH;

mbedConnector = new MbedConnector({
  host: host,
  accessKey: accessKey
});

module.exports = function(mock, useCallback) {
  var config = {
    mock: mock,
    useCallback: useCallback,
    host: host,
    accessKey: accessKey,
    endpointName: endpointName,
    resourceName: resourceName,
    clientPath: clientPath,
    nockConfig: {
      reqheaders: {
        'Authorization': 'Bearer ' + accessKey
      }
    },
    clientManager: new ClientManager(clientPath)
  };

  require('./general')(mbedConnector, config);
  require('./endpoints')(mbedConnector, config);
  require('./notifications')(mbedConnector, config);
  require('./subscriptions')(mbedConnector, config);
}




