'use strict';

// based on https://github.com/blackat/ui-navbar
// added permissions

angular
.module("app")
.provider("navbarLeft", function () {
  this.tree = [];

  this.$get = function () {
    return this;
  };
  this.push = function (order, data) {
    data.index = order;
    this.tree.push(data);
  };
  this.sort = function() {
    this.tree.sort(function(a, b) {
      return b.index - a.index;
    });
  };
})
.directive('navbarTree', function () {
  return {
    restrict: 'E',
    replace: true,
    scope: {
      navbarTree: '='
    },
    templateUrl: 'template/navbar-ul-tree.html'
  };
})
.directive('navbarSubTree', function () {
  return {
    restrict: 'E',
    replace: true,
    scope: {
      navbarSubTree: '='
    },
    templateUrl: 'template/navbar-ul-subtree.html'
  };
})
.directive('navbarLeaf', function ($compile) {
  return {
    restrict: 'E',
    replace: true,
    scope: {
      navbarLeaf: '='
    },
    templateUrl: 'template/navbar-li.html',
    link: function (scope, element/*, attrs*/) {
      if (angular.isArray(scope.navbarLeaf.subtree)) {
        element.append('<navbar-sub-tree navbar-sub-tree=\"navbarLeaf.subtree\"></navbar-sub-tree>');
        var parent = element.parent();
        var classFound = false;
        while(parent.length > 0 && !classFound) {
          if (parent.hasClass('navbar-right')) {
            classFound = true;
          }
          parent = parent.parent();
        }

        if (classFound) {
          element.addClass('dropdown-submenu-right');
        } else {
          element.addClass('dropdown-submenu');
        }

        $compile(element.contents())(scope);
      }
    }
  };
})
.run(["$templateCache", function($templateCache) {
  // TODO mouseover -> click if possible
  $templateCache.put("template/navbar-ul-tree.html",
  '<ul class="nav navbar-nav">\n'+

  '  <li ui-sref-active="active" uib-dropdown="" is-open="tree.isopen" ng-repeat="tree in navbarTree" ng-init="tree.isopen = false"\n'+
  '  class="ng-hide" ng-show="$root.Auth.hasPermissions(tree.permissions) && $root.Auth.hasRoles(tree.roles)">\n'+
  '    <a uib-dropdown-toggle="" ng-mouseover="tree.isopen = true" ui-sref=\"{{tree.state}}\" ng-click-if="!tree.subtree">\n'+
  '      <span ng-bind-html-and-compile="tree.name" translate></span>\n'+
  '      <b class="caret" class="ng-hide" ng-show="tree.subtree"></b>\n'+
  '    </a>\n'+
  '    <navbar-sub-tree navbar-sub-tree="tree.subtree" class="ng-hide" ng-show="tree.subtree"></navbar-sub-tree>\n'+
  '  </li>\n'+
  '</ul>');


  $templateCache.put("template/navbar-ul-subtree.html",
  "<ul class='dropdown-menu'>\n" +
  "  <navbar-leaf ng-repeat='leaf in navbarSubTree' navbar-leaf='leaf'></leaf>\n" +
  "</ul>");

  $templateCache.put("template/navbar-li.html",
  "<li class=\"ng-hide\" ng-class=\"{divider: navbarLeaf.name == 'divider'}\" ng-show=\"$root.Auth.hasPermissions(navbarLeaf.permissions) && $root.Auth.hasRoles(navbarLeaf.roles)\">\n" +
  "  <a class=\"ng-hide\" ui-sref=\"{{navbarLeaf.state}}\" ng-hide=\"navbarLeaf.name === 'divider'\">{{navbarLeaf.name}}</a>\n" +
  "</li>");

}]);
