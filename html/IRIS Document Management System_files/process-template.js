(function() {
    angular.module('iris_process_mgmt').factory('ProcessTemplates', function ($resource) {
        return $resource(iris.config.apiUrl + "/process-management/process-templates/:id", {
            id: '@id'
        }, {
            copyToProject: {
                method: 'POST',
                url: iris.config.apiUrl + '/process-management/projects/:projectId/process-templates/copy-from/:id',
                params: {
                    id: '@id',
                    projectId: '@projectId'
                }
            },
            startProcess: {
                method: 'POST',
                url: iris.config.apiUrl + '/process-management/projects/:projectId/process-templates/:id/start',
                params: {
                    id: '@id',
                    projectId: '@projectId'
                }
            }
        });
    });

    angular.module('iris_process_mgmt')
        .factory('ProcessTemplateService', function ($translate, ProcessTemplates) {
            function query(params) {
                return ProcessTemplates.query(params).$promise;
            }

            var processStatuses = [
                { id: "CREATED", name: $translate.instant('label.pm.Created') },
                { id: "IN_PROGRESS", name: $translate.instant('label.pm.InProgress') },
                { id: "COMPLETED", name: $translate.instant('label.pm.Completed') }
            ];

            return {
                getProcessStatuses: () => processStatuses,
                getProcessViewUrl: (id) => `${iris.config.baseUrl}/ui/ui/process-management/project-processes/${id}/view`,

                query,
                queryWithFilter: (filter) => {
                    return query({filter: angular.toJson(filter)});
                },

                get: (id) => {
                    return ProcessTemplates.get({id}).$promise;
                },

                save: (item) => {
                    return ProcessTemplates.save({id: item.id}, item).$promise;
                },

                create: (params) => {
                    params || (params = {});
                    params.processDefinition || (params.processDefinition = {});
                    return new ProcessTemplates(params);
                },

                remove: (item) => ProcessTemplates.remove({id: item.id}).$promise,

                copyToProject: (projectId, id) => ProcessTemplates.copyToProject({projectId, id}).$promise,
                startProcess: (projectId, id) => ProcessTemplates.startProcess({projectId, id}).$promise
            }
        });
})();
