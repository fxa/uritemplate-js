URI Template JS
===============

This is a javascript implementation of [RFC6570](http://tools.ietf.org/html/rfc6570) - URI Template,
and can expand templates up to and including Level 4 in that specification.

It exposes a constructor function UriTemplate with the two methods:

* (static) parse(uriTemplateText) returning an instance of UriTemplate
* expand(variables) returning an string

Be aware, that a parsed UriTemplate is frozen, so it is stateless. You can reuse instances of UriTemplates.

Requirements
------------

You can use uritemplate.js in any even not so modern browser (Tested even with IE8 in IE7-Mode), see file demo.html.
But you can also use it with node:

**npm install uritemplate**

and then in a node application:

    var
        UriTemplate = require('uritemplate'),
        template;
    template = UriTemplate.parse('{?query*})';
    template.expand({query: {first: 1, second: 2}});
    --> "?first=1&second=2"

or within a html document (see also demo.html):

    <script type="text/javascript" src="bin/uritemplate.js"></script>
    <script type="text/javascript">
        var template = UriTemplate.parse('{?query*}');
        alert(template.expand({query: {first: 1, second: 2}}));
    </script>


If you want to clone the git project, be aware of the submodule uritemplate-test.
So you have to to:

    git clone --recursive https://github.com/fxa/uritemplate-js.git

    
Build
-----
    npm install
    npm test

Tests
-----

The integration tests are taken from https://github.com/uri-templates/uritemplate-test as a submodule.
The tests are integrated in the Jakefile.

License
-------
Copyright 2013 Franz Antesberger

MIT License, see http://mit-license.org/

Release Notes
-------------
* 0.3.4 minor package.json changes to support npm install and npm test 
* 0.3.3 fixed https://github.com/fxa/uritemplate-js/issues/12 Pct-Encoding-Error with chars < 0x100 (missing 0-padding). Thanks to https://github.com/pfraze!
* 0.3.2 fixed https://github.com/fxa/uritemplate-js/issues/11 Problems with older IE versions. Thanks to anozaki!
* 0.3.1 fixed https://github.com/fxa/uritemplate-js/issues/10 thank you, Paul-Martin!
* 0.3.0 introduced UriTemplateError as exception, so the interface changed from string to UriTemplateError (as the rfc suggested)
* 0.2.4 fixed double encoding according [RubenVerborgh] and some Prefix modifiers bugs
* 0.2.3 fixed bug with empty objects ('{?empty}' with '{empty:{}}' shall expand to '?empty=')
* 0.2.2 fixed pct encoding bug with multibyte utf8 chars
* 0.2.1 fixed a bug in package.json
* 0.2.0 heavy project refactoring, splitting source files, introducing jshint (preparation of next steps)

Next Steps
----------
* Implementing more unit tests (now only a view tests are implemented)
* A new method extract(uri), which tries to extract the variables from a given uri.
  This is harder, than you might think
