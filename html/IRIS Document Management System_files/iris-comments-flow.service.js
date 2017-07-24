(function() {
    angular.module('irisCommentsFlow').factory('IrisCommentsFlowService', function() {
        var defaultSettings = {
            limit: 15,
            commentTypes: [
                { moduleName: "TASK_MGMT", entityName: "task" },
                { moduleName: "dms", entityName: "files" }
            ]
        };

        return {
            getDefaultSettings: function () {
                return defaultSettings;
            }
        };
    });
})();