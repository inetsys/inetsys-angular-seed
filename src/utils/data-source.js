'use strict';

// Helpers to work with sources
// sources can be used for: selects & filters
console.log("declare setDataSource", setDataSource);
function setDataSource(app) {
  app.dataSource = function dataSource(
    source_name, values,
    filter_name, all_filters_label) {
    this
    .value(source_name, values)
    .run(["$rootScope", function($rootScope) {
      $rootScope[source_name] = values;
      $rootScope[source_name + '_filters'] = [{id: null, label: all_filters_label}].concat(values);
    }])
    .filter(filter_name, ["sourceGetLabel", function(sourceGetLabel) {
      return function(x) {
        return sourceGetLabel(values, x);
      };
    }]);

    return this;
  };

  app.factory('sourceGetLabel', function() {
    return function source_get_label(values, id) {
        if (Array.isArray(id)) {
          return id.map(function(v) {
            return source_get_label(values, v);
          }).join(", ");
        }

        if ("object" === typeof id) {
          return source_get_label(values, id.key || id.id);
        }

        var i;
        for (i = 0; i < values.length; ++i) {
          if (values[i].id === id) {
            return values[i].label;
          }
        }

        return '??';
    };
  });

  return app;
}
