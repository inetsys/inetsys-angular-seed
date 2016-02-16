// usage: confirmStateExit($scope, 'form.$dirty' [, tpl])
angular
.module('app')
.provider('confirmStateExitConfig', function() {
  this.template = 'src/confirm-state-exit/dirty-modal.tpl.html';

  this.$get = function () {
    return this;
  };
})
.factory('confirmStateExit', function($rootScope, $uibModal, $state, confirmStateExitConfig) {

  return function confirm_state_exit($scope, cond_expr, tpl) {
    tpl = tpl || confirmStateExitConfig.template;

    var obj = {
      is_dirty: function() {
        return $scope.$eval(cond_expr);
      },
      open: function(ok, leave) {
        var modalInstance = $uibModal.open({
          templateUrl: tpl,
          windowClass: 'zindex-9999',
          backdrop: 'static',
          keyboard: false,
          controller: ['$scope', function($scope_modal) {

            $scope_modal.ok = function () {
              ok && ok();
              modalInstance.close();
            };

            $scope_modal.leave = function () {
              leave && leave();
              modalInstance.close();
            };
          }]
        });
      }
    };

    // if dirty, show a warning
    var cancel_dirty_leave,
      leave_confirmed = false;

    cancel_dirty_leave = $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
      var is_dirty = obj.is_dirty();

      if (is_dirty && !leave_confirmed) {
        event.preventDefault();
        $rootScope.$emit("$stateChangePrevented", event, toState, toParams, fromState, fromParams);

        obj.open(null, function(modalInstance) {
          leave_confirmed = true;
          $state.go(toState, toParams);
        });
      }
    });

    $scope.$on("$destroy", function() {
      cancel_dirty_leave();
    });

    return obj;
  };
});
