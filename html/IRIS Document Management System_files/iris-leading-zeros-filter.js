(function(globals) {
    'use strict';

    globals.angular.module('irisApp').filter('irisLeadingZeros', function () {
        return function(val, size) {
            var res = val + "";
            while (res.length < size) res = "0" + res;
            return res;
        };
    });

})({
    angular: angular,
    config: iris.config
});