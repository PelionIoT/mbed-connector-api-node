var nock = require('nock');
var urljoin = require('url-join');

module.exports = {
  createLongPollInstance: function(host, config) {
    var mockApi = nock(host, config);

    mockApi.get(urljoin('/notification', 'pull'))
            .query({ noWait: true, })
            .reply(204);

    return mockApi;
  }
};