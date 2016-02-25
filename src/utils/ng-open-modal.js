"use strict";

// usage: ng-open-modal="/views/xxx.tpl.html"

angular
.module('app')
.directive('ngOpenModal', function ($uibModal) {
  return {
    restrict: 'A',
    link: function ($scope, $elm, $attrs) {
      $elm.bind('click', function() {
        var html = $scope.$eval($attrs.ngOpenModal);
        var modalInstance = $uibModal.open({
          templateUrl: html,
          controller: ['$scope', function($scope_modal) {
            $scope_modal.close = function(){
              modalInstance.close();
            };
          }]
        });
      });
    }
  };
});
