var nock = require('nock');
var urljoin = require('url-join');
var assert = require('assert');
var util = require('util');

var MbedConnector = require('../index');

require('dotenv').load({silent: true});

var mbedConnector;
var host = process.env.HOST;
var accessKey = process.env.ACCESS_KEY
var endpointName = process.env.ENDPOINT_NAME

var config = {
  reqheaders: {
    'Authorization': 'Bearer ' + accessKey
  }
}

mbedConnector = new MbedConnector({
  host: host,
  accessKey: accessKey
});

module.exports = function(mock, useCallback) {
  require('./general')(mbedConnector, mock, useCallback);
  require('./endpoints')(mbedConnector, mock, useCallback);
  require('./notifications')(mbedConnector, mock, useCallback);
  require('./subscriptions')(mbedConnector, mock, useCallback);
}




