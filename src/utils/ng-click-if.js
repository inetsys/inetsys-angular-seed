'use strict';

//
// Prenvent click unless the condition is true
//

angular
.module('app')
.directive('ngClickIf', function($log) {
  return {
    restrict: 'A',
    link: function($scope, $elem, $attrs) {
      $log.debug('(ngClickIf) attach to', $elem);
      $elem.on('click', function($event) {
        var cond = $scope.$eval($attrs.ngClickIf);
        $log.debug('(ngClickIf) clicked: ', $attrs.ngClickIf, 'is', cond);
        if (!cond) {
          $log.debug('(ngClickIf) prevent!');
          $event.preventDefault();
          $event.stopPropagation();
        }
      });
    }
  };
});
