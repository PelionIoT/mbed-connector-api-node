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
   
    if (options.useSync) {
      this.useSync = true;
    } else {
      this.useSync = false;
    }
  }

  this.asyncCallbacks = {};
};

mbedClient.prototype = new events.EventEmitter;

mbedClient.prototype.modifyOptionsWithAuth = function(options, domain) {
  if (this.credentials.token) {
    // If a token is set, assume using token authentication

    // Remove basic auth
    if (options.auth) {
      delete options.auth;
    }

    if (!options.headers) {
      options.headers = {};
    }

    options.headers.Authorization = 'Bearer ' + this.credentials.token;
  } else if (this.credentials.username && this.credentials.password) {
    // If a token is not set but a username and password are set, assume using basic auth

    // Remove token authorization header
    if (options.headers && options.headers.Authorization) {
      delete options.headers.Autorization;
    }

    options.auth = { user: domain + '/' + this.credentials.username, pass: this.credentials.password };
  }
};

mbedClient.prototype.requestCallback = function(error, response, body, callback) {
  if (error || response.statusCode >= 400) {
    var e = new Error('Request failed with status ' + response.statusCode);
    e.status = response.statusCode;
    callback(e, null);
  } else {
    if (body) {
      var obj = null;
      try {
        obj = JSON.parse(body);
      } catch (e) {
      }

      if (obj && obj["async-response-id"]) {
        this.asyncCallbacks[obj["async-response-id"]] = function(err, body) {
          callback(err, body);
        };
      } else {
        callback(null, body);
      }
    } else { 
      callback(null, body);
    }
  }
};

mbedClient.prototype.makeAuthorizedRequest = function(options, domain, callback, sync) {
  if (!options.url) {
    throw new Error('No "url" property specified in request options');
  }

  if (sync) {
    options.url += '?sync=true';
  }

  this.modifyOptionsWithAuth(options, domain);

  var _this = this;
  request(options, function(error, response, body) {
    _this.requestCallback(error, response, body, callback);
  });
}

mbedClient.prototype.createWebhook = function(domain, url, callback) {
  var options = {
    method: 'PUT',
    url: urljoin(this.host, 'notification/callback'),
    json: {url: url}
  }
  
  this.makeAuthorizedRequest(options, domain, callback);
}

mbedClient.prototype.registerPreSubscription = function(domain, preSubscriptionData, callback) {
  var options = {
    method: 'PUT',
    url: urljoin(this.host, 'subscriptions'),
    json: preSubscriptionData
  }

  this.makeAuthorizedRequest(options, domain, callback);
}

mbedClient.prototype.subscribeToResource = function(domain, endpoint, resource, callback, sync) {
  var options = {
    method: 'PUT',
    url: urljoin(this.host, 'subscriptions', endpoint, resource)
  }

  this.makeAuthorizedRequest(options, domain, callback, sync);
}

mbedClient.prototype.getSubscriptionsForResource = function(domain, endpoint, resource, callback) {
  var options = {
    method: 'GET',
    url: urljoin(this.host, 'subscriptions', endpoint, resource)
  }
  
  this.makeAuthorizedRequest(options, domain, callback);
}


mbedClient.prototype.getEndpoints = function(domain, callback) {
  var options = {
    url: urljoin(this.host, 'endpoints'),
    headers: {
      accept: 'application/json'
    }
  }

  this.makeAuthorizedRequest(options, domain, callback);
}

mbedClient.prototype.getEndpoint = function(domain, endpoint, callback) {
  var options = {
    url: urljoin(this.host, 'endpoints', endpoint),
    headers: {
      accept: 'application/json'
    }
  }

  this.makeAuthorizedRequest(options, domain, callback);
}

mbedClient.prototype.getResource = function(domain, endpoint, resource, callback, sync) {
  var options = {
    url: urljoin(this.host, 'endpoints', endpoint, resource),
    headers: {
      accept: '*/*'
    }
  }

  this.makeAuthorizedRequest(options, domain, callback, sync);
}

mbedClient.prototype.putResource = function(domain, endpoint, resource, value, callback, sync) {
  var options = {
    method: 'PUT',
    url: urljoin(this.host, 'endpoints', endpoint, resource),
    headers: {
      accept: '*/*'
    },
    body: value.toString()
  }

  this.makeAuthorizedRequest(options, domain, callback, sync);
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

mbedClient.prototype.handleWebhook = function(payload) {
  if (payload.registrations) {
    this.emit('registrations', payload.registrations);
  }
  
  if (payload['reg-updates']) {
    this.emit('reg-updates', payload['reg-updates']);
  }

  if (payload["async-responses"]) {
    var _this = this;
    payload['async-responses'].forEach(function(asyncResponse) {
      _this.asyncResponseHandler(asyncResponse);
    });
  }
}

module.exports = mbedClient; 
