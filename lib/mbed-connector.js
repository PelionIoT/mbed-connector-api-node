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
    urljoin = require('url-join');

var mbedClient = function(host, credentials) {
  this.host = host;
  this.credentials = credentials;
};

mbedClient.prototype.modifyOptionsWithAuth = function(options) {
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

    options.auth = { user: this.credentials.username, pass: this.credentials.password };
  }
}

mbedClient.prototype.makeAuthorizedRequest = function(options, callback) {
  if (!options.url) {
    throw new Error('No "url" property specified in request options');
  }

  this.modifyOptionsWithAuth(options);
  request(options, callback);
}

mbedClient.prototype.createWebhook = function(domain, url, callback) {
  var options = {
    method: 'PUT',
    url: urljoin(this.host, domain, 'notification/callback'),
    json: {url: url}
  }
  
  this.makeAuthorizedRequest(options, callback);
}

mbedClient.prototype.registerPreSubscription = function(domain, preSubscriptionData, callback) {
  var options = {
    method: 'PUT',
    url: urljoin(this.host, domain, 'subscriptions'),
    json: preSubscriptionData
  }

  this.makeAuthorizedRequest(options, callback);
}

mbedClient.prototype.subscribeToResource = function(domain, endpoint, resource, callback) {
  var options = {
    method: 'PUT',
    url: urljoin(this.host, domain, 'subscriptions', endpoint, resource)
  }

  this.makeAuthorizedRequest(options, callback);
}

mbedClient.prototype.getSubscriptionsForResource = function(domain, endpoint, resource, callback) {
  var options = {
    method: 'GET',
    url: urljoin(this.host, domain, 'subscriptions', endpoint, resource)
  }
  
  this.makeAuthorizedRequest(options, callback);
}


mbedClient.prototype.getEndpoints = function(domain, callback) {
  var options = {
    url: urljoin(this.host, domain, 'endpoints'),
    headers: {
      domain: domain,
      accept: 'application/json'
    }
  }

  this.makeAuthorizedRequest(options, callback);
}

mbedClient.prototype.getEndpoint = function(domain, endpoint, callback) {
  var options = {
    url: urljoin(this.host, domain, 'endpoints', endpoint),
    headers: {
      domain: domain,
      accept: 'application/json'
    }
  }

  this.makeAuthorizedRequest(options, callback);
}

mbedClient.prototype.getResource = function(domain, endpoint, resource, callback) {
  var options = {
    url: urljoin(this.host, domain, 'endpoints', endpoint, resource),
    headers: {
      domain: domain,
      accept: '*/*'
    }
  }

  this.makeAuthorizedRequest(options, callback);
}

mbedClient.prototype.putResource = function(domain, endpoint, resource, value, callback) {
  var options = {
    method: 'PUT',
    url: urljoin(this.host, domain, 'endpoints', endpoint, resource),
    headers: {
      domain: domain,
      accept: '*/*'
    },
    body: value.toString()
  }

  this.makeAuthorizedRequest(options, callback);
}
module.exports = mbedClient; 
