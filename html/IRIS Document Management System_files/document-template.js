(function() {
    angular.module('iris_documents').factory('DocumentTemplates', function ($resource) {
        return $resource(iris.config.apiUrl + "/documents/projects/:projectId/templates/:id", {
            projectId: '@projectId',
            id: '@id'
        });
    });

    angular.module('iris_documents')
        .factory('DocumentTemplateService', function (DocumentTemplates) {
            function query(projectId, filter) {
                var params = {
                    projectId: projectId
                };
                filter && (params.filter = angular.toJson(filter));
                return DocumentTemplates.query(params).$promise
            }

            return {
                query,
                queryByCollection: (projectId, collectionNameId) => query(projectId, [{f: "collectionNameId", v: [collectionNameId]}]),

                get: (projectId, id) => DocumentTemplates.get({projectId, id}).$promise,

                save: (item) => DocumentTemplates.save({projectId: item.projectId, id: item.id}, item).$promise,

                create: (params) => new DocumentTemplates(params),

                remove: (item) => DocumentTemplates.remove({projectId: item.projectId, id: item.id}).$promise
            }
        });
})();
