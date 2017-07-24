(function() {
    angular.module('irisMyTasks').factory('IrisMyTasksService', function() {
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