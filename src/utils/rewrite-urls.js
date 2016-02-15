// this will rewrite any request
// usefull to keep isolated frontend from backend versioning
angular
.module("app")
// Reescribe las url que empiezan por /api
.provider('rewriteUrlsConfig', function () {
  this.start_with = {};
  this.$get = function () {
    return this;
  };
})
.factory('rewriteInterceptor', function (rewriteUrlsConfig) {
  return {
    request: function (config) {
      var i, url;

      for (i in rewriteUrlsConfig.start_with) {
        url = rewriteUrlsConfig.start_with[i];
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
