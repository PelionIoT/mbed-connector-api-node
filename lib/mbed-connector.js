/*
 * Copyright (c) 2013-2015, ARM Limited, All Rights Reserved
 * SPDX-License-Identifier: Apache-2.0
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

 /*
  * Copyright (c) 2013-2015, ARM Limited, All Rights Reserved
  * SPDX-License-Identifier: Apache-2.0
  *
  * Licensed under the Apache License, Version 2.0 (the "License"); you may
  * not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  * http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
  * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  */

 var request = require('request'),
     urljoin = require('url-join'),
     events = require('events'),
     util = require('util'),
     extend = require('extend');

 var mbedConnector = function(options) {
   var defaultOptions = {
     host: 'https://api.connector.mbed.com'
   };

   this.options = extend(true, {}, defaultOptions, options || {});

   this.asyncCallbacks = {};
 };

 mbedConnector.prototype = new events.EventEmitter;

// Endpoint directory lookups

mbedConnector.prototype.getEndpoints = function(callback, options) {
  options = extend(true, {}, this.options, options || {});

  var requestData = {
    url: urljoin(options.host, 'endpoints'),
    headers: {
      accept: 'application/json'
    }
  }

  this.makeRequest(requestData, function(error, data) {
    if (error) {
      callback(error);
    } else {
      callback(null, JSON.parse(data.payload));
    }
  }, options);
}

mbedConnector.prototype.getResources = function(endpoint, callback, options) {
  options = extend(true, {}, this.options, options || {});

  var requestData = {
    url: urljoin(options.host, 'endpoints', endpoint),
    headers: {
      accept: 'application/json'
    }
  }

  this.makeRequest(requestData, function(error, data) {
    if (error) {
      callback(error);
    } else {
      callback(null, JSON.parse(data.payload));
    }
  }, options);
}

mbedConnector.prototype.getResourceValue = function(endpoint, resource, callback, options) {
  options = extend(true, {}, this.options, options || {});

  var requestData = {
    url: urljoin(options.host, 'endpoints', endpoint, resource),
    headers: {
      accept: '*/*'
    }
  }

  this.makeRequest(requestData, function(error, data) {
    if (error) {
      callback(error);
    } else {
      var typedData;

      try {
        typedData = JSON.parse(data.payload);
      } catch (e) {
        typedData = data;
      }

      callback(null, typedData);
    }
  }, options);
}

mbedConnector.prototype.putResourceValue = function(endpoint, resource, value, callback, options) {
  options = extend(true, {}, this.options, options || {});

  var requestData = {
    method: 'PUT',
    url: urljoin(options.host, 'endpoints', endpoint, resource),
    headers: {
      accept: 'application/json'
    },
    body: value.toString()
  }

  this.makeRequest(requestData, function(error, data) {
    if (error) {
      callback(error);
    } else {
      callback(null);
    }
  }, options);
}

mbedConnector.prototype.postResource = function(endpoint, resource, value, callback, options) {
  options = extend(true, {}, this.options, options || {});

  var requestData = {
    method: 'POST',
    url: urljoin(options.host, 'endpoints', endpoint, resource),
    headers: {
      accept: 'application/json'
    }
  }

  if (value) {
    requestData.body = value.toString();
  }

  this.makeRequest(requestData, function(error, data) {
    if (error) {
      callback(error);
    } else {
      callback(null);
    }
  }, options);
}

mbedConnector.prototype.deleteEndpoint = function(endpoint, callback, options) {
  options = extend(true, {}, this.options, options || {});

  var requestData = {
    method: 'DELETE',
    url: urljoin(options.host, 'endpoints', endpoint),
    headers: {
      accept: 'application/json'
    }
  }

  this.makeRequest(requestData, function(error, data) {
    if (error) {
      callback(error);
    } else {
      callback(null);
    }
  }, options);
}


