## inetsys-angular-seed

This package include all needed to bootstrap an angular app.
It's not a module, it will configure your app, and require that your app
to be named: **app**

This is the minimum initialization needed:

```js
angular
.module('app', [
  'ui.bootstrap', // modals, error handling, navbar, dirty form confirmations
  'ui.router', // loading screens, session
  'ngCookies', // session
  'cgBusy' // loading screens
])
```

tested with:
* JQuery 2.1.4
* angular 1.5.6
* angular-bootstrap 1.3.1
* angular-ui-router 0.2.18
* angular-cookies 4.0.10
* angular-busy 4.1.3

## Components

* Auth (login/logout JWT)
* Error handling (single error, error list, error with custom template)
* Navbar
* Loading when change state and requesting data from server
* Error/no-Auth rediection
* Authentication routes
* Confirm state exit with a modal (do not leave dirty forms without confirmation!)

### Extras / Optionals

* src/utils/raw-request.js

  Configure your app to use RAW-HTML-BODY-OLD-FASHION requests, this will remove the JSON-body configuration by default in angular!!

  Add this file with caution! There is no turning back!


## Installation

bower.json@main only contains the css.

You should manually add all Javascripts file after your app initialization
Do not think about use wiredep, because this will add your configuration before your app initialization, and it will fail. Sorry: manually.

Here is the list of common recommended files:

**NOTE about order** loading interceptor must be the first one, so must be included last.

```json
[
  "/src/auth/auth.service.js",
  "/src/auth/authenticate-route.js",
  "/src/auth/login.controller.js",
  "/src/auth/redirection.service.js",
  "/src/auth/routes.js",
  "/src/error/error.js",
  "/src/navbar/navbar.js",
  "/src/utils/rewrite-urls.js",
  "/src/confirm-state-exit/confirm-state-exit.js",
  "/src/loading/loading.js",
]
```

Optionals

```json
[
  "src/utils/raw-request.js",
  "src/utils/formalizer.js"
  "src/utils/ng-open-modal.js"
  "src/utils/ui-router-redirect.js"
  "src/utils/data-source.js"
  "src/utils/ng-click-if.js"
]
```


**NOTE**: navbar require https://github.com/inetsys/ng-formalizer/blob/master/lib/ng-compile.js

To configure URLS each component has a provider.
Except those that add routes. You overwrite those routes like:

```js
angular
.module('app')
.run(['$state', function override_login($state) {
   var state = $state.get('login');
   state.templateUrl = 'path-to-my-login-view/login.tpl.html';
}]);
```

## Usage

### navbar

```js
angular.module('app')
.config(function ($stateProvider, navbarLeftProvider) {

  navbarLeftProvider.push(3 /*priority higher left-right */, {
    name: "XXX",
    state: 'xxx.yyy',
    logged: true, // require a logged user to be displayed
    'permissions': [ // user must have all permissions
      '??'
    ],
    'permissionsAny': [ // user must have at least one permission
      '??'
    ],
    roles: [ // user must have all roles
      '??'
    ],
    rolesAny: [ // user must have at least one role
      '??'
    ]
  });
})
// expose the navbar to the scope
.run(function ($rootScope, navbarLeft) {
  navbarLeft.sort();
  $rootScope.tl_navbar = navbarLeft.tree;
});
```


Markup
```html
<navbar-tree navbar-tree="tl_navbar"></navbar-tree>
```

### angular.app("xx").dataSource

DataSource it's a shortcut to keep select values sane.
Allow it to use it to create, update, or filter and be displayed.

```js
// first dataSource need to be injected in your app.
setDataSource(angular.module('app'))
.dataSource('name_of_the_value',[
  {"id": "xxx", "label": "yyy"} // always id-label!
], 'name_of_the_filter', "label of the default null value")
.dataSource()
.value() // get the idea can be chained, after setDataSource


//
// what it does ?
//
// source for create/update that cannot be null
$rootScope.name_of_the_value = [
  {"id": "xxx", "label": "yyy"}
];

// source for filters or update/create that can be null
$rootScope.name_of_the_value_filters = [
  {"id": null, "label": "label of the default null value"},
  {"id": "xxx", "label": "yyy"}
];
// for display a readable label
.filter('name_of_the_filter', function() {
  function(id) {
    // 1. search id @ filters and return the label.
    // 2. if is an array, separated by ,
    // 3. if is an object, search its id and do 1.
  }
})

```

### Loading bypass
Do a request but do not show loading screen:

```js
$http({
  method: 'XXXX',
  url: 'YYYY',
  noLoading: true
})
```

## do not display modal on error
```js
$http({
  method: 'XXXX',
  url: 'YYYY',
  noModalError: true
})
```

## Request never fail

Some request may raise an error, if they are in state.resolve
you will never reach the desired state. `recoverErrorStatus` force
the status if an error is found.

```js
$http({
  method: 'XXXX',
  url: 'YYYY',
  recoverErrorStatus: 200
})
```




### confirmStateExit

```js
confirmStateExit($scope, 'condition-evaled-in-the-scope', ['template-url',
  [function(toState, toParams, fromState, fromParams) {
    // this callback is to check if the state change require to display the modal
    // Imagine the toState being a substate
  },
  [function($scope_modal) {
    // to inject some staff the template may need
  }]]])

// example
confirmStateExit($scope, 'form.dirty');
```

# ui-router: redirectTo

redirectTo support

* string: destination state
* Angular Injection Function Annotation


Example of redirection based on permisions:

```js
$stateProvider
.state("installation.view", {
  '...': '...',
  // TODO redirectTo must accept a function! to test permissions!
  redirectTo: ["Auth", function(Auth) {
    if (Auth.hasPermissions("xx")) {
      return "xx";
    }
    if (Auth.hasPermissions("yy")) {
      return "yy";
    }
    return "zz";
  }]
});
```

## Test / Showcase

```
node server/app.js
firefox localhost:8080
```
