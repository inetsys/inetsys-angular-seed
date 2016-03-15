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
    var state;

    for (; i < path.length; ++i) {
      state = path.slice(0, i +1).join(".");
      s = $state.get(state);

      if (s.authenticate) {
        require_auth = true;
      }
      if (require_auth) {
        if (undefined === toState.resolve) {
          $log.error("(AuthenticateRoute)", state, "need a resolve: add resolve:{}");
          return;
        }
        s.resolve = s.resolve || {};
        s.resolve.authenticate = AuthenticateRouteResolve;
      }
    }

    $log.debug("(AuthenticateRoute)", path, "require_auth?", require_auth);
  };
})
.run(function ($rootScope, AuthenticateRoute) {
  $rootScope.$on('$stateChangeStart', AuthenticateRoute);
});
