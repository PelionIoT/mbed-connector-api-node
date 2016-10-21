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

var urljoin = require('url-join');
var util = require('util');
var utility = require('./utility');
var extend = require('extend');

var mbedConnectorApi = require('./common');

/**
 * Gets the current traffic usage and limits of the mbed Device Connector
 * account
 * @param {Object} [options] - Optional options object
 * @param {function} [callback] - A function that is passed the arguments
 * `(error, limits)`
 */

mbedConnectorApi.prototype.getLimits = function(options, callback) {
  options = extend(true, {}, this.options, options || {});

  var requestData = {
    method: 'GET',
    url: urljoin(options.host, options.restApiVersion, 'limits'),
    headers: {
      accept: 'application/json'
    }
  };

  this.makeRequest(requestData, function(error, data) {
    if (typeof callback === 'function') {
      if (error) {
        callback(error);
      } else {
        callback(null, JSON.parse(data.payload));
      }
    }
  }, options);
};


/**
 * Gets a list of the available REST API versions
 * @param {Object} [options] - Optional options object
 * @param {function} [callback] - A function that is passed the arguments
 * `(error, versions)`
 */

mbedConnectorApi.prototype.getApiVersions = function(options, callback) {
  options = extend(true, {}, this.options, options || {});

  var requestData = {
    method: 'GET',
    url: urljoin(options.host, 'rest-versions'),
    headers: {
      accept: 'application/json'
    }
  };

  this.makeRequest(requestData, function(error, data) {
    if (typeof callback === 'function') {
      if (error) {
        callback(error);
      } else {
        callback(null, JSON.parse(data.payload));
      }
    }
  }, options);
};
