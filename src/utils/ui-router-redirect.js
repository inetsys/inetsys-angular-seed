'use strict';

//
// redirect to a new state base on: redirectTo in state definition
// example:
// $stateProvider
// .state("xx", {
//   url: "/xx",
//   redirectTo: "xx.yy"
// });
// redirectTo can be a function.
//

angular
.module('app')
.run(['$rootScope', '$state', '$injector', '$log', '$timeout', function($rootScope, $state, $injector, $log, $timeout) {
  $rootScope.$on('$stateChangeSuccess', function(evt, to, params) {
    $log.debug('(redirectTo?)', to.redirectTo);

    if ('string' === typeof to.redirectTo) {
      $timeout(function() {
        $state.go(to.redirectTo, params);
      });
    }

    if ('function' === typeof to.redirectTo || Array.isArray(to.redirectTo)) {
      var state = $injector.invoke(to.redirectTo);
      if (state) {
        $timeout(function() {
          $state.go(state, params);
        });
      }
    }
  });
}]);
