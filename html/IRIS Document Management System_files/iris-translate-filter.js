(function(globals) {
    'use strict';

    globals.angular.module('irisApp').filter('irisTranslate', function(LocaleService) {
        return function(value, translations, defaultValue) {
            const currLocale = LocaleService.getCurrentLocale();
            if (currLocale && translations && translations[currLocale]) {
                value = translations[currLocale];
            }

            return value || defaultValue;
        }
    })

})({
    angular: angular,
    config: iris.config
});
