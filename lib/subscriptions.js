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

var urljoin = require('url-join'),
    util = require('util'),
    utility = require('./utility'),
    extend = require('extend');

var mbedConnector = require('./common');


/**
 * GETs the status of a resource's subscription
 * @param {string} endpoint - The name of the endpoint
 * @param {string} resource - The path to the resource
 * @param {function} callback - A function that is passed `(error, subscribed)` where
 * `subscribed` is `true` or `false`
 * @param {Object} [options] - Optional options object
 */

mbedConnector.prototype.getResourceSubscription = function(endpoint, resource, callback, options) {
  options = extend(true, {}, this.options, options || {});

  var requestData = {
    method: 'GET',
    url: urljoin(options.host, options.restApiVersion, 'subscriptions', endpoint, resource)
  }

  this.makeRequest(requestData, function(error, data) {
    if (error) {
      if (error.status === 404) {
        // Not subscribed
        callback(null, false);
      } else {
        callback(error);
      }
    } else {
      // if no error code returned, return true for 'subscribed'
      callback(null, true);
    }
  }, options);
};


/**
 * PUTs a subscription to a resource
 * @param {string} endpoint - The name of the endpoint
 * @param {string} resource - The path to the resource
 * @param {function} callback - A function that is passed a potential `error` object
 * @param {Object} [options] - Optional options object
 */

mbedConnector.prototype.putResourceSubscription = function(endpoint, resource, callback, options) {
  options = extend(true, {}, this.options, options || {});

  var requestData = {
    method: 'PUT',
    url: urljoin(options.host, options.restApiVersion, 'subscriptions', endpoint, resource),
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
};


/**
 * DELETEs a resource's subscription
 * @param {string} endpoint - The name of the endpoint
 * @param {string} resource - The path to the resource
 * @param {function} callback - A function that is passed a potential `error` object
 * @param {Object} [options] - Optional options object
 */

mbedConnector.prototype.deleteResourceSubscription = function(endpoint, resource, callback, options) {
  options = extend(true, {}, this.options, options || {});

  var requestData = {
    method: 'DELETE',
    url: urljoin(options.host, options.restApiVersion, 'subscriptions', endpoint, resource),
    headers: {
      accept: 'application/json'
    }
  }

  this.makeRequest(requestData, function(error, data) {
    if (error) {
      if (error.status === 404) {
        // No current subscription
        callback(null);
      } else {
        callback(error);
      }
    } else {
      callback(null);
    }
  }, options);
};


/**
 * Gets a list of an endpoint's subscriptions
 * @param {string} endpoint - The name of the endpoint
 * @param {function} callback - A function that is passed `(error, subscriptions)`
 * @param {Object} [options] - Optional options object
 */

mbedConnector.prototype.getEndpointSubscriptions = function(endpoint, callback, options) {
  options = extend(true, {}, this.options, options || {});

  var requestData = {
    method: 'GET',
    url: urljoin(options.host, options.restApiVersion, 'subscriptions', endpoint),
    headers: {
      accept: 'text/uri-list'
    }
  }

  this.makeRequest(requestData, function(error, data) {
    if (error) {
      if (error.status === 404) {
        // Handle if no subscriptions exist for an endpoint
        callback(null, []);
      } else {
        callback(error);
      }
    } else {
      // Trim the last newline character from the uri-list
      var uriListString = data.payload.replace(/\n$/, '');
      callback(null, uriListString.split(/\n/));
    }
  }, options);
};


/**
 * Removes an endpoint's subscriptions
 * @param {string} endpoint - The name of the endpoint
 * @param {function} callback - A function that is passed a potential `error` object
 * @param {Object} [options] - Optional options object
 */

mbedConnector.prototype.deleteEndpointSubscriptions = function(endpoint, callback, options) {
  options = extend(true, {}, this.options, options || {});

  var requestData = {
    method: 'DELETE',
    url: urljoin(options.host, options.restApiVersion, 'subscriptions', endpoint),
    headers: {
      accept: 'application/json'
    }
  }

  this.makeRequest(requestData, function(error, data) {
    if (error) {
      if (error.status === 404) {
        // No current subscriptions
        callback(null, false);
      } else {
        callback(error);
      }
    } else {
      callback(null);
    }
  }, options);
};


/**
 * Removes all subscriptions
 * @param {function} callback - A function that is passed a potential `error` object
 */

mbedConnector.prototype.deleteAllSubscriptions = function(callback, options) {
  options = extend(true, {}, this.options, options || {});

  var requestData = {
    method: 'DELETE',
    url: urljoin(options.host, options.restApiVersion, 'subscriptions'),
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
};


/**
 * GETs pre-subscription data
 * @param {function} callback - A function that is passed `(error, data)`
 * @param {Object} [options] - Optional options object
 */

mbedConnector.prototype.getPreSubscription = function(callback, options) {
  options = extend(true, {}, this.options, options || {});

  var requestData = {
    method: 'GET',
    url: urljoin(options.host, options.restApiVersion, 'subscriptions'),
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


/**
 * PUTs pre-subscription data
 * @param {Object} data - The pre-subscription data
 * @param {function} callback - A function that is passed a potential `error` object
 * @param {Object} [options] - Optional options object
 */

mbedConnector.prototype.putPreSubscription = function(data, callback, options) {
  options = extend(true, {}, this.options, options || {});

  var requestData = {
    method: 'PUT',
    url: urljoin(options.host, options.restApiVersion, 'subscriptions'),
    json: data
  }

  this.makeRequest(requestData, function(error, data) {
    if (error) {
      callback(error);
    } else {
      callback(null);
    }
  }, options);
};