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

var util = require('util');

var Utility = {};

Utility.getAsyncResponseId = function(data) {
  if (util.isString(data)) {
    try {
      data = JSON.parse(data);
    } catch (e) {
      // Not a JSON string, so return false
      return false;
    }
  }

  if (data) {
    if (data["async-response-id"]) {
      return data["async-response-id"];
    }
  }

  return null;
};

Utility.handleAsyncError = function(asyncResponse, callback) {
  var fakeResponse = {
    statusCode: asyncResponse.status
  };

  this.handleError("", fakeResponse, asyncResponse.error, callback);
};

Utility.handleError = function(error, response, body, callback) {
  if (callback) {
    var status;

    if (response && response.statusCode) {
      status = response.statusCode;
    } else {
      status = "error in callback";
    }

    var errorString = 'Request failed: [Status ' + status + '] ';
    errorString += body + '\n\n' + String(error);

    var e = new Error(errorString);
    e.response = response;
    e.error = error;
    e.status = status;

    callback(e);
  }
};

module.exports = Utility;