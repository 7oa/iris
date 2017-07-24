(function(globals) {
    'use strict';

    globals.angular.module('irisApp').filter('irisToAlias', function ($filter) {
        return function(val) {
            return val ? $filter("latinize")(val).replace(/\W+/g, '_').toLowerCase() : "";
        };
    });

})({
    angular: angular,
    config: iris.config
});