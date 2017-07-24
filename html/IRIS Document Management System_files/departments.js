(function() {
    irisAppDependencies.add('iris_departments');

    angular.module('iris_departments', []);

    angular.module('iris_departments').factory('Departments', function ($resource) {
        return $resource(iris.config.apiUrl + "/system/companies/:companyId/departments/:id", {
            companyId: '@companyId',
            id: '@id'
        });
    });

    angular.module('iris_departments')
        .factory('DepartmentService', function ($translate, Departments) {
            function query(params) {
                return Departments.query(params).$promise;
            }

            function queryWithFilter(companyId, filter) {
                return query({companyId, filter: angular.toJson(filter)});
            }

            return {
                query,
                queryWithFilter,

                queryByParent: (companyId, parentId) => {
                    return queryWithFilter(companyId, [
                        { f: 'parentId', v: [parentId] }
                    ]);
                },

                get: (companyId, id) => Departments.get({companyId, id}).$promise,

                save: (item) => Departments.save(item).$promise,

                create: params => new Departments(params),

                remove: (companyId, id) => Departments.remove({companyId, id}).$promise
            }
        });
})();