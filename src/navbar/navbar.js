'use strict';

// based on https://github.com/blackat/ui-navbar
// added permissions

angular
.module('app')
.provider('navbarLeft', function() {
  this.tree = [];

  function concat(dst, src) {
    if (!src) {
      return dst;
    }

    if (!dst) {
      dst = [];
    }
    var i;
    for (i = 0; i < src.length; ++src) {
      dst.push(src[i]);
    }

    return dst;
  }

  function set_defaults(data, parent) {
    data.subtree = data.subtree || [];
    // NOTE copy parent permissions/roles into children
    // this force to hide each child individually
    // and make them more testable.
    if (parent) {
      ['permissions', 'permissionsAny', 'roles', 'rolesAny'].forEach(function(k) {
        data[k] = concat(data[k], parent[k]);
      });
    }

    var i = 0;
    for (; i < data.subtree.length; ++i) {
      set_defaults(data.subtree[i], data);
    }
  }

  this.$get = function() {
    return this;
  };
  this.push = function(order, data) {
    data.index = order;
    this.tree.push(data);
    set_defaults(data);
  };
  this.sort = function() {
    this.tree.sort(function(a, b) {
      return b.index - a.index;
    });
  };
})
.directive('navbarTree', function() {
  return {
    restrict: 'E',
    scope: {
      navbarTree: '='
    },
    templateUrl: 'template/navbar-ul-tree.html',
    controller: ['$scope', 'Auth', function($scope, Auth) {
      $scope.is_visible = function(tree) {
        if (tree.visibilityOverride) {
          if ($scope.$eval(tree.visibilityOverride)) {
            return true;
          }
        }
        if (tree.logged && !Auth.isLoggedIn()) { // section requires login?
          return false;
        }

        return Auth.hasPermissionsAny(tree.permissionsAny) &&
          Auth.hasPermissions(tree.permissions) &&
          Auth.hasRoles(tree.roles);
      };
    }]
  };
})
.directive('navbarSubTree', function() {
  return {
    restrict: 'E',
    scope: {
      navbarSubTree: '='
    },
    templateUrl: 'template/navbar-ul-subtree.html'
  };
})
.directive('navbarLeaf', ['Auth', '$compile', function(Auth, $compile) {
  return {
    restrict: 'E',
    scope: {
      navbarLeaf: '='
    },
    templateUrl: 'template/navbar-li.html',
    link: function($scope, $element/*, attrs*/) {
      $scope.is_visible = function(tree) {
        if (tree.visibilityOverride) {
          if ($scope.$eval(tree.visibilityOverride)) {
            return true;
          }
        }
        if (tree.logged && !Auth.isLoggedIn()) { // section requires login?
          return false;
        }

        return Auth.hasPermissionsAny(tree.permissionsAny) &&
          Auth.hasPermissions(tree.permissions) &&
          Auth.hasRoles(tree.roles);
      };

      if (angular.isArray($scope.navbarLeaf.subtree)) {
        $element.append('<navbar-sub-tree navbar-sub-tree=\"navbarLeaf.subtree\"></navbar-sub-tree>');
        var parent = $element.parent();
        var classFound = false;
        while (parent.length > 0 && !classFound) {
          if (parent.hasClass('navbar-right')) {
            classFound = true;
          }
          parent = parent.parent();
        }

        if (classFound) {
          $element.addClass('dropdown-submenu-right');
        } else {
          $element.addClass('dropdown-submenu');
        }

        $compile($element.contents())($scope);
      }
    }
  };
}])
.run(['$templateCache', function($templateCache) {
  // TODO mouseover -> click if possible
  $templateCache.put('template/navbar-ul-tree.html',
  '<ul class="nav navbar-nav">\n' +
  '  <li ui-sref-active="active" uib-dropdown="" is-open="tree.isopen" ng-repeat="tree in navbarTree" ng-init="tree.isopen = false"\n' +
  '  class="ng-hide" ng-show="is_visible(tree)">\n' +
  '    <a uib-dropdown-toggle="" ng-mouseover="tree.subtree.length ? (tree.isopen = true) : null" ui-sref=\"{{tree.state}}\" ng-click-if="!tree.subtree.length">\n' +
  '      <span ng-bind-html-and-compile="tree.name"></span>\n' +
  '      <b class="caret" class="ng-hide" ng-show="tree.subtree.length"></b>\n' +
  '    </a>\n' +
  '    <navbar-sub-tree navbar-sub-tree="tree.subtree" class="ng-hide" ng-show="tree.subtree.length"></navbar-sub-tree>\n' +
  '  </li>\n' +
  '</ul>');


  $templateCache.put('template/navbar-ul-subtree.html',
  '<ul class="dropdown-menu">\n' +
  '  <navbar-leaf ng-repeat="leaf in navbarSubTree" navbar-leaf="leaf"></navbar-leaf>\n' +
  '</ul>');

  $templateCache.put('template/navbar-li.html',
  '<li ui-sref-active="active" class="ng-hide" ng-class="{divider: navbarLeaf.name == \'divider\'}"' +
  '  ng-show="is_visible(tree)">\n' +
  '  <a class="ng-hide" ui-sref="{{navbarLeaf.state}}" ng-hide="navbarLeaf.name === \'divider\'">{{navbarLeaf.name}}</a>\n' +
  '</li>');

}]);
