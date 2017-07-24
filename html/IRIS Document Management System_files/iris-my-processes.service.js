(function() {
    angular.module('irisMyProcesses').factory('IrisMyProcessesService', function() {
        var defaultSettings = {
            limit: 15
        };

        return {
            getDefaultSettings: function () {
                return defaultSettings;
            }
        };
    });
})();