URI Template JS
===============

This is a javascript implementation of [RFC6570](http://tools.ietf.org/html/rfc6570) - URI Template,
and can expand templates up to and including Level 4 in that specification.

It exposes a constructor function UriTemplate with the two methods:

* (static) parse(uriTemplateText)
* expand(variables)

Requirements
------------

You can use uri-template.js in any modern browsers (Tested even with IE8 in IE7-Mode), see file demo.html.
But you can also use it with node:

    var
        UriTemplate = require('./path/to/uritemplate.js'),
        template,
        expanded;
    template = UriTemplate.parse('{?query*}';
    template.expand({query: {firstParam: "firstValue", secondParam: "secondValue"}});
    --> "?firstParam=firstValue&secondParam=secondValue"

Tests
-----

The tests are taken from https://github.com/uri-templates/uritemplate-test as a submodule.
Run the tests with

    node test.js

Comming soon
------------

* npm support with package.json
* npm support for npm install
* A new method extract(uri), which tries to extract the variables from a given uri

License
-------
Copyright 2012 Franz Antesberger

MIT License, see http://mit-license.org/
