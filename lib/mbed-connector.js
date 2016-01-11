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

var request = require('request'),
urljoin = require('url-join'),
events = require('events'),
util = require('util'),
extend = require('extend');

var mbedConnector = require('./common');
require('./general');
require('./endpoints');
require('./notifications');
require('./subscriptions');

module.exports = mbedConnector;

/*
mbedConnector.prototype.putResource = function(endpoint, resource, value, callback, options) {
  options = this.populateOptions(options, {
    request: {
      method: 'PUT',
      url: urljoin(this.host, 'endpoints', endpoint, resource),
      headers: {*/
        //accept: '*/*'
      /*},
      body: value.toString()
    }
  });

  this.makeAuthorizedRequest(options, callback);
}


// Notifications

mbedConnector.prototype.subscribeToResource = function(endpoint, resource, callback, options) {
  options = this.populateOptions(options, {
    request: {
      method: 'PUT',
      url: urljoin(this.host, 'subscriptions', endpoint, resource)
    }
  });

  this.makeAuthorizedRequest(options, callback);
}

mbedConnector.prototype.unsubscribeFromResource = function(endpoint, resource, callback, options) {
  options = this.populateOptions(options, {
    request: {
      method: 'DELETE',
      url: urljoin(this.host, 'subscriptions', endpoint, resource)
    }
  });

  this.makeAuthorizedRequest(options, callback);
}

mbedConnector.prototype.unsubscribeFromAllResources = function(callback, options) {
  options = this.populateOptions(options, {
    request: {
      method: 'DELETE',
      url: urljoin(this.host, 'subscriptions')
    }
  });

  this.makeAuthorizedRequest(options, callback);
}

mbedConnector.prototype.getSubscriptionForResource = function(endpoint, resource, callback, options) {
  options = this.populateOptions(options, {
    request: {
      method: 'GET',
      url: urljoin(this.host, 'subscriptions', endpoint, resource)
    }
  });

  this.makeAuthorizedRequest(options, callback);
}

mbedConnector.prototype.getSubscriptionsForEndpoint = function(endpoint, callback, options) {
  options = this.populateOptions(options, {
    request: {
      method: 'GET',
      url: urljoin(this.host, 'subscriptions', endpoint)
    }
  });

  this.makeAuthorizedRequest(options, callback);
}

mbedConnector.prototype.unsubscribeFromEndpointResources = function(endpoint, callback, options) {
  options = this.populateOptions(options, {
    request: {
      method: 'DELETE',
      url: urljoin(this.host, 'subscriptions', endpoint)
    }
  });

  this.makeAuthorizedRequest(options, callback);
}

mbedConnector.prototype.setPreSubscriptionData = function(preSubscriptionData, callback, options) {
  options = this.populateOptions(options, {
    request: {
      method: 'PUT',
      url: urljoin(this.host, 'subscriptions'),
      json: preSubscriptionData
    }
  });

  this.makeAuthorizedRequest(options, callback);
}

mbedConnector.prototype.getPreSubscriptionData = function(callback, options) {
  options = this.populateOptions(options, {
    request: {
      method: 'GET',
      url: urljoin(this.host, 'subscriptions')
    }
  });

  this.makeAuthorizedRequest(options, callback);
}


mbedConnector.prototype.setCallbackURL = function(url, callback, options) {
  options = this.populateOptions(options, {
    request: {
      method: 'PUT',
      url: urljoin(this.host, 'notification/callback'),
      json: {url: url}
    }
  });

  this.makeAuthorizedRequest(options, callback);
}

mbedConnector.prototype.getCallbackURL = function(callback, options) {
  options = this.populateOptions(options, {
    request: {
      method: 'GET',
      url: urljoin(this.host, 'notification/callback')
    }
  });

  this.makeAuthorizedRequest(options, callback);
}

mbedConnector.prototype.deleteCallbackURL = function(callback, options) {
  options = this.populateOptions(options, {
    request: {
      method: 'DELETE',
      url: urljoin(this.host, 'notification/callback')
    }
  });

  this.makeAuthorizedRequest(options, callback);
}*/

