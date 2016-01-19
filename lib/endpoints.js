var request = require('request'),
    urljoin = require('url-join'),
    events = require('events'),
    util = require('util'),
    extend = require('extend');

var mbedConnector = require('./common');

mbedConnector.prototype.getEndpoints = function(callback, options) {
  options = extend(true, {}, this.options, options || {});

  var requestData = {
    method: 'GET',
    url: urljoin(options.host, 'endpoints'),
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
}

mbedConnector.prototype.getResources = function(endpoint, callback, options) {
  options = extend(true, {}, this.options, options || {});

  var requestData = {
    method: 'GET',
    url: urljoin(options.host, 'endpoints', endpoint),
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
}

mbedConnector.prototype.getResourceValue = function(endpoint, resource, callback, options) {
  options = extend(true, {}, this.options, options || {});

  var requestData = {
    method: 'GET',
    url: urljoin(options.host, 'endpoints', endpoint, resource),
    headers: {
      accept: '*/*'
    }
  }

  this.makeRequest(requestData, function(error, data) {
    if (error) {
      callback(error);
    } else {
      callback(null, data.payload);
    }
  }, options);
}

mbedConnector.prototype.putResourceValue = function(endpoint, resource, value, callback, options) {
  options = extend(true, {}, this.options, options || {});

  var requestData = {
    method: 'PUT',
    url: urljoin(options.host, 'endpoints', endpoint, resource),
    headers: {
      accept: 'application/json'
    },
    body: value.toString()
  }

  this.makeRequest(requestData, function(error, data) {
    if (error) {
      callback(error);
    } else {
      callback(null);
    }
  }, options);
}

mbedConnector.prototype.postResource = function(endpoint, resource, value, callback, options) {
  options = extend(true, {}, this.options, options || {});

  var requestData = {
    method: 'POST',
    url: urljoin(options.host, 'endpoints', endpoint, resource),
    headers: {
      accept: 'application/json'
    }
  }

  if (value) {
    requestData.body = value.toString();
  }

  this.makeRequest(requestData, function(error, data) {
    if (error) {
      callback(error);
    } else {
      callback(null);
    }
  }, options);
}

mbedConnector.prototype.deleteEndpoint = function(endpoint, callback, options) {
  options = extend(true, {}, this.options, options || {});

  var requestData = {
    method: 'DELETE',
    url: urljoin(options.host, 'endpoints', endpoint),
    headers: {
      accept: 'application/json'
    }
  }

  this.makeRequest(requestData, function(error, data) {
    if (error) {
      callback(error);
    } else {
      callback(null);
    }
  }, options);
}