'use strict';

// usage: confirmStateExit($scope, 'form.$dirty' [, tpl])

angular
.module('app')
.provider('confirmStateExitConfig', function() {
  this.template = 'src/confirm-state-exit/dirty-modal.tpl.html';

  this.$get = function() {
    return this;
  };
})
.factory('confirmStateExit', function($rootScope, $uibModal, $state, confirmStateExitConfig, $log) {
  var counter = 0;

  return function confirm_state_exit($scope, cond_expr, tpl, open_cb) {
    var _counter = ++counter;

    $log.debug('(confirmStateExit ', _counter, ') init');

    tpl = tpl || confirmStateExitConfig.template;

    var opened = false;

    var cse = {
      confirmed: false,
      is_dirty: function(event, toState, toParams, fromState, fromParams) {
        if ('function' === typeof cond_expr) {
          $log.debug('(confirmStateExit ', _counter, ') cond_expr()');
          return cond_expr(cse, event, toState, toParams, fromState, fromParams);
        }

        return $scope.$eval(cond_expr);
      },
      prevent: function prevent(event, toState, toParams, fromState, fromParams) {
        event.preventDefault();
        $rootScope.$emit('$stateChangePrevented', event, toState, toParams, fromState, fromParams);
      },
      go: function(toState, toParams) {
        cse.confirmed = true;
        $state.go(toState, toParams);
      },
      open: function(ok, leave) {
        opened = true;
        var modalInstance = $uibModal.open({
          templateUrl: tpl,
          windowClass: 'zindex-9999',
          backdrop: 'static',
          keyboard: false,
          controller: ['$scope', function($scope_modal) {
            open_cb && open_cb($scope_modal);

            $scope_modal.ok = function() {
              opened = false;
              ok && ok(modalInstance);
              modalInstance.close();
            };

            $scope_modal.leave = function() {
              opened = false;
              leave && leave(modalInstance);
              modalInstance.close();
            };
          }]
        });
      }
    };

    // if dirty, show a warning
    var cancel_dirty_leave = $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
      // avoid double open when $locationProvider.when is in use
      $log.debug('(confirmStateExit ', _counter, ') opened', opened);
      if (opened) {
        cse.prevent(event, toState, toParams, fromState, fromParams);
        return;
      }

      var is_dirty = cse.is_dirty(event, toState, toParams, fromState, fromParams);

      $log.debug('(confirmStateExit ', _counter, ') is_dirty?', is_dirty, ' cse.confirmed?', cse.confirmed);

      if (is_dirty && !cse.confirmed) {
        cse.prevent(event, toState, toParams, fromState, fromParams);
        cse.open(null, function() {
          cse.go(toState, toParams);
        });
      }
    });

    $scope.$on('$destroy', function() {
      cancel_dirty_leave();
      $log.debug('(confirmStateExit ', _counter, ') removed');
    });

    return cse;
  };
});
