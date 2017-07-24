(function() {

    irisAppDependencies.add('iris_personnelmgmt_staff');

    angular.module('iris_personnelmgmt_staff', []);

    const module = angular.module('iris_personnelmgmt_staff');

    module.factory('Staff', function ($resource) {
        return $resource(`${iris.config.apiUrl}/personnelmanagement/profiles/:id`, {id: '@id'});
    });

    module.factory('CompanyStaff', function ($resource) {
        return $resource(`${iris.config.apiUrl}/personnelmanagement/profiles/company/:companyId`, {
            companyId: '@companyId'
        });
    });

    module.factory('StaffService', function(Staff, CompanyStaff) {

        return {
            getAllStaff() {
                return Staff.query().$promise;
            },

            getByCompanyId(companyId) {
                return CompanyStaff.query({companyId}).$promise;
            },

            getStaff(id) {
                return Staff.get({id: id}).$promise;
            },

            saveStaff(staff) {
                return Staff.save(staff).$promise;
            },

            createStaff(params) {
                return new Staff(params);
            },

            removeStaff(id) {
                return Staff.delete({id: id}).$promise;
            },

            // Expects an array of job title IDs
            getStaffByJobTitleIDs(jobTitleIDs) {
                return Staff.query({filter: angular.toJson([{f: 'jobTitleId', v: jobTitleIDs}])}).$promise;
            }
        }
    })
})();