'use strict';

// hook ui-router and httpProvider supporting loading screens
// without any verbose code

angular
.module('app')
.factory('chainLoading', function($rootScope) {
  return function chainLoading(promise) {
    if (!$rootScope.loading || $rootScope.loading.$$state.status == 1) {
      $rootScope.loading = promise;
    } else {
      $rootScope.loading = $rootScope.loading.then(function() { return promise; });
    }

    return $rootScope.loading;
  };
})
.factory('chainLoadingQ', function($rootScope, $q) {
  return function chainLoading() {
    var defer = $q.defer();
    if (!$rootScope.loading || $rootScope.loading.$$state.status == 1) {
      $rootScope.loading = defer.promise;
    } else {
      $rootScope.loading = $rootScope.loading.then(function() { return defer.promise; });
    }
    return defer;
  };
})
// state change -> loading!
.run(function ($rootScope, chainLoadingQ, $log) {
  var defer = null;

  $rootScope.$on("$stateChangeStart", function (event, toState, toParams, fromState, fromParams) {
    $log.debug("(Loading) $stateChangeStart", toState.name);
    if (!defer) {
      defer = chainLoadingQ();
    }
  });

  $rootScope.$on("$stateChangePrevented", function(event, toState, toParams, fromState, fromParams) {
    $log.debug("(Loading) $stateChangePrevented", toState.name);
    if (defer) {
      defer.resolve();
      defer = null;
    }
  });
  $rootScope.$on("$stateChangeSuccess", function(event, toState, toParams, fromState, fromParams) {
    $log.debug("(Loading) $stateChangeSuccess", toState.name);
    if (defer) {
      defer.resolve();
      defer = null;
    }
  });

  $rootScope.$on("$stateChangeError", function (event, tostate, toparams) {
    $log.error("(Loading) $stateChangeError", arguments);
    if (defer) {
      defer.resolve();
      defer = null;
    }
  });

  $rootScope.$on("$stateNotFound", function (event, unfoundState, fromState, fromParams) {
    $log.error("(Loading) $stateNotFound", arguments);
    if (defer) {
      defer.resolve();
      defer = null;
    }
  });
})
.factory('httpLoadingInterceptor', function ($q, $rootScope, $log, chainLoadingQ) {
  var requests = 0;
  var defer = null;

  return {
    request: function (config) {
      if (config.noLoading) {
        return config;
      }

      requests++;

      if (requests == 1) {
        defer = chainLoadingQ();
      }

      // Show loader
      $rootScope.$broadcast("$loading");
      return config;
    },
    response: function (response) {
      if (response.config.noLoading) {
        return response;
      }

      if ((--requests) === 0) {
        // Hide loader
        $rootScope.$broadcast("$loaded");
        defer.resolve();
      }

      return response;
    },
    responseError: function (response) {
      if (response.config.noLoading) {
        return $q.reject(response);
      }

      if ((--requests) === 0) {
        // Hide loader
        $rootScope.$broadcast("$loaded");
        defer.resolve();
      }

      return $q.reject(response);
    }
  };
})
.config(function ($httpProvider) {
  $httpProvider.interceptors.push('httpLoadingInterceptor');
});
