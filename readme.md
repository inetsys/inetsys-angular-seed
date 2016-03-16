## inetsys-angular-seed

This package include all needed to bootstrap an angular app.
It's not a module, it will configure your app, and require the your app
to be called: **app**

This is the minimum initialization needed:

```js
angular
.module('app', [
  'ui.bootstrap',
  'ui.router',
  'ngCookies',
  'cgBusy'
])
```

tested with:
* JQuery 2.1.4
* angular 1.5.0
* angular-bootstrap 1.1.2
* angular-ui-router 0.2.18
* angular-cookie 4.0.10
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


## Installation

bower.json@main only contains the css.

You should manually add all Javascripts file after your app initialization
Do not think about use wiredep, because this will add your configuration before your app initialization, and it will fail. Sorry: manually.

Here is the list of common recommended files:

```json
[
  "/src/auth/auth.service.js",
  "/src/auth/authenticate-route.js",
  "/src/auth/login.controller.js",
  "/src/auth/redirection.service.js",
  "/src/auth/routes.js",
  "/src/loading/loading.js",
  "/src/error/error.js",
  "/src/navbar/navbar.js",
  "/src/utils/rewrite-urls.js",
  "/src/confirm-state-exit/confirm-state-exit.js"
]
```

Optionals

```json
[
  "src/utils/raw-request.js",
  "src/utils/ui-router-redirect.js"
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
   state.templateUrl = 'paty-to-my-login-view/login.tpl.html';
}]);
```

## Usage

### Loading bypass
Do a request but do not show loading screen:

```js
$http({
  method: 'XXXX',
  url: 'YYYY',
  noLoading: true
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
