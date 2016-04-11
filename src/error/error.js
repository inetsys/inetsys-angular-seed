'use strict';

// $rootScope.modal_error, contains if there is a model active
angular
.module('app')
.provider("errorConfig", function () {
  // url that return user data
  this.default_template = 'src/error/error.tpl.html';
  this.templates = {
    html: 'src/error/error-html.tpl.html'
  };

  this.$get = function () {
    return this;
  };
})
// This http interceptor listens for authentication failures
.factory('errorHandler', ['$injector', '$log', 'errorConfig', '$q', function ($injector, $log, errorConfig, $q) {
  var error_list = [];
  var instance;

  function pop_error(reject) {
    var err_data = error_list[0];
    error_list.splice(0, 1);

    //deferred
    var i;
    for (i = 0; i < err_data.deferred.length; ++i) {
      if (err_data.deferred[i] && reject) {
        err_data.deferred[i].reject(err_data.response[i]);
      }
    }
  }

  function unique(value, index, self) {
    return self.indexOf(value) === index;
  }

  // check if the error can be squashed
  function squash_errors() {
    if (error_list[0].type) {
      return;
    }

    // squask all un-type related errors
    var i;
    var err_data = error_list[0];
    for (i = 1; i < error_list.length; ++i) {
      if (!error_list[i].error.type) {
        err_data.error.list = err_data.error.list
          .concat(error_list[i].error.list)
          .filter(unique);
        err_data.response.push(error_list[i].response[0]);
        err_data.deferred.push(error_list[i].deferred[0]);
        error_list.splice(i, 1);
        --i;
      }
    }
  }

  function show_modal() {
    if (!error_list.length) {
      return;
    }

    if (instance) {
      squash_errors();

      return instance.result.then(function() {
        show_modal();
      });
    }

    var $uibModal = $injector.get('$uibModal');
    var $http = $injector.get('$http');
    // TODO review why I did this ?
    // var $rootScope = $injector.get('$rootScope');


    var err_data = error_list[0];
    var err = err_data.error;
    var templateUrl = errorConfig.default_template;
    if (err.type) {
      templateUrl = errorConfig.templates[err.type];
    }


    instance = $uibModal.open({
      size: err.type ? 'lg': undefined,
      templateUrl: templateUrl,
      //scope: $rootScope,
      backdrop: 'static',
      keyboard: false,
      controller: ['$scope', '$uibModalInstance', function ($scope, $uibModalInstance) {
        $scope.templateUrl = templateUrl;
        $scope.error = err;

        // TODO
        // we should retry the request adding param to query
        $scope.retry = function (param) {
          // why not clone?
          // we may need to add more than one param because there are
          // two confirmations
          //var config = angular.copy(err_data.response[0].config);
          var config = err_data.response[0].config;

          $log.debug("(errorHandler) retry", param, config);
          if (config.url.indexOf("?") !== -1) {
            config.url += "&" + param + "=true";
          } else {
            config.url += "?" + param + "=true";
          }

          pop_error(false);
          instance = null;
          $uibModalInstance.close(null);

          $http(config)
          .then(function(response) {
            $log.debug("(errorHandler) success", response);
            err_data.deferred[0].resolve(response);
          }, function(response) {
            $log.debug("(errorHandler) error", response);
            err_data.deferred[0].reject(response);
          });
        };

        $scope.close = function () {
          pop_error(true);

          instance = null;
          $uibModalInstance.close(null);
        };

        $scope.ok = function () {
          pop_error(true);

          instance = null;
          $uibModalInstance.close(null);
        };
      }]
    });
  }

  return {
    push: function(error, response) {
      var serr = {
        error: error,
        deferred: [null],
        response: [response],
        modal: null
      };

      // defer if has a type
      // because can be retried
      if (error.type) {
        serr.deferred[0] = $q.defer();
      }

      error_list.push(serr);

      show_modal();

      return serr.deferred[0] ? serr.deferred[0].promise : $q.reject(response);
    }
  };
}])
.factory('errorFormat', function() {
  return function(response) {
    // html-error ?
    if (
      'string' === typeof response.data &&
      'text/html' === response.headers('Content-Type')
    ) {
      return {
        html: response.data,
        type: 'html'
      };
    }

    var error = {
      list: [],
      type: null
    };

    if ('string' === typeof response.data) {
      error.list = [response.data];
    } else if (Array.isArray(response.data)) {
      error.list = response.data.slice(0);
    } else {
      if (Array.isArray(response.data.error)) {
        error.list = response.data.error.slice(0);
      } else if (response.data.error) {
        error.list = [response.data.error];
      }
      if (response.data.type) {
        error.type = response.data.type;
      }
    }

    return error;
  };
})
.factory('errorInterceptor', ['$q', '$injector', '$interpolate', '$log', 'errorHandler', 'errorFormat', function ($q, $injector, $interpolate, $log, errorHandler, errorFormat) {
  return {
    responseError: function (response) {
      $log.debug('(errorInterceptor) responseError::', response);

      // manage 4XX & 5XX
      if (response.status >= 400 && !response.config.noModalError) {
        var errors = errorFormat(response);

        // TODO handle retry
        // TODO modal should be promisable?
        return errorHandler.push(errors, response);
      }

      return $q.reject(response);
    }
  };
}])
// $http({recoverErrorStatus: 200})
// usage: do not fail to resolve a state, just ignore possible errors
// maybe need: noModalError, to not display the error.
.factory('recoverErrorStatusInterceptor', ['$q', '$injector', '$interpolate', '$log', 'errorHandler', 'errorFormat', function ($q, $injector, $interpolate, $log, errorHandler, errorFormat) {
  return {
    responseError: function (response) {
      if (response.config.recoverErrorStatus) {
        $log.debug('(recoverErrorStatusInterceptor) recover', response);
        response.status = response.config.recoverErrorStatus;
        return response;
      }

      return $q.reject(response);
    }
  };
}])
.config(function ($httpProvider) {
  $httpProvider.interceptors.push('recoverErrorStatusInterceptor');
  $httpProvider.interceptors.push('errorInterceptor');
});
