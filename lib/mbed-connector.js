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
    events = require('events');

var mbedClient = function(host, credentials, options) {
  this.host = host;
  this.credentials = credentials;

  if (options) {
    if (options.responseCallback) {
      this.requestCallback = options.responseCallback;
    }

    if (options.asyncResponseHandler) {
      this.asyncResponseHandler = asyncResponseHandler;
    }
  }

  this.asyncCallbacks = {};
};

mbedClient.prototype = new events.EventEmitter;

// Endpoint directory lookups

mbedClient.prototype.getEndpoints = function(callback, options) {
  options = this.populateOptions(options, {
    request: {
      url: urljoin(this.host, 'endpoints'),
      headers: {
        accept: 'application/json'
      }
    }
  });

  this.makeAuthorizedRequest(options, callback);
}

mbedClient.prototype.getEndpoint = function(endpoint, callback, options) {
  options = this.populateOptions(options, {
    request: {
      url: urljoin(this.host, 'endpoints', endpoint),
      headers: {
        accept: 'application/json'
      }
    }
  });

  this.makeAuthorizedRequest(options, callback);
}

mbedClient.prototype.getResource = function(endpoint, resource, callback, options) {
  options = this.populateOptions(options, {
    request: {
      url: urljoin(this.host, 'endpoints', endpoint, resource),
      headers: {
        accept: '*/*'
      }
    }
  });

  this.makeAuthorizedRequest(options, callback);
}

mbedClient.prototype.putResource = function(endpoint, resource, value, callback, options) {
  options = this.populateOptions(options, {
    request: {
      method: 'PUT',
      url: urljoin(this.host, 'endpoints', endpoint, resource),
      headers: {
        accept: '*/*'
      },
      body: value.toString()
    }
  });

  this.makeAuthorizedRequest(options, callback);
}


// Notifications

mbedClient.prototype.subscribeToResource = function(endpoint, resource, callback, options) {
  options = this.populateOptions(options, {
    request: {
      method: 'PUT',
      url: urljoin(this.host, 'subscriptions', endpoint, resource)
    }
  });

  this.makeAuthorizedRequest(options, callback);
}

mbedClient.prototype.unsubscribeFromResource = function(endpoint, resource, callback, options) {
  options = this.populateOptions(options, {
    request: {
      method: 'DELETE',
      url: urljoin(this.host, 'subscriptions', endpoint, resource)
    }
  });

  this.makeAuthorizedRequest(options, callback);
}

mbedClient.prototype.unsubscribeFromAllResources = function(callback, options) {
  options = this.populateOptions(options, {
    request: {
      method: 'DELETE',
      url: urljoin(this.host, 'subscriptions')
    }
  });

  this.makeAuthorizedRequest(options, callback);
}

mbedClient.prototype.getSubscriptionForResource = function(endpoint, resource, callback, options) {
  options = this.populateOptions(options, {
    request: {
      method: 'GET',
      url: urljoin(this.host, 'subscriptions', endpoint, resource)
    }
  });

  this.makeAuthorizedRequest(options, callback);
}

mbedClient.prototype.getSubscriptionsForEndpoint = function(endpoint, callback, options) {
  options = this.populateOptions(options, {
    request: {
      method: 'GET',
      url: urljoin(this.host, 'subscriptions', endpoint)
    }
  });

  this.makeAuthorizedRequest(options, callback);
}

mbedClient.prototype.unsubscribeFromEndpointResources = function(endpoint, callback, options) {
  options = this.populateOptions(options, {
    request: {
      method: 'DELETE',
      url: urljoin(this.host, 'subscriptions', endpoint)
    }
  });

  this.makeAuthorizedRequest(options, callback);
}

mbedClient.prototype.setPreSubscriptionData = function(preSubscriptionData, callback, options) {
  options = this.populateOptions(options, {
    request: {
      method: 'PUT',
      url: urljoin(this.host, 'subscriptions'),
      json: preSubscriptionData
    }
  });

  this.makeAuthorizedRequest(options, callback);
}

mbedClient.prototype.getPreSubscriptionData = function(callback, options) {
  options = this.populateOptions(options, {
    request: {
      method: 'GET',
      url: urljoin(this.host, 'subscriptions')
    }
  });

  this.makeAuthorizedRequest(options, callback);
}


mbedClient.prototype.setCallbackURL = function(url, callback, options) {
  options = this.populateOptions(options, {
    request: {
      method: 'PUT',
      url: urljoin(this.host, 'notification/callback'),
      json: {url: url}
    }
  });

  this.makeAuthorizedRequest(options, callback);
}

mbedClient.prototype.getCallbackURL = function(callback, options) {
  options = this.populateOptions(options, {
    request: {
      method: 'GET',
      url: urljoin(this.host, 'notification/callback')
    }
  });

  this.makeAuthorizedRequest(options, callback);
}

