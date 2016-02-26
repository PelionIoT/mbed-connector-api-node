![build status](https://travis-ci.org/ARMmbed/mbed-connector-api-node.svg?branch=master)

# mbed-connector-api

Node.js library for talking to the mbed Device Connector Service

## API Reference

You can view the full API Reference [here](docs/API.md).

## How to use

### Get all endpoints

```javascript
var MbedConnectorApi = require('mbed-connector-api');
var mbedConnectorApi = new MbedConnectorApi({
  accessKey: /* Access Key */
});
mbedConnectorApi.getEndpoints(function(error, endpoints) {
  if (error) throw error;
  console.log('Endpoints:', endpoints);
});
```

### Get an endpoint's resources
In this example, the endpoint's name is `test-endpoint`.

```javascript
var MbedConnectorApi = require('mbed-connector-api');
var mbedConnectorApi = new MbedConnectorApi({
  accessKey: /* Access Key */
});
mbedConnectorApi.getResources('test-endpoint', function(error, resources) {
  if (error) throw error;
  console.log('Resources:', resources);
});
```

### Get a resource's value
In this example, the endpoint's name is `test-endpoint` and the resource URI is `/Test/0/D`.

**NOTE:** Long polling is used as the notification channel

```javascript
var MbedConnectorApi = require('mbed-connector-api');
var mbedConnectorApi = new MbedConnectorApi({
  accessKey: /* Access Key */
});
mbedConnectorApi.startLongPolling(function(error) {
  if (error) throw error;
  mbedConnectorApi.getResourceValue('test-endpoint', '/Test/0/D', function(error, value) {
    if (error) throw error;
    console.log('Value:', value);
  });
});
```

### Get all endpoints, resources, and values
```javascript
var MbedConnectorApi = require('mbed-connector-api');
var mbedConnectorApi = new MbedConnectorApi({
  accessKey: /* Access Key */
});

// Setup notification channel
mbedConnectorApi.startLongPolling(function(error) {
  if (error) throw error;
  mbedConnectorApi.getEndpoints(function(error, endpoints) {
    if (error) throw error;
    endpoints.forEach(function(endpoint) {
      mbedConnectorApi.getResources(endpoint.name, function(error, resources) {
        if (error) throw error;
        resources.forEach(function(resource) {
          mbedConnectorApi.getResourceValue(endpoint.name, resource.uri, function(error, value) {
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

## Testing
There are two types of tests that are available in this library: **mocking** and **integration** tests.

### Mocking Tests
Mocking tests can be ran with the following command:

```
npm test
```

These tests mock the expected results from mbed Device Connector. This allows you to run the test offline and without any endpoints setup. **Before any PRs are accepted on this repository, you must pass the mocking tests.**

### Integration Tests
The integration tests can be ran with the following command:

```
npm run-script test-external-longpoll
```

These tests will use an mbed linux client to perform "end to end" testing with mbed Device Connector.

#### mbed Linux Client

You will need a built mbed linux client to run integration tests. You can use the [mbed-client-linux-example](https://github.com/ARMmbed/mbed-client-linux-example) project.

#### Environment Setup
Running these tests require a number of environment variables to be setup. These can be set in your shell or in a `.env` file in the root of the project. The following variables are **required** to be set:

- ACCESS_KEY - An access key for your mbed Device Connector account
- ENDPOINT_NAME - The name of the mbed linux client you built. This can be found in your `security.h` file
- RESOURCE_NAME - The path to an observable resource on your client. For the [mbed-client-linux-example](https://github.com/ARMmbed/mbed-client-linux-example), this would be `/Test/0/D`
- CLIENT_PATH - The path to your compiled mbed linux client executable (see the above section)

The following variables are also available for optional configuration:

- HOST - The URL to the mbed Device Connector API. Defaults to `https://api.connector.mbed.com`.


