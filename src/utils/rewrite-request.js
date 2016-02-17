'use strict';

// this will rewrite any request
// usefull to keep isolated frontend from backend versioning

angular
.module("app")
// Reescribe las url que empiezan por /api
.provider('rewriteRequestConfig', function () {
  this.start_with = {};
  this.add_header = {};
  this.$get = function () {
    return this;
  };
})
.factory('rewriteInterceptor', function (rewriteRequestConfig) {
  return {
    request: function (config) {
      var i, url;

      config.headers = config.headers || {};
      for (i in rewriteRequestConfig.add_header) {
        config.headers[i] = rewriteRequestConfig.add_header[i];
      }

      for (i in rewriteRequestConfig.start_with) {
        url = rewriteRequestConfig.start_with[i];
        if (config.url.indexOf(i) === 0) {
          config.url = url + config.url.substring(i.length);
        }

      }
      //console.info(config);
      return config;
    }
  };
})
.config(function ($httpProvider) {
  $httpProvider.interceptors.push('rewriteInterceptor');
});