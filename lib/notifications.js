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
 * GETs the current callback data
 * @param {function} [callback] - A function that is passed the arguments
 * `(error, callbackData)` where `callbackData` is an object containing a `url`
 * string and a `headers` object
 * @param {Object} [options] - Optional options object
 */

mbedConnectorApi.prototype.getCallback = function(callback, options) {
  options = extend(true, {}, this.options, options || {});

  var requestData = {
    method: 'GET',
    url: urljoin(options.host,
                 options.restApiVersion,
                 'notification',
                 'callback'),
    headers: {
      accept: 'application/json'
    }
  }

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
 * PUTs callback data
 * @param {Object} data - The callback data
 * @param {string} data.url - The callback URL
 * @param {Object} [data.headers] - The headers that should be set when
 * mbed Device Connector PUTs to the given callback URL
 * @param {function} [callback] - A function that is passed a potential `error`
 * object
 * @param {Object} [options] - Optional options object
 */

mbedConnectorApi.prototype.putCallback = function(data, callback, options) {
  options = extend(true, {}, this.options, options || {});

  var requestData = {
    method: 'PUT',
    url: urljoin(options.host,
                 options.restApiVersion,
                 'notification',
                 'callback'),
    headers: {
      accept: 'application/json'
    },
    json: data
  }

  this.makeRequest(requestData, function(error) {
    if (typeof callback === 'function') {
      if (error) {
        callback(error);
      } else {
        callback(null);
      }
    }
  }, options);
};


/**
 * DELETEs the callback data (effectively stopping mbed Device Connector from
 * PUTing notifications)
 * @param {function} [callback] - A function that is passed a potential `error`
 * object
 * @param {Object} [options] - Optional options object
 */

mbedConnectorApi.prototype.deleteCallback = function(callback, options) {
  options = extend(true, {}, this.options, options || {});

  var requestData = {
    method: 'DELETE',
    url: urljoin(options.host,
                 options.restApiVersion,
                 'notification',
                 'callback'),
    headers: {
      accept: 'application/json'
    }
  }

  this.makeRequest(requestData, function(error) {
    if (typeof callback === 'function') {
      if (error) {
        callback(error);
      } else {
        callback(null);
      }
    }
  }, options);
};



/**
 * Begins long polling constantly for notifications
 * @param {function} [callback] - A function that is passed a potential `error`
 * object
 * @param {Object} [options] - Optional options object
 */

mbedConnectorApi.prototype.startLongPolling = function(callback, options) {
  var firstPoll = true;
  var waitingForFirstResponse = false;

  if (!options) {
    options = {};
  }

  if (options && !options.requestCallback) {
    options.requestCallback = this.longPollRequestCallback;
  }

  options = extend(true, {}, this.options, options || {});

  var _this = this;

  var requestData = {
    method: 'GET',
    url: urljoin(options.host, options.restApiVersion, 'notification', 'pull'),
    headers: {
      accept: 'application/json',
      Connection: 'keep-alive'
    },
    qs: {
      'noWait': false
    }
  };

  function poll(error, data) {
    if (error) {
      if (waitingForFirstResponse) {
        waitingForFirstResponse = false;

        if (typeof callback === 'function') {
          callback(error);
        }
      } else {
        console.log('ERROR: Long poll failed [Status ' + error.status + ']');
      }
    } else {
      if (data) {
        _this.handleNotifications(data);
      }

      if (firstPoll) {
        firstPoll = false;
        waitingForFirstResponse = true;
        requestData.qs.noWait = true;
      } else {
        requestData.qs.noWait = false;
      }

      _this.longPollRequestObj = _this.makeRequest(requestData, poll, options);

      if (waitingForFirstResponse) {
        waitingForFirstResponse = false;
        if (typeof callback === 'function') {
          callback();
        }
      }
    }
  }

  if (this.longPollRequestObj) {
    this.stopLongPolling();
  }

  poll();
};


/**
 * Stops long polling for notifications
 */

mbedConnectorApi.prototype.stopLongPolling = function() {
  if (this.longPollRequestObj) {
    this.longPollRequestObj.abort();
    this.longPollRequestObj = null;
  }
};

mbedConnectorApi.prototype.longPollRequestCallback = function(error,
                                                           response,
                                                           body,
                                                           callback) {
  if (typeof callback === 'function') {
    if (error || (response && response.statusCode >= 400)) {
      utility.handleError(error, response, body, callback);
    } else {
      if (response.statusCode === 200) {
        // New notifications
        var data = body;
        if (util.isString(data)) {
          try {
            data = JSON.parse(body);
          } catch (e) {
            // Not a JSON string, failing silently
          }
        }

        callback(null, data);
      } else {
        callback();
      }
    }
  }
};

mbedConnectorApi.prototype.asyncResponseHandler = function(asyncResponse) {
  if (this.asyncCallbacks[asyncResponse.id]) {
    if (asyncResponse.status >= 400) {
      utility.handleAsyncError(asyncResponse,
                               this.asyncCallbacks[asyncResponse.id]);
    } else {
      if (asyncResponse.payload) {
        var payload = new Buffer(asyncResponse.payload, 'base64');
        asyncResponse.payload = payload.toString();
      }

      this.asyncCallbacks[asyncResponse.id](null, asyncResponse);
    }

    delete this.asyncCallbacks[asyncResponse.id];
  }
};

mbedConnectorApi.prototype.handleNotifications = function(payload) {
  var _this = this;

  if (payload['notifications']) {

    payload['notifications'].forEach(function(notification) {
      var data = new Buffer(notification.payload, 'base64');
      notification.payload = data.toString();

      /**
       * Resource notification event.
       *
       * @event mbedConnectorApi#notification
       * @property {Object} notification - A notifcation object
       */
      _this.emit('notification', notification);
    });


  }

  if (payload['registrations']) {
    payload['registrations'].forEach(function(registration) {
      /**
       * Endpoint registration event.
       *
       * @event mbedConnectorApi#registration
       * @property {Object} registration - A registration object
       */
      _this.emit('registration', registration);
    });
  }

  if (payload['reg-updates']) {
    payload['reg-updates'].forEach(function(regUpdate) {
      /**
       * Endpoint registration update event.
       *
       * @event mbedConnectorApi#reg-update
       * @property {Object} regUpdate - A registration update object
       */
      _this.emit('reg-update', regUpdate);
    });
  }

  if (payload['de-registrations']) {
    payload['de-registrations'].forEach(function(endpoint) {
      /**
       * Endpoint de-registration event.
       *
       * @event mbedConnectorApi#de-registration
       * @property {string} endpoint - The name of the endpoint
       */
      _this.emit('de-registration', endpoint);
    });
  }

  if (payload['registrations-expired']) {
    payload['registrations-expired'].forEach(function(registrationExpired) {
      /**
       * Endpoint registration expiration event.
       *
       * @event mbedConnectorApi#registration-expired
       * @property {string} endpoint - The name of the endpoint
       */
      _this.emit('registration-expired', registrationExpired);
    });
  }

  if (payload["async-responses"]) {
    payload['async-responses'].forEach(function(asyncResponse) {
      _this.asyncResponseHandler(asyncResponse);
    });
  }
};
