(function () {
    // Register dependencies in irisApp / main module
    irisAppDependencies.add('iris_personnelmgmt_jobtitles');

    // Register new module
    angular.module('iris_personnelmgmt_jobtitles', []);

    // Get the newly registered module
    const module = angular.module('iris_personnelmgmt_jobtitles');

    // API endpoint / connection to backend controller
    module.factory('JobTitle', function ($resource) {
        return $resource(`${iris.config.apiUrl}/personnelmanagement/job-titles/:id/`, {id: '@id'});
    });

    // Create the service
    module.factory('JobTitleService', function (JobTitle) {

        return {
            getJobTitles()  {
                return JobTitle.query().$promise;
            },

            getJobTitle(id) {
                return JobTitle.get({id: id}).$promise;
            },

            saveJobTitle(jobTitle) {
                return JobTitle.save(jobTitle).$promise;
            },

            createJobTitle(params) {
                return new JobTitle(params);
            },

            removeJobTitle(id) {
                return JobTitle.delete({id: id}).$promise;
            }
        }
    })
})();