'use strict';

//
// handle redirections
//
// when an error ocurr at state/resolve user will be redirected
// to 'error' state unless the error contains: redirectOnError
//
// example:
// resolve: {
//   do_magic: ['$q', function ($q) {
//     var deferred = $q.defer();
//     deferred.reject({
//       redirectOnError: 'custom_error.view'
//     });
//     return deferred.promise;
//   }]
// }


angular
.module('app')
// save where to redirect default: last state we try to enter
.provider('Redirection', function() {
  // url that return user data
  this.state = {
    name: null,
    params: {}
  };
  this.error = {
  };

  this.$get = function() {
    return this;
  };
})
// redirect to login, saving current state/params
.factory('redirectToLogin', function($state, Redirection) {
  return function(name, params) {
    if (!name) {
      name = Redirection.state.name;
      params = Redirection.state.params;
    }

    $state.go('login', {
      redirectTo: name,
      redirectToParams: JSON.stringify(params || {}),
    });
  };
})
.run(function($rootScope, $state, $log, Auth, Redirection, redirectToLogin, lastError) {
  $rootScope.$on('$stateChangeStart', function(event, toState, toParams/*, fromState, fromParams*/) {
    if ('login' !== toState.name && 'error' !== toState.name) {
      Redirection.state.name = toState.name;
      Redirection.state.params = toParams;
    }
  });

  $rootScope.$on('$stateChangeError', function(event, toState, toParams, fromState, fromParams, error) {
    $log.error('(event:$stateChangeError)', arguments);

    // go to error state to stop inifite loop
    // if has session is a error that won't redirect to login, so goto error
    if (Auth.isLoggedIn()) {
      // default error state is 'error'
      // overriden by Redirection.error by status code (global)
      // overriden by redirectOnError (local)

      var target_state = 'error';
      if (error && error.status) {
        target_state = Redirection.error[error.status] || 'error';
      }

      if (!$state.get(target_state)) {
        $log.error('(event:$stateChangeError) error state[', target_state, '] not defined');
        target_state = 'error';
      }

      if (error && error.redirectOnError) {
        target_state = error.redirectOnError;
      }
      $log.debug('(event:$stateChangeError) redirect to', target_state, toParams);

      $state.go(target_state, toParams);
    } else {
      redirectToLogin(toState.name, toParams);
    }
  });

  $rootScope.$on('$stateNotFound', function(/*event, unfoundState, fromState, fromParams*/) {
    $log.error('(event:$stateNotFound)', arguments);
    $state.go('error');
  });
});
