'use strict';

angular
.module('app')
.controller('LoginCtrl', function($scope, Auth, $state, $stateParams, authConfig, $injector, $log) {
  $scope.user = {};
  $scope.errors = {};
  $scope.submitted = false;
  $scope.hidden = true;

  // Logged in, redirect to home
  function redirect() {
    if ($stateParams.redirectTo) {
      var p;
      try {
        p = JSON.parse($stateParams.redirectToParams);
      } catch (e) { $log.error(e); p = null; }

      $state.go($stateParams.redirectTo, p);
    } else {
      if ('string' === typeof authConfig.state_after_login) {
        $state.go(authConfig.state_after_login);
      } else {
        $injector.invoke(authConfig.state_after_login);
      }
    }
  }

  Auth.isLoggedInAsync(function(logged) {
    if (logged) {
      $log.debug('(LoginCtrl) user is logged just redirect');

      return redirect();
    }
    $scope.hidden = false;
  });

  $scope.login = function(form) {
    $scope.submitted = true;

    if (form.$valid) {
      $log.debug('(LoginCtrl) submit form');

      Auth.login(
        $scope.user.username,
        $scope.user.password,
        $scope.user.remindme
      )
      .then(function() {
        if (Auth.isLoggedIn()) {
          return redirect();
        }
      });
    }
  };

});
