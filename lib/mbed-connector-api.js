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

var mbedConnectorApi = require('./common');
var shouldFnBeAugmented = require('./should-fn-be-augmented');
var promisify = require('es6-promisify');

require('./general');
require('./endpoints');
require('./notifications');
require('./subscriptions');

// We need to augment every function on the prototype which has 'options, callback' as last parameters...
var toAugment = Object.keys(mbedConnectorApi.prototype).filter(function(k) {
  return shouldFnBeAugmented(mbedConnectorApi.prototype[k]);
});

toAugment.forEach(function(k) {

  var originalFn = mbedConnectorApi.prototype[k];

  mbedConnectorApi.prototype[k] = function() {
    var args = [].slice.call(arguments);
    var self = this;

    var expectedNumberOfArgs = originalFn.length;

    // if the last two arguments are fn, object => switch them...
    if (args.length >= 2 &&
        typeof args[args.length - 2] === 'function' &&
        typeof args[args.length - 1] === 'object') {

      var callback = args[args.length - 2];
      args[args.length - 2] = args[args.length - 1];
      args[args.length - 1] = callback;
    }

    // if last argument is function, but not all elements filled, insert empty options object
    if (args.length !== expectedNumberOfArgs &&
        typeof args[args.length - 1] === 'function') {

      args.splice(args.length - 1, 0, {});
    }

    // if last argument is not a function, return a promise
    if (typeof args[args.length - 1] !== 'function') {
      
      // make sure to fill up the args number so function is always at the end
      for (var ix = 0; ix < (expectedNumberOfArgs - args.length - 1); ix++) {
        args.push(null);
      }

      return promisify(originalFn.bind(self)).apply(self, args);

    }

    // otherwise, invoke the function with the new args list
    return originalFn.apply(self, args);
  };


});

module.exports = mbedConnectorApi;
