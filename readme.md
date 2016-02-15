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
  'ipCookie',
  'cgBusy'
])
```

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
  "src/utils/raw-request.js"
]
```

To configure URLS each component has a provider.
Except those that add routes. You overwrite those routes like:

```js
angular
.module('app')
.config(function ($stateProvider) {
  $stateProvider
  .state('login', {
    url: '/login?redirectTo&redirectToParams',
    templateUrl: 'paty-to-my-login-view/login.tpl.html',
    controller: 'LoginCtrl'
  });
})
```

## Test / Showcase

```
node server/app.js
firefox localhost:8080
```
