var child_process = require('child_process');
var pty = require('pty.js');

var ClientManager = function(clientPath) {
  this.childProcess = null;
  this.clientPath = clientPath;
}

ClientManager.prototype.startClient = function(callback, options) {
  var _this = this;
  var outputText = '';
  var started = false;
  this.stopClient(function() {
    _this.childProcess = pty.spawn(_this.clientPath);

    _this.childProcess.stdout.on('data', function(data) {
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