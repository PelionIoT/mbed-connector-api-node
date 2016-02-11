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
 * GETs the current callback data
 * @param {function} callback - A function that is passed the arguments
 * `(error, callbackData)` where `callbackData` is an object containing a `url`
 * string and a `headers` object
 * @param {Object} [options] - Optional options object
 */

mbedConnector.prototype.getCallback = function(callback, options) {
  options = extend(true, {}, this.options, options || {});

  var requestData = {
    method: 'GET',
    url: urljoin(options.host, options.restApiVersion, 'notification', 'callback'),
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
 * PUTs callback data
 * @param {Object} data - The callback data
 * @param {string} data.url - The callback URL
 * @param {Object} [data.headers] - The headers that should be set when
 * Connector PUTs to the given callback URL
 * @param {function} callback - A function that is passed a potential `error` object
 * @param {Object} [options] - Optional options object
 */

mbedConnector.prototype.putCallback = function(data, callback, options) {
  options = extend(true, {}, this.options, options || {});

  var requestData = {
    method: 'PUT',
    url: urljoin(options.host, options.restApiVersion, 'notification', 'callback'),
    headers: {
      accept: 'application/json',
      json: data
    }
  }

  this.makeRequest(requestData, function(error) {
    if (error) {
      callback(error);
    } else {
      callback(null);
    }
  }, options);
};


/**
 * DELETEs the callback data (effectively stopping Connector from PUTing
 * notifications)
 * @param {function} callback - A function that is passed a potential `error` object
 * @param {Object} [options] - Optional options object
 */

mbedConnector.prototype.deleteCallback = function(callback, options) {
  options = extend(true, {}, this.options, options || {});

  var requestData = {
    method: 'DELETE',
    url: urljoin(options.host, options.restApiVersion, 'notification', 'callback'),
    headers: {
      accept: 'application/json'
    }
  }

  this.makeRequest(requestData, function(error) {
    if (error) {
      callback(error);
    } else {
      callback(null);
    }
  }, options);
};



/**
 * Begins long polling constantly for notifications
 * @param {function} callback - A function that is passed a potential `error` object
 * @param {Object} [options] - Optional options object
 */

mbedConnector.prototype.startLongPolling = function(callback, options) {
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

        if (callback) {
          callback(error);
        }
      } else {
        console.log('ERROR: Long poll failed [Status ' + error.status + ']');
        throw error;
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
        if (callback) {
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

mbedConnector.prototype.stopLongPolling = function() {
  if (this.longPollRequestObj) {
    this.longPollRequestObj.abort();
    this.longPollRequestObj = null;
  }
};

mbedConnector.prototype.longPollRequestCallback = function(error, response, body, callback) {
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
          // Not a JSON string, so return false
          throw new Error('Failed to parse JSON in longPollRequestCallback');
        }
      }

      callback(null, data);
    } else {
      callback();
    }
  }
};

mbedConnector.prototype.asyncResponseHandler = function(asyncResponse) {
  if (this.asyncCallbacks[asyncResponse.id]) {
    if (asyncResponse.status >= 400) {
      utility.handleAsyncError(asyncResponse, this.asyncCallbacks[asyncResponse.id]);
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

mbedConnector.prototype.handleNotifications = function(payload) {
  if (payload['notifications']) {
    payload['notifications'].forEach(function(notification) {
      var data = new Buffer(notification.payload, 'base64');
      notification.payload = data.toString();
    });

    /**
     * Resource notifications event.
     *
     * @event mbedConnector#notifications
     * @property {Object[]} notifications - An array of notification objects
     */
    this.emit('notifications', payload['notifications']);
  }

  if (payload['registrations']) {
    /**
     * Endpoint registrations event.
     *
     * @event mbedConnector#registrations
     * @property {Object[]} registrations - An array of registration objects
     */
    this.emit('registrations', payload['registrations']);
  }

  if (payload['reg-updates']) {
    /**
     * Endpoint registration updates event.
     *
     * @event mbedConnector#reg-updates
     * @property {Object[]} regUpdates - An array of registration update objects
     */
    this.emit('reg-updates', payload['reg-updates']);
  }

  if (payload['de-registrations']) {
    /**
     * Endpoint de-registrations event.
     *
     * @event mbedConnector#de-registrations
     * @property {Object[]} deRegistrations - An array of de-registration objects
     */
    this.emit('de-registrations', payload['de-registrations']);
  }

  if (payload['registrations-expired']) {
    /**
     * Endpoint registration expirations event.
     *
     * @event mbedConnector#registrations-expired
     * @property {Object[]} registrationsExpired - An array of registration
     * expirations objects
     */
    this.emit('registrations-expired', payload['registrations-expired']);
  }

  if (payload["async-responses"]) {
    var _this = this;
    payload['async-responses'].forEach(function(asyncResponse) {
      _this.asyncResponseHandler(asyncResponse);
    });
  }
};
