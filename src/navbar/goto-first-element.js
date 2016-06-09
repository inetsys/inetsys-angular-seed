'use strict';

// Redirect to the first element in the given menu
// you should send the same structure nabvarLeft has
// example:
// authConfigProvider.state_after_login = ['GotoFirstElement', function(GotoFirstElement) {
//   GotoFirstElement(navbarLeftProvider.$get());
// }];

angular
.module('app')
.factory('GotoFirstElement', function($state, Auth, $log) {
  return function GotoFirstElement(navbar) {
    function allowed(state) {
      return Auth.hasPermissions(state.permissions)
        && Auth.hasPermissionsAny(state.permissionsAny)
        && Auth.hasRoles(state.roles)
        && Auth.hasRolesAny(state.rolesAny);
    }

    function loop_list(list) {
      var i;

      for (i = 0; i < list.length; ++i) {
        if (allowed(list[i])) {
          if (list[i].subtree.length) {
            $log.debug('(GotoFirstElement) allowed continue testing inner list');
            if (loop_list(list[i].subtree)) {
              return true;
            }
            // dont have permissions for any item in the list :S
          } else {
            $log.debug('(GotoFirstElement) redirec to', list[i].state);
            $state.go(list[i].state);
            return true;
          }

        }
      }

      return false;
    }

    loop_list(navbar.tree);
  };
});
