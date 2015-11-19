# mbed-connector

Node.js library for talking to the mbed Device Connector Service

## How to use

An instance of the connector must first be created to store connection information and credentials.

```javascript
var MbedConnector = require('mbed-connector');
var credentials = {
  token: /* mbed Device Connector Service Access key */
};
var mbedConnector = new MbedConnector(/* url to mbed Device Connector Service API */, credentials);
```

You will also need to create a webhook. In this example, the webhook route is `http://example.com/webhook`.

```javascript
mbedConnector.createWebhook('http://example.com/webhook', function(err, data) {
  if (err) throw err;

  console.log('Webhook created!');
});
```

In your `/webhook` route, you need to call the `handleWebhook` function and pass it the parsed JSON object that is passed to the route via an HTTP PUT request.

## Notes when using express

When using express, you can set an app variable to your instance of mbedConnector. This will let you access the instance in your routes.

```javascript
var express = require('express');
var MbedConnector = require('mbed-connector');

var app = express();

var credentials = {
  token: /* mbed Device Connector Service Access key */
};

var url = 'http://mywebsite.com';
var port = 80;

var mbedConnector = new MbedConnector(/* url to mbed Device Connector Service API> */, credentials);

app.set('mbedConnector', mbedConnector);

// Setup webhook route to handle PUT requests
app.put('/webhook', function (req, res) {
  if (req.body) {
    var mbedConnector = req.app.get('mbedConnector');
    // Let the mbed Device Connector Service library handle the webhook payload
    mbedConnector.handleWebhook(req.body);
  }

  res.sendStatus(200);
});

var server = app.listen(port, function () {
  console.log('Example app listening at %s:%s', url, port);

  // Register your webhook route
  mbedConnector.createWebhook(url + '/webhook', function(error) {
    if (error) {
      console.error('webhook registration failed');
    } else {
      console.log('webhook registration succeeded');
    }
  });
});
```

Setting of the `mbedConnector` variable is not necessary in this particular example since it is still in scope, but this will allow you to break up your app into multiple files.

## API

### new MbedConnector(host, credentials[, options])

Create an mbed Device Connector Service client

- `host` - URL to mbed Device Connector Service API
- `credentials` - Object containing authentication information for mbed Device Connector Service. The object should have the following format:
```javascript
var credentials = {
  token: /* mbed Device Connector Service Access key */ ;
};
```
- `options` - Object containing **optional** configuration
  - `requestCallback` - function that is called anytime a request callback returns. The function is passed the error, response, and body arguments from the request callback (see the [request library documentation](https://github.com/request/request) for more information)
  ```javascript
  options.requestCallback = function(error, response, body, callback) {
    // handle response
    // ...
    callback();
  };
  ```
  - `asyncResponseHandler` - function that is called anytime an async-response is received through the webhook, **but only if requestCallback is not overriden (see above)**. The function is passed an asyncResponse object. See the mbed Device Connector Service documentation for the format of the asyncResponse object.


### .createWebhook(url, callback[, options])

Create a webhook. This allows the mbed Device Connector Service to push updates to your application.

- `url` - URL where the mbed Device Connector Service should PUT updates

### .startLongPolling(callback[, options])

Start continuous long polling for notifications. This can be used instead of a webhook so an app can run from a publicly-unreachable machine (eg locally or behind a firewall).

### .registerPreSubscription(preSubscriptionData, callback[, options])

Configure the relevant subscriptions

- `preSubscriptionData` - Object detailing the subscriptions. See the mbed Device Connector Service documentation for more information.

### .subscribeToResource(endpoint, resource, callback[, options])

Subscribe to an endpoint's resource.

- `endpoint` - name of the endpoint
- `resource` - full path of the resource (ex. "/Object/0/Resource")

### .getSubscriptionsForResource(endpoint, resource, callback[, options])

Get the subscriptions to an endpoint's resource.

- `endpoint` - name of the endpoint
- `resource` - full path of the resource (ex. "/Object/0/Resource")

### .getEndpoints(callback[, options])

Get a list of the endpoints.

### .getResource(endpoint, resource, callback[, options])

Get the value of an endpoint's resource.

- `endpoint` - name of the endpoint
- `resource` - full path of the resource (ex. "/Object/0/Resource")

### .putResource(endpoint, resource, value, callback[, options])

Set the value of an endpoint's resource.

- `endpoint` - name of the endpoint
- `resource` - full path of the resource (ex. "/Object/0/Resource")
- `value` - value of the resource

## Events

### .on('registrations', callback)

Event triggered when new endpoints register. The callback is passed an array of all the new endpoints. See the mbed Device Connector Service documentation for more information on the format of the data passed by the "registrations" notification.

### .on('de-registrations', callback)

Event triggered when endpoints de-register. The callback is passed an array of all the names of the de-registered endpoints.

### .on('reg-updates', callback)

Event triggered when endpoints re-register. The callback is passed an array of all the re-registered endpoints. See the mbed Device Connector Service documentation for more information on the format of the data passed by the "reg-updates" notification.

### .on('notifications', callback)

Event triggered on new notifications. The callback is passed an array of all the new notifications. See the mbed Device Connector Service documentation for more information on the format of the data passed by the "notifcations" notification.
