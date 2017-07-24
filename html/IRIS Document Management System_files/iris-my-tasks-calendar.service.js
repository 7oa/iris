(function() {
    angular.module('irisMyTasksCalendar').factory('IrisMyTasksCalendarService', function() {
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