'use strict';
// on $stateChangeStart check if a parent has 'authenticate:true'
// if it does, put AuthenticateRouteResolve in the resolve

// this method works
// this maybe more elegant: https://github.com/angular-ui/ui-router/issues/1165#issuecomment-164897856
// for the future...
angular
.module('app')
.factory('AuthenticateRouteResolve', function(Auth, $q, $state, $log, $timeout, redirectToLogin, $rootScope) {
  return function AuthenticateRouteDeferCB() {
    $log.debug('(AuthenticateRouteResolve) Resolve auth');
    var defer = $q.defer();

    // allow authentication on offline applications
    // if $rootScope.offline just passthrough
    if ($rootScope.offline) {
      $log.debug('(AuthenticateRouteResolve) offline => passthrough');
      $timeout(function() {
        defer.resolve();
      });
    } else {
      Auth.isLoggedInAsync(function(loggedIn) {
        $log.debug('(AuthenticateRouteResolve) user is logged in?', !!loggedIn);
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
// if state has 'authenticate:true', add authentication to resolve
// if you need user data at resolve, pass the param: authenticate
// resolve: {my_data: ['authenticate', 'Auth', function(authenticate, Auth) {
//   Auth.getCurrentUser(); // contains user information :)
// }]}
.factory('AuthenticateRoute', function(Auth, $state, $log, $q, AuthenticateRouteResolve) {
  return function(event, toState/*, toParams, fromState, fromParams*/) {
    var require_auth = false;
    var path = toState.name.split('.');
    var i = 0;
    var s;
    var state;

    for (; i < path.length; ++i) {
      state = path.slice(0, i + 1).join('.');
      s = $state.get(state);

      if (s.authenticate) {
        require_auth = true;
      }
      if (require_auth) {
        if (undefined === toState.resolve) {
          $log.error('(AuthenticateRoute)', state, 'need at least and empty resolve object: "resolve:{}"');
          return;
        }
        s.authenticate = true;
        s.resolve = s.resolve || {};
        s.resolve.authenticate = AuthenticateRouteResolve;
      }
    }

    $log.debug('(AuthenticateRoute)', path, 'require_auth?', require_auth);
  };
})
.run(function($rootScope, AuthenticateRoute) {
  $rootScope.$on('$stateChangeStart', AuthenticateRoute);
});
