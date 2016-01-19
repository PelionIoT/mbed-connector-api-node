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

mbedConnector.prototype.getLimits = function(callback, options) {
  options = extend(true, {}, this.options, options || {});

  var requestData = {
    method: 'GET',
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

mbedConnector.prototype.getApiVersion = function(callback, options) {
  options = extend(true, {}, this.options, options || {});

  var requestData = {
    method: 'GET',
    url: options.host,
    headers: {
      accept: 'text/plain'
    }
  }

  this.makeRequest(requestData, function(error, data) {
    if (error) {
      callback(error);
    } else {
      var lines = data.payload.split('\n');
      var match = lines[1].match(/REST version = (.*)/);
      callback(null, match[1]);
    }
  }, options);
};

mbedConnector.prototype.getApiVersions = function(callback, options) {
  options = extend(true, {}, this.options, options || {});

  var requestData = {
    method: 'GET',
    url: urljoin(options.host, 'rest-versions'),
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

mbedConnector.prototype.getConnectorVersion = function(callback, options) {
  options = extend(true, {}, this.options, options || {});

  var requestData = {
    method: 'GET',
    url: options.host,
    headers: {
      accept: 'text/plain'
    }
  }

  this.makeRequest(requestData, function(error, data) {
    if (error) {
      callback(error);
    } else {
      var lines = data.payload.split('\n');
      var match = lines[0].match(/DeviceServer (.*)/);
      callback(null, match[1]);
    }
  }, options);
};

mbedConnector.prototype.getLimits = function(callback, options) {
  options = extend(true, {}, this.options, options || {});

  var requestData = {
    method: 'GET',
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