/*
mbedConnector.prototype.putResource = function(endpoint, resource, value, callback, options) {
  options = this.populateOptions(options, {
    request: {
      method: 'PUT',
      url: urljoin(this.host, 'endpoints', endpoint, resource),
      headers: {*/
        //accept: '*/*'
      /*},
      body: value.toString()
    }
  });

  this.makeAuthorizedRequest(options, callback);
}


// Notifications

mbedConnector.prototype.subscribeToResource = function(endpoint, resource, callback, options) {
  options = this.populateOptions(options, {
    request: {
      method: 'PUT',
      url: urljoin(this.host, 'subscriptions', endpoint, resource)
    }
  });

  this.makeAuthorizedRequest(options, callback);
}

mbedConnector.prototype.unsubscribeFromResource = function(endpoint, resource, callback, options) {
  options = this.populateOptions(options, {
    request: {
      method: 'DELETE',
      url: urljoin(this.host, 'subscriptions', endpoint, resource)
    }
  });

  this.makeAuthorizedRequest(options, callback);
}

mbedConnector.prototype.unsubscribeFromAllResources = function(callback, options) {
  options = this.populateOptions(options, {
    request: {
      method: 'DELETE',
      url: urljoin(this.host, 'subscriptions')
    }
  });

  this.makeAuthorizedRequest(options, callback);
}

mbedConnector.prototype.getSubscriptionForResource = function(endpoint, resource, callback, options) {
  options = this.populateOptions(options, {
    request: {
      method: 'GET',
      url: urljoin(this.host, 'subscriptions', endpoint, resource)
    }
  });

  this.makeAuthorizedRequest(options, callback);
}

mbedConnector.prototype.getSubscriptionsForEndpoint = function(endpoint, callback, options) {
  options = this.populateOptions(options, {
    request: {
      method: 'GET',
      url: urljoin(this.host, 'subscriptions', endpoint)
    }
  });

  this.makeAuthorizedRequest(options, callback);
}

mbedConnector.prototype.unsubscribeFromEndpointResources = function(endpoint, callback, options) {
  options = this.populateOptions(options, {
    request: {
      method: 'DELETE',
      url: urljoin(this.host, 'subscriptions', endpoint)
    }
  });

  this.makeAuthorizedRequest(options, callback);
}

mbedConnector.prototype.setPreSubscriptionData = function(preSubscriptionData, callback, options) {
  options = this.populateOptions(options, {
    request: {
      method: 'PUT',
      url: urljoin(this.host, 'subscriptions'),
      json: preSubscriptionData
    }
  });

  this.makeAuthorizedRequest(options, callback);
}

mbedConnector.prototype.getPreSubscriptionData = function(callback, options) {
  options = this.populateOptions(options, {
    request: {
      method: 'GET',
      url: urljoin(this.host, 'subscriptions')
    }
  });

  this.makeAuthorizedRequest(options, callback);
}


mbedConnector.prototype.setCallbackURL = function(url, callback, options) {
  options = this.populateOptions(options, {
    request: {
      method: 'PUT',
      url: urljoin(this.host, 'notification/callback'),
      json: {url: url}
    }
  });

  this.makeAuthorizedRequest(options, callback);
}

mbedConnector.prototype.getCallbackURL = function(callback, options) {
  options = this.populateOptions(options, {
    request: {
      method: 'GET',
      url: urljoin(this.host, 'notification/callback')
    }
  });

  this.makeAuthorizedRequest(options, callback);
}

mbedConnector.prototype.deleteCallbackURL = function(callback, options) {
  options = this.populateOptions(options, {
    request: {
      method: 'DELETE',
      url: urljoin(this.host, 'notification/callback')
    }
  });

  this.makeAuthorizedRequest(options, callback);
}*/

// Misc

mbedConnector.prototype.getLimits = function(callback, options) {
  options = extend(true, {}, this.options, options || {});

  var requestData = {
    url: urljoin(options.host, 'limits'),
    headers: {
      accept: 'application/json'
    }
  }

  this.makeRequest(requestData, function(error, data) {
    if (error) {
      callback(error);
    } else {
      callback(null, JSON.parse(data.payload));
    }
  }, options);
};

mbedConnector.prototype.startLongPolling = function(options) {
  if (!options) {
    options = {};
  }

  if (options && !options.requestCallback) {
    options.requestCallback = this.longPollRequestCallback;
  }

  options = extend(true, {}, this.options, options || {});

  var _this = this;

  var requestData = {
    url: urljoin(options.host, '/notification/pull')
  }

  function poll(error, data) {
    if (error) {
      console.log('ERROR: Long poll failed [Status ' + error.status + ']');
      throw error;
    } else {
      if (data) {
        _this.handleNotifications(data);
      }

      _this.longPollRequestObj = _this.makeRequest(requestData, poll, options);
    }
  }

  if (this.longPollRequestObj) {
    this.stopLongPolling();
  }

  poll();
}

mbedConnector.prototype.stopLongPolling = function() {
  if (this.longPollRequestObj) {
    this.longPollRequestObj.abort();
    this.longPollRequestObj = null;
  }
}

// Traffic limits

/*mbedConnector.prototype.getTrafficLimits = function(callback, options) {
  options = this.populateOptions(options, {
    request: {
      method: 'GET',
      url: urljoin(this.host, 'limits')
    }
  });

  this.makeAuthorizedRequest(options, callback);
}*/

// Helper functions

