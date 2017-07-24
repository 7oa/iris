(function () {
    angular.module('irisSensorboardWidget').factory('IrisSensorboardWidgetService',
        function ($translate, $q, $window) {
            var defaultSettings = {
                liveModeInterval: 1
            };

            return {
                getDefaultSettings: function () {
                    return defaultSettings;
                }
            };
        });

})();