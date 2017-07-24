(function() {
    angular.module('irisNewsstream').factory('IrisNewsstreamService', function() {
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