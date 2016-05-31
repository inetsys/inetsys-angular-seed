'use strict';

//
// GET given list from $HTTP if *.json will use $templateCache
//

angular
.module('app')
.factory('ResolveUrlList', function($q, $http, $templateCache) {
  return function(list) {
    var promises = list.map(function fetch_url(file) {
      return $http({
        url : file,
        method: 'GET',
        // cache only for json
        cache: (file.indexOf('.json') === -1 ? null : $templateCache)
      });
    });
    return $q.all(promises);
  };
});
