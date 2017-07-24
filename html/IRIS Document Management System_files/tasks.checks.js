(function () {
    angular.module('iris_taskmanagement').factory('Checks', function ($resource) {
        return $resource(iris.config.apiUrl + '/task-management/tasks/:taskId/checks/:id/:action', {
            taskId: '@taskId',
            id: '@id',
            action: '@action'
        }, {
            toggleDone: {
                method: "POST",
                params: {action: "toggle-done"}
            }
        });
    });

    angular.module('iris_taskmanagement')
        .factory('ChecksService', function ($translate, Checks) {
            return {
                getChecks: (taskId) => Checks.query({taskId}).$promise,

                getCheck: (taskId, id) => Checks.get({taskId, id}).$promise,

                saveCheck: check => Checks.save({taskId: check.taskId, id: check.id}, check).$promise,

                createCheck: params => new Checks(params),

                removeCheck: check => Checks.remove({taskId: check.taskId, id: check.id}).$promise,

                toggleDone: check => Checks.toggleDone({taskId: check.taskId, id: check.id}).$promise
            }
        });
})();