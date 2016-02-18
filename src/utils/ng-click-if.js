"use strict";

angular
.module('app')
.directive('ngClickIf', function($log) {
  return {
    restrict: 'A',
    link: function($scope, $elem, $attrs) {
      $log.debug("attach to", $elem);
      $elem.on('click', function($event) {
        $log.debug($attrs.ngClickIf);
        $log.debug($scope.$eval($attrs.ngClickIf));
        if (!$scope.$eval($attrs.ngClickIf)) {
          $log.debug("prevent!");
          $event.preventDefault();
          $event.stopPropagation()
        }
      });
    }
   };
});
