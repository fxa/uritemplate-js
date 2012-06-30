URI Template JS
===============

This is a javascript implementation of [RFC6570](http://tools.ietf.org/html/rfc6570) - URI Template,
and can expand templates up to and including Level 4 in that specification.

It exposes a constructor function UriTemplate with the two methods:

* (static) parse(uriTemplateText) returning an instance of UriTemplate
* expand(variables) returning an string

Requirements
------------

You can use uritemplate.js in any even not so modern browser (Tested even with IE8 in IE7-Mode), see file demo.html.
But you can also use it with node:

**npm install uritemplate**

and then:

    var
        UriTemplate = require('uritemplate'),
        template;
    template = UriTemplate.parse('{?query*}';
    template.expand({query: {first: 1, second: 2}});
    --> "?first=1&second=2"

If you want to clone the git project, be aware of the submodule uritemplate-test.
So you have to to:

    git https://github.com/fxa/uritemplate-js.git
    git submodule init
    git submodule update

Tests
-----

The tests are taken from https://github.com/uri-templates/uritemplate-test as a submodule.
Run the tests with

    node test.js

Comming soon
------------

* A new method extract(uri), which tries to extract the variables from a given uri
* Support of javascript's Date class

License
-------
Copyright 2012 Franz Antesberger

MIT License, see http://mit-license.org/
