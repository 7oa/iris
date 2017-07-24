(function(globals) {

    globals.angular.module('iris_locale', []);

    globals.angular.module('iris_locale').factory('LocaleService', [function () {
        return {
            getCurrentLocale: () => {
                return globals.config &&
                    globals.config.me &&
                    globals.config.me.profile &&
                    globals.config.me.profile.language
            }
        }
    }]);
})({
    angular: angular,
    config: iris.config
});