function getAsyncResponseId(data) {
  if (util.isString(data)) {
    try {
      data = JSON.parse(data);
    } catch (e) {
      // Not a JSON string, so return false
      return false;
    }
  }

  if (data) {
    if (data["async-response-id"]) {
      return data["async-response-id"];
    }
  }

  return null;
}

function handleError(error, response, body, callback) {
  var status;

  if (response && response.statusCode) {
    status = response.statusCode;
  } else {
    status = "error in callback";
  }

  console.log(error);

  var e = new Error('Request failed: [Status ' + status + '] ' + body);
  e.response = response;
  e.error = error;
  e.status = status;

  if (callback) {
    callback(e);
  } else {
    throw e;
  }
}

mbedConnector.prototype.longPollRequestCallback = function(error, response, body, callback) {
  if (error || (response && response.statusCode >= 400)) {
    handleError(error, response, body, callback);
  } else {
    if (response.statusCode === 200) {
      // New notifications
      var data = body;
      if (util.isString(data)) {
        try {
          data = JSON.parse(body);
        } catch (e) {
          // Not a JSON string, so return false
          throw new Error('Failed to parse JSON in longPollRequestCallback');
        }
      }

      callback(null, data);
    }
  }
}

mbedConnector.prototype.requestCallback = function(error, response, body, callback) {
  if (error || (response && response.statusCode >= 400)) {
    handleError(error, response, body, callback);
  } else {
    if (body) {
      var asyncResponseId = getAsyncResponseId(body);
      if (asyncResponseId) {
        this.asyncCallbacks[asyncResponseId] = function(err, body) {
          if (callback) {
            callback(err, body);
          }
        };
      } else {
        var data = {
          status: response.status,
          payload: body
        };

        callback(null, data);
      }
    } else {
      if (callback) {
        var data = {
          status: response.status,
          payload: body
        };

        callback(null, data);
      }
    }
  }
};

mbedConnector.prototype.makeRequest = function(requestData, userCallback, options) {
  var requestObj = extend(true, {}, requestData);
  options = extend(true, {}, this.options, options, options || {});

  var requestCallback = options.requestCallback || this.requestCallback;

  // Set authorization headers
  if (this.options.accessKey) {
    // If a token is set, assume using token authentication
    // Remove basic auth
    if (requestObj.auth) {
      delete requestObj.auth;
    }

    if (!requestObj.headers) {
      requestObj.headers = {};
    }

    requestObj.headers.Authorization = 'Bearer ' + options.accessKey;
  } else if (this.options.username && this.options.password && this.options.domain) {
    // If a token is not set but a username and password are set, assume using basic auth

    // Remove token authorization header if it exists
    if (requestObj.headers && requestObj.headers.Authorization) {
      delete requestObj.headers.Autorization;
    }

    requestObj.auth = {
      user: options.domain + '/' + options.username,
      pass: options.password
    };
  }

  var _this = this;
  request(requestObj, function(error, response, body) {
    requestCallback.call(_this, error, response, body, userCallback);
  });
}

mbedConnector.prototype.asyncResponseHandler = function(asyncResponse) {
  if (this.asyncCallbacks[asyncResponse.id]) {
    if (asyncResponse.status >= 400) {
      var e = new Error('Request failed with status ' + asyncResponse.status);
      e.status = asyncResponse.status;
      e.error = asyncResponse.error;
      this.asyncCallbacks[asyncResponse.id](e);
    } else {
      if (asyncResponse.payload) {
        var payload = new Buffer(asyncResponse.payload, 'base64');
        asyncResponse.payload = payload.toString();
      }

      this.asyncCallbacks[asyncResponse.id](null, asyncResponse);
      delete this.asyncCallbacks[asyncResponse.id];
    }
  }
}


mbedConnector.prototype.handleNotifications = function(payload) {
  if (payload['notifications']) {
    payload['notifications'].forEach(function(notification) {
      var data = new Buffer(notification.payload, 'base64');
      notification.payload = data.toString();
    });

    this.emit('notifications', payload['notifications']);
  }

  if (payload['registrations']) {
    this.emit('registrations', payload['registrations']);
  }

  if (payload['reg-updates']) {
    this.emit('reg-updates', payload['reg-updates']);
  }

  if (payload['de-registrations']) {
    this.emit('de-registrations', payload['de-registrations']);
  }

  if (payload['registrations-expired']) {
    this.emit('registrations-expired', payload['registrations-expired']);
  }

  if (payload["async-responses"]) {
    var _this = this;
    payload['async-responses'].forEach(function(asyncResponse) {
      _this.asyncResponseHandler(asyncResponse);
    });
  }
}

module.exports = mbedConnector;
