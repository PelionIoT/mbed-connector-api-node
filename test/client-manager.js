var child_process = require('child_process');

var ClientManager = function(clientPath) {
  this.childProcess = null;
  this.currentStart = null;
  this.currentFinish = null;
  this.clientPath = clientPath;
}

ClientManager.prototype.startClient = function(callback) {
  var _this = this;
  this.stopClient(function() {
    if (callback) {
      _this.setCurrentStart(callback);
    }
    _this.childProcess = child_process.spawn(_this.clientPath);
  });
}

ClientManager.prototype.stopClient = function(callback, signal) {
  signal = signal || 'SIGINT';
  if (this.childProcess) {
    if (callback) {
      this.setCurrentFinish(callback);
    }

    this.childProcess.kill(signal);
    this.childProcess = null;
  } else {
    if (callback) {
      callback();
    }
  }
}

ClientManager.prototype.getRegistrationsEventHandler = function(endpointName) {
  var _this = this;

  return function(registrations) {
    if (registrations[0].ep === endpointName) {
      if (_this.currentStart) {
        var start = _this.currentStart;
        _this.currentStart = null;
        start();
      }
    } else {
      console.log("Unexpected registration: " + registrations[0].ep);
    }
  }
}

ClientManager.prototype.getDeRegistrationsEventHandler = function(endpointName) {
  var _this = this;

  return function(deRegistrations) {
    if (deRegistrations[0] === endpointName) {
      if (_this.currentFinish) {
        var finish = _this.currentFinish;
        _this.currentFinish = null;
        finish();
      }
    } else {
      console.log("Unexpected deregistration: " + deRegistrations[0]);
    }
  }
}

ClientManager.prototype.setCurrentStart = function(currentStart) {
  this.currentStart = currentStart;
}

ClientManager.prototype.setCurrentFinish = function(currentFinish) {
  this.currentFinish = currentFinish;
}

module.exports = ClientManager;