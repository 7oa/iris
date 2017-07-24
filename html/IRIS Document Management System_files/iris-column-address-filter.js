(function(globals) {
    'use strict';

    globals.angular.module('irisApp').filter('irisColumnAddress', function () {
        var chars = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];

        function getChar(val) {
            if (!val) return "";
            return getChar(Math.floor((val - 1) / chars.length)) + chars[(val - 1) % chars.length];
        }

        return function(val) {
            return getChar(val);
        };
    });

})({
    angular: angular,
    config: iris.config
});