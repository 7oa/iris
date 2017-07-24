(function () {
    irisAppDependencies.add('iris_working_days');

    angular.module('iris_working_days', []);

    const module = angular.module('iris_working_days');

    module.factory('WorkDaysConfiguration', function ($resource) {
        return $resource(`${iris.config.apiUrl}/reporting/projects/:projectId/work-day-configurations/:id`, {projectId: '@projectId', id: '@id'});
    });


    module.factory('WorkDaysConfigurationService', function ($translate, WorkDaysConfiguration) {
        var conditionOptions = ['>', '<', '=', '!=', '>=', '<='].map(v => {return {id:v, name:v}});

        return {
            getWorkDaysConfigurations: (projectId) => WorkDaysConfiguration.query({projectId}).$promise,

            getWorkDaysConfiguration: (projectId, id)=>WorkDaysConfiguration.get({projectId, id}).$promise,

            saveWorkDaysConfiguration: workDayConfiguration=>WorkDaysConfiguration.save(workDayConfiguration).$promise,

            createWorkDaysConfiguration: params=>new WorkDaysConfiguration(params),

            removeWorkDaysConfiguration: workDayConfiguration=>WorkDaysConfiguration.remove(workDayConfiguration).$promise,

            getConditionOptions: () => conditionOptions
        }
    })
})();