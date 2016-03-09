'use strict';

// redirect to a new state base on: redirectTo in state definition
// example:
// $stateProvider
// .state("xx", {
//   url: "/xx",
//   redirectTo: "xx.yy"
// });

angular
.module('app')
.run(['$rootScope', '$state', '$injector', function($rootScope, $state, $injector) {

    $rootScope.$on('$stateChangeSuccess', function(evt, to, params) {
      if ('string' === typeof to.redirectTo) {
        evt.preventDefault();
        $state.go(to.redirectTo, params);
      }
      if ('function' === typeof to.redirectTo || Array.isArray(to.redirectTo)) {
        var state = $injector.invoke(to.redirectTo);
        if (state) {
          $state.go(state, params);
        }
      }
    });
}]);
