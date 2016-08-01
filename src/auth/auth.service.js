'use strict';


// factory fast access via $rootScope.auth
// current user: $rootScope.user
// emit $logout & $login event to rootScope
angular
.module('app')
.provider('authConfig', function() {
  // url/method that return user data
  this.api_users_data_method = 'POST';
  this.api_users_data = '/api/users/me';

  // url(POST) that return the token
  this.api_auth = '/api/auth';

  this.state_after_login = 'users';

  // url/method to call to logout user
  // null to disable request
  this.api_users_logout_method = 'POST';
  this.api_users_logout = '/api/logout';

  this.token_header = 'X-Access-Token';
  this.token_prefix = 'Bearer ';
  this.cookie_name = 'token';
  this.cookie_domain = null;

  // server side header to force session expired -> will logout user
  this.expiration_header = 'X-Session-Expired';

  this.$get = function() {
    return this;
  };
})
.factory('Auth', function Auth($location, $rootScope, $http, $cookies, $state, $log, authConfig) {
  var currentUser = {};
  var login_in_prog = null;

  function set_current_user(val) {
    $log.debug('(Auth) set_current_user');

    $rootScope.user = val;
    currentUser = val;
  }

  function login_me() {
    return $http({
      method: authConfig.api_users_data_method,
      url: authConfig.api_users_data
    })
    .then(function(response) {
      set_current_user(response.data);
      $rootScope.$emit('$login');
    });
  }

  function get_token() {
    return $cookies.get(authConfig.cookie_name);
  }
  // set token will set a cookie in current domain and parent domain
  // for no good reason :S
  function set_token(data) {
    $cookies.put(authConfig.cookie_name, data, {
      path: '/',
      secure: $location.protocol() === 'https',
      domain: authConfig.cookie_domain
    });
  }

  function Base64URLDecode(base64UrlEncodedValue) {
    var res;
    var newValue = base64UrlEncodedValue.replace('-', '+').replace('_', '/');

    try {
      res = decodeURIComponent(escape(window.atob(newValue)));
    } catch (e) {
      throw 'Base64URL decode of JWT segment failed';
    }

    return res;
  }

  // remove token will remove the cookie in current domain
  // and all parent domains
  function remove_token() {
    // main domain
    $cookies.remove(authConfig.cookie_name, {
      path: '/',
      secure: $location.protocol() === 'https',
      domain: authConfig.cookie_domain
    });

    $log.debug('(Auth) get_token() ', get_token());
  }

  function has_role(roles, chk_fn) {
    if (!roles) {
      return true;
    }

    if (!currentUser || !currentUser.roles) {
      return false;
    }

    if ('string' === typeof roles) {
      roles = [roles];
    }
    return roles[chk_fn](function(role) {
      // drop nulls, empty strings
      if (!role) {
        return true;
      }

      return currentUser ? currentUser.roles.indexOf(role) !== -1 : false;
    });
  }

  // permissions can be:
  // * a list of strings
  // * an object-boolean-terminated user: { create: true, delete: false }
  function has_permission(perms, chk_fn) {
    if (!perms) {
      return true;
    }

    if (!currentUser || !currentUser.permissions) {
      return false;
    }

    if ('string' === typeof perms) {
      perms = [perms];
    }

    return perms[chk_fn](function(perm) {
      // drop nulls, empty strings
      if (!perm) {
        return true;
      }

      if (Array.isArray(currentUser.permissions)) {
        return currentUser ? currentUser.permissions.indexOf(perm) !== -1 : false;
      }
      // currentUser.permissions is an object
      var ref = currentUser.permissions;
      return perm.split('.').every(function(k) {
        if (ref[k]) {
          ref = ref[k];
          return true;
        }
        return false;
      });
    });
  }

  $log.debug('(Auth) Token', get_token());

  if (get_token()) {
    login_in_prog = login_me()
    .finally(function() {
      login_in_prog = null;
    });
  }


  return ($rootScope.Auth = {

    /**
     * Authenticate user and save token
     *
     * @param  {Object}   user     - login info
     * @return {Promise}
     */
    login: function(username, password, remindme) {
      return (login_in_prog = $http({
        method: 'POST',
        url: authConfig.api_auth,
        data: {
          username: username,
          password: password,
          remindme: remindme || false
        }
      })
      .then(function(response) {
        $log.debug('(Auth) login success', response.data);

        set_token(response.data.token);

        return login_me().then(function() {
          return response;
        });
      }, function(response) {
        $log.debug('(Auth) login err', response);
        this.logout();

        return response;
      }.bind(this))
      .finally(function() {
        login_in_prog = null;
      }));
    },

    refreshSession: function() {
      return login_me();
    },

    /**
     * logout first, call logout API later
     * $emit $logout event to $rootScope after the api call
     *
     * @param  {Boolean}
     */
    logout: function(redirect_to) {
      set_current_user({});
      var token = get_token();
      remove_token();

      if (token && authConfig.api_users_logout && authConfig.api_users_logout_method) {
        var headers = {};
        headers[authConfig.token_header] = token;
        $http({
          method: authConfig.api_users_logout_method,
          url: authConfig.api_users_logout,
          headers: headers
        })
        .finally(function() {
          // TODO review if this is the best site
          $rootScope.$emit('$logout');

          if (redirect_to) {
            $log.debug('(Auth) redirect logout', redirect_to);

            $state.go(redirect_to);
          }
        });
      } else if (redirect_to) {
        $log.debug('(Auth) redirect logout', redirect_to);

        $state.go(redirect_to);
      }
    },

    /**
     * Gets all available info on authenticated user
     *
     * @return {Object} user
     */
    getCurrentUser: function() {
      return currentUser;
    },

    /**
     * Check if a user is logged in
     *
     * @return {Boolean}
     */
    isLoggedIn: function() {
      return currentUser.hasOwnProperty('id');
    },

    /**
     * Waits for currentUser to resolve before checking if user is logged in
     */
    isLoggedInAsync: function(cb) {
      $log.debug('(Auth) isLoggedInAsync', currentUser, login_in_prog);

      if (currentUser.hasOwnProperty('id')) {
        cb(true);
      } else if (login_in_prog) {
        login_in_prog
          .then(function() {
            cb(true);
          }).catch(function() {
            cb(false);
          });
      } else {
        cb(false);
      }
    },
    hasRoles: function(roles) {
      return has_role(roles, 'every');
    },
    hasRolesAny: function(roles) {
      return has_role(roles, 'some');
    },
    hasPermissions: function(perms) {
      return has_permission(perms, 'every');
    },
    hasPermissionsAny: function(perms) {
      return has_permission(perms, 'some');
    },
    /**
     * Get auth token
     */
    getToken: get_token,
    getTokenExp: function() {
      var tk = get_token();
      if (!tk) {
        return null;
      }

      tk = tk.split('.');
      var payload = JSON.parse(Base64URLDecode(tk[1]));
      return payload.exp * 1000;
    }
  });
})
.factory('authInterceptor', function($injector, $q) {
  return {
    // Add authorization token to headers
    request: function(config) {
      var authConfig = $injector.get('authConfig');
      var Auth = $injector.get('Auth');
      config.headers = config.headers || {};
      var t = Auth.getToken();
      if (t) {
        config.headers[authConfig.token_header] = authConfig.token_prefix + t;
      }
      return config;
    },
    responseError: function(response) {
      var authConfig = $injector.get('authConfig');
      var Auth = $injector.get('Auth');

      if (response.headers(authConfig.expiration_header)) {
        Auth.logout();
      }

      return $q.reject(response);
    }
  };
})
.config(function($httpProvider) {
  $httpProvider.interceptors.push('authInterceptor');
})
// just run it so it can autologin
.run(function(Auth) {});
