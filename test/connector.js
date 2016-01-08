var MbedConnector = require('../index');

var host = process.env.HOST;
var accessKey = process.env.ACCESS_KEY;
var endpointName = process.env.ENDPOINT_NAME;

var mbedConnector;

module.exports = function() {
  if (!mbedConnector) {
    mbedConnector = new MbedConnector({
      host: host,
      accessKey: accessKey
    });
  }

  return mbedConnector;
}