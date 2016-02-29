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

var child_process = require('child_process');
var extend = require('extend');
var pty = require('pty.js');

var ClientManager = function(clientPath, options) {
  this.childProcess = null;
  this.clientPath = clientPath;
  this.options = options;
}

ClientManager.prototype.startClient = function(callback, options) {
  var _this = this;
  var outputText = '';
  var started = false;

  options = extend(true, {}, this.options, options || {});

  this.stopClient(function() {
    _this.childProcess = pty.spawn(_this.clientPath);

    _this.childProcess.stdout.on('data', function(data) {
      var dataString = data.toString();
      if (options.printDebugOutput && (dataString.trim()).length) {
        console.log('ClientManager:', data.toString());
      }

      outputText += data.toString();

      if ((outputText.indexOf('Registered') > -1) && !started) {
        started = true;
        if (callback) {
          callback();
        }
      }
    });
  });
}

ClientManager.prototype.stopClient = function(callback, signal) {
  signal = signal || 'SIGINT';
  if (this.childProcess) {
    this.childProcess.on('close', function(code, receivedSignal) {
      if (callback) {
        callback();
      }
    });

    this.childProcess.kill(signal);
    this.childProcess = null;
  } else {
    if (callback) {
      callback();
    }
  }
}

module.exports = ClientManager;