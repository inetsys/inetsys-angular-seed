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
.run(['$rootScope', '$state', function($rootScope, $state) {

    $rootScope.$on('$stateChangeSuccess', function(evt, to, params) {
      if (to.redirectTo) {
        evt.preventDefault();
        $state.go(to.redirectTo, params);
      }
    });
}]);
