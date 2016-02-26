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

var nock = require('nock');
var urljoin = require('url-join');
var assert = require('assert');
var util = require('util');

var ClientManager = require('./client-manager');
var MbedConnectorApi = require('../index');

require('dotenv').load({silent: true});

var mbedConnectorApi;
var host = process.env.HOST || 'https://api.connector.mbed.com';
var accessKey = process.env.ACCESS_KEY || 'DUMMY_KEY';
var endpointName = process.env.ENDPOINT_NAME || 'DUMMY_ENDPOINT';
var resourceName = process.env.RESOURCE_NAME || 'DUMMY/0/RESOURCE';
var clientPath = process.env.CLIENT_PATH;
var clientManagerDebug;

if (process.env.CLIENT_MANAGER_DEBUG && process.env.CLIENT_MANAGER_DEBUG !== 'FALSE') {
  clientManagerDebug = true;
} else {
  clientManagerDebug = false;
}

mbedConnectorApi = new MbedConnectorApi({
  host: host,
  accessKey: accessKey
});

module.exports = function(mock, useCallback) {
  var config = {
    mock: mock,
    useCallback: useCallback,
    host: host,
    accessKey: accessKey,
    endpointName: endpointName,
    resourceName: resourceName,
    clientPath: clientPath,
    nockConfig: {
      reqheaders: {
        'Authorization': 'Bearer ' + accessKey
      }
    },
    clientManager: new ClientManager(clientPath, {
      printDebugOutput: clientManagerDebug
    })
  };

  require('./general')(mbedConnectorApi, config);
  require('./endpoints')(mbedConnectorApi, config);
  require('./notifications')(mbedConnectorApi, config);
  require('./subscriptions')(mbedConnectorApi, config);
}




