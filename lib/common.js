/*
 * Copyright (c) 2013-2016, ARM Limited, All Rights Reserved
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

var request = require('request');
var urljoin = require('url-join');
var events = require('events');
var util = require('util');
var utility = require('./utility');
var extend = require('extend');

/**
 * Represents an mbed Device Connector REST API Client
 * @class
 * @constructor
 * @param {Object} options - Options object
 * @param {string} options.accessKey - Access Key for your mbed Device Connector
 * account
 * @param {string} [options.host=https://api.connector.mbed.com] - URL for mbed
 * Device Connector API
 * @param {string} [options.restApiVersion=v2] - Version of mbed Device
 * Connector REST API to use
 *
 * @fires mbedConnectorApi#notification
 * @fires mbedConnectorApi#registration
 * @fires mbedConnectorApi#reg-update
 * @fires mbedConnectorApi#de-registration
 * @fires mbedConnectorApi#registration-expired
 */
var mbedConnectorApi = function(options) {
  var defaultOptions = {
    host: 'https://api.connector.mbed.com',
    restApiVersion: 'v2'
  };

  this.options = extend(true, {}, defaultOptions, options || {});

  this.asyncCallbacks = {};
};

mbedConnectorApi.prototype = new events.EventEmitter;

mbedConnectorApi.prototype.makeRequest = function(requestData, userCallback,
                                               options) {
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
  } else if (this.options.username &&
             this.options.password &&
             this.options.domain) {
    // If a token is not set but a username and password are set,
    // assume using basic auth

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
  return request(requestObj, function(error, response, body) {
    requestCallback.call(_this, error, response, body, userCallback);
  });
}

mbedConnectorApi.prototype.requestCallback = function(error, response, body,
                                                   callback) {
  if (typeof callback === 'function') {
    if (error || (response && response.statusCode >= 400)) {
      utility.handleError(error, response, body, callback);
    } else {
      var asyncResponseId;

      if (body) {
        asyncResponseId = utility.getAsyncResponseId(body);
      }

      if (asyncResponseId) {
        this.asyncCallbacks[asyncResponseId] = function(err, body) {
          callback(err, body);
        };
      } else {
        var data = {
          status: response.status,
          payload: body
        };

        callback(null, data);
      }
    }
  }
};

mbedConnectorApi.prototype.asyncResponseHandler = function(asyncResponse) {
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
};

module.exports = mbedConnectorApi;