mbedClient.prototype.deleteCallbackURL = function(callback, options) {
  options = this.populateOptions(options, {
    request: {
      method: 'DELETE',
      url: urljoin(this.host, 'notification/callback')
    }
  });

  this.makeAuthorizedRequest(options, callback);
}

mbedClient.prototype.startLongPolling = function(callback, options) {
  var _this = this;

  options = this.populateOptions(options, {
    request: {
      method: 'GET',
      url: urljoin(this.host, 'notification/pull')
    }
  });

  function poll(error) {
    if (error) {
      console.log('ERROR: Long poll failed [Status ' + error.status + ']');
      console.log(error);
      throw error;
    } else {
      _this.longPollRequestObj = _this.makeAuthorizedRequest(options, poll);
    }
  }


  if (this.longPollRequestObj) {
    this.stopLongPolling();
  }

  poll();

  if (callback) {
    callback();
  }
}

mbedClient.prototype.stopLongPolling = function() {
  if (this.longPollRequestObj) {
    this.longPollRequestObj.abort();
    this.longPollRequestObj = null;
  }
}

mbedClient.prototype.handleNotifications = function(payload) {
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


// Traffic limits

mbedClient.prototype.getTrafficLimits = function(callback, options) {
  options = this.populateOptions(options, {
    request: {
      method: 'GET',
      url: urljoin(this.host, 'limits')
    }
  });

  this.makeAuthorizedRequest(options, callback);
}

// Helper functions

mbedClient.prototype.modifyOptionsWithAuth = function(options) {
  if (this.credentials.token) {
    // If a token is set, assume using token authentication

    // Remove basic auth
    if (options.request.auth) {
      delete options.request.auth;
    }

    if (!options.request.headers) {
      options.request.headers = {};
    }

    options.request.headers.Authorization = 'bearer ' + this.credentials.token;
  } else if (this.credentials.username && this.credentials.password) {
    // If a token is not set but a username and password are set, assume using basic auth

    var domain;

    if (options.domain) {
      domain = options.domain;
    } else if (this.credentials.domain) {
      domain = this.credentials.domain;
    } else {
      throw new Error('Using basic auth, but no valid domain found before making request');
    }

    // Remove token authorization header if it exists
    if (options.request.headers && options.request.headers.Authorization) {
      delete options.request.headers.Autorization;
    }

    options.request.auth = { user: domain + '/' + this.credentials.username, pass: this.credentials.password };
  }
};

mbedClient.prototype.populateOptions = function(options, defaultOptions) {
  options = options || {};

  if (!options.request) {
    options.request = defaultOptions.request;
  }

  return options;
};

mbedClient.prototype.requestCallback = function(error, response, body, callback) {
  if (error || (response && response.statusCode >= 400)) {
    var status;

    if (response && response.statusCode) {
      status = response.statusCode;
    } else {
      status = "error in callback";
    }

    var e = new Error('Request failed: [Status ' + status + '] ' + body);
    e.response = response;
    e.error = error;
    e.status = status;

    if (callback) {
      callback(e);
    }
  } else {
    if (body) {
      var obj = null;
      try {
        obj = JSON.parse(body);
      } catch (e) {
        // Do nothing here, just catching exception (handled below)
      }

      if (obj) {
        if (obj["async-response-id"]) {
          this.asyncCallbacks[obj["async-response-id"]] = function(err, body) {
            if (callback) {
              callback(err, body);
            }
          };
        } else {
          this.handleNotifications(obj);

          if (callback) {
            callback(null, obj);
          }
        }
      } else {
        if (callback) {
          callback(null, body);
        }
      }
    } else {
      if (callback) {
        callback(null, body);
      }
    }
  }
};

mbedClient.prototype.makeAuthorizedRequest = function(options, callback) {
  if (!options.request) {
    throw new Error('No "request" property given in options');
  }

  if (!options.request.url) {
    throw new Error('No "url" property specified in request options');
  }

  this.modifyOptionsWithAuth(options);

  var _this = this;
  request(options.request, function(error, response, body) {
    _this.requestCallback(error, response, body, callback);
  });
}

mbedClient.prototype.asyncResponseHandler = function(asyncResponse) {
  if (this.asyncCallbacks[asyncResponse.id]) {
    if (asyncResponse.status >= 400) {
      var e = new Error('Request failed with status ' + asyncResponse.status);
      e.status = asyncResponse.status;
      this.asyncCallbacks[asyncResponse.id](e);
    } else {
      var data = new Buffer(asyncResponse.payload, 'base64');
      this.asyncCallbacks[asyncResponse.id](null, data.toString());
      delete this.asyncCallbacks[asyncResponse.id];
    }
  }
}


module.exports = mbedClient;
