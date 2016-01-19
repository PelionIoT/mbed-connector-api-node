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

var urljoin = require('url-join'),
    util = require('util'),
    utility = require('./utility'),
    extend = require('extend');

var mbedConnector = require('./common');

mbedConnector.prototype.getCallback = function(callback, options) {
  options = extend(true, {}, this.options, options || {});

  var requestData = {
    method: 'GET',
    url: urljoin(options.host, 'notification', 'callback'),
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

mbedConnector.prototype.putCallback = function(data, callback, options) {
  options = extend(true, {}, this.options, options || {});

  var requestData = {
    method: 'PUT',
    url: urljoin(options.host, 'notification', 'callback'),
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

mbedConnector.prototype.deleteCallback = function(callback, options) {
  options = extend(true, {}, this.options, options || {});

  var requestData = {
    method: 'DELETE',
    url: urljoin(options.host, 'notification', 'callback'),
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
    method: 'GET',
    url: urljoin(options.host, '/notification/pull'),
    headers: {
      accept: 'application/json'
    }
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
};

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
    }
  }
};

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
};

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
};
