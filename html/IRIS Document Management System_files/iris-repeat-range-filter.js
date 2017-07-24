(function(globals) {
    'use strict';

    globals.angular.module('irisApp').filter('irisRepeatRange', function () {
        return function(val, range) {
            range = parseInt(range);
            for (var i=0; i<range; i++) val.push(i);
            return val;
        };
    });

})({
    angular: angular,
    config: iris.config
});
    