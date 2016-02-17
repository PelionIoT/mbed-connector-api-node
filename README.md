![build status](https://travis-ci.org/ARMmbed/mbed-connector-node.svg?branch=master)

# mbed-connector

Node.js library for talking to the mbed Device Connector Service

## API Reference

You can view the full API Reference [here](docs/API.md).

## How to use

### Get all endpoints

```javascript
var MbedConnector = require('mbed-connector');
var mbedConnector = new MbedConnector({
  accessKey: /* Access Key */
});
mbedConenctor.getEndpoints(function(error, endpoints) {
  if (error) throw error;
  console.log('Endpoints:', endpoints);
});
```

### Get an endpoint's resources
In this example, the endpoint's name is `test-endpoint`.

```javascript
var MbedConnector = require('mbed-connector');
var mbedConnector = new MbedConnector({
  accessKey: /* Access Key */
});
mbedConenctor.getResources('test-endpoint', function(error, resources) {
  if (error) throw error;
  console.log('Resources:', resources);
});
```

### Get a resource's value
In this example, the endpoint's name is `test-endpoint` and the resource URI is `/Test/0/D`.

**NOTE:** Long polling is used as the notification channel

```javascript
var MbedConnector = require('mbed-connector');
var mbedConnector = new MbedConnector({
  accessKey: /* Access Key */
});
mbedConnector.startLongPolling(function(error) {
  if (error) throw error;
  mbedConenctor.getResourceValue('test-endpoint', '/Test/0/D', function(error, value) {
    if (error) throw error;
    console.log('Value:', value);
  });
});
```

### Get all endpoints, resources, and values
```javascript
var MbedConnector = require('mbed-connector');
var mbedConnector = new MbedConnector({
  accessKey: /* Access Key */
});

// Setup notification channel
mbedConnector.startLongPolling(function(error) {
  if (error) throw error;
  mbedConnector.getEndpoints(function(error, endpoints) {
    if (error) throw error;
    endpoints.forEach(function(endpoint) {
      mbedConnector.getResources(endpoint.name, function(error, resources) {
        if (error) throw error;
        resources.forEach(function(resource) {
          mbedConnector.getResourceValue(endpoint.name, resource.uri, function(error, value) {
            console.log('Endpoint:', endpoint.name);
            console.log('Resource:', resource.uri);
            console.log('Value:', value);
          });
        });
      });
    });
  });
});
```


