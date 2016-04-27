'use strict';

//
// Get formalizer metadata from API
// and override messages with defaults in spanish
//

angular
.module('app')
.service('UtilsFormalizer', function($http, $templateCache, $interpolate) {
  // override messages in spanish
  function set_messages(fields) {
    var default_messages = {
      'required': 'Campo obligatorio',
      'min': 'Valor mínimo: {{element.attrs[\'min\']}}',
      'max': 'Valor máximo: {{element.attrs[\'max\']}}',
      'minlength': 'Al menos debe tener {{element.attrs[\'ng-maxlength\']}} caracteres',
      'maxlength': 'Máximos caracteres excedidos: {{element.attrs[\'ng-maxlength\']}}',
      'number': 'Número no válido',
      'email': 'Email no válido',
      'url': 'URL inválida',
      'blacklist': 'El valor esta en una lista negra',
      //'equal-to':
      'only-alpha': 'Sólo letras',
      'only-iso': 'Sólo \'A-Z, a-z, 0-9\' son caracteres válidos',
      'one-upper': 'Al menos una mayúscula',
      'one-lower': 'Al menos una minúscula',
      'one-number': 'Al menos un número',
      'one-alpha': 'Al menos una letra',
      //'server-validation':
      'length': 'Debe tener exactamente {{element.attrs[\'ng-length\']}} caracteres',
      'decimals': 'Máximo número de decimales excedido: {{element.attrs[\'ng-decimals\']}}',
      'no-decimals': 'No puede tener decimales',
      'date': 'Campo fecha no válido',
      'required_list': 'Al menos uno debe ser marcado'
    };

    var i;
    var j;
    for (i in fields) {
      fields[i].messages = fields[i].messages || {};
      for (j in default_messages) {
        if (fields[i].messages[j] === undefined) {
          fields[i].messages[j] = $interpolate(default_messages[j])({element: fields[i]});
        }
      }
    }

    return fields;
  }
  return {
    set_messages: set_messages,
    get: function(entity) {
      return $http({
        method: 'GET',
        url: '/api/' + entity + '/formalizer',
        cache: $templateCache // just once
      }).then(function(data) {
        set_messages(data.data);
        return data;
      });
    }
  };
})
.run(function($rootScope) {
  // API - formalizer
  // spanish postal code
  $rootScope.$postal_code_regex = /^(0[1-9]|[1-4][0-9]|5[0-2])[0-9]{3}$/;
});
