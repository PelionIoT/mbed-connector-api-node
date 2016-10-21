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

var assert = require('assert');

var sfba = require('../lib/should-fn-be-augmented');

describe('Should fn be augmented', function() {
  it('should return true for arguments end with options, callback', function() {
    assert.equal(sfba(function(endpoint, options, callback) {}), true);
  });
  
  it('should return true for arguments only options, callback', function() {
    assert.equal(sfba(function(options, callback) {}), true);
  });
  
  it('should return true for arguments only options, callback w/o spaces', function() {
    assert.equal(sfba(function(options,callback) {}), true);
  });
  
  it('should return true for arguments only options, callback w/many spaces', function() {
    assert.equal(sfba(function    (  options     ,   callback  ) {}), true);
  });
  
  it('should return false for arguments not end with options, callback', function() {
    assert.equal(sfba(function (options, callback, somethingElse) {}), false);
  });
  
  it('should return false for options,callback not in arguments', function() {
    assert.equal(sfba(function(somethingElse) { bla(options, callback); }), false);
  });
});
