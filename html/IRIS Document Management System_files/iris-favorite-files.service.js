(function() {
    angular.module('irisFavoriteFiles').factory('IrisFavoriteFilesService', function() {
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