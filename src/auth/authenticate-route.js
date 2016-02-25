"use strict";
// on $stateChangeStart check if a parent has 'authenticate:true'
// if it does, put AuthenticateRouteResolve in the resolve

// this method works
// this maybe more elegant: https://github.com/angular-ui/ui-router/issues/1165#issuecomment-164897856
// for the future...
angular
.module('app')
.factory('AuthenticateRouteResolve', function(Auth, $q, $state, $log, $timeout, redirectToLogin, $rootScope) {
  return function AuthenticateRouteDeferCB() {
    $log.debug("(AuthenticateRouteResolve) Resolve auth");
    var defer = $q.defer();

    // allow authentication on offline applications
    // if $rootScope.offline just passthrough
    console.log($rootScope);
    console.log("offline", $rootScope.offline);
    if ($rootScope.offline) {
      $log.debug("(AuthenticateRouteResolve) offline => passthrough");
      $timeout(function() {
        defer.resolve();
      });
    } else {
      Auth.isLoggedInAsync(function(loggedIn) {
        $log.debug("(AuthenticateRouteResolve) user auth?", !!loggedIn);
        if (!loggedIn) {
          defer.reject();
          $timeout(function() {
            redirectToLogin();
          });
        } else {
          defer.resolve();
        }
      });
    }


    return defer.promise;
  };
})
// Add resolve function if needed to state on $stateChangeStart
.factory('AuthenticateRoute', function(Auth, $state, $log, $q, AuthenticateRouteResolve) {
  return function (event, toState/*, toParams, fromState, fromParams*/) {
    var require_auth = false;
    var path = toState.name.split(".");
    var i = 0;
    var s;

    for (; i < path.length; ++i) {
      s = $state.get(path.slice(0, i +1).join("."));

      if (s.authenticate) {
        require_auth = true;
      }
    }

    $log.debug("(AuthenticateRoute)", path, "require_auth?", require_auth);

    if (require_auth) {
      if (undefined === toState.resolve) {
        $log.error("(AuthenticateRoute)", toState.name, "need a resolve: add resolve:{}");
        return;
      }
      toState.resolve = toState.resolve || {};
      toState.resolve.authenticate = AuthenticateRouteResolve;
    }
  };
})
.run(function ($rootScope, AuthenticateRoute) {
  $rootScope.$on('$stateChangeStart', AuthenticateRoute);
});
