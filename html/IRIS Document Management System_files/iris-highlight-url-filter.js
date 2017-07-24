(function(globals) {
    'use strict';

    globals.angular.module('irisApp').filter('irisHighlightUrl', function () {
        var urlPattern = /(http|https):\/\/[\w-]+([\w.,@?^=%&amp;:\/~+#-]*[\w@?^=%&amp;\/~+#-])?/gi;
        return function (text, placeholder, target) {
            if (!text) return text;
            return text.replace(urlPattern, '<a class="btn-link" target="' + (target || '_black') + '" href="$&">' + (placeholder || '$&') + '</a>');
        };
    });

})({
    angular: angular,
    config: iris.config
});
    