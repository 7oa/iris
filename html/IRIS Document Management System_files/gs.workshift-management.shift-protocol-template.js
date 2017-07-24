(function() {

    const module = angular.module('iris_gs_workshift_management_protocol_template');

    module.factory('ProjectProtocolTemplate', function($resource) {
        return $resource(`${iris.config.apiUrl}/shiftmanagement/shift-templates/project/:projectId/:id`, {
            projectId: '@projectId',
            id: '@id'
        })
    });

    module.factory('ProtocolTemplate', function($resource) {
        return $resource(`${iris.config.apiUrl}/shiftmanagement/shift-templates/:id`, {
            id: '@id',
            projectId: '@projectId',
            deviceId: '@deviceId'
        }, {
            query: {isArray: false}
        })
    });

    module.factory('ShiftProtocolTemplateService', function($filter,
        ProjectProtocolTemplate, ProtocolTemplate) {

        return {
            findAllByProject: (projectId) =>
                ProjectProtocolTemplate.query({ projectId: projectId }).$promise,

            getById: (id) =>
                ProtocolTemplate.query({id: id}).$promise,

            createTemplate: () =>
                new ProtocolTemplate(),

            remove: (id) =>
                ProtocolTemplate.remove({id: id}).$promise,

            save: (id, model) =>
                model.$save()
        }
    })

